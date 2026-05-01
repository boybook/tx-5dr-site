# 电台能力与电源

本页说明插件如何通过服务端运行时 `ctx.radio` 访问电台能力协商系统与物理电源管理。该接口只暴露给服务端插件逻辑；iframe 页面内的 `window.tx5dr` Bridge 不会直接获得这些能力。

## 适用场景

电台能力与电源接口适合以下类型的插件：

- 在启动时检查当前电台是否支持 AGC、前置放大、衰减器、调谐器等能力
- 根据插件策略读取或刷新当前能力状态
- 将枚举、数值或布尔能力写回物理电台
- 在任务开始前请求电台开机、唤醒 control-only 连接，并让 Host 自动连接和启动引擎
- 在面板按钮点击后，由服务端插件逻辑代为执行受控电台操作

不建议在 iframe 内自行绕过插件服务端逻辑调用这些能力。自定义 UI 应把用户动作发送给 `ctx.ui.pages` 对应的服务端 handler，再由服务端插件根据权限和业务规则调用 `ctx.radio`。

## 权限声明

电台相关权限按用途拆分：

```ts
const plugin = {
  name: 'radio-assistant',
  version: '1.0.0',
  type: 'utility',
  permissions: ['radio:read', 'radio:control', 'radio:power'],
};
```

权限含义如下：

| 权限 | 允许的能力 |
| --- | --- |
| `radio:read` | 读取能力快照、单项能力状态、刷新能力、读取电源支持信息与最近电源状态 |
| `radio:control` | 写入能力、设置频率等电台控制操作 |
| `radio:power` | 请求开机、关机、待机、恢复工作等物理电源操作 |
| `network` | 仍仅表示插件可使用 `ctx.fetch` 访问网络 |

缺少权限时，Host 会在运行时抛出明确错误，例如插件需要声明 `radio:power` 才能调用 `ctx.radio.power.set(...)`。权限声明统一写在 `PluginDefinition.permissions`，更多设计背景见 [插件权限模型](./permissions)。

## 读取能力快照

`ctx.radio.capabilities.getSnapshot()` 返回 Host 当前维护的能力描述与状态；`refresh()` 会先请求底层能力刷新，再返回更新后的快照。

```ts
import type { PluginDefinition } from '@tx5dr/plugin-api';

const plugin: PluginDefinition = {
  name: 'capability-reader',
  version: '1.0.0',
  type: 'utility',
  permissions: ['radio:read'],
  async onLoad(ctx) {
    const snapshot = await ctx.radio.capabilities.refresh();
    const agc = ctx.radio.capabilities.getState('agc_mode');

    ctx.log.info('radio capability snapshot', {
      count: snapshot.capabilities.length,
      agc: agc?.value,
    });
  },
};

export default plugin;
```

常用方法：

```ts
ctx.radio.capabilities.getSnapshot();
ctx.radio.capabilities.getState('agc_mode');
await ctx.radio.capabilities.refresh();
```

## 写入能力

`ctx.radio.capabilities.write(...)` 使用 `WriteCapabilityPayload`，支持布尔、数值、字符串枚举和 action 能力。

```ts
import type { PluginDefinition } from '@tx5dr/plugin-api';

const plugin: PluginDefinition = {
  name: 'capability-writer',
  version: '1.0.0',
  type: 'utility',
  permissions: ['radio:control'],
  async onLoad(ctx) {
    await ctx.radio.capabilities.write({ id: 'agc_mode', value: 'fast' });
    await ctx.radio.capabilities.write({ id: 'rf_gain', value: 65 });
    await ctx.radio.capabilities.write({ id: 'tuner_tune', action: true });
  },
};

export default plugin;
```

写入前建议先读取快照，确认目标能力的 `supported`、`availability`、`valueType` 和枚举选项。底层能力管理器仍会做最终校验，因此不支持或不可用的能力会被拒绝。

## 电源支持与状态

电源 API 默认使用当前 active profile，也可以显式传入 `profileId`。

```ts
const support = await ctx.radio.power.getSupport();
const state = ctx.radio.power.getState();

ctx.log.info('radio power support', {
  profileId: support.profileId,
  canPowerOn: support.canPowerOn,
  state: state?.state,
  stage: state?.stage,
});
```

如果插件管理多个配置档，可以显式指定：

```ts
const support = await ctx.radio.power.getSupport('field-rig');
const state = ctx.radio.power.getState('field-rig');
```

`getState()` 返回的是 Host 最近记录到的电源状态事件；如果该 profile 尚未产生过事件，会返回 `null`。

## 请求开机并自动连接

`ctx.radio.power.set('on')` 会走 Host 现有的物理开机、control-only 唤醒、promote-to-full、能力 bootstrap、自动连接和引擎启动流程。`autoEngine` 默认是 `true`。

```ts
import type { PluginDefinition } from '@tx5dr/plugin-api';

const plugin: PluginDefinition = {
  name: 'wake-radio-before-work',
  version: '1.0.0',
  type: 'utility',
  permissions: ['radio:read', 'radio:power'],
  async onLoad(ctx) {
    const support = await ctx.radio.power.getSupport();
    if (!support.canPowerOn) {
      ctx.log.warn('current radio profile cannot be powered on by plugin');
      return;
    }

    const result = await ctx.radio.power.set('on');
    ctx.log.info('radio power requested', {
      target: result.target,
      finalState: result.state,
    });
  },
};

export default plugin;
```

需要覆盖配置档或禁用自动启动引擎时：

```ts
await ctx.radio.power.set('on', {
  profileId: 'field-rig',
  autoEngine: false,
});
```

其他目标状态包括：

```ts
await ctx.radio.power.set('standby');
await ctx.radio.power.set('operate');
await ctx.radio.power.set('off');
```

## UI 插件中的推荐调用方式

自定义 UI 面板如果需要提供“开机”“调谐”“切换 AGC”等按钮，应保持以下分层：

1. iframe 页面通过 `window.tx5dr` 向插件服务端页面 handler 发送结构化请求。
2. 服务端插件校验当前设置、操作员上下文和权限。
3. 服务端插件调用 `ctx.radio.capabilities` 或 `ctx.radio.power`。
4. 插件通过 `ctx.ui.send(...)` 或页面响应把结果回传给 iframe。

这样可以让敏感电台操作继续受 manifest 权限约束，也避免把物理电源控制直接暴露到浏览器 iframe。
