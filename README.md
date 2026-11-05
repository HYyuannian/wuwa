# 鸣潮数据看板 · WUWA DATA

一个非官方的《鸣潮》数据看板，提供角色、武器、声骸与配队数据的检索和可视化。

仓库：https://github.com/HYyuannian/wuwa

在线 Demo（Vercel + Supabase）：https://wuwa-hyyuannian.vercel.app/

GitHub Pages 镜像：https://hyyuannian.github.io/wuwa/

> 当前状态：**全栈版本已上线**。前端通过 Vercel Functions 只读查询 Supabase，数据为 60 名角色、124 把武器、37 套声骸。
>
> 角色含 Lv.1 基础面板、技能、头像与标签；列表支持服务端筛选和分页。

## 技术栈

| 模块 | 选型 |
| --- | --- |
| 框架 | Vue 3 + TypeScript |
| 构建 | Vite |
| UI | Element Plus |
| 图表 | ECharts + vue-echarts |
| 状态 | Pinia（主题）+ TanStack Query（服务端数据） |
| 路由 | Vue Router（Hash 模式，兼容 GitHub Pages） |
| 数据 | Supabase Postgres + Encore 快照种子 |
| 后端 API | Hono + Vercel Functions |
| 数据库 | Supabase Postgres + Drizzle |
| API 打包 | esbuild 单文件函数 |

## 三天排期

### Day 0：数据源与工程初始化

- [x] 初始化 Vite + Vue 3 + TS 工程
- [x] 接入 Element Plus、ECharts、Pinia、Vue Router
- [x] 搭好布局、导航、深色模式、路由骨架
- [x] 定义数据模型与本地快照加载层
- [x] 改用 encore.moe 公开 API（无需账号）
- [x] 编写 `scripts/import-data.mjs` 并生成第一份真实快照

### Day 1：角色模块（核心）

- [x] 角色列表、搜索、属性 / 武器 / 稀有度筛选
- [x] 角色详情页
- [x] Lv.1 基础属性接入
- [x] 角色头像接入（encore.moe 图片）
- [x] 技能字段适配
- [ ] 突破材料与图片本地缓存

### Day 2：武器 / 声骸 / 配队 + 图表

- [x] 武器列表与筛选
- [x] 声骸套装列表（2 件套 / 5 件套效果）
- [x] 属性分布图
- [ ] 武器详情与对比
- [ ] 声骸主副词条与搭配推荐
- [ ] 配队推荐（编辑器为可选项）
- [x] 稀有度占比 / 武器类型分布图表
- [ ] 角色成长曲线

### Day 3：打磨与交付

- [x] 响应式细节、骨架屏、错误态
- [x] 部署 Vercel + GitHub Pages
- [ ] README 截图 / GIF、在线 Demo 链接
- [x] 补充 LICENSE（MIT）
- [ ] 打 `v0.1.0` tag

## 目录结构

```text
.
├─ public/
│  └─ data/                  # Encore 快照（作为数据库种子）
├─ api/
│  ├─ [...route].js          # esbuild 打包后的 Vercel 函数（已提交）
│  └─ ping.ts                # 最小健康探针
├─ api-entry.ts              # Vercel 函数入口源码
├─ server/
│  ├─ db/                    # Drizzle schema / 数据库连接
│  ├─ lib/                   # Encore 抓取、同步、鉴权
│  └─ routes/                # 只读 API 路由
├─ drizzle/                  # 数据库迁移 SQL
├─ docs/
│  ├─ supabase-vercel-plan.md
│  └─ supabase-setup.md
├─ scripts/
│  ├─ import-data.mjs        # 下载并转换社区数据，生成快照
│  ├─ sync-db.ts             # 把数据同步到 Postgres
│  ├─ check-db.ts            # 检查数据库和数据量
│  ├─ build-api.mjs          # esbuild 打包 API
│  ├─ smoke-api.ts           # API 冒烟测试
│  └─ ui-smoke.mjs           # Playwright UI 冒烟测试
├─ .cache/                   # 下载缓存（已 gitignore）
├─ src/
│  ├─ api/                   # API 客户端、DTO、映射
│  ├─ components/            # 通用组件
│  ├─ composables/           # 防抖等组合式函数
│  ├─ constants/             # 属性 / 武器元数据
│  ├─ layouts/               # 页面布局
│  ├─ plugins/               # ECharts 按需注册
│  ├─ queries/               # TanStack Query hooks
│  ├─ router/                # 路由
│  ├─ stores/                # Pinia（仅主题）
│  ├─ styles/                # 全局样式与主题变量
│  ├─ types/                 # 数据模型
│  └─ views/                 # 页面
├─ .github/workflows/        # Pages / 数据库同步 / API / UI 测试
└─ vite.config.ts            # 别名 / base
```

## 本地开发

```bash
npm install
npm run dev
```

Windows PowerShell 如果提示 `npm.ps1` 被执行策略禁止，改用：

```powershell
npm.cmd install
npm.cmd run dev
```

