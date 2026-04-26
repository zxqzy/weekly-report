/**
 * AI 客户端配置
 * 使用 OpenAI SDK 兼容格式，支持 智谱AI / DeepSeek / OpenAI
 */

const OpenAI = require('openai');

let aiClient = null;

/**
 * 获取 AI 客户端（单例）
 * @returns {OpenAI | null}
 */
function getAiClient() {
  if (!aiClient) {
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      console.warn('[AI] No API key configured, AI generation will use fallback template');
      return null;
    }
    aiClient = new OpenAI({
      apiKey,
      baseURL: process.env.AI_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4',
    });
  }
  return aiClient;
}

const AI_MODEL = process.env.AI_MODEL || 'glm-4-flash';

module.exports = { getAiClient, AI_MODEL };
