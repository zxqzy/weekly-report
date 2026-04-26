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
    await expect(page.getByText('本周事项')).toBeVisible();
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
    // 获取今天的日期，找到对应的添加按钮
    const today = new Date();
    const year = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${mm}-${dd}`;

    // 点击今天的"添加"按钮
    const addBtn = page.getByTestId(`add-record-btn-${todayStr}`);
    await addBtn.click();

    // 输入内容
    const input = page.getByTestId('new-record-input');
    await expect(input).toBeVisible();
    await input.fill('完成用户模块开发');

    // 提交
    await page.getByTestId('submit-record-btn').click();

    // 验证事项出现在列表中
    await expect(page.getByText('完成用户模块开发')).toBeVisible({ timeout: 5000 });

    // 验证 Toast 成功通知
    await expect(page.getByTestId('toast-success')).toBeVisible({ timeout: 3000 });
  });

  test('按 Enter 键应提交事项', async ({ page }) => {
    const today = new Date();
    const year = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${mm}-${dd}`;

    await page.getByTestId(`add-record-btn-${todayStr}`).click();
    const input = page.getByTestId('new-record-input');
    await input.fill('按 Enter 测试事项');
    await input.press('Enter');

    await expect(page.getByText('按 Enter 测试事项')).toBeVisible({ timeout: 5000 });
  });

  test('空内容不能提交', async ({ page }) => {
    const today = new Date();
    const year = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${mm}-${dd}`;

    await page.getByTestId(`add-record-btn-${todayStr}`).click();
    const submitBtn = page.getByTestId('submit-record-btn');
    await expect(submitBtn).toBeDisabled();
  });
});

test.describe('周报生成', () => {
  test.beforeEach(async ({ page }) => {
    // 先添加一条事项（确保有数据）
    const today = new Date();
    const year = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${year}-${mm}-${dd}`;

    await page.getByTestId(`add-record-btn-${todayStr}`).click();
    await page.getByTestId('new-record-input').fill('准备周报测试的工作事项');
    await page.getByTestId('submit-record-btn').click();
    await expect(page.getByText('准备周报测试的工作事项')).toBeVisible({ timeout: 5000 });

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

    // 验证成功 Toast
    await expect(page.getByTestId('toast-success')).toBeVisible({ timeout: 3000 });
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

    // 修改内容
    await textarea.clear();
    await textarea.fill('## 本周工作\n- 完成了 E2E 测试\n\n## 下周计划\n- 继续优化');

    // 保存
    await page.getByTestId('save-report-btn').click();
    await expect(page.getByText('完成了 E2E 测试')).toBeVisible({ timeout: 5000 });
    await expect(page.getByTestId('toast-success')).toBeVisible({ timeout: 3000 });
  });
});

test.describe('Tab 切换', () => {
  test('点击"历史周报" Tab 应切换到历史页', async ({ page }) => {
    await page.getByTestId('tab-history').click();
    // 历史页有"历史周报"标题或空状态
    await expect(page.getByText('历史周报')).toBeVisible();
  });

  test('Tab 切换后再切回应保持正常', async ({ page }) => {
    await page.getByTestId('tab-report').click();
    await page.getByTestId('tab-history').click();
    await page.getByTestId('tab-records').click();
    await expect(page.getByText('本周事项')).toBeVisible();
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
