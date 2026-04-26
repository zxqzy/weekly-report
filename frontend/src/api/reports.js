/**
 * 周报 API
 */
import client from './client';

/**
 * AI 生成周报
 * @param {string} weekStart - YYYY-MM-DD
 */
export function generateReport(weekStart) {
  return client.post('/reports/generate', { weekStart });
}

/**
 * 手动保存/更新周报
 * @param {{ weekStart: string, content: string }} data
 */
export function saveReport(data) {
  return client.post('/reports', data);
}

/**
 * 获取某周的周报
 * @param {string} weekStart
 */
export function getWeekReport(weekStart) {
  return client.get('/reports', { params: { weekStart } });
}

/**
 * 获取历史周报列表
 * @param {number} page
 * @param {number} pageSize
 */
export function getReportHistory(page = 1, pageSize = 10) {
  return client.get('/reports/history', { params: { page, pageSize } });
}

/**
 * 删除周报
 * @param {number} id
 */
export function deleteReport(id) {
  return client.delete(`/reports/${id}`);
}
