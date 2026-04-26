/**
 * 周报数据模型层
 * 负责所有与 reports 表的数据库操作
 */

const { getDb } = require('../config/database');

/**
 * 创建或更新周报（UPSERT，同一周只保存一份）
 * @param {{ week_start: string, content: string, is_ai: number }} data
 * @returns {object}
 */
function upsertReport(data) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO reports (week_start, content, is_ai)
    VALUES (@week_start, @content, @is_ai)
    ON CONFLICT(week_start) DO UPDATE SET
      content    = excluded.content,
      is_ai      = excluded.is_ai,
      updated_at = datetime('now', 'localtime')
  `);
  stmt.run(data);
  return getReportByWeek(data.week_start);
}

/**
 * 按周一日期查询周报
 * @param {string} weekStart
 * @returns {object | null}
 */
function getReportByWeek(weekStart) {
  const db = getDb();
  return db.prepare('SELECT * FROM reports WHERE week_start = ?').get(weekStart) || null;
}

/**
 * 按 ID 查询周报
 * @param {number} id
 * @returns {object | null}
 */
function getReportById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM reports WHERE id = ?').get(id) || null;
}

/**
 * 获取所有历史周报（按时间倒序）
 * @param {number} limit - 每页数量
 * @param {number} offset - 偏移量
 * @returns {{ reports: object[], total: number }}
 */
function getAllReports(limit = 20, offset = 0) {
  const db = getDb();
  const reports = db
    .prepare('SELECT * FROM reports ORDER BY week_start DESC LIMIT ? OFFSET ?')
    .all(limit, offset);
  const { total } = db.prepare('SELECT COUNT(*) as total FROM reports').get();
  return { reports, total };
}

/**
 * 删除周报
 * @param {number} id
 * @returns {boolean}
 */
function deleteReport(id) {
  const db = getDb();
  const result = db.prepare('DELETE FROM reports WHERE id = ?').run(id);
  return result.changes > 0;
}

module.exports = {
  upsertReport,
  getReportByWeek,
  getReportById,
  getAllReports,
  deleteReport,
};
