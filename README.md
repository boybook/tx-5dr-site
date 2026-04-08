# TX-5DR Site

TX-5DR 官网与文档中心，基于 VitePress 构建，面向 GitHub Pages 部署。

## 技术栈

- VitePress + Vue 3
- Tailwind CSS v4
- TypeScript
- GitHub Pages + GitHub Actions

## 当前结构

- `/`：官网首页，展示最新 nightly 元数据、推荐下载、安装命令和多平台下载卡片
- `/guide/`：面向普通 HAM 的安装、选型、部署与首次使用指南
- `/wiki/`：项目定位、架构、分发策略、命令与安装包说明
- `/plugin-api/`：面向插件开发者的文档入口与自动生成的 Reference
- `/en/`：英文首页

## 功能

- 首页直接拉取 TX-5DR 版本元数据并展示下载入口
- 根据当前系统推荐合适的桌面安装包
- 支持展示 Windows / macOS / Linux / Server 下载卡片
- 自动判断是否优先使用中国大陆 OSS 镜像，并在失败时回退
- 亮色 / 暗色主题切换
- 首页中英双语
- 中文文档导航、侧边栏和本地搜索

## 开发

```bash
npm install
npm run docs:sync-plugin-api   # 从 ../tx-5dr 同步插件 API Reference
npm run dev
```

VitePress 默认会在本地启动文档站开发服务器。

## 校验

```bash
npm run docs:prepare
npm run lint
npm run test
npm run build
```

如果主项目源码不在默认的 `../tx-5dr`，可以先设置 `TX5DR_SOURCE_DIR=/path/to/tx-5dr`。

## 发布到 GitHub Pages

1. 将此仓库推送到 GitHub，仓库名建议保持为 `tx-5dr-site`
2. 在仓库 Settings → Pages 中把 Source 设置为 `GitHub Actions`
3. 推送到 `main` 后，`.github/workflows/deploy.yml` 会自动构建并发布

如果未来切换到自定义域名或 `boybook.github.io` 根站点，请把工作流里的 `VITE_BASE_PATH` 调整为 `/`。
