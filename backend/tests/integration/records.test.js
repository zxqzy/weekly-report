/**
 * 集成测试 - 事项 API
 * 使用 Supertest 发送真实 HTTP 请求，验证完整请求-响应链路
 */

const request = require('supertest');

// 测试前切换为内存数据库
process.env.DB_PATH = ':memory:';
process.env.NODE_ENV = 'test';

const app = require('../../src/app');
const { closeDb } = require('../../src/config/database');

afterAll(() => closeDb());

describe('POST /api/records - 添加事项', () => {
  test('正常添加事项应返回 201 和事项数据', async () => {
    const res = await request(app).post('/api/records').send({
      date: '2024-01-08',
      content: '完成登录模块开发',
    });
    expect(res.status).toBe(201);
    expect(res.body.code).toBe(0);
    expect(res.body.data).toMatchObject({
      date: '2024-01-08',
      content: '完成登录模块开发',
      week_start: '2024-01-08',
    });
    expect(res.body.data.id).toBeDefined();
  });

  test('日期格式错误应返回 400', async () => {
    const res = await request(app).post('/api/records').send({
      date: '2024/01/08',
      content: '测试',
    });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe(-1);
  });

  test('内容为空应返回 400', async () => {
    const res = await request(app).post('/api/records').send({
      date: '2024-01-08',
      content: '',
    });
    expect(res.status).toBe(400);
  });

  test('缺少日期字段应返回 400', async () => {
    const res = await request(app).post('/api/records').send({
      content: '测试',
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/records?weekStart=YYYY-MM-DD - 获取某周事项', () => {
  let createdId;

  beforeAll(async () => {
    // 准备测试数据
    const res = await request(app).post('/api/records').send({
      date: '2024-01-09',
      content: '设计数据库表结构',
    });
    createdId = res.body.data.id;
  });

  test('正常查询应返回该周事项列表', async () => {
    const res = await request(app).get('/api/records').query({ weekStart: '2024-01-08' });
    expect(res.status).toBe(200);
    expect(res.body.code).toBe(0);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  test('周开始日期格式错误应返回 400', async () => {
    const res = await request(app).get('/api/records').query({ weekStart: 'invalid' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/records/:id - 更新事项', () => {
  let recordId;

  beforeAll(async () => {
    const res = await request(app).post('/api/records').send({
      date: '2024-01-10',
      content: '原始内容',
    });
    recordId = res.body.data.id;
  });

  test('正常更新应返回更新后的数据', async () => {
    const res = await request(app)
      .put(`/api/records/${recordId}`)
      .send({ content: '更新后的内容' });
    expect(res.status).toBe(200);
    expect(res.body.data.content).toBe('更新后的内容');
  });

  test('不存在的 ID 应返回 404', async () => {
    const res = await request(app).put('/api/records/99999').send({ content: '内容' });
    expect(res.status).toBe(404);
  });

  test('非法 ID 应返回 400', async () => {
    const res = await request(app).put('/api/records/abc').send({ content: '内容' });
    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/records/:id - 删除事项', () => {
  let recordId;

  beforeAll(async () => {
    const res = await request(app).post('/api/records').send({
      date: '2024-01-11',
      content: '待删除的事项',
    });
    recordId = res.body.data.id;
  });

  test('正常删除应返回成功', async () => {
    const res = await request(app).delete(`/api/records/${recordId}`);
    expect(res.status).toBe(200);
    expect(res.body.code).toBe(0);
  });

  test('重复删除应返回 404', async () => {
    const res = await request(app).delete(`/api/records/${recordId}`);
    expect(res.status).toBe(404);
  });
});
