/**
 * AI 服务层
 * 负责构建 prompt、调用大模型 API，并处理降级逻辑
 */

const { getAiClient, AI_MODEL } = require('../config/ai');
const { getDayOfWeekCN } = require('../utils/dateHelper');

/**
 * 将事项列表转换为 prompt 文本
 * @param {object[]} records - 事项列表 [{ date, content }]
 * @param {string} weekStart - 周一日期
 * @returns {string}
 */
function buildPrompt(records, weekStart) {
  // 按日期分组
  const grouped = records.reduce((acc, r) => {
    if (!acc[r.date]) acc[r.date] = [];
    acc[r.date].push(r.content);
    return acc;
  }, {});

  // 生成每日条目
  const dailyText = Object.keys(grouped)
    .sort()
    .map((date) => {
      const dayName = getDayOfWeekCN(date);
      const items = grouped[date].map((c, i) => `  ${i + 1}. ${c}`).join('\n');
      return `${date}（${dayName}）：\n${items}`;
    })
    .join('\n\n');

  return `你是一名专业的职场写作助手。请根据以下本周工作记录，生成一份结构清晰、语言专业的工作周报。

要求：
1. 周报格式如下（严格遵守，使用 Markdown）：
## 本周工作
（列出主要工作成果，每条用 - 开头，语言简洁专业）

## 遇到的问题与风险
（如无明显问题可写"无明显风险"，有问题则简述）

## 下周计划
（根据本周工作合理推断下周安排，每条用 - 开头）

2. 不要照搬原始描述，要提炼归纳，使用正式的书面表达。
3. 只输出周报正文，不要输出其他解释。

本周工作记录（${weekStart} 起）：
${dailyText}`;
}

/**
 * 生成降级模板（AI 不可用时使用）
 * @param {object[]} records
 * @param {string} weekStart
 * @returns {string}
 */
function buildFallbackReport(records, weekStart) {
  const grouped = records.reduce((acc, r) => {
    if (!acc[r.date]) acc[r.date] = [];
    acc[r.date].push(r.content);
    return acc;
  }, {});

  const workItems = Object.keys(grouped)
    .sort()
    .flatMap((date) => grouped[date].map((c) => `- ${c}（${date}）`))
    .join('\n');

  return `## 本周工作
${workItems || '- 暂无记录'}

## 遇到的问题与风险
- 无明显风险

## 下周计划
- 请根据实际情况填写下周计划

> ⚠️ 此周报由模板生成（AI 接口未配置），请手动完善内容。`;
}

/**
 * 调用 AI 生成周报
 * @param {object[]} records - 事项列表
 * @param {string} weekStart - 周一日期
 * @returns {{ content: string, isAi: boolean }}
 */
async function generateWeeklyReport(records, weekStart) {
  if (!records || records.length === 0) {
    throw Object.assign(new Error('本周暂无工作记录，请先添加事项'), { statusCode: 400 });
  }

  const client = getAiClient();

  // 无 AI 配置时使用降级模板
  if (!client) {
    return {
      content: buildFallbackReport(records, weekStart),
      isAi: false,
    };
  }

  try {
    const prompt = buildPrompt(records, weekStart);
    const completion = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('AI 返回内容为空');
    }

    return { content: content.trim(), isAi: true };
  } catch (err) {
    console.error('[AI] Generation failed, using fallback:', err.message);
    // AI 调用失败时降级为模板
    return {
      content: buildFallbackReport(records, weekStart),
      isAi: false,
    };
  }
}

module.exports = { generateWeeklyReport, buildPrompt, buildFallbackReport };
