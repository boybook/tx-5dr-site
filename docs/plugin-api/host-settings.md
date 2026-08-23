# 宿主设置

受信任的服务端插件可以通过 `ctx.settings` 读取或修改一组白名单设置。每个命名空间需要单独权限，写入仍会经过 TX-5DR 原有的校验和归一化。

## 命名空间

| 命名空间 | 权限 | 方法 |
| --- | --- | --- |
| `ctx.settings.ft8` | `settings:ft8` | `get()`、`update(patch)` |
| `ctx.settings.decodeWindows` | `settings:decode-windows` | `get()`、`update(settings)` |
| `ctx.settings.realtime` | `settings:realtime` | `get()`、`update(settings)` |
| `ctx.settings.frequencyPresets` | `settings:frequency-presets` | `get()`、`update(presets)`、`reset()` |
| `ctx.settings.station` | `settings:station` | `get()`、`update(patch)` |
| `ctx.settings.pskReporter` | `settings:psk-reporter` | `get()`、`update(patch)` |
| `ctx.settings.ntp` | `settings:ntp` | `get()`、`update({ servers })` |

## 读取和更新

```ts
import { definePlugin } from '@tx5dr/plugin-api';

export default definePlugin({
  apiVersion: 2,
  name: 'station-policy',
  version: '1.0.0',
  type: 'utility',
  permissions: ['settings:ft8', 'settings:station'],

  async onLoad(ctx) {
    const current = await ctx.settings.ft8.get();
    ctx.log.info('Current FT8 settings', {
      maxSameTransmissionCount: current.maxSameTransmissionCount,
    });

    await ctx.settings.ft8.update({ maxSameTransmissionCount: 20 });
    await ctx.settings.station.update({ callsign: 'W1AW' });
  },
});
```

`get()` 和 `update()` 的结果都是独立数据。修改返回对象不会继续修改 Host；再次改变设置时仍需调用 `update()`。

## 从 iframe 设置页触发

iframe 不直接获得 `ctx.settings`。页面通过 Bridge 调用服务端 handler：

下面的 handler 所在插件还需要声明 `permissions: ['settings:ntp']`。

```ts
ctx.ui.registerPageHandler({
  async onMessage(pageId, action, data, requestContext) {
    if (pageId !== 'settings' || action !== 'setNtpServers') return null;
    if (requestContext.user.role !== 'admin') {
      throw new Error('Admin access is required');
    }

    const input = data as { servers?: unknown };
    if (!Array.isArray(input.servers)
        || !input.servers.every((item) => typeof item === 'string')) {
      throw new Error('servers must be a string array');
    }

    return ctx.settings.ntp.update({ servers: input.servers });
  },
});
```

```js
const updated = await window.tx5dr.invoke('setNtpServers', {
  servers: ['time.cloudflare.com', 'pool.ntp.org'],
});
```

`accessScope: 'admin'` 可以在页面入口限制访问，handler 仍应依据 `requestContext.user` 校验敏感 action。

## 不开放的设置

`ctx.settings` 不包含：

- 认证 Token、用户和权限配置
- 操作员 CRUD
- 电台硬件连接参数
- 音频设备选择
- rigctld、OpenWebRX 和 Profile 管理
- server host/port 等网络暴露设置

公开插件 API 不提供这些能力，插件不应通过内部配置文件或未公开 REST 路由绕过。服务端插件本身仍被视为受信任的同进程代码，manifest permission 不是恶意代码沙箱。

## 使用建议

- 只申请实际使用的 `settings:*` 权限。
- 把一次更新当成一个完整业务动作，并处理 schema 拒绝。
- 需要插件自身设置时，优先使用 `PluginDefinition.settings` 和 `ctx.updateConfig()`。
- 宿主设置适合站级策略，不应替代 strategy 的通联状态机。

## Reference

- [Host Settings Reference](./reference/settings)
- [权限与能力](./permissions)
- [自定义 UI](./tutorial-custom-ui)
