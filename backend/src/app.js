/**
 * Express 应用入口
 * 职责：注册中间件、路由，启动服务器
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { initializeDatabase } = require('./config/database');
const recordRoutes = require('./routes/recordRoutes');
const reportRoutes = require('./routes/reportRoutes');
const errorHandler = require('./middlewares/errorHandler');

// 初始化数据库（建表）
initializeDatabase();

const app = express();

// ── 基础中间件 ──────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ── 健康检查 ────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 业务路由 ────────────────────────────────────────────────────
app.use('/api/records', recordRoutes);
app.use('/api/reports', reportRoutes);

// ── 404 处理 ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ code: -1, message: `路由 ${req.path} 不存在`, data: null });
});

// ── 全局错误处理（必须在最后）──────────────────────────────────
app.use(errorHandler);

// ── 启动服务器 ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
