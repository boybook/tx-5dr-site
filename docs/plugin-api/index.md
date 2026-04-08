# 插件 API

本节说明 TX-5DR 插件开发所依赖的公共接口、文档入口和自动生成流程。相关源码位于主项目 `packages/plugin-api`，运行时实现位于 `packages/server/src/plugin/`。

## 文档范围

- [快速开始](./getting-started)：说明最小插件示例和同步命令
- [心智模型](./concepts)：说明 `PluginDefinition`、`PluginContext`、`PluginHooks` 和 `StrategyRuntime` 的关系
- [示例与约定](./examples)：说明常见插件类型与编写边界
- [Reference](./reference/)：从 `packages/plugin-api/src` 与 `packages/contracts/src` 自动生成的接口文档

## 源码来源

当前这组插件 API 文档以主项目仓库 `~/Documents/coding/tx-5dr` 的 `feature/plugin-system` 分支为事实来源。手写页面基于该分支的 `docs/plugin-system.md`、`packages/plugin-api` 和内置插件实现；Reference 页面由该分支的 `packages/plugin-api/src` 自动生成。

## 自动生成命令

站点仓库已提供同步脚本：

```bash
npm run docs:sync-plugin-api
```

该命令会读取 `../tx-5dr` 下的主项目源码；若路径不同，可通过环境变量 `TX5DR_SOURCE_DIR` 覆盖。
