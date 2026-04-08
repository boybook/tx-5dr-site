# Wiki

本节用于说明 TX-5DR 的设计背景、组件关系、分发方式和稳定参考信息。相关内容主要对应主项目中的 `README.zh-CN.md`、`CLAUDE.md` 和插件开发文档。

## 内容范围

- [关于](./about)：说明作者、主项目许可证和直接依赖许可证
- [为什么是 TX-5DR](./why-tx5dr)：说明项目要解决的问题、约束条件和当前做法
- [架构概览](./architecture)：说明 `packages/web`、`packages/server`、`packages/electron-main`、`packages/plugin-api` 等模块的关系
- [插件系统概览](./plugin-system)：说明插件类型、加载位置和公共接口边界
- [下载与分发策略](./distribution)：说明首页下载区如何选择 GitHub 和 OSS 元数据
- [命令参考](./commands)：列出常用维护与开发命令
- [安装包说明](./packages)：说明桌面版、Linux 服务器版和 Docker 的发布物

## 阅读顺序

1. 先阅读 [为什么是 TX-5DR](./why-tx5dr)
2. 需要查看许可证与作者信息时，阅读 [关于](./about)
3. 再阅读 [架构概览](./architecture)
4. 需要扩展自动化时，阅读 [插件系统概览](./plugin-system)
5. 需要部署或分发细节时，继续阅读 [下载与分发策略](./distribution) 与 [安装包说明](./packages)
