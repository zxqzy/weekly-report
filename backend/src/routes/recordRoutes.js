/**
 * 事项路由层
 */

const express = require('express');
const router = express.Router();
const recordController = require('../controllers/recordController');

// POST   /api/records          - 添加事项
router.post('/', recordController.createRecord);

// GET    /api/records?weekStart=YYYY-MM-DD  - 获取某周事项
router.get('/', recordController.getRecordsByWeek);

// PUT    /api/records/:id      - 更新事项
router.put('/:id', recordController.updateRecord);

// DELETE /api/records/:id      - 删除事项
router.delete('/:id', recordController.deleteRecord);

module.exports = router;
