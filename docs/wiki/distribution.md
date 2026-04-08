# 下载与分发策略

本页说明官网首页下载区如何组合 GitHub Releases、OSS 元数据和浏览器环境信息。相关实现位于站点仓库的 `src/lib/metadata.ts`。

## 数据来源

首页下载区当前使用两类发布元数据：

- GitHub Releases：通过 GitHub Releases API 获取发布信息和附件列表
- OSS 元数据：通过 `latest.json` 清单获取镜像侧的发布信息

站点会把两类数据整理为统一的 `ReleaseCatalog` 结构，再交给首页组件使用。

## 区域与源选择

`src/lib/metadata.ts` 中的 `resolvePreferredSource()` 会先尝试获取国家代码，再决定默认下载源：

- 国家代码为 `CN` 时，优先选择 OSS
- 其他情况，优先选择 GitHub
- 若首选源缺失元数据，则回退到另一侧

该逻辑用于减少区域网络差异对下载入口的影响。

## 平台与架构判断

站点会基于浏览器环境识别平台和架构，并在 `sortAssetsForDisplay()` 与 `getRecommendedAsset()` 中按以下信息排序：

- 平台：Windows / macOS / Linux
- 架构：如 `x64`、`arm64`
- 包类型：如 `msi`、`dmg`、`deb`、`rpm`

首页推荐下载按钮与平台列表都使用这一排序结果。

## nightly 与 release

当前元数据结构同时保留 `nightly` 和 `release` 两个通道。首页默认展示的内容以当前可用发布物为准，站点本身不额外定义独立版本规则，并沿用主项目发布信息。

## 与文档的关系

本页只说明下载区的数据整理方式。具体安装命令、安装包和部署步骤，请阅读 [指南](../guide/) 对应章节。
