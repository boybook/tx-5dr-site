# 插件系统概览

本页说明 TX-5DR 插件系统的作用范围、类型划分和接口边界。相关实现位于 `packages/server/src/plugin/`，对外公共接口位于 `packages/plugin-api`。

## 背景

自动化逻辑、候选目标筛选、面板展示和外部集成如果直接写入核心后端，会增加以下维护成本：

- 不同场景下的自动化逻辑难以并存
- 外部扩展需要直接修改主项目代码
- 升级主项目时难以隔离本地改动

因此，本项目把扩展点放到插件层，并将公共接口单独整理到 `packages/plugin-api`。

## 插件类型

### 策略插件

策略插件通过 `createStrategyRuntime(ctx)` 返回 `StrategyRuntime`。其特点如下：

- 类型为 `type: 'strategy'`
- 每个操作员同一时刻只启用一个
- 负责 QSO 自动化运行时、状态和发射文本

内置 `standard-qso` 位于 `packages/server/src/plugin/builtins/standard-qso/`，可作为策略插件的参考实现。

### 工具插件

工具插件通过 `hooks` 参与处理流程。其特点如下：

- 类型为 `type: 'utility'`
- 可多个同时启用
- 常用于候选过滤、候选打分、广播监听、面板推送和定时任务

内置 `snr-filter`、`worked-station-bias`、`qso-session-inspector` 和 `heartbeat-demo` 都属于该类。

## 插件接口边界

外部插件开发应优先依赖 `@tx5dr/plugin-api`。当前公共接口包括：

- `PluginDefinition`
- `PluginContext`
- `PluginHooks`
- `StrategyRuntime`
- `KVStore`、`PluginLogger`、`OperatorControl` 等辅助接口

该接口边界用于把插件作者依赖的类型与主项目内部实现分离。

## 配置与数据目录

主项目文档说明，用户插件放置在运行时数据目录下的 `plugins/` 子目录。不同分发形态下的绝对路径不同，但目录结构保持一致。插件本地化文件、README 和入口文件都位于该目录内。

## 与文档的关系

本节说明的是插件层的结构和边界。具体接口字段与类型定义，请继续阅读 [插件 API](../plugin-api/)。
