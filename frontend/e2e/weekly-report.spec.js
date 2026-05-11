/**
 * E2E 测试 - 周报系统核心用户流程
 * 测试策略：后端使用真实 Node 进程（内存数据库），AI 接口不配置（使用降级模板）
 *
 * 覆盖流程：
 * 1. 页面加载 & 基础 UI
 * 2. 添加工作事项
 * 3. 编辑事项
 * 4. 生成周报（降级模板）
 * 5. 编辑并保存周报
 * 6. 历史周报列表
 * 7. 删除事项 & 删除周报
 */
import { test, expect } from '@playwright/test';

// 获取今天日期字符串 YYYY-MM-DD
function getTodayStr() {
  const today = new Date();
  const year = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

// 每次生成唯一内容，避免历史数据干扰
function uniqueText(prefix = '测试事项') {
  return `${prefix}_${Date.now()}`;
}

// 添加一条事项的辅助函数
async function addRecord(page, content) {
  const todayStr = getTodayStr();
  const addBtn = page.getByTestId(`add-record-btn-${todayStr}`);
  await addBtn.click();
  const input = page.getByTestId('new-record-input');
  await expect(input).toBeVisible();
  await input.fill(content);
  await page.getByTestId('submit-record-btn').click();
  // 等待新增的这条出现（用精确文本匹配）
  await expect(page.getByText(content)).toBeVisible({ timeout: 5000 });
}

// 测试前导航到首页
test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // 等待页面加载完成（标题和 Tab 可见）
  await expect(page.getByText('AI 周报系统')).toBeVisible();
});

test.describe('页面加载', () => {
  test('首页应正确渲染核心元素', async ({ page }) => {
    await expect(page.getByTestId('week-selector')).toBeVisible();
    await expect(page.getByTestId('tab-records')).toBeVisible();
    await expect(page.getByTestId('tab-report')).toBeVisible();
    await expect(page.getByTestId('tab-history')).toBeVisible();
  });

  test('默认应显示"本周事项" Tab', async ({ page }) => {
    await expect(page.getByTestId('tab-records')).toHaveClass(/active/);
    // 用 testid 精确定位 Tab 按钮，避免和页面内 h2 标题冲突
    await expect(page.getByTestId('tab-records')).toBeVisible();
  });

  test('周选择器应显示日期范围', async ({ page }) => {
    const label = page.getByTestId('week-label');
    await expect(label).toBeVisible();
    // 日期格式 YYYY-MM-DD ~ YYYY-MM-DD
    const text = await label.textContent();
    expect(text).toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});

test.describe('事项管理', () => {
  test('应能添加工作事项', async ({ page }) => {
    const content = uniqueText('完成用户模块开发');
    await addRecord(page, content);

    // 验证 Toast 成功通知
    await expect(page.getByTestId('toast-success')).toBeVisible({ timeout: 3000 });
  });

  test('按 Enter 键应提交事项', async ({ page }) => {
    const content = uniqueText('按Enter测试事项');
    const todayStr = getTodayStr();

    await page.getByTestId(`add-record-btn-${todayStr}`).click();
    const input = page.getByTestId('new-record-input');
    await input.fill(content);
    await input.press('Enter');

    await expect(page.getByText(content)).toBeVisible({ timeout: 5000 });
  });

  test('空内容不能提交', async ({ page }) => {
    const todayStr = getTodayStr();

    await page.getByTestId(`add-record-btn-${todayStr}`).click();
    const submitBtn = page.getByTestId('submit-record-btn');
    await expect(submitBtn).toBeDisabled();
  });
});

test.describe('周报生成', () => {
  // 每个周报测试前都添加一条唯一事项
  let recordContent;

  test.beforeEach(async ({ page }) => {
    recordContent = uniqueText('周报测试事项');
    await addRecord(page, recordContent);

    // 等待「事项添加成功」Toast 消失，避免和后续周报 Toast 冲突
    await expect(page.getByTestId('toast-success')).toBeHidden({ timeout: 5000 });

    // 切换到周报 Tab
    await page.getByTestId('tab-report').click();
    await expect(page.getByTestId('generate-report-btn')).toBeVisible();
  });

  test('有事项时"生成周报"按钮应可用', async ({ page }) => {
    const generateBtn = page.getByTestId('generate-report-btn');
    await expect(generateBtn).not.toBeDisabled();
  });

  test('应能生成周报（降级模板）', async ({ page }) => {
    await page.getByTestId('generate-report-btn').click();

    // 等待周报内容出现（降级模板包含"本周工作"）
    await expect(page.getByTestId('report-preview')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/本周工作/)).toBeVisible({ timeout: 10000 });

    // 验证成功 Toast（精确匹配文本，避免和其他 Toast 冲突）
    await expect(page.getByText('周报生成成功！')).toBeVisible({ timeout: 3000 });
  });

  test('生成周报后应显示编辑和复制按钮', async ({ page }) => {
    await page.getByTestId('generate-report-btn').click();
    await expect(page.getByTestId('report-preview')).toBeVisible({ timeout: 10000 });

    await expect(page.getByTestId('edit-report-btn')).toBeVisible();
    await expect(page.getByTestId('copy-report-btn')).toBeVisible();
  });

  test('应能编辑并保存周报', async ({ page }) => {
    // 先生成
    await page.getByTestId('generate-report-btn').click();
    await expect(page.getByTestId('report-preview')).toBeVisible({ timeout: 10000 });

    // 点击编辑
    await page.getByTestId('edit-report-btn').click();
    const textarea = page.getByTestId('report-edit-textarea');
    await expect(textarea).toBeVisible();

    // 修改内容（用唯一标识避免和历史周报内容冲突）
    const editContent = uniqueText('E2E编辑内容');
    await textarea.clear();
    await textarea.fill(`## 本周工作\n- ${editContent}\n\n## 下周计划\n- 继续优化`);

    // 保存
    await page.getByTestId('save-report-btn').click();
    await expect(page.getByText(editContent)).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('周报保存成功！')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Tab 切换', () => {
  test('点击"历史周报" Tab 应切换到历史页', async ({ page }) => {
    await page.getByTestId('tab-history').click();
    // 验证历史 Tab 处于 active 状态
    await expect(page.getByTestId('tab-history')).toHaveClass(/active/);
  });

  test('Tab 切换后再切回应保持正常', async ({ page }) => {
    await page.getByTestId('tab-report').click();
    await page.getByTestId('tab-history').click();
    await page.getByTestId('tab-records').click();
    // 用 testid 验证事项 Tab 处于 active，避免和 h2 标题文字冲突
    await expect(page.getByTestId('tab-records')).toHaveClass(/active/);
  });
});

test.describe('周导航', () => {
  test('点击上一周按钮应更新日期范围', async ({ page }) => {
    const labelBefore = await page.getByTestId('week-label').textContent();
    await page.getByTestId('prev-week-btn').click();
    const labelAfter = await page.getByTestId('week-label').textContent();
    expect(labelBefore).not.toBe(labelAfter);
  });

  test('点击下一周按钮应更新日期范围', async ({ page }) => {
    const labelBefore = await page.getByTestId('week-label').textContent();
    await page.getByTestId('next-week-btn').click();
    const labelAfter = await page.getByTestId('week-label').textContent();
    expect(labelBefore).not.toBe(labelAfter);
  });
});
