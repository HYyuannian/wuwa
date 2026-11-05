# Supabase 创建与连接步骤

> Supabase 项目必须创建在你自己的账号或组织下。这个仓库已经准备好数据库 Schema、迁移、同步脚本和 API，只差连接串。

## 1. 创建项目

1. 打开 https://supabase.com/dashboard
2. 使用 GitHub 登录（推荐）
3. 点击 **New project**
4. 填写：
   - Name：`wuwa-data-dashboard`
   - Database Password：生成一个强密码并保存到密码管理器
   - Region：选择离你最近的区域，国内推荐 **Northeast Asia (Tokyo)** 或 **Southeast Asia (Singapore)**
5. 创建后等待项目状态变为 **Active**

## 2. 获取连接串

进入项目：

**Project Settings → Database → Connection string → URI**

复制两种连接串：

| 用途 | 连接方式 | 端口 |
|---|---|---|
| 运行时 / API | Transaction pooler | 6543 |
| 迁移 / 同步 | Direct connection 或 Session pooler | 5432 |

把密码替换成创建项目时设置的密码。

## 3. 写入本地 `.env`

仓库根目录已经有 `.env`（已 gitignore），填入：

```env
DATABASE_URL=postgresql://postgres.<ref>:<password>@<region>.pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres
CRON_SECRET=<已经自动生成，不需要改>
VITE_API_BASE=/api
CORS_ORIGIN=http://localhost:5173,https://hyyuannian.github.io
```

说明：

- `DATABASE_URL` 用 Transaction pooler，适合 Vercel Serverless
- `DIRECT_URL` 用于 `drizzle-kit migrate`
- `.env` 不要提交，不要把连接串发到聊天里

## 4. 建表与导入数据

```bash
npm run db:migrate
npm run sync:db
npm run db:check
```

期望输出：

```text
[db] characters=60 weapons=124 echoes=37
[db] latest sync: success ...
```

如果迁移失败，确认 `DIRECT_URL` 是 5432 直连或 Session pooler，而不是 6543。

## 5. 本地验证 API

配置好 `.env` 后，可以用 Vercel CLI 本地运行 Functions：

```bash
npx vercel dev
```

然后访问：

```text
http://localhost:3000/api/health
http://localhost:3000/api/characters
http://localhost:3000/api/stats
```

如果暂时不装 Vercel CLI，也可以先只验证数据库：

```bash
npm run db:check
```

## 6. 配置 Vercel

1. 打开 https://vercel.com/new，导入 `HYyuannian/wuwa`
2. Framework Preset：Vite
3. Build Command：`npm run build`
4. Output Directory：`dist`
5. 在 Environment Variables 添加：
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `CRON_SECRET`
   - `CORS_ORIGIN`
   - `VITE_API_BASE=/api`
6. Deploy

部署后验证：

```text
https://<project>.vercel.app/api/health
https://<project>.vercel.app/api/characters
https://<project>.vercel.app/api/stats
```

## 7. 配置定时同步

`.github/workflows/sync-db.yml` 会每天运行一次：

1. 打开 GitHub 仓库 **Settings → Secrets and variables → Actions**
2. 新增 Repository secret：
   - Name：`DATABASE_URL`
   - Value：Supabase Transaction pooler 连接串
3. 在 Actions 页面手动运行一次 **Sync database** 验证

## 8. 常见问题

- **`DATABASE_URL is not set`**：`.env` 没填或当前目录不对
- **`relation "characters" does not exist`**：先运行 `npm run db:migrate`
- **连接超时**：检查是否用了 6543 pooler；迁移改用 5432
- **Vercel 构建失败**：确认环境变量已经在 Vercel 配置，而不是只写在本地 `.env`
- **同步接口 401**：请求头需要 `Authorization: Bearer <CRON_SECRET>`
