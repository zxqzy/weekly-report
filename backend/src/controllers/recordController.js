/**
 * 事项控制器层
 * 负责接收 HTTP 请求、调用 Service、返回响应
 */

const recordService = require('../services/recordService');
const { success, error } = require('../utils/response');

/**
 * POST /api/records
 * 添加工作事项
 */
async function createRecord(req, res) {
  try {
    const { date, content } = req.body;
    const record = recordService.addRecord({ date, content });
    return success(res, record, '事项添加成功', 201);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

/**
 * GET /api/records?weekStart=YYYY-MM-DD
 * 获取某周的所有事项
 */
async function getRecordsByWeek(req, res) {
  try {
    const { weekStart } = req.query;
    const records = recordService.getWeekRecords(weekStart);
    return success(res, records);
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

/**
 * PUT /api/records/:id
 * 更新事项内容
 */
async function updateRecord(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return error(res, '事项 ID 无效', 400);
    const { content } = req.body;
    const updated = recordService.editRecord(id, content);
    return success(res, updated, '事项更新成功');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

/**
 * DELETE /api/records/:id
 * 删除事项
 */
async function deleteRecord(req, res) {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return error(res, '事项 ID 无效', 400);
    recordService.removeRecord(id);
    return success(res, null, '事项删除成功');
  } catch (err) {
    return error(res, err.message, err.statusCode || 500);
  }
}

module.exports = { createRecord, getRecordsByWeek, updateRecord, deleteRecord };
