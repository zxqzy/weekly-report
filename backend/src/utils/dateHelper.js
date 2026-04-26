/**
 * 日期工具函数
 */

/**
 * 获取指定日期所在周的周一日期
 * @param {string} dateStr - YYYY-MM-DD 格式日期
 * @returns {string} - YYYY-MM-DD 格式的周一日期
 */
function getWeekStart(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const day = date.getDay(); // 0=周日 1=周一 ... 6=周六
  const diff = day === 0 ? -6 : 1 - day; // 调整到周一
  date.setDate(date.getDate() + diff);
  return formatDate(date);
}

/**
 * 获取周结束日期（周日）
 * @param {string} weekStart - YYYY-MM-DD 格式的周一日期
 * @returns {string} - 周日日期
 */
function getWeekEnd(weekStart) {
  const date = new Date(weekStart + 'T00:00:00');
  date.setDate(date.getDate() + 6);
  return formatDate(date);
}

/**
 * 格式化 Date 为 YYYY-MM-DD
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 获取当前周的周一日期
 * @returns {string}
 */
function getCurrentWeekStart() {
  return getWeekStart(formatDate(new Date()));
}

/**
 * 校验日期字符串格式是否合法
 * @param {string} dateStr
 * @returns {boolean}
 */
function isValidDate(dateStr) {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const date = new Date(dateStr + 'T00:00:00');
  return !isNaN(date.getTime());
}

/**
 * 将日期映射到中文星期
 * @param {string} dateStr
 * @returns {string}
 */
function getDayOfWeekCN(dateStr) {
  const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const date = new Date(dateStr + 'T00:00:00');
  return days[date.getDay()];
}

module.exports = {
  getWeekStart,
  getWeekEnd,
  formatDate,
  getCurrentWeekStart,
  isValidDate,
  getDayOfWeekCN,
};
