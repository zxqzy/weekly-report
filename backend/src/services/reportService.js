/**
 * 周报业务逻辑层
 */

const reportModel = require('../models/reportModel');
const recordModel = require('../models/recordModel');
const aiService = require('./aiService');
const { isValidDate } = require('../utils/dateHelper');

/**
 * 生成并保存周报（调用 AI）
 * @param {string} weekStart
 * @returns {object}
 */
async function generateAndSaveReport(weekStart) {
  if (!weekStart || !isValidDate(weekStart)) {
    throw Object.assign(new Error('周开始日期格式无效'), { statusCode: 400 });
  }

  // 查询该周的所有事项
  const records = recordModel.getRecordsByWeek(weekStart);

  // 调用 AI 生成
  const { content, isAi } = await aiService.generateWeeklyReport(records, weekStart);

  // 保存到数据库
  const report = reportModel.upsertReport({
    week_start: weekStart,
    content,
    is_ai: isAi ? 1 : 0,
  });

  return report;
}

/**
 * 保存/更新周报内容（用户手动编辑后保存）
 * @param {string} weekStart
 * @param {string} content
 * @returns {object}
 */
function saveReport(weekStart, content) {
  if (!weekStart || !isValidDate(weekStart)) {
    throw Object.assign(new Error('周开始日期格式无效'), { statusCode: 400 });
  }
  if (!content || !content.trim()) {
    throw Object.assign(new Error('周报内容不能为空'), { statusCode: 400 });
  }

  return reportModel.upsertReport({
    week_start: weekStart,
    content: content.trim(),
    is_ai: 0,
  });
}

/**
 * 获取某周的周报
 * @param {string} weekStart
 * @returns {object | null}
 */
function getWeekReport(weekStart) {
  if (!weekStart || !isValidDate(weekStart)) {
    throw Object.assign(new Error('周开始日期格式无效'), { statusCode: 400 });
  }
  return reportModel.getReportByWeek(weekStart);
}

/**
 * 获取历史周报列表
 * @param {number} page
 * @param {number} pageSize
 * @returns {{ reports: object[], total: number, page: number, pageSize: number }}
 */
function getReportHistory(page = 1, pageSize = 10) {
  const limit = Math.min(Math.max(parseInt(pageSize) || 10, 1), 50);
  const offset = (Math.max(parseInt(page) || 1, 1) - 1) * limit;
  const { reports, total } = reportModel.getAllReports(limit, offset);
  return { reports, total, page: parseInt(page), pageSize: limit };
}

/**
 * 删除周报
 * @param {number} id
 */
function removeReport(id) {
  const deleted = reportModel.deleteReport(id);
  if (!deleted) {
    throw Object.assign(new Error('周报不存在'), { statusCode: 404 });
  }
}

module.exports = {
  generateAndSaveReport,
  saveReport,
  getWeekReport,
  getReportHistory,
  removeReport,
};
