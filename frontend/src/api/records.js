/**
 * 事项 API
 */
import client from './client';

/**
 * 获取某周的所有事项
 * @param {string} weekStart - YYYY-MM-DD
 */
export function getRecordsByWeek(weekStart) {
  return client.get('/records', { params: { weekStart } });
}

/**
 * 添加事项
 * @param {{ date: string, content: string }} data
 */
export function createRecord(data) {
  return client.post('/records', data);
}

/**
 * 更新事项
 * @param {number} id
 * @param {string} content
 */
export function updateRecord(id, content) {
  return client.put(`/records/${id}`, { content });
}

/**
 * 删除事项
 * @param {number} id
 */
export function deleteRecord(id) {
  return client.delete(`/records/${id}`);
}
