# TX-5DR Site

TX-5DR 官网项目，面向 GitHub Pages 部署。

## 技术栈

- Vite + React + TypeScript
- Tailwind CSS v4
- i18next / react-i18next
- GitHub Pages + GitHub Actions

## 功能

- 首页直接拉取 TX-5DR 版本元数据并展示下载入口
- 根据当前系统推荐合适的桌面安装包
- 支持展开全部下载方式，展示 installer / archive / deb / rpm / install script
- 自动判断是否优先使用中国大陆 OSS 镜像，并支持手动切换为 GitHub / OSS / 自动
- 亮色 / 暗色主题切换
- 中英双语

## 开发

```bash
npm install
npm run dev
```

## 校验

```bash
npm run lint
npm run test
npm run build
```

## 发布到 GitHub Pages

1. 将此仓库推送到 GitHub，仓库名建议保持为 `tx-5dr-site`
2. 在仓库 Settings → Pages 中把 Source 设置为 `GitHub Actions`
3. 推送到 `main` 后，`.github/workflows/deploy.yml` 会自动构建并发布

如果未来切换到自定义域名或 `boybook.github.io` 根站点，请把工作流里的 `VITE_BASE_PATH` 和 `vite.config.ts` 中的默认 `base` 调整为 `/`。
