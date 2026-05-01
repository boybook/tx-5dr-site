# 插件权限模型

TX-5DR 插件权限用于声明和约束敏感宿主能力。权限不是普通插件设置，而是插件在定义阶段向 Host 明确请求的 capability；Host 会在加载和运行时根据声明决定是否开放对应 API。

## 设计概念

权限系统遵循三个原则：

- **显式声明**：插件必须在 `PluginDefinition.permissions` 中写出自己需要的敏感能力。
- **最小权限**：插件应只申请当前功能真正需要的权限，避免一次性申请所有权限。
- **运行时兜底**：权限不是 TypeScript 提示而已；缺少权限时，Host 会让对应 API 不可用或在调用时抛出明确错误。

权限声明主要解决两类问题：

- 让使用者和插件管理界面能看到插件打算触碰哪些敏感能力。
- 让 Host 在服务端插件上下文中把网络、电台控制、宿主设置等能力隔离开。

## 配置方法

权限写在插件默认导出的 `PluginDefinition` 上：

```ts
import type { PluginDefinition } from '@tx5dr/plugin-api';

const plugin: PluginDefinition = {
  name: 'my-station-helper',
  version: '1.0.0',
  type: 'utility',
  permissions: ['network', 'radio:read', 'settings:ft8'],
  hooks: {
    async onLoad(ctx) {
      const ft8 = await ctx.settings.ft8.get();
      ctx.log.info('FT8 settings loaded', {
        maxSameTransmissionCount: ft8.maxSameTransmissionCount,
      });
    },
  },
};

export default plugin;
```

Drop-in JavaScript 插件同样使用 `permissions` 字段：

```js
export default {
  name: 'my-drop-in-plugin',
  version: '1.0.0',
  type: 'utility',
  permissions: ['network'],
  async onLoad(ctx) {
    const resp = await ctx.fetch('https://example.com/ping');
    ctx.log.info('network probe complete', { ok: resp.ok });
  },
};
```

Host 加载插件时会把 `permissions` 通过 contracts schema 校验；未知权限字符串会导致插件定义校验失败。

## 权限清单

| 权限 | 解锁能力 | 典型用途 |
| --- | --- | --- |
| `network` | `ctx.fetch` | 访问外部 API、上传日志、同步远程数据 |
| `radio:read` | `ctx.radio.capabilities.getSnapshot()`、`refresh()`、`getState()`、`ctx.radio.power.getSupport()`、`getState()` | 读取电台能力、电源支持和当前状态 |
| `radio:control` | `ctx.radio.setFrequency()`、`ctx.radio.capabilities.write()` | 设置频率、写入 AGC/RF Power/Tuner 等能力 |
| `radio:power` | `ctx.radio.power.set(...)` | 开机、关机、待机、恢复工作 |
| `settings:ft8` | `ctx.settings.ft8` | 读取/更新 FT8/FT4 自动化设置 |
| `settings:decode-windows` | `ctx.settings.decodeWindows` | 读取/替换解码窗口设置 |
| `settings:realtime` | `ctx.settings.realtime` | 读取/更新实时音频传输设置 |
| `settings:frequency-presets` | `ctx.settings.frequencyPresets` | 读取/替换/重置频率预设 |
| `settings:station` | `ctx.settings.station` | 读取/更新站台信息 |
| `settings:psk-reporter` | `ctx.settings.pskReporter` | 读取/更新 PSK Reporter 设置 |
| `settings:ntp` | `ctx.settings.ntp` | 读取/更新 NTP 服务器列表 |

## 不需要权限的常用能力

普通插件运行时能力默认可用，不需要额外权限：

- `ctx.config`：读取插件自身配置。
- `ctx.store`：访问插件隔离的持久化 KV 存储。
- `ctx.log`：写入插件日志。
- `ctx.timers`：注册宿主管理的定时器。
- `ctx.operator`：当前插件实例对应的操作员控制面。
- `ctx.logbook`：查询、写入和通知日志更新。
- `ctx.band`：读取当前频段和 slot 解码数据。
- `ctx.ui`：推送面板数据、注册 iframe 页面 handler。
- `ctx.files`：使用插件隔离的文件存储沙箱。
- `ctx.logbookSync`：注册日志同步 Provider。

这些能力仍然受插件实例作用域、数据隔离和具体方法校验约束；“不需要权限”不表示插件可以访问宿主内部任意对象。

## 运行时行为

不同权限的失败形态略有差异：

- `network` 未声明时，`ctx.fetch` 为 `undefined`。插件应在调用前确认它存在，或通过类型/配置保证已声明。
- `radio:*` 未声明时，对应 `ctx.radio` 方法会抛出包含所需权限的错误。
- `settings:*` 未声明时，对应 `ctx.settings` 命名空间的 `get()` / `update()` 会抛出包含所需权限的错误。
- 设置类 API 会复用宿主 schema；即使权限存在，非法值仍会被拒绝。

推荐写法：

```ts
if (!ctx.fetch) {
  ctx.log.warn('network permission is not granted');
  return;
}

try {
  await ctx.settings.ntp.update({ servers: ['time.cloudflare.com'] });
} catch (error) {
  ctx.log.error('failed to update NTP servers', error);
}
```

## 服务端插件与 iframe UI

权限只授予服务端插件上下文，不直接授予 iframe 页面。

如果 iframe UI 需要触发敏感能力，应采用以下分层：

1. iframe 页面通过 `window.tx5dr.invoke(action, data)` 发请求。
2. 服务端插件在 `ctx.ui.registerPageHandler(...)` 中接收请求。
3. 服务端插件校验用户动作、插件配置和当前上下文。
4. 服务端插件调用 `ctx.radio`、`ctx.settings` 或 `ctx.fetch`。
5. 服务端插件把结果返回给 iframe，或通过 `ctx.ui.send(...)` 推送状态。

这样可以避免把电台控制、宿主设置或网络能力直接暴露给浏览器 iframe，同时仍保留自定义 UI 的交互能力。

## 选择权限的建议

- 只同步远程日志：通常只需要 `network`。
- 只显示电台能力状态：使用 `radio:read`，不要申请 `radio:control`。
- 需要调频或写入电台能力：使用 `radio:control`，必要时再加 `radio:read` 做前置检查。
- 需要开关电台：使用 `radio:power`，通常也搭配 `radio:read` 读取支持状态。
- 需要调整宿主设置：只申请对应的 `settings:*` 域，不要把所有设置权限一次性全开。
- iframe 页面需要敏感操作：权限仍写在服务端插件定义里，页面通过 Bridge 调用服务端 handler。

## 相关页面

- [电台能力与电源](./radio-capabilities-power)：`radio:*` 权限和 `ctx.radio` 示例。
- [宿主设置能力](./host-settings)：`settings:*` 权限和 `ctx.settings` 白名单。
- [日志同步 Provider](./tutorial-logbook-sync)：`network` 权限和外部日志服务同步示例。
- [PluginDefinition Reference](./reference/definition)：`permissions?: PluginPermission[]` 的类型位置。
