/**
 * 集成测试 - 周报 API
 */

const request = require('supertest');

process.env.DB_PATH = ':memory:';
process.env.NODE_ENV = 'test';
// 不配置 AI_API_KEY，使用降级模板测试
process.env.AI_API_KEY = '';

const app = require('../../src/app');
const { closeDb } = require('../../src/config/database');

afterAll(() => closeDb());

// 测试用的周开始日期
const TEST_WEEK = '2024-01-15';

// 为测试周添加一些事项数据
async function seedRecords() {
  await request(app).post('/api/records').send({ date: '2024-01-15', content: '周一：完成架构设计' });
  await request(app).post('/api/records').send({ date: '2024-01-16', content: '周二：前端组件开发' });
  await request(app).post('/api/records').send({ date: '2024-01-17', content: '周三：后端接口联调' });
}

describe('POST /api/reports/generate - 生成周报', () => {
  beforeAll(seedRecords);

  test('有事项时应成功生成周报（降级模板）', async () => {
    const res = await request(app)
      .post('/api/reports/generate')
      .send({ weekStart: TEST_WEEK });

    expect(res.status).toBe(201);
    expect(res.body.code).toBe(0);
    expect(res.body.data).toMatchObject({
      week_start: TEST_WEEK,
    });
    expect(res.body.data.content).toContain('## 本周工作');
  });

  test('周开始日期格式错误应返回 400', async () => {
    const res = await request(app)
      .post('/api/reports/generate')
      .send({ weekStart: 'not-a-date' });
    expect(res.status).toBe(400);
  });

  test('没有任何事项时应返回 400', async () => {
    const res = await request(app)
      .post('/api/reports/generate')
      .send({ weekStart: '2025-01-01' }); // 该周无记录
    expect(res.status).toBe(400);
    expect(res.body.message).toContain('暂无工作记录');
  });
});

describe('GET /api/reports - 获取某周周报', () => {
  test('已有周报时应返回周报数据', async () => {
    const res = await request(app).get('/api/reports').query({ weekStart: TEST_WEEK });
    expect(res.status).toBe(200);
    expect(res.body.data).not.toBeNull();
    expect(res.body.data.week_start).toBe(TEST_WEEK);
  });

  test('没有周报时 data 应为 null', async () => {
    const res = await request(app).get('/api/reports').query({ weekStart: '2020-01-06' });
    expect(res.status).toBe(200);
    expect(res.body.data).toBeNull();
  });
});

describe('POST /api/reports - 手动保存周报', () => {
  const SAVE_WEEK = '2024-01-22';

  test('正常保存应返回周报数据', async () => {
    const content = '## 本周工作\n- 完成功能开发\n\n## 下周计划\n- 持续迭代';
    const res = await request(app)
      .post('/api/reports')
      .send({ weekStart: SAVE_WEEK, content });

    expect(res.status).toBe(200);
    expect(res.body.data.week_start).toBe(SAVE_WEEK);
    expect(res.body.data.is_ai).toBe(0);
  });

  test('再次保存同一周应覆盖', async () => {
    const newContent = '## 本周工作\n- 更新后的内容';
    const res = await request(app)
      .post('/api/reports')
      .send({ weekStart: SAVE_WEEK, content: newContent });

    expect(res.status).toBe(200);
    expect(res.body.data.content).toBe(newContent);
  });

  test('内容为空应返回 400', async () => {
    const res = await request(app)
      .post('/api/reports')
      .send({ weekStart: SAVE_WEEK, content: '' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/reports/history - 历史周报列表', () => {
  test('应返回分页数据', async () => {
    const res = await request(app).get('/api/reports/history').query({ page: 1, pageSize: 5 });
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('reports');
    expect(res.body.data).toHaveProperty('total');
    expect(Array.isArray(res.body.data.reports)).toBe(true);
  });
});

describe('DELETE /api/reports/:id - 删除周报', () => {
  let reportId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/reports')
      .send({ weekStart: '2024-02-05', content: '待删除的周报内容' });
    reportId = res.body.data.id;
  });

  test('正常删除应返回成功', async () => {
    const res = await request(app).delete(`/api/reports/${reportId}`);
    expect(res.status).toBe(200);
    expect(res.body.code).toBe(0);
  });

  test('再次删除应返回 404', async () => {
    const res = await request(app).delete(`/api/reports/${reportId}`);
    expect(res.status).toBe(404);
  });
});

describe('GET /health - 健康检查', () => {
  test('应返回 ok 状态', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});
