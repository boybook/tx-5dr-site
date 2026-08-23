# 电台控制

API v2 把电台读取和写入拆成不同接口。`ctx.radio` 始终是只读运行状态；能力协商、调频、调谐和电源操作分别由权限控制。

## 选择权限

| 需求 | 权限 | API |
| --- | --- | --- |
| 读取当前频率、波段、模式和连接状态 | 无 | `ctx.radio` |
| 读取/刷新电台 capability 和电源支持 | `radio:read` | `ctx.radioCapabilities`、`ctx.radioPower` |
| 调频或切换波段 | `radio:control` | `ctx.radioCommands` |
| 启停调谐器或开始手动调谐 | `radio:tuner-control` | `ctx.radioTunerCommands` |
| 改变物理电源状态 | `radio:power` | `ctx.radioPowerCommands` |

这些 API 只存在于服务端插件 context。iframe 页面需要通过 page handler 请求服务端执行。

## 读取运行状态

```ts
hooks: {
  onFrequencyChange(_event, ctx) {
    ctx.log.info('Radio changed', {
      frequency: ctx.radio.frequency,
      band: ctx.radio.band,
      mode: ctx.radio.mode.mode,
      submode: ctx.radio.mode.submode,
      connected: ctx.radio.isConnected,
    });
  },
}
```

读取 `ctx.radio` 不需要权限，也不会把物理设备对象交给插件。

## 读取 capability

```ts
import { definePlugin } from '@tx5dr/plugin-api';

export default definePlugin({
  apiVersion: 2,
  name: 'capability-reader',
  version: '1.0.0',
  type: 'utility',
  permissions: ['radio:read'],

  async onLoad(ctx) {
    const snapshot = await ctx.radioCapabilities.refresh();
    const agc = ctx.radioCapabilities.getState('agc_mode');

    ctx.log.info('Radio capabilities loaded', {
      count: snapshot.capabilities.length,
      agc: agc?.value,
    });
  },
});
```

`getSnapshot()` 返回 Host 当前缓存的描述和值；`refresh()` 会读取底层电台，再返回新的快照。返回值是独立数据，修改它不会改变设备状态。

v2 不再提供任意 capability `write()`。常用写操作被收敛为明确的电台和调谐器命令。

## 调频和切换波段

```ts
export default definePlugin({
  apiVersion: 2,
  name: 'band-control',
  version: '1.0.0',
  type: 'utility',
  instanceScope: 'global',
  permissions: ['radio:read', 'radio:control', 'radio:tuner-control'],

  quickActions: [{ id: 'switch-20m', label: 'switch20m' }],

  hooks: {
    async onUserAction(actionId, _payload, ctx) {
      if (actionId !== 'switch-20m') return;

      await ctx.radioCommands.submit({
        type: 'switch-band',
        frequency: 14_074_000,
        autoTune: true,
      });
    },
  },
});
```

可用电台命令：

```ts
await ctx.radioCommands.submit({
  type: 'set-frequency',
  frequency: 7_074_000,
});

await ctx.radioCommands.submit({
  type: 'switch-band',
  frequency: 14_074_000,
  autoTune: true,
});
```

`autoTune: true` 还需要 `radio:tuner-control`。Host 会在同一个物理空闲检查中完成切频和调谐。

## 调谐器命令

```ts
await ctx.radioTunerCommands.submit({ type: 'set-enabled', enabled: true });
await ctx.radioTunerCommands.submit({ type: 'start-manual-tune' });
```

API 不接受任意 capability ID，因此插件不能借调谐器权限写入其他设备状态。

## 电源状态与命令

```ts
const support = await ctx.radioPower.getSupport();
const state = ctx.radioPower.getState();

if (support.canPowerOn && state?.state !== 'on') {
  const result = await ctx.radioPowerCommands.submit({
    type: 'set-power',
    state: 'on',
    options: { autoEngine: true },
  });
  ctx.log.info('Power command completed', { state: result.state });
}
```

`getSupport(profileId?)` 和 `getState(profileId?)` 需要 `radio:read`。改变状态需要另行声明 `radio:power`。

```ts
await ctx.radioPowerCommands.submit({ type: 'set-power', state: 'standby' });
await ctx.radioPowerCommands.submit({ type: 'set-power', state: 'operate' });
await ctx.radioPowerCommands.submit({ type: 'set-power', state: 'off' });
```

## 物理安全规则

电台和调谐器写操作会在 Digital、Voice、CW、Tune 或人工 PTT 正占用发射机时拒绝。插件命令不会中断已经提交或正在播出的帧，也不会获得 emergency stop。

处理拒绝时应向用户说明当前设备忙碌，不要在无上限循环中持续重试。

## 从 iframe 发起操作

```ts
ctx.ui.registerPageHandler({
  async onMessage(_pageId, action, _data, requestContext) {
    if (action !== 'switch20m') return null;
    if (requestContext.user.role !== 'admin') {
      throw new Error('Admin access is required');
    }
    await ctx.radioCommands.submit({
      type: 'set-frequency',
      frequency: 14_074_000,
    });
    return { ok: true };
  },
});
```

iframe 使用 `await window.tx5dr.invoke('switch20m')`。服务端 handler 仍负责检查页面绑定、用户输入和插件自身开关。

## Reference

- [RadioView 与 command ports](./reference/helpers)
- [电台 contracts 类型](./reference/contracts)
- [权限与能力](./permissions)
