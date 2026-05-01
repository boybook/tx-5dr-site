# 心智模型

本页说明插件接口之间的职责关系。相关类型定义位于 `packages/plugin-api/src/definition.ts`、`context.ts`、`hooks.ts` 和 `runtime.ts`。

## 四个核心接口

- `PluginDefinition`：声明插件名称、版本、类型、设置、静态面板和生命周期入口
- `PluginContext`：提供配置、存储、日志、操作员控制和电台控制接口
- `PluginHooks`：定义过滤、打分、广播监听和配置变更入口
- `StrategyRuntime`：定义策略插件的自动化运行时接口

## PluginDefinition

`PluginDefinition` 是插件入口文件的默认导出结构。该接口负责声明静态信息和生命周期方法，典型字段包括：

- `name`、`version`
- `type`
- `settings`、`quickActions`、`panels`
- `onLoad`、`onUnload`
- `hooks`
- `createStrategyRuntime`

设置字段支持 `boolean`、`number`、`string`、`string[]`、`object[]` 和 `info`。其中 `object[]` 用 `itemFields` 描述每一项的简单字段，适合由宿主生成列表编辑器；如果设置 UI 需要复杂交互，应改用 iframe 设置页。

## PluginContext

`PluginContext` 由宿主在运行时注入。当前公共字段包括：

- `config`
- `store.global` / `store.operator`
- `log`
- `timers`
- `operator`
- `radio`
- `logbook`（查询 + 写入 + 通知）
- `band`
- `ui`（结构化面板推送 + 运行期面板 contribution + iframe 页面通信）
- `files`（二进制文件持久化）
- `logbookSync`（日志同步 Provider 注册）
- `settings`（声明 `settings:*` 权限后访问安全白名单内的宿主设置）
- `fetch`（声明 `network` 权限时可用）

这些字段对应主项目中明确开放给插件的运行时表面。

`ctx.radio` 包含基础只读状态、频率设置、电台能力协商和物理电源管理。能力快照、能力写入、开机请求与自动连接都只暴露在服务端插件上下文中；如果插件提供 iframe UI，应通过页面通信把用户动作交给服务端插件逻辑处理。详细权限与示例见 [电台能力与电源](./radio-capabilities-power)。

`ctx.settings` 用于让受信任插件读取或调整安全白名单内的宿主设置，例如 FT8/FT4 自动化、解码窗口、实时音频传输、频率预设、站台信息、PSK Reporter 和 NTP 服务器。每个命名空间都需要单独权限；iframe 页面不能直接绕过宿主 REST API，应通过 `tx5dr.invoke()` 调用插件后端 handler。详细范围见 [宿主设置能力](./host-settings)。

## 静态面板与运行期 UI Contribution

`PluginDefinition.panels` 适合声明插件安装后固定存在的面板。宿主内部会把这些静态面板视为保留的 `manifest` contribution group，因此它们和运行期动态面板走同一套 slot 查询、iframe 渲染、权限、meta、snapshot 与 websocket 管线。

如果插件需要由配置决定“现在有几个 Tab/面板”，不要预先声明多个空面板，也不要在 iframe 内部伪装宿主 Tab。应在运行时调用：

```ts
ctx.ui.setPanelContributions('my-runtime-group', panels);
ctx.ui.clearPanelContributions('my-runtime-group');
```

`setPanelContributions()` 的语义是替换整个 group。`groupId` 需要是插件内稳定 ID；合并后的 `panel.id` 在同一插件实例内必须唯一。iframe 动态面板可以通过 `params` 复用同一个 `ui.pages` 页面，例如多个语音右侧 Tab 共享一个 `voice-right-webview`，再用 `tx5dr.params.tabId` 区分上下文。

## PluginHooks

`PluginHooks` 用于处理宿主发出的事件。当前主要分为三类：

### Pipeline Hooks

- `onFilterCandidates`
- `onScoreCandidates`

这两个入口会改变候选消息列表或排序结果。

其中 `onScoreCandidates` 适合“偏好排序型”插件：插件通过调整 `candidate.score` 表达偏好，而不是直接调用呼叫控制。内置 `worked-station-bias` 就是标准示例。

### Autocall Proposal Hook

- `onAutoCallCandidate`

这个入口适用于“守候型” utility 插件。它不直接执行呼叫，而是向 Host 返回一个 declarative proposal：

- `callsign`：建议自动起呼的目标呼号
- `priority`：提议优先级，值越大越优先
- `lastMessage`：触发该提议的具体消息及其 slot 元数据

Host 会统一收集并仲裁多个 proposal，再最多执行一次真正的 `requestCall(...)`。这使得多个自动起呼插件可以稳定组合，而不会因为广播 Hook 的执行时序产生竞态。

这里的 `lastMessage.slotInfo` 必须表示触发消息所属的真实 RX 时隙，因为后续自动起呼会依赖它去选择相反的回复周期。

### Autocall Execution Hook

- `onConfigureAutoCallExecution`

这个入口位于 proposal 仲裁之后、真正 `requestCall(...)` 之前，用于描述“命中后怎么执行”。当前内置 `autocall-controls` 就使用它来统一控制自动起呼前的空闲频率选择。

### Broadcast Hooks

- `onSlotStart`
- `onDecode`
- `onQSOStart`
- `onQSOComplete`
- `onQSOFail`
- `onTimer`
- `onUserAction`
- `onConfigChange`

这类入口主要用于监听事件、记录状态、触发定时任务或更新面板。

对于新的自动起呼插件，推荐优先使用 `onAutoCallCandidate`；`onSlotStart` / `onDecode` 更适合做观察、统计、缓存和预处理，而不是直接抢占自动起呼。

## StrategyRuntime

`StrategyRuntime` 只用于 `strategy` 类型插件。当前接口负责以下对象：

- `decide()`：根据解码结果推进自动化流程
- `getTransmitText()`：生成当前发射文本
- `requestCall()`：处理呼叫请求
- `getSnapshot()`：输出运行时快照
- `patchContext()`、`setState()`、`setSlotContent()`、`reset()`：更新策略运行时状态

## 作用域划分

插件设置和存储都区分 `global` 与 `operator` 两个范围：

- `global`：所有操作员共享
- `operator`：每个操作员独立

该划分与主项目的多操作员模型保持一致。
