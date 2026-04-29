# 第 4 章：面板、按钮与定时器

前面几章的插件都偏“后台逻辑”。这一章开始讲插件怎样和用户交互。

最常见的三个入口是：

- `quickActions`
- `onUserAction(...)`
- `onTimer(...)`

以及一条 UI 数据通道：

- `ctx.ui.send(...)`

## 先分清三种用途

### quickActions

适合“让用户点一个按钮触发插件行为”。

例如：

- 手动清空缓存
- 手动触发一次外部同步
- 手动开始一次临时扫描

### onTimer(...)

适合“让插件自己定时做事”。

例如：

- 每 30 秒检查一次状态
- 每 5 分钟推送一次统计
- 一段时间后自动停止某个行为

### ctx.ui.send(...)

适合“让插件把数据推给前端面板”。

例如：

- 当前统计
- 最近事件列表
- 外部接口状态

## 一个最小 quickAction 例子

```ts
import type { PluginDefinition } from '@tx5dr/plugin-api';

const plugin: PluginDefinition = {
  name: 'button-demo',
  version: '1.0.0',
  type: 'utility',
  quickActions: [
    { id: 'ping', label: 'pingAction' },
  ],
  hooks: {
    onUserAction(actionId, _payload, ctx) {
      if (actionId !== 'ping') {
        return;
      }
      ctx.log.info('plugin quick action clicked', {
        actionId,
        operatorId: ctx.operator.id,
      });
    },
  },
};

export default plugin;
```

这类场景的重点是：**用户显式点击，插件再响应**。这和自动起呼 proposal 完全是两种设计语义。

## 一个最小 timer 例子

```ts
import type { PluginDefinition } from '@tx5dr/plugin-api';

const plugin: PluginDefinition = {
  name: 'timer-demo',
  version: '1.0.0',
  type: 'utility',
  onLoad(ctx) {
    ctx.timers.setInterval('heartbeat', 30_000);
  },
  onUnload(ctx) {
    ctx.timers.clear('heartbeat');
  },
  hooks: {
    onTimer(timerId, ctx) {
      if (timerId !== 'heartbeat') {
        return;
      }
      ctx.log.info('heartbeat tick', {
        operatorId: ctx.operator.id,
      });
    },
  },
};

export default plugin;
```

`heartbeat-demo` 就是这一模式的参考实现。

## 一个最小面板数据推送例子

```ts
import type { PluginDefinition } from '@tx5dr/plugin-api';

const plugin: PluginDefinition = {
  name: 'panel-demo',
  version: '1.0.0',
  type: 'utility',
  panels: [
    { id: 'stats', title: 'statsPanel', component: 'key-value', width: 'full' },
  ],
  hooks: {
    onDecode(messages, ctx) {
      ctx.ui.send('stats', {
        decodeCount: messages.length,
        timestamp: Date.now(),
      });
    },
  },
};

export default plugin;
```

这样前端面板就可以订阅这份数据并渲染。

这里顺便出现了一个新字段：`width`。

- `width: 'half'`（默认）表示沿用宿主的常规紧凑布局
- `width: 'full'` 表示“这个面板更重要，希望给它更宽的展示空间”
- 当前操作员卡片 host 会把 `full` 解释为桌面端跨整行显示；但 `automation` 之类的 host 可以按自己的布局策略忽略它，所以它是声明式 hint，而不是绝对布局命令

## 运行时动态面板

上面的 `panels` 是静态声明，适合面板数量固定的插件。如果面板数量来自用户配置（例如语音页面右侧要显示 0 到 N 个网页 Tab），应使用 UI Contribution：

```ts
ctx.ui.setPanelContributions('voice-tabs', [
  {
    id: 'voice-tab:dx-cluster',
    title: 'DX Cluster',
    component: 'iframe',
    pageId: 'voice-webview',
    params: { tabId: 'dx-cluster' },
    slot: 'voice-right-top',
    width: 'full',
  },
]);

ctx.ui.clearPanelContributions('voice-tabs');
```

几点约束：

- `groupId` 是插件内稳定 ID，`setPanelContributions()` 每次替换整个 group
- 静态 `panels` 会被宿主视为保留的 `manifest` group，动态 group 和它们进入同一套渲染管线
- 同一插件实例内合并后的 `panel.id` 必须唯一
- iframe 面板的 `pageId` 必须引用 `ui.pages` 里声明过的页面
- `params` 只接受字符串键值，会作为 `tx5dr.params` 注入 iframe

## 两个内置案例

### heartbeat-demo

它展示的是：

- 生命周期
- timer
- button quickAction

### qso-session-inspector

它展示的是：

- 广播 Hook 监听
- operator-scope 存储
- 面板数据推送

## 什么时候不要用 onUserAction(...)

`onUserAction(...)` 只适合插件自己的交互语义。像这些系统核心控制，不建议绕进去：

- 操作员自动化状态切换
- 策略运行时内部状态推进
- 标准起呼 / 发射控制

这些应该继续走各自明确的宿主机制。

## 需要更灵活的界面？

本章介绍的结构化面板（`key-value`、`table`、`log`、`chart`）适合展示简单数据。但如果你需要：

- 自定义的表单输入
- 交互式图表
- 多步向导
- 完全定制的布局

可以使用 **iframe 面板** —— 插件提供自己的 HTML/CSS/JS 页面，由宿主在沙箱 iframe 中渲染。iframe 面板支持双向通信：`tx5dr.invoke()` 向服务端请求数据，`tx5dr.onPush()` 接收服务端推送。

详见 [第 6 章：自定义 UI 与 iframe 面板](./tutorial-custom-ui)。

## 这一章你应该学会什么

- 按钮是 `quickActions + onUserAction(...)`
- 定时逻辑是 `timers + onTimer(...)`
- 面板数据是 `ctx.ui.send(...)`
- 动态宿主面板是 `ctx.ui.setPanelContributions(...)`
- 需要自定义交互时，用 iframe 面板（第 6 章）

下一章进入最复杂、也最强大的部分：自己写一个 `strategy` 插件。
