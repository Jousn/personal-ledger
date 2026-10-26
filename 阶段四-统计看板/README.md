# 随手记 · 个人记账本

一个全栈个人记账应用：收支记录、按月管理、多用户隔离、统计看板。

## 技术栈

- **框架**：Next.js 16（App Router、Turbopack、Cache Components）
- **语言**：TypeScript
- **样式**：Tailwind CSS v4
- **数据库**：SQLite + Prisma ORM（本地零配置，生产可切 PostgreSQL）
- **认证**：Auth.js（NextAuth v5）+ bcryptjs，JWT 会话
- **图表**：Recharts 3
- **校验**：Zod

## 快速开始

```bash
npm install          # 安装依赖
npx prisma db push   # 初始化本地 SQLite 数据库（prisma/dev.db）
npm run dev          # 开发模式 http://localhost:3000
```

生产构建与运行：

```bash
npm run build
npm start
```

> 首次启动后先访问 `/register` 注册账号，再进入记账明细页。

## 功能

- 注册 / 登录（邮箱 + 密码），会话由 Auth.js JWT 维持
- 记一笔：收入/支出、分类、备注、日期
- 明细页：按月筛选、上月/下月切换、月份跳转、编辑、删除
- 数据按用户完全隔离（他人记录一律 404，不泄露存在性）
- 统计看板：本月收支结余、近 6 个月趋势柱状图、支出分类环图、分类排行
- 路由保护：`src/proxy.ts`（Next 16 的 middleware 约定）粗筛 + 服务端 `auth()` 精确鉴权

## 目录结构

```
src/
├── app/
│   ├── page.tsx                  # 首页（功能介绍 + 开发路线图）
│   ├── login/ · register/        # 登录 / 注册
│   ├── transactions/             # 记账明细（增删改查 + 月度汇总）
│   ├── stats/                    # 数据统计看板
│   └── api/
│       ├── auth/                 # NextAuth 端点 + 注册接口
│       └── transactions/         # 流水 REST API（zod 校验、登录态、用户隔离）
├── auth.ts                       # Auth.js 配置（Credentials + JWT）
├── proxy.ts                      # 路由保护（Next 16 proxy 约定）
├── components/                   # NavBar / 表单 / 列表 / 图表等
└── lib/                          # prisma 单例、常量、校验、鉴权、统计聚合
prisma/schema.prisma              # User / Transaction 数据模型
```

## API 一览

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/api/auth/register` | 注册（name/email/password） |
| GET/POST | `/api/transactions` | 列表（?month=&type=）/ 新建 |
| GET/PUT/DELETE | `/api/transactions/:id` | 单条查/改/删（仅本人的记录） |

所有 `/api/transactions*` 需要登录，未登录返回 401。

## 部署提示

- **Vercel**：导入仓库即可构建；需配置环境变量 `DATABASE_URL`、`AUTH_SECRET`（`openssl rand -base64 32` 生成）。Vercel 自动信任主机。
- SQLite 在 Serverless 上不可持久化，生产请把 `schema.prisma` 的 provider 换成 `postgresql`（Neon/Supabase 免费档即可），金额字段建议同时改为 `Decimal`。
- 自托管：`npm run build && npm start`，反向代理指向 3000 端口，并设置 `AUTH_TRUST_HOST=true` 与 `AUTH_URL=https://你的域名`。

## 说明

- 日期统一按 UTC 日存储、以 ISO 日期串展示，避免时区偏移。
- 金额本地开发用 Float（SQLite 无 Decimal），生产换 Postgres 后建议 Decimal。
