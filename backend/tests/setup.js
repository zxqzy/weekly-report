/**
 * Jest 测试全局配置
 * 每次测试使用内存数据库，保证测试隔离
 */

const { getDb, closeDb } = require('../src/config/database');

// 在所有测试前，将数据库切换为内存模式
beforeAll(() => {
  // 使用测试专用的内存数据库路径
  process.env.DB_PATH = ':memory:';
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  closeDb();
});
