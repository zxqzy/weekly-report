/**
 * 事项业务逻辑层
 * 处理参数校验、业务规则，调用 Model 层
 */

const recordModel = require('../models/recordModel');
const { getWeekStart, isValidDate } = require('../utils/dateHelper');

/**
 * 添加工作事项
 * @param {{ date: string, content: string }} params
 * @returns {object}
 */
function addRecord({ date, content }) {
  if (!date || !isValidDate(date)) {
    throw Object.assign(new Error('日期格式无效，请使用 YYYY-MM-DD'), { statusCode: 400 });
  }
  if (!content || !content.trim()) {
    throw Object.assign(new Error('事项内容不能为空'), { statusCode: 400 });
  }
  const trimmedContent = content.trim();
  if (trimmedContent.length > 500) {
    throw Object.assign(new Error('事项内容不能超过 500 字'), { statusCode: 400 });
  }

  const week_start = getWeekStart(date);
  return recordModel.createRecord({ date, content: trimmedContent, week_start });
}

/**
 * 获取某周的所有事项
 * @param {string} weekStart
 * @returns {object[]}
 */
function getWeekRecords(weekStart) {
  if (!weekStart || !isValidDate(weekStart)) {
    throw Object.assign(new Error('周开始日期格式无效'), { statusCode: 400 });
  }
  return recordModel.getRecordsByWeek(weekStart);
}

/**
 * 获取某天的事项
 * @param {string} date
 * @returns {object[]}
 */
function getDayRecords(date) {
  if (!date || !isValidDate(date)) {
    throw Object.assign(new Error('日期格式无效'), { statusCode: 400 });
  }
  return recordModel.getRecordsByDate(date);
}

/**
 * 更新事项
 * @param {number} id
 * @param {string} content
 * @returns {object}
 */
function editRecord(id, content) {
  if (!content || !content.trim()) {
    throw Object.assign(new Error('事项内容不能为空'), { statusCode: 400 });
  }
  const updated = recordModel.updateRecord(id, content.trim());
  if (!updated) {
    throw Object.assign(new Error('事项不存在'), { statusCode: 404 });
  }
  return updated;
}

/**
 * 删除事项
 * @param {number} id
 */
function removeRecord(id) {
  const deleted = recordModel.deleteRecord(id);
  if (!deleted) {
    throw Object.assign(new Error('事项不存在'), { statusCode: 404 });
  }
}

module.exports = {
  addRecord,
  getWeekRecords,
  getDayRecords,
  editRecord,
  removeRecord,
};
