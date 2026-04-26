/**
 * 单元测试 - aiService
 * 测试 prompt 构建和降级逻辑（不真实调用 API）
 */

const { buildPrompt, buildFallbackReport } = require('../../src/services/aiService');

const mockRecords = [
  { date: '2024-01-08', content: '修复了登录模块的 bug' },
  { date: '2024-01-08', content: '完成了用户表设计' },
  { date: '2024-01-09', content: '参加需求评审会议' },
  { date: '2024-01-10', content: '前端页面开发' },
];

describe('aiService - buildPrompt', () => {
  test('生成的 prompt 应包含各日期的工作内容', () => {
    const prompt = buildPrompt(mockRecords, '2024-01-08');
    expect(prompt).toContain('修复了登录模块的 bug');
    expect(prompt).toContain('参加需求评审会议');
    expect(prompt).toContain('2024-01-08');
    expect(prompt).toContain('2024-01-09');
  });

  test('生成的 prompt 应包含本周工作、风险、下周计划关键词', () => {
    const prompt = buildPrompt(mockRecords, '2024-01-08');
    expect(prompt).toContain('本周工作');
    expect(prompt).toContain('风险');
    expect(prompt).toContain('下周计划');
  });

  test('同一天的多条事项应按编号列出', () => {
    const prompt = buildPrompt(mockRecords, '2024-01-08');
    expect(prompt).toContain('1.');
    expect(prompt).toContain('2.');
  });
});

describe('aiService - buildFallbackReport', () => {
  test('降级模板应包含原始事项内容', () => {
    const report = buildFallbackReport(mockRecords, '2024-01-08');
    expect(report).toContain('修复了登录模块的 bug');
    expect(report).toContain('参加需求评审会议');
  });

  test('降级模板应包含 Markdown 标题', () => {
    const report = buildFallbackReport(mockRecords, '2024-01-08');
    expect(report).toContain('## 本周工作');
    expect(report).toContain('## 下周计划');
  });

  test('无事项时降级模板显示暂无记录', () => {
    const report = buildFallbackReport([], '2024-01-08');
    expect(report).toContain('暂无记录');
  });
});

describe('aiService - generateWeeklyReport', () => {
  beforeEach(() => {
    // 清除之前测试的 AI 客户端缓存
    jest.resetModules();
    delete process.env.AI_API_KEY;
  });

  test('无 API Key 时应返回降级模板', async () => {
    process.env.AI_API_KEY = '';
    const { generateWeeklyReport } = require('../../src/services/aiService');
    const result = await generateWeeklyReport(mockRecords, '2024-01-08');
    expect(result.isAi).toBe(false);
    expect(result.content).toContain('## 本周工作');
  });

  test('记录为空时应抛出错误', async () => {
    const { generateWeeklyReport } = require('../../src/services/aiService');
    await expect(generateWeeklyReport([], '2024-01-08')).rejects.toThrow('暂无工作记录');
  });
});
