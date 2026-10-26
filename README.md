# 随手记 · 个人记账本（Next.js 全栈项目）

一个按**阶段推进**开发的全栈 Web 项目：从零搭建到完整可用的个人记账应用。**四个阶段全部完成** ✅

## 技术栈

| 层面 | 技术 |
|---|---|
| 框架 | Next.js 16（App Router，前后端一体） |
| 语言 | TypeScript |
| 样式 | Tailwind CSS v4 |
| 数据库 | SQLite（本地开发）+ Prisma ORM（生产可平滑切换 PostgreSQL） |
| 认证 | Auth.js（NextAuth v5，Credentials + JWT Session）+ bcryptjs |
| 图表 | Recharts 3 |
| 校验 | Zod |

## 目录结构与开发阶段

实际开发在 `dev/` 工作区进行，**每完成一个阶段，就把当时的完整源码快照存入对应阶段文件夹**（不含 `node_modules` / `.next` / 数据库文件，进入文件夹执行 `npm install && npx prisma db push` 即可还原运行）。

```
personal-ledger/
├── dev/                    # 开发工作区（最终完整版，含 README）
├── 阶段一-基础框架/        # ✅ 脚手架 + 全局布局 + 路由占位
├── 阶段二-记账核心/        # ✅ Prisma 建模 + 流水增删改查
├── 阶段三-用户系统/        # ✅ 注册登录 + 数据隔离
├── 阶段四-统计看板/        # ✅ 图表看板 + 打磨 + 部署说明
└── README.md               # 本文件
```

## 阶段进度（全部完成）

| 阶段 | 内容 | 交付物 | 状态 |
|---|---|---|---|
| 一 | 项目基础框架 | Next.js 脚手架、中文全局布局与导航、首页/明细/统计路由骨架、生产构建通过 | ✅ 完成 |
| 二 | 记账核心功能 | Prisma 数据模型、`/api/transactions` REST API（zod 校验）、明细页（录入/列表/编辑/删除/按月筛选） | ✅ 完成 |
| 三 | 用户系统 | 注册/登录页面、Auth.js JWT 会话、proxy 路由保护、流水按用户隔离 | ✅ 完成 |
| 四 | 统计看板 | 近 6 个月趋势柱状图、支出分类环图、分类排行、月度汇总卡片、部署说明 | ✅ 完成 |

每个阶段交付前均通过两项验证：`npm run build` 生产构建零错误 + 启动服务冒烟测试（页面、API、认证流、数据隔离逐一验证）。

## 本地运行（最新完整版 dev/）

```bash
cd dev
npm install         # 安装依赖
npx prisma db push  # 初始化 SQLite 数据库
npm run dev         # 开发服务器 http://localhost:3000
# 或生产模式：npm run build && npm start
```

启动后访问 `/register` 注册账号即可开始使用。

### 任意历史阶段运行

```bash
cd 阶段二-记账核心   # 进入想体验的阶段文件夹
npm install && npx prisma db push   # 阶段一起无需 prisma
npm run dev
```

## 部署提示（详见 dev/README.md）

- **Vercel**：导入即部署；环境变量需 `DATABASE_URL`、`AUTH_SECRET`。
- Serverless 环境请把数据库切到 PostgreSQL（Neon/Supabase 免费档），schema 的 provider 一改即可。
- 自托管：`npm run build && npm start` + 反代 3000 端口，设置 `AUTH_TRUST_HOST=true` 与 `AUTH_URL`。

## 开发过程中的关键决策

- **Prisma 锁定 6.x 稳定版**：npm latest 会装到 8.0 RC（CLI 全面重构、无 `db push`），生产项目不追 RC。
- **Next 16 新约定**：middleware 已迁移为 `proxy.ts`；动态数据访问用 `<Suspense>` 流式渲染（Cache Components 要求）。
- **移除 Google Fonts**：`next/font/google` 构建时需联网下载字体，国内网络易卡死，改用系统字体栈。
- **日期处理**：统一 UTC 日存储 + ISO 串展示，规避时区偏移；月份区间用「下月一号」计算而非 `-31` 拼接。
- **安全边界**：proxy 粗筛 Cookie + 服务端 `auth()` 精确鉴权双层防护；他人记录返回 404 而非 403，不泄露数据存在性。
