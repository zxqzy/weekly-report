# 项目待办事项

记录当前项目已完成的内容和后续需要做的事情。

---

## ✅ 已完成

- [x] 后端 Express 应用（路由 / 控制器 / 服务 / 模型分层）
- [x] SQLite 数据库初始化（records + reports 表）
- [x] 事项 CRUD API（增删改查）
- [x] 周报 API（AI 生成 / 手动保存 / 历史列表 / 删除）
- [x] AI 服务层（智谱AI / DeepSeek / OpenAI 兼容，含降级模板）
- [x] 后端测试（42 个：单元 + 集成，Jest + Supertest）
- [x] React + Vite 前端项目搭建
- [x] Zustand 全局状态管理
- [x] Axios API 封装层
- [x] 核心组件：WeekSelector / RecordList / ReportPanel / HistoryList / ToastContainer
- [x] 前端组件测试（20 个，Vitest + React Testing Library）
- [x] Playwright E2E 测试配置及用例
- [x] GitHub Actions CI/CD 工作流（后端测试 + 前端测试 + E2E + 自动部署）
- [x] Render.com 后端部署配置（render.yaml）
- [x] Vercel 前端部署配置（vercel.json）
- [x] 环境变量模板（.env.example）
- [x] .gitignore
- [x] README.md

---

## 🔲 待完成

### 高优先级（上线前必做）

- [ ] **实际部署验证** — 将后端部署到 Render、前端部署到 Vercel，验证线上联调正常
- [ ] **配置真实 AI API Key** — 在 Render 控制台填入 `AI_API_KEY`，验证 AI 生成周报功能
- [ ] **配置 CORS_ORIGIN** — 后端环境变量中填入 Vercel 分配的前端域名，避免跨域报错
- [ ] **配置 GitHub Secrets** — 在仓库 Settings → Secrets 中添加 `RENDER_DEPLOY_HOOK`，启用自动部署触发
- [ ] **运行 E2E 测试** — 本地启动前后端后，执行 `npm run test:e2e` 验证完整流程

### 中优先级（功能完善）

- [ ] **用户认证** — 目前没有登录机制，多人使用时数据混在一起；可加 JWT 或简单的 token 鉴权
- [ ] **数据导出** — 支持将周报导出为 Word / PDF 文件，方便邮件发送
- [ ] **Markdown 编辑器** — 将周报编辑区升级为带工具栏的 Markdown 编辑器（如集成 @uiw/react-md-editor）
- [ ] **周报模板自定义** — 允许用户修改 AI Prompt 模板，适配不同团队的周报格式
- [ ] **事项批量操作** — 支持批量删除、拖拽排序
- [ ] **移动端适配** — 当前 CSS 未做响应式，在手机上体验较差

### 低优先级（锦上添花）

- [ ] **数据库升级** — 将 SQLite 替换为 PostgreSQL（Render 提供免费 PostgreSQL），支持多用户并发
- [ ] **监控与告警** — 集成 Sentry 捕获前端 JS 错误和后端异常
- [ ] **SQLite 定期备份** — 编写 cron 脚本将 .db 文件定时上传到云存储（阿里云 OSS / S3）
- [ ] **AI Prompt 优化** — 根据实际生成效果持续调整 prompt，提升周报质量
- [ ] **历史事项搜索** — 支持按关键词搜索历史事项和周报
- [ ] **暗色主题** — 添加 Dark Mode 切换

---

## 📝 备忘

### 本地开发命令

```bash
npm run dev:backend    # 启动后端 (port 3001)
npm run dev:frontend   # 启动前端 (port 5173)
npm run test:backend   # 后端 42 个测试
npm run test:frontend  # 前端 20 个测试
npm run test:e2e       # E2E 测试（需先启动前后端）
```

### AI Key 申请地址

- 智谱AI（免费）：https://open.bigmodel.cn
- DeepSeek（免费额度）：https://platform.deepseek.com

### 部署平台

- 后端：https://render.com（免费 Web Service，冷启动约 30s）
- 前端：https://vercel.com（免费，全球 CDN）
