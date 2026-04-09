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
    { id: 'stats', label: 'statsPanel' },
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

## 这一章你应该学会什么

- 按钮是 `quickActions + onUserAction(...)`
- 定时逻辑是 `timers + onTimer(...)`
- 面板数据是 `ctx.ui.send(...)`

下一章进入最复杂、也最强大的部分：自己写一个 `strategy` 插件。
