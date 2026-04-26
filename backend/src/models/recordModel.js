/**
 * 事项数据模型层
 * 负责所有与 records 表的数据库操作
 */

const { getDb } = require('../config/database');

/**
 * 创建工作事项
 * @param {{ date: string, content: string, week_start: string }} data
 * @returns {{ id: number, date: string, content: string, week_start: string, created_at: string, updated_at: string }}
 */
function createRecord(data) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO records (date, content, week_start)
    VALUES (@date, @content, @week_start)
  `);
  const result = stmt.run(data);
  return getRecordById(result.lastInsertRowid);
}

/**
 * 按 ID 查询事项
 * @param {number} id
 * @returns {object | null}
 */
function getRecordById(id) {
  const db = getDb();
  return db.prepare('SELECT * FROM records WHERE id = ?').get(id) || null;
}

/**
 * 按周查询所有事项（按日期升序）
 * @param {string} weekStart - YYYY-MM-DD 格式的周一日期
 * @returns {object[]}
 */
function getRecordsByWeek(weekStart) {
  const db = getDb();
  return db
    .prepare('SELECT * FROM records WHERE week_start = ? ORDER BY date ASC, id ASC')
    .all(weekStart);
}

/**
 * 按日期查询事项
 * @param {string} date - YYYY-MM-DD
 * @returns {object[]}
 */
function getRecordsByDate(date) {
  const db = getDb();
  return db
    .prepare('SELECT * FROM records WHERE date = ? ORDER BY id ASC')
    .all(date);
}

/**
 * 更新事项内容
 * @param {number} id
 * @param {string} content
 * @returns {object | null}
 */
function updateRecord(id, content) {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE records
    SET content = @content, updated_at = datetime('now', 'localtime')
    WHERE id = @id
  `);
  const result = stmt.run({ id, content });
  if (result.changes === 0) return null;
  return getRecordById(id);
}

/**
 * 删除事项
 * @param {number} id
 * @returns {boolean}
 */
function deleteRecord(id) {
  const db = getDb();
  const result = db.prepare('DELETE FROM records WHERE id = ?').run(id);
  return result.changes > 0;
}

module.exports = {
  createRecord,
  getRecordById,
  getRecordsByWeek,
  getRecordsByDate,
  updateRecord,
  deleteRecord,
};
