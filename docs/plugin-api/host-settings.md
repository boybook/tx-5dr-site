# 宿主设置能力

`ctx.settings` 是 TX-5DR 1.7.0 新增的插件宿主设置控制面。它面向需要维护站台策略、自动化策略或网络环境的服务端插件，允许插件在声明权限后读取或修改一组安全白名单设置。

## 设计目标

- 让插件能够自动维护常见系统设置，而不是要求用户手动进入系统设置页
- 让权限按设置域拆分，插件只声明自己真正需要的能力
- 复用宿主已有校验与归一化逻辑，避免插件写入破坏配置文件
- 保持 iframe UI 隔离：页面本身不获得 REST 绕行能力，只能调用插件后端 handler

## 权限与命名空间

每个命名空间都需要在 `PluginDefinition.permissions` 中声明对应权限。声明后，该命名空间的 `get()` 和 `update()` 都可用；未声明时会抛出权限错误。权限系统的整体设计、配置位置和运行时要求见 [插件权限模型](./permissions)。

| 命名空间 | 权限 | 能力 |
| --- | --- | --- |
| `ctx.settings.ft8` | `settings:ft8` | 读取/更新 FT8/FT4 自动化设置 |
| `ctx.settings.decodeWindows` | `settings:decode-windows` | 读取/替换解码窗口设置 |
| `ctx.settings.realtime` | `settings:realtime` | 读取/更新实时音频传输设置 |
| `ctx.settings.frequencyPresets` | `settings:frequency-presets` | 读取/替换/重置频率预设 |
| `ctx.settings.station` | `settings:station` | 读取/更新站台信息 |
| `ctx.settings.pskReporter` | `settings:psk-reporter` | 读取/更新 PSK Reporter 设置 |
| `ctx.settings.ntp` | `settings:ntp` | 读取/更新 NTP 服务器列表 |

## 示例：调整重复发射保护

下面的插件在加载时读取 FT8 设置，并把连续相同发射兜底上限改为 `0`。`0` 是宿主保留的后门语义，表示停用重复发射保护；普通系统设置 UI 仍会限制用户输入 `1..200`。

```ts
import type { PluginDefinition } from '@tx5dr/plugin-api';

const plugin: PluginDefinition = {
  name: 'station-automation-policy',
  version: '1.0.0',
  type: 'utility',
  permissions: ['settings:ft8'],
  hooks: {
    async onLoad(ctx) {
      const before = await ctx.settings.ft8.get();
      ctx.log.info('Current repeated TX guard', {
        maxSameTransmissionCount: before.maxSameTransmissionCount,
      });

      await ctx.settings.ft8.update({ maxSameTransmissionCount: 0 });
    },
  },
};

export default plugin;
```

## 示例：从 iframe 设置页触发

`ctx.settings` 只存在于服务端插件上下文。若插件有自定义 iframe 设置页，应让页面通过 Bridge 调用后端 handler：

```ts
// server-side plugin
ctx.ui.registerPageHandler(async (request) => {
  if (request.action === 'setNtpServers') {
    await ctx.settings.ntp.update({ servers: request.data.servers });
    return { ok: true };
  }
  return { ok: false };
});
```

```ts
// iframe page
await window.tx5dr.invoke('setNtpServers', {
  servers: ['time.cloudflare.com', 'pool.ntp.org'],
});
```

## 白名单范围

当前允许插件调整：

- FT8/FT4 自动化设置，包括连续相同发射兜底上限
- 解码窗口设置
- 实时音频传输设置，更新后宿主会广播 `realtimeSettingsChanged`
- 频率预设
- 站台信息
- PSK Reporter 设置
- NTP 服务器列表

当前不开放：

- 认证、Token、用户和权限配置
- 操作员 CRUD
- 电台硬件连接配置
- 音频设备选择
- rigctld、OpenWebRX 和 Profile
- server host/port 等通常需要重启或具有网络暴露风险的设置

## 维护约定

- 插件应请求最小权限集合，不要为了方便一次性声明所有 `settings:*`
- `decodeWindows`、`realtime`、`frequencyPresets` 和 `ntp` 会复用 contracts schema，非法值会被拒绝
- `ft8.maxSameTransmissionCount` 在 UI 中受 `1..200` 限制，但插件、REST API 和直接配置文件可以写入 `0` 或大于 `200` 的值
- 该 API 是宿主兜底能力，不改变策略插件的核心职责；策略插件仍负责产生下一条发射文本，宿主负责最终安全门
