# 下载与分发策略

本页说明官网首页下载区当前如何只依赖 OSS `latest.json` 来获取版本元数据，并按访问地区选择下载链接。相关实现位于站点仓库的 `src/lib/metadata.ts`。

## 数据来源

首页下载区当前只使用一类发布元数据：

- OSS 元数据：通过 `latest.json` 清单获取版本号、commit、更新摘要、附件列表与地域化下载链接。

GitHub Releases 仍然承载正式版和 nightly 的二进制附件，但官网运行时不再调用 GitHub Releases API，也不再依赖 GitHub 上的 `latest.json`。

## 区域与下载链接选择

`src/lib/metadata.ts` 中的 `resolvePreferredSource()` 会先尝试获取国家代码，再决定默认下载链路：

- 国家代码为 `CN` 时，优先选择 `url_cn`（通常指向 OSS / 全球加速 CDN）
- 其他情况，优先选择 `url_global`（通常指向 GitHub Release）
- 若首选链接不存在，则回退到同一资产的备用链接或兼容字段 `url`

该逻辑只决定下载地址，不再决定“去哪个平台读取元数据”。

## 平台与架构判断

站点会基于浏览器环境识别平台和架构，并在 `sortAssetsForDisplay()` 与 `getRecommendedAsset()` 中按以下信息排序：

- 平台：Windows / macOS / Linux
- 架构：如 `x64`、`arm64`
- 包类型：如 `exe`（NSIS）、`dmg`、`deb`、`rpm`、`appimage`

首页推荐下载按钮与平台列表都使用这一排序结果。

## nightly 与 release

当前元数据结构同时保留 `nightly` 和 `release` 两个通道。首页默认展示 nightly；每个通道都从 OSS 上对应的 `latest.json` 读取版本号、commit 和更新摘要。

## 与文档的关系

本页只说明下载区的数据整理方式。具体安装命令、安装包和部署步骤，请阅读 [指南](../guide/) 对应章节。
