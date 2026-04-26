# ✨ AI 周报系统

一个基于大模型的智能工作周报生成工具。记录每日工作事项，一键调用 AI 生成结构化周报，支持编辑保存和历史查看。

**技术栈：** React 18 + Vite · Node.js + Express · SQLite · 智谱AI / DeepSeek / OpenAI

---

## 功能特性

- 📝 **事项管理** — 按天记录工作内容，支持增删改，自动归属到所在周
- 🤖 **AI 生成周报** — 一键调用大模型，将零散事项提炼为三段式专业周报（本周工作 / 风险问题 / 下周计划）
- ✏️ **编辑 & 保存** — 生成后可手动润色，保存最终版本
- 📋 **历史周报** — 查看所有历史周报，支持展开预览和删除
- 🔄 **周导航** — 自由切换任意一周查看事项和周报
- 🔌 **AI 降级** — 未配置 API Key 时自动使用模板生成，不影响主流程

---

## 项目结构

```
weekly-report/
├── backend/                    # Node.js + Express 后端
│   ├── src/
│   │   ├── app.js              # Express 入口
│   │   ├── config/             # 数据库 & AI 客户端配置
│   │   ├── controllers/        # 路由控制器
│   │   ├── services/           # 业务逻辑层
│   │   ├── models/             # 数据库操作层
│   │   ├── routes/             # 路由注册
│   │   ├── middlewares/        # 错误处理中间件
│   │   └── utils/              # 日期工具、响应封装
│   ├── tests/
│   │   ├── unit/               # 单元测试（aiService、dateHelper）
│   │   └── integration/        # 集成测试（records API、reports API）
│   ├── .env.example            # 环境变量模板
│   └── render.yaml             # Render.com 部署配置
│
├── frontend/                   # React + Vite 前端
│   ├── src/
│   │   ├── api/                # Axios 封装（records / reports）
│   │   ├── store/              # Zustand 全局状态管理
│   │   ├── components/         # UI 组件
│   │   │   ├── WeekSelector    # 周切换器
│   │   │   ├── RecordList      # 事项列表
│   │   │   ├── ReportPanel     # 周报生成/编辑面板
│   │   │   ├── HistoryList     # 历史周报列表
│   │   │   └── ToastContainer  # 通知提示
│   │   └── test/               # Vitest 组件测试
│   ├── e2e/                    # Playwright E2E 测试
│   ├── .env.example            # 前端环境变量模板
│   ├── playwright.config.js    # E2E 测试配置
│   ├── vercel.json             # Vercel 部署配置
│   └── vite.config.js          # Vite + Vitest 配置
│
├── .github/workflows/ci.yml    # GitHub Actions CI/CD
├── .gitignore
└── package.json                # Monorepo 快捷脚本
```

---

## 快速开始

### 前置要求

- Node.js >= 18
- npm >= 9

### 1. 克隆项目

```bash
git clone https://github.com/your-username/weekly-report.git
cd weekly-report
```

### 2. 安装依赖

```bash
# 安装前后端依赖（一键）
npm run install:all

# 或分别安装
cd backend && npm install
cd ../frontend && npm install
```

### 3. 配置环境变量

```bash
cp backend/.env.example backend/.env
```

编辑 `backend/.env`，填入 AI API Key（可选，不填则使用降级模板）：

```env
# 智谱AI 免费申请：https://open.bigmodel.cn
AI_API_KEY=your_api_key_here
AI_BASE_URL=https://open.bigmodel.cn/api/paas/v4
AI_MODEL=glm-4-flash
```

> **不配置 AI Key 也可以正常使用**，系统会自动用模板生成周报，你再手动编辑即可。

### 4. 启动开发服务器

打开两个终端窗口：

```bash
# 终端 1 — 启动后端（端口 3001）
npm run dev:backend

# 终端 2 — 启动前端（端口 5173）
npm run dev:frontend
```

浏览器访问 **http://localhost:5173** 即可使用。

---

## 运行测试

```bash
# 后端测试（42 个：单元 + 集成）
npm run test:backend

# 前端组件测试（20 个：Vitest + React Testing Library）
npm run test:frontend

# 运行所有测试
npm run test:all

# E2E 测试（需要先启动前后端）
npm run test:e2e
```

---

## 部署上线

### 后端 → Render.com（免费）

1. 在 [Render.com](https://render.com) 创建 **Web Service**，连接 GitHub 仓库
2. 设置：
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. 在 Environment 面板添加 `AI_API_KEY`、`CORS_ORIGIN`（填前端域名）等环境变量
4. 部署后获得 `https://your-app.onrender.com`

### 前端 → Vercel（免费）

1. 在 [Vercel](https://vercel.com) 导入 GitHub 仓库
2. 设置 **Root Directory** 为 `frontend`
3. 添加环境变量：
   ```
   VITE_API_BASE_URL=https://your-app.onrender.com/api
   ```
4. 部署后获得 `https://your-app.vercel.app`

### CI/CD（自动化）

每次推送到 `main` 分支时，GitHub Actions 自动：
1. 运行后端单元 + 集成测试
2. 运行前端组件测试 + 构建验证
3. 运行 E2E 测试
4. 全部通过后触发 Render 自动部署

在仓库 Settings → Secrets 中添加 `RENDER_DEPLOY_HOOK` 即可启用自动部署触发。

---

## API 接口概览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| GET | `/api/records?weekStart=YYYY-MM-DD` | 获取某周事项 |
| POST | `/api/records` | 添加事项 |
| PUT | `/api/records/:id` | 更新事项 |
| DELETE | `/api/records/:id` | 删除事项 |
| POST | `/api/reports/generate` | AI 生成周报 |
| POST | `/api/reports` | 手动保存周报 |
| GET | `/api/reports?weekStart=YYYY-MM-DD` | 获取某周周报 |
| GET | `/api/reports/history` | 历史周报列表 |
| DELETE | `/api/reports/:id` | 删除周报 |

---

## 支持的 AI 服务

在 `backend/.env` 中切换配置即可：

| 服务 | 免费额度 | baseURL |
|------|----------|---------|
| 智谱AI (推荐) | ✅ 有免费额度 | `https://open.bigmodel.cn/api/paas/v4` |
| DeepSeek | ✅ 有免费额度 | `https://api.deepseek.com/v1` |
| OpenAI | ❌ 需付费 | `https://api.openai.com/v1` |
