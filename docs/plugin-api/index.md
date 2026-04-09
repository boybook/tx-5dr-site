# 插件 API

本节说明 TX-5DR 插件开发所依赖的公共接口、教程入口和自动生成流程。相关源码位于主项目 `packages/plugin-api`，运行时实现位于 `packages/server/src/plugin/`。

如果你是第一次接触 TX-5DR 插件开发，建议不要直接从 Reference 开始，而是先走一遍教程路径。

## 文档范围

- [学习路径](./learning-path)：按从简单到复杂的顺序组织整套教程
- [快速开始](./getting-started)：说明最小插件示例和同步命令
- [第 1 章：Hello Utility](./tutorial-hello-utility)
- [第 2 章：过滤与评分](./tutorial-filter-and-score)
- [第 3 章：守候与自动起呼](./tutorial-watcher-autocall)
- [第 4 章：面板、按钮与定时器](./tutorial-ui-actions-and-panels)
- [第 5 章：StrategyRuntime](./tutorial-strategy-runtime)
- [心智模型](./concepts)：说明 `PluginDefinition`、`PluginContext`、`PluginHooks` 和 `StrategyRuntime` 的关系
- [示例与约定](./examples)：说明常见插件类型与编写边界
- [Reference](./reference/)：从 `packages/plugin-api/src` 与 `packages/contracts/src` 自动生成的接口文档

## 推荐阅读顺序

### 如果你是第一次写插件

1. 先看 [快速开始](./getting-started)
2. 再看 [学习路径](./learning-path)
3. 然后按教程章节顺序往后读

### 如果你已经写过别的插件系统

1. 先看 [心智模型](./concepts)
2. 再看你关心的教程章节
3. 最后用 [Reference](./reference/) 对字段签名

## 源码来源

当前这组插件 API 文档以主项目仓库 `~/Documents/coding/tx-5dr` 的当前源码为事实来源。手写页面基于主项目中的 `docs/plugin-system.md`、`packages/plugin-api` 和内置插件实现；Reference 页面由当前 checkout 的 `packages/plugin-api/src` 自动生成。

## 自动生成命令

站点仓库已提供同步脚本：

```bash
npm run docs:sync-plugin-api
```

该命令会读取 `../tx-5dr` 下的主项目源码；若路径不同，可通过环境变量 `TX5DR_SOURCE_DIR` 覆盖。