项目自带 `.npmrc`，默认使用 npmmirror（淘宝源），国内网络更稳定。

常用命令：

```bash
npm run dev                 # 本地开发
npm run build               # 类型检查 + 构建
npm run typecheck           # 仅类型检查
npm run preview             # 预览构建产物
npm run import:data         # 生成 / 更新数据快照（优先用缓存）
npm run import:data:refresh # 强制重新下载全部源数据
npm run db:generate         # 生成 Drizzle 迁移
npm run db:migrate          # 应用迁移到 Supabase
npm run sync:db             # 把 Encore 数据同步到数据库
npm run db:check            # 检查数据库连接和数据量
```

## 数据策略：构建时快照

页面运行时**不请求任何第三方接口**，只读取 `public/data/*.json`。这样部署后不受接口下线、限流或跨域影响。

数据流：

1. `scripts/import-data.mjs` 从 encore.moe 下载列表与详情到 `.cache/wuwa/encore/`。
2. 脚本完成字段映射、去重、过滤，输出到 `public/data/`。
3. 前端启动时加载快照，展示列表、筛选、详情和图表。
4. 需要更新数据时重新运行 `npm run import:data:refresh`，再把生成的 JSON 一起提交。

数据源：

- [encore.moe](https://encore.moe)：角色 / 武器 / 声骸公开数据（zh-Hans）
- 接口：`https://api.encore.moe/zh-Hans/character`、`/weapon`、`/echo`

导入规则：

- 角色与武器按名称去重，过滤缺少元素 / 武器类型的异常条目
- 角色 / 武器详情逐条抓取并缓存，失败时自动回退到列表数据
- 武器包含 1~5 星，稀有度筛选可覆盖全部条目
- 角色属性取详情中的 Lv.1 基础面板，技能与标签同步导入

> 社区数据可能滞后于游戏版本，也可能包含未上线内容。本项目在导入阶段做了去重与过滤，但请以游戏内实际内容为准。

## 全栈架构

方案文档：[`docs/supabase-vercel-plan.md`](docs/supabase-vercel-plan.md)

已完成：

- Supabase 项目、表结构、Drizzle 迁移
- 数据导入：60 角色 / 124 武器 / 37 声骸
- Encore 抓取模块、快照入库、受保护的同步接口
- Hono 只读 API：角色、武器、声骸、统计、元信息
- Vercel 部署：前端 + API 同一项目
- 前端 TanStack Query 化：服务端筛选、分页、加载/错误状态
- API smoke 与 Playwright UI smoke 均通过

后续可选项：

- 配队模块
- README 截图 / GIF
- 更多 E2E 覆盖和性能优化

API：

```text
GET /api/characters
GET /api/character?id=1304   # 单段路径，兼容 Vercel catch-all
GET /api/weapons
GET /api/echoes
GET /api/stats
GET /api/meta
GET /api/admin/sync          # 需要 CRON_SECRET
```

> Vercel 的 catch-all 函数只匹配单段路径，因此角色详情使用 `/api/character?id=`，前端会自动处理。

## 部署

### Vercel（主站，前端 + API）

1. 导入 GitHub 仓库，Framework Preset 选 Vite。
2. 构建命令 `npm run build`，输出目录 `dist`。
3. 配置环境变量：`DATABASE_URL`、`DIRECT_URL`、`CRON_SECRET`、`VITE_API_BASE=/api`、`CORS_ORIGIN=*`。
4. 访问：https://wuwa-hyyuannian.vercel.app/

### GitHub Pages（静态镜像）

1. 仓库 Settings → Pages → Source 选择 **GitHub Actions**。
2. 推送到 `main` 后，`.github/workflows/deploy.yml` 会自动构建部署。
3. 前端在 `github.io` 下会自动请求 Vercel API；CORS 已验证。
4. 访问：https://hyyuannian.github.io/wuwa/

### 定时同步

`.github/workflows/sync-db.yml` 每天从 encore.moe 同步到 Supabase；`db-setup.yml` 用于首次建库和种子导入。

## 验收清单

- [x] 角色列表可搜索、筛选、进入详情
- [x] 武器 / 声骸页面可用
- [x] 属性 / 稀有度 / 武器类型图表正常渲染
- [x] 深色 / 浅色模式切换正常
- [ ] 移动端细节打磨
- [x] 前端运行时通过 Supabase API 只读查询
- [x] README 含在线地址与数据来源说明
- [ ] README 截图 / GIF
- [x] 部署成功且有可访问链接
- [x] API 与 UI smoke 测试通过

## 数据来源与免责声明

- 数据来自社区公开项目：[encore.moe](https://encore.moe)
- 本项目为非官方粉丝项目，与库洛游戏无关联。
- 游戏名称、角色、图片等素材版权归原权利人所有，本项目仅用于学习与交流。
- 如果数据源要求署名或删除内容，请通过 Issue 联系。

## License

本项目使用 MIT License，详见 [LICENSE](./LICENSE)。
