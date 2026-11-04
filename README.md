# 鸣潮数据看板 · WUWA DATA

一个非官方的《鸣潮》数据看板，提供角色、武器、声骸与配队数据的检索和可视化。

仓库：https://github.com/HYyuannian/wuwa

> 当前状态：**可运行版本**，已接入社区数据快照：60 名角色、124 把武器、37 套声骸。角色含 Lv.1 基础面板、技能、头像与标签。

## 技术栈

| 模块 | 选型 |
| --- | --- |
| 框架 | Vue 3 + TypeScript |
| 构建 | Vite |
| UI | Element Plus |
| 图表 | ECharts + vue-echarts |
| 状态 | Pinia |
| 路由 | Vue Router（Hash 模式，兼容 GitHub Pages） |
| 数据 | Node 导入脚本 + 构建时本地 JSON 快照 |

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
- [ ] 角色头像接入（encore.moe 图片）
- [ ] 技能字段适配
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

- [ ] 响应式细节、骨架屏、错误态
- [ ] 部署 Vercel 或 GitHub Pages
- [ ] README 截图 / GIF、在线 Demo 链接
- [ ] 补充 LICENSE（建议 MIT）
- [ ] 打 `v0.1.0` tag

## 目录结构

```text
.
├─ public/
│  └─ data/                  # 构建时生成的数据快照（已提交）
│     ├─ meta.json
│     ├─ characters.json
│     ├─ weapons.json
│     ├─ echoes.json
│     └─ teams.json
├─ scripts/
│  └─ import-data.mjs        # 下载并转换社区数据，生成快照
├─ .cache/                   # 下载缓存（已 gitignore）
├─ src/
│  ├─ api/                   # 快照加载
│  ├─ components/            # 通用组件
│  ├─ constants/             # 属性 / 武器元数据
│  ├─ layouts/               # 页面布局
│  ├─ plugins/               # ECharts 按需注册
│  ├─ router/                # 路由
│  ├─ stores/                # Pinia（主题、数据集）
│  ├─ styles/                # 全局样式与主题变量
│  ├─ types/                 # 数据模型
│  └─ views/                 # 页面
├─ .github/workflows/        # GitHub Pages 自动部署
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

## 部署

### Vercel（推荐）

1. 导入 GitHub 仓库。
2. 构建命令 `npm run build`，输出目录 `dist`。
3. 纯静态部署，无需配置接口代理。

### GitHub Pages（纯静态，兼容 Hash 路由）

1. 仓库 Settings → Pages → Source 选择 **GitHub Actions**。
2. 推送到 `main` 后，`.github/workflows/deploy.yml` 会自动构建部署。
3. 本项目使用相对路径 + Hash 路由，项目页无需额外设置 `VITE_BASE`。
4. 启用后访问：https://hyyuannian.github.io/wuwa/
5. 在仓库 Variables 里配置 `VITE_REPO_URL`，导航栏会显示 GitHub 入口。

## 验收清单

- [x] 角色列表可搜索、筛选、进入详情
- [x] 武器 / 声骸页面可用
- [x] 属性 / 稀有度 / 武器类型图表正常渲染
- [x] 深色 / 浅色模式切换正常
- [ ] 移动端细节打磨
- [x] 数据更新不依赖运行时接口
- [ ] README 含截图、在线地址、数据来源说明
- [ ] 部署成功且有可访问链接

## 数据来源与免责声明

- 数据来自社区公开项目：[encore.moe](https://encore.moe)
- 本项目为非官方粉丝项目，与库洛游戏无关联。
- 游戏名称、角色、图片等素材版权归原权利人所有，本项目仅用于学习与交流。
- 如果数据源要求署名或删除内容，请通过 Issue 联系。

## License

本项目使用 MIT License，详见 [LICENSE](./LICENSE)。
