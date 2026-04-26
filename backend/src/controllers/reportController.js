/**
 * 周报控制器层
 */

const reportService = require('../services/reportService');
const { success, error } = require('../utils/response');

/**
 * POST /api/reports/generate
 * 调用 AI 生成周报
 */
async function generateReport(req, res) {
  try {
    const { weekStart } = req.body;
    const report = await reportService.generateAndSaveReport(weekStart);
    return success(res, report, '周报生成成功', 201);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

/**
 * POST /api/reports
 * 保存/更新周报（手动编辑后保存）
 */
async function saveReport(req, res) {
  try {
    const { weekStart, content } = req.body;
    const report = reportService.saveReport(weekStart, content);
    return success(res, report, '周报保存成功');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

/**
 * GET /api/reports?weekStart=YYYY-MM-DD
 * 获取某周的周报
 */
async function getWeekReport(req, res) {
  try {
    const { weekStart } = req.query;
    const report = reportService.getWeekReport(weekStart);
    return success(res, report);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

/**
 * GET /api/reports/history?page=1&pageSize=10
 * 获取历史周报列表
 */
async function getHistory(req, res) {
  try {
    const { page, pageSize } = req.query;
    const result = reportService.getReportHistory(page, pageSize);
    return success(res, result);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

/**
 * DELETE /api/reports/:id
 * 删除周报
 */
async function deleteReport(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return error(res, '周报 ID 无效', 400);
    reportService.removeReport(id);
    return success(res, null, '周报删除成功');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

module.exports = { generateReport, saveReport, getWeekReport, getHistory, deleteReport };
