import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,  // 保证测试有序执行
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // CI 环境无头运行，本地开发显示真实浏览器窗口 + 慢动作方便观察
    headless: !!process.env.CI,
    slowMo: process.env.CI ? 0 : 500,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // CI 中自动启动前后端
  webServer: process.env.CI ? [
    {
      command: 'cd ../backend && node src/app.js',
      url: 'http://localhost:3001/health',
      reuseExistingServer: !process.env.CI,
      env: {
        PORT: '3001',
        NODE_ENV: 'test',
        DB_PATH: ':memory:',
        AI_API_KEY: '',
      },
      timeout: 30000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
  ] : undefined,
});
