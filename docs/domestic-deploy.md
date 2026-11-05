# 国内可访问部署方案

> 目标：让完整 API 版本在中国大陆网络下可直接访问，不再依赖 `*.vercel.app`。
>
> 前置结论：GitHub Pages 镜像已经可用（静态快照）；本文档用于部署**完整 API**。

## 可选平台

| 平台 | 形态 | 国内访问 | 成本/门槛 | 推荐度 |
|---|---|---|---|---|
| 腾讯云 CloudBase 云托管 | 容器 | 默认域名可用 | 需腾讯云实名，低用量有免费额度 | 推荐 |
| 阿里云函数计算 FC | 容器 / Node | 默认域名可用 | 需阿里云实名，有免费额度 | 推荐 |
| 腾讯云轻量应用服务器 | VPS + Docker | 可用 | 约 ¥30+/月，需自行配域名/HTTPS | 可控 |
| Sealos | 容器云 | 可用 | GitHub 登录，可能有试用额度 | 可试 |
| Vercel 自定义域名 | 海外 | 不保证 | 需域名，仍可能被阻断 | 不推荐 |
| GitHub Pages | 静态 | 可用 | 免费 | 已有镜像 |

## 已准备好的部署物

仓库已包含：

- `server/standalone.ts`：标准 Node HTTP 服务，监听 `PORT`（默认 3000）
- `scripts/build-server.mjs`：esbuild 打包为 `dist-server/server.mjs`
- `Dockerfile`：多阶段构建，运行时不需要 node_modules
- `api/[...route].js`：Vercel 版本，保留不动

本地验证：

```bash
npm run build:server
PORT=3001 DATABASE_URL=postgres://localhost:5432/dummy npm run start:server
curl http://127.0.0.1:3001/api/health
```

## 容器部署步骤（通用）

1. 构建镜像：
   ```bash
   docker build -t wuwa-api .
   ```
2. 推送到镜像仓库（腾讯云 TCR、阿里云 ACR、GHCR 等）。
3. 在平台创建服务/函数，选择该镜像，端口填 `3000`。
4. 环境变量：
   ```env
   DATABASE_URL=<Supabase transaction pooler 或国内 Postgres>
   CRON_SECRET=<同步密钥>
   CORS_ORIGIN=*
   ```
5. 部署后先测：
   ```text
   https://<国内域名>/api/health
   https://<国内域名>/api/characters
   ```
6. 把 GitHub Pages 的 `VITE_API_BASE` 指向国内 API，或直接修改 `src/api/http.ts` 的 fallback 地址。

## 关键风险：Supabase 可能需要一起迁移

当前数据库在 Supabase（海外）。国内主机不一定能稳定访问 Supabase：

- 如果国内 API 能连通 Supabase：只需换 API 部署，成本最低。
- 如果连不上/延迟过高：把数据库迁到国内 Postgres（腾讯云 PostgreSQL、阿里云 RDS），然后：
  1. 修改 `DATABASE_URL`
  2. 运行 `npm run db:migrate`
  3. 运行 `npm run sync:db -- --snapshot`
  4. API 代码不需要改

GitHub Actions 负责的定时同步可以继续从 GitHub 侧写国内数据库，也可以改到国内主机。

## 下一步

选定平台后，需要：

- 平台账号（实名）
- 镜像仓库（或平台自带的代码构建）
- 国内 API 域名/默认域名

把平台和可用的登录方式告诉我，我可以继续准备镜像构建、环境变量和部署命令。
