/**
 * 周报路由层
 */

const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// POST   /api/reports/generate             - AI 生成周报（注意放在 /:id 前面）
router.post('/generate', reportController.generateReport);

// POST   /api/reports                      - 手动保存周报
router.post('/', reportController.saveReport);

// GET    /api/reports/history              - 历史周报列表
router.get('/history', reportController.getHistory);

// GET    /api/reports?weekStart=YYYY-MM-DD - 获取某周周报
router.get('/', reportController.getWeekReport);

// DELETE /api/reports/:id                  - 删除周报
router.delete('/:id', reportController.deleteReport);

module.exports = router;
