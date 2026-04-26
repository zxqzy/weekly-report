/**
 * 单元测试 - dateHelper 工具函数
 */

const {
  getWeekStart,
  getWeekEnd,
  formatDate,
  isValidDate,
  getDayOfWeekCN,
} = require('../../src/utils/dateHelper');

describe('dateHelper - getWeekStart', () => {
  test('周一的 weekStart 应该是自身', () => {
    expect(getWeekStart('2024-01-08')).toBe('2024-01-08'); // 周一
  });

  test('周三应返回当周的周一', () => {
    expect(getWeekStart('2024-01-10')).toBe('2024-01-08'); // 周三 -> 周一
  });

  test('周日应返回上周的周一（ISO 周日为本周最后一天）', () => {
    expect(getWeekStart('2024-01-14')).toBe('2024-01-08'); // 周日 -> 本周周一
  });

  test('周六应返回当周的周一', () => {
    expect(getWeekStart('2024-01-13')).toBe('2024-01-08'); // 周六 -> 周一
  });
});

describe('dateHelper - getWeekEnd', () => {
  test('周一对应的周末应为同周周日', () => {
    expect(getWeekEnd('2024-01-08')).toBe('2024-01-14');
  });
});

describe('dateHelper - isValidDate', () => {
  test('合法日期返回 true', () => {
    expect(isValidDate('2024-01-08')).toBe(true);
  });

  test('格式不对返回 false', () => {
    expect(isValidDate('2024/01/08')).toBe(false);
    expect(isValidDate('20240108')).toBe(false);
    expect(isValidDate('')).toBe(false);
    expect(isValidDate(null)).toBe(false);
  });

  test('无效日期返回 false', () => {
    expect(isValidDate('2024-13-01')).toBe(false);
  });
});

describe('dateHelper - getDayOfWeekCN', () => {
  test('周一返回"周一"', () => {
    expect(getDayOfWeekCN('2024-01-08')).toBe('周一');
  });

  test('周五返回"周五"', () => {
    expect(getDayOfWeekCN('2024-01-12')).toBe('周五');
  });

  test('周日返回"周日"', () => {
    expect(getDayOfWeekCN('2024-01-14')).toBe('周日');
  });
});
