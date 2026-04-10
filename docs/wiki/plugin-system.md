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

其中比较典型的两类规范入口是：

- `onScoreCandidates(...)`：用于“偏好排序型”插件，例如已通联偏置，只调整候选分数，不直接控制呼叫
- `onAutoCallCandidate(...)`：用于“守候型”插件，返回自动起呼提议，由 Host 统一仲裁

内置 `snr-filter`、`worked-station-bias`、`qso-session-inspector`、`heartbeat-demo`、`watched-callsign-autocall` 和 `watched-novelty-autocall` 都属于该类。

### 自动起呼提议（Autocall Proposal）

对于“守候型”工具插件，当前推荐实现 `onAutoCallCandidate(slotInfo, messages, ctx)`，返回一个自动起呼提议，而不是在 `onSlotStart` / `onDecode` 中直接调用 `ctx.operator.call(...)`。

其设计目标是让多个自动起呼插件可以稳定组合：

- Host 会收集所有活跃 utility 插件的提议
- 统一按 `priority`、命中消息顺序、插件名稳定排序进行仲裁
- 仲裁完成后，最多只执行一次统一的 `requestCall(...)`

内置参考：

- `watched-callsign-autocall`：显式守候呼号，默认优先级更高
- `watched-novelty-autocall`：守候新 DXCC / 新网格 / 新呼号，适合和其他插件组合

这套 proposal 机制是当前推荐的新写法；旧插件仍可兼容直接 `call()`，但不再建议作为新插件的默认实现方式。

这里最重要的细节之一是：`lastMessage.slotInfo` 必须表示**触发消息真正所属的 RX 时隙**，而不是简单复用当前 hook 被调用时的时隙参数。后续自动起呼会根据这条消息所属时隙去推导下一次发射周期；如果时隙语义写错，就可能出现同一时隙误发。

### 自动起呼执行策略（Autocall Execution）

proposal 胜出后，Host 还会继续调用 `onConfigureAutoCallExecution(request, plan, ctx)`。这个 hook 用来描述“命中后如何执行”，而不是“如何发现目标”。

当前内置 `autocall-controls` 就是通过这个 hook 提供共享执行策略，例如：

- 是否在自动起呼前先选择更空闲的发射音频频率
- 后续不同自动起呼插件之间如何共享同一套执行层策略

如果插件需要复用系统内已有的空闲频率选择算法，应使用 `ctx.band.findIdleTransmitFrequency(...)`，而不是自己重写一套频谱占用分析逻辑。

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
