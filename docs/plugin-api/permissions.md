# 权限与能力

`permissions` 声明插件需要使用哪些敏感 Host API。使用 `definePlugin()` 时，这份声明同时决定 callback 中 `ctx` 的 TypeScript 类型和运行时属性。

## 声明权限

```ts
import { definePlugin } from '@tx5dr/plugin-api';

export default definePlugin({
  apiVersion: 2,
  name: 'station-helper',
  version: '1.0.0',
  type: 'utility',
  permissions: ['network', 'radio:read', 'settings:ft8'],

  async onLoad(ctx) {
    const settings = await ctx.settings.ft8.get();
    const capabilities = ctx.radioCapabilities.getSnapshot();
    const response = await ctx.fetch('https://example.com/status');

    ctx.log.info('Station helper ready', {
      autoReply: settings.autoReply,
      capabilityCount: capabilities.capabilities.length,
      remoteOk: response.ok,
    });
  },
});
```

未知权限会在加载时被拒绝。未声明的 capability 不会出现在 `ctx` 上，也不需要在每次使用前手写 `if (ctx.fetch)` 一类检查。

## 权限清单

| 权限 | 添加到 `ctx` 的能力 | 常见用途 |
| --- | --- | --- |
| `network` | `network`、`fetch` | HTTP 和 UDP |
| `plugin:event-bus` | `eventBus` | 插件间进程内消息 |
| `operator:transmit-control` | `operatorCommands` | 开始/停止自动化、请求起呼等高层命令 |
| `radio:read` | `radioCapabilities`、`radioPower` | 读取电台 capability 和电源状态 |
| `radio:control` | `radioCommands` | 调频、切换波段 |
| `radio:tuner-control` | `radioTunerCommands` | 启停调谐器、手动调谐 |
| `radio:power` | `radioPowerCommands` | 开机、关机、待机、恢复工作 |
| `logbook:read` | 只读 `logbook` | worked 查询、QSO 查询和统计 |
| `logbook:write` | 可写 `logbook` | durable 添加或更新 QSO |
| `logbook:sync` | `logbookSync` | 注册同步 Provider |
| `settings:ft8` | `settings.ft8` | FT8/FT4 自动化设置 |
| `settings:decode-windows` | `settings.decodeWindows` | 解码窗口设置 |
| `settings:realtime` | `settings.realtime` | 实时音频传输设置 |
| `settings:frequency-presets` | `settings.frequencyPresets` | 频率预设 |
| `settings:station` | `settings.station` | 站台信息 |
| `settings:psk-reporter` | `settings.pskReporter` | PSK Reporter 设置 |
| `settings:ntp` | `settings.ntp` | NTP 服务器列表 |
| `host:hamlib` | `hostDependencies.hamlib` | 使用 Host 已加载的 Hamlib 依赖 |

## 不需要声明的基础能力

正常 callback 始终可以使用：

- `ctx.config` / `ctx.updateConfig()`
- `ctx.store.global` / `ctx.store.operator`
- `ctx.log`
- `ctx.timers`
- 只读 `ctx.operator`
- 只读 `ctx.radio`
- `ctx.band`
- `ctx.ui`
- `ctx.files`

“基础能力”不表示可以直接修改内部状态。`operator` 和 `radio` 是只读 view；需要产生副作用时，使用有权限的 command port。

## 命令型能力

strategy 通过 `StrategyRuntime.decide()` 返回声明式结果，不申请 `operator:transmit-control`。

utility 使用操作员命令时，必须声明 `operator:transmit-control`，并实现一个运行时开关：

```ts
export default definePlugin({
  apiVersion: 2,
  name: 'scheduled-caller',
  version: '1.0.0',
  type: 'utility',
  permissions: ['operator:transmit-control'],

  settings: {
    enabled: {
      type: 'boolean',
      default: false,
      label: 'enabled',
      scope: 'operator',
    },
  },

  isAutoCallEnabled: (ctx) => ctx.config.enabled === true,

  onLoad(ctx) {
    ctx.timers.set('schedule', 60_000);
  },

  hooks: {
    async onTimer(timerId, ctx) {
      if (timerId !== 'schedule') return;
      if (ctx.config.enabled !== true) return;
      await ctx.operatorCommands.submit({ type: 'start-automation' });
    },
  },
});
```

- 真正会自主起呼的插件使用 `isAutoCallEnabled()`，这样 Host 可以显示并暂停其自动起呼状态。
- 遥控桥、UDP 协议接入等偶尔提交命令但不会自主选台的插件使用 `isTransmitControlEnabled()`。

命令权限不授予 raw PTT、音频输出或物理发射所有权。Host 仍会检查当前物理发射状态和命令 epoch。

## 日志本权限

- 只做 worked 判断或查询：`logbook:read`
- 添加、更新 QSO：`logbook:write`
- 注册同步 Provider：`logbook:sync`

同步插件通常同时需要 `network`、`logbook:read`、`logbook:write` 和 `logbook:sync`。global 插件应通过 `ctx.logbook.forCallsign(callsign)` 访问明确的日志本。

## 网络、EventBus 和 Host 依赖

- `network` 同时提供受控 `ctx.fetch` 和 `ctx.network.udp`。UDP socket 可以保存在插件实例中，但只在有效 callback 中操作，并在 unload 时关闭；Host cleanup 也会回收插件拥有的 socket。
- `plugin:event-bus` 提供 fire-and-forget 的 topic 消息。每个 subscriber 收到独立的 structured-clone 副本；异常由 Host 隔离并记录。保存 `subscribe()` 返回的 unsubscribe，在不再需要时调用。
- `host:hamlib` 是高级 native Host handle，用于复用 Host 已加载的 Hamlib 实例。它不是可序列化数据，不能通过 EventBus、UI 或 Hook 返回值传递。

## iframe 不继承服务端权限

iframe 页面只获得 `window.tx5dr` Bridge，不会直接获得 `fetch`、电台命令或日志本。

```text
iframe invoke -> server-side page handler -> validate requestContext -> capability
```

页面 action 和 data 属于插件自己的输入，必须校验。用户角色、operator、callsign 和资源绑定以 Host 提供的 `requestContext` 为准。

## 权限不是进程沙箱

权限约束的是 TX-5DR 主动提供的公开 API。服务端插件当前与 Host 位于同一 Node.js 进程，因此安装第三方插件仍然意味着信任其代码。不要把 manifest permission 当作执行恶意插件的安全隔离。

## 相关页面

- [插件如何运行](./concepts)
- [电台控制](./radio-capabilities-power)
- [宿主设置](./host-settings)
- [日志同步 Provider](./tutorial-logbook-sync)
- [Capability 映射 Reference](./reference/capabilities)
- [Host Dependencies Reference](./reference/host-dependencies)
- [PluginContext Reference](./reference/context)
