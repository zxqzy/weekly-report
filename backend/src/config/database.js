/**
 * 数据库配置与初始化
 * 使用 better-sqlite3（同步 SQLite 驱动，适合 Node.js 单进程）
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../../data/weekly_report.db');

// 确保数据目录存在
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/** 单例数据库连接 */
let dbInstance = null;

/**
 * 获取数据库连接（单例模式）
 * @returns {Database.Database}
 */
function getDb() {
  if (!dbInstance) {
    dbInstance = new Database(DB_PATH);
    // 开启 WAL 模式，提升并发读写性能
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('foreign_keys = ON');
  }
  return dbInstance;
}

/**
 * 初始化数据库表结构（首次启动自动建表）
 */
function initializeDatabase() {
  const db = getDb();

  db.exec(`
    -- 工作事项表：每天记录的工作内容
    CREATE TABLE IF NOT EXISTS records (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      date        TEXT    NOT NULL,          -- 日期 YYYY-MM-DD
      content     TEXT    NOT NULL,          -- 事项内容
      week_start  TEXT    NOT NULL,          -- 所属周的周一日期
      created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    -- 周报表：AI 生成或用户编辑后的最终周报
    CREATE TABLE IF NOT EXISTS reports (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      week_start  TEXT    NOT NULL UNIQUE,   -- 周一日期作为唯一键
      content     TEXT    NOT NULL,          -- 周报正文（Markdown 文本）
      is_ai       INTEGER NOT NULL DEFAULT 1, -- 1=AI生成 0=手动编写
      created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
      updated_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    -- 索引优化：按周查询事项
    CREATE INDEX IF NOT EXISTS idx_records_week_start ON records(week_start);
    CREATE INDEX IF NOT EXISTS idx_records_date       ON records(date);
  `);

  console.log('[DB] Database initialized');
  return db;
}

/**
 * 关闭数据库连接（测试环境清理用）
 */
function closeDb() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

module.exports = { getDb, initializeDatabase, closeDb };
