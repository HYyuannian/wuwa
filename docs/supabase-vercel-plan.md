# Supabase + Vercel Functions 全栈改造方案

> 目标：把当前静态数据看板升级为「Supabase Postgres + Vercel Functions + Vue 前端」的全栈项目，作为作品集展示。
>
> 数据仍然来自 encore.moe 公开 API，只在同步任务中访问；前端只通过自己的只读 API 查询，不存储游戏数据。

## 状态

- [x] 方案文档
- [x] 后端依赖与目录骨架
- [x] 数据库 Schema / Drizzle 配置
- [x] 生成迁移：`drizzle/0000_rainy_zemo.sql`
- [x] Encore 抓取与数据库同步模块（实测 60 / 124 / 37）
- [x] 只读 API（Hono），`/api/health` 与 404 路由本地验证通过
- [ ] Supabase 建库与迁移
- [ ] Vercel 部署
- [ ] 前端切换为 API 查询
- [ ] 测试、README、CI

## 架构

```text
encore.moe API
      │ 手动 / Vercel Cron
      ▼
Supabase Postgres
      │
      ▼
Vercel Functions（Hono + Drizzle，只读 API）
      │  /api/*
      ▼
Vue 前端（只查询，不存游戏数据）
```

## 目录结构

```text
api/
└─ [...route].ts              # Vercel Functions 入口
server/
├─ app.ts                     # Hono 应用
├─ db/
│  ├─ schema.ts               # Drizzle 表结构
│  └─ client.ts               # Supabase Postgres 连接
├─ routes/
│  ├─ characters.ts
│  ├─ weapons.ts
│  ├─ echoes.ts
│  ├─ stats.ts
│  ├─ meta.ts
│  └─ admin.ts
├─ lib/
│  ├─ encore.ts               # Encore 抓取与字段转换
│  ├─ sync.ts                 # 全量替换数据库
│  ├─ auth.ts                 # 定时任务鉴权
│  └─ cache.ts                # 缓存头
│  └─ http.ts                 # 通用响应/错误
drizzle.config.ts
drizzle/                       # 迁移 SQL
scripts/sync-db.ts             # 本地手动同步
vercel.json                    # Cron 配置
```

## 数据库

| 表 | 主要字段 |
|---|---|
| `characters` | `id`、`name`、`rarity`、`element`、`weapon_type`、`avatar_url`、`description` |
| `character_stats` | `character_id`、`level`、`hp`、`atk`、`def`、`crit_rate`、`crit_damage`、`energy_regen` |
| `character_skills` | `id`、`character_id`、`name`、`type`、`description`、`sort_order` |
| `character_roles` | `character_id`、`role` |
| `weapons` | `id`、`name`、`rarity`、`type`、`base_atk`、`sub_stat`、`description`、`icon_url` |
| `echo_sets` | `id`、`name`、`element`、`two_piece`、`five_piece`、`icon_url` |
| `sync_runs` | `id`、`started_at`、`finished_at`、`status`、`counts`、`error` |

索引：

- `characters(element)`、`characters(weapon_type)`、`characters(rarity)`
- `weapons(type)`、`weapons(rarity)`
- `echo_sets(element)`

搜索先使用 `ILIKE`，数据量增长后再加 `pg_trgm` 索引。

## API

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/api/characters?element=&weapon=&rarity=&q=&page=&pageSize=` | 角色分页 / 筛选 |
| GET | `/api/characters/:id` | 角色详情 + 属性 + 技能 + 标签 |
| GET | `/api/weapons?type=&rarity=&q=&page=&pageSize=` | 武器分页 / 筛选 |
| GET | `/api/weapons/:id` | 武器详情 |
| GET | `/api/echoes?element=` | 声骸套装 |
| GET | `/api/stats` | 首页统计和图表数据 |
| GET | `/api/meta` | 数据版本、最后同步时间 |
| GET | `/api/health` | 健康检查 |
| GET | `/api/admin/sync` | 受保护的同步接口 |

响应格式：

```json
{
  "items": [],
  "total": 60,
  "page": 1,
  "pageSize": 24
}
```

- 参数使用 Zod 校验
- 读取接口设置 `Cache-Control`
- 所有写操作只允许 `CRON_SECRET`
- 数据库连接只存在于服务端，前端不接触 `DATABASE_URL`

## 数据同步

1. `server/lib/encore.ts` 从 encore.moe 拉取角色、武器、声骸列表和详情。
2. `server/lib/sync.ts` 在事务中先清空业务表，再批量写入最新数据。
3. 每次同步写入 `sync_runs`，失败时记录错误。
4. 定时同步使用 GitHub Actions（`.github/workflows/sync-db.yml`），避免 Vercel Hobby 函数 60 秒限制；也可以本地运行 `npm run sync:db`。
5. `/api/admin/sync` 保留为受保护的手动触发接口。
6. `public/data/*.json` 保留作为种子数据和离线 fallback。

## 前端改造

新增：

```text
src/api/
├─ http.ts
├─ characters.ts
├─ weapons.ts
├─ echoes.ts
├─ stats.ts
└─ meta.ts

src/queries/
├─ useCharacters.ts
├─ useCharacter.ts
├─ useWeapons.ts
├─ useEchoes.ts
└─ useStats.ts
```

- 引入 `@tanstack/vue-query` 管理服务端状态
- 筛选条件写入 URL query
- 列表使用服务端分页
- 删除 `src/stores/dataset.ts` 和 `src/api/dataset.ts`
- Pinia 只保留主题状态
- 增加 loading 骨架、错误重试、空状态

## 环境变量

```env
DATABASE_URL=postgres://...pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgres://...:5432/postgres
CRON_SECRET=...
VITE_API_BASE=/api
CORS_ORIGIN=https://hyyuannian.github.io
```

- `DATABASE_URL` 只放服务端
- `DIRECT_URL` 用于迁移
- 密钥不加 `VITE_` 前缀
- 使用 Supabase pooler，避免 Serverless 连接数耗尽

## 部署

1. 创建 Supabase 项目，拿到连接串。
2. 本地 `.env` 配置 `DATABASE_URL`、`DIRECT_URL`。
3. 运行 `npm run db:generate` 生成迁移。
4. 运行 `npm run db:migrate` 建表。
5. 运行 `npm run sync:db` 导入第一版数据。
6. 创建 Vercel 项目，关联 GitHub 仓库。
7. 配置 Vercel 环境变量；在 GitHub Secrets 添加 `DATABASE_URL` 供定时同步使用。
8. 部署并验证 API / 页面 / 定时同步。
9. 前端迁到 Vercel，同源访问 API；GitHub Pages 可选保留。

## 安全

- 只读 API 公共访问；写接口必须带 `CRON_SECRET`
- Drizzle 参数化查询
- 不记录数据库连接串、token、完整请求体
- 读取接口走 CDN 缓存
- `sync_runs` 保留同步历史
- 数据源失败时保留上一次成功数据

## 工期

| 阶段 | 预计 |
|---|---|
| Supabase + Schema + 迁移 | 2~3 小时 |
| Encore 模块 + 同步脚本 | 2~3 小时 |
| Hono API + 校验 + 缓存 | 3~4 小时 |
| 前端 API 化 + TanStack Query | 4~5 小时 |
| Vercel + Cron 部署 | 2~3 小时 |
| 测试与文档 | 2~3 小时 |

合计约 1.5~2 天。
