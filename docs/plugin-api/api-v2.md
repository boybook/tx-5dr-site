# API v2 与兼容性

API v2 把读取和修改明确分开：插件读取普通数据或只读 view，需要改变 TX-5DR 状态时调用受权限保护的 command port。这样既保留插件的自由度，也让发射、电台和日志写入经过同一套 Host 生命周期。

## 新插件

所有新插件都使用：

```ts
import { definePlugin } from '@tx5dr/plugin-api';

export default definePlugin({
  apiVersion: 2,
  name: 'my-plugin',
  version: '1.0.0',
  type: 'utility',
  permissions: [],
});
```

`definePlugin()` 会保留 `permissions` 的字面量类型。不要把定义手动扩宽成 `PluginDefinition`，否则 TypeScript 无法准确推导 callback 中可用的 capability。

## v2 改变了什么

| 需求 | v2 写法 |
| --- | --- |
| 读取操作员状态 | `ctx.operator` |
| 请求开始自动化或起呼 | `ctx.operatorCommands.submit(...)` |
| 读取频率、波段和模式 | `ctx.radio` |
| 读取电台 capability | `ctx.radioCapabilities` |
| 调频或切换波段 | `ctx.radioCommands.submit(...)` |
| 调谐器操作 | `ctx.radioTunerCommands.submit(...)` |
| 读取或改变电源 | `ctx.radioPower` / `ctx.radioPowerCommands` |
| 查询或写入日志本 | `ctx.logbook`，权限分别为 `logbook:read` / `logbook:write` |
| 注册日志同步服务 | `ctx.logbookSync` + `logbook:sync` |

v2 不提供 raw PTT、音频播放器、Mixer、Encoder 或物理发射 lease。插件提交产品级命令，Host 决定何时以及是否执行物理操作。

## 数据语义

v2 的普通数据按值传递。修改配置、Hook 参数、查询结果或 UI 返回值，不会隐式修改 Host 或持久化数据。

```ts
const saved = ctx.store.global.get<{ url: string }>('service');
saved.url = 'https://example.com';
ctx.store.global.set('service', saved);
```

插件不需要调用额外的 `clone()` 或 `detach()` API。只需传递普通数据，并通过明确的写入方法提交变化。详细说明见 [插件如何运行](./concepts#普通数据按值传递)。

## 哪些插件必须使用 v2

Host 会拒绝以下未声明 `apiVersion: 2` 的插件：

- 所有 `strategy` 插件
- 使用 `operator:transmit-control` 的 utility
- 使用 `radio:control`、`radio:tuner-control` 或 `radio:power` 的 utility
- 使用 `logbook:write` 或 `logbook:sync` 的 utility

只观察事件、不请求命令权限的旧 utility 仍可能加载，但“能加载”不表示旧能力表面继续存在：旧的无权限 logbook、嵌套 radio 写接口等调用仍需迁移。legacy 插件同样使用新的按值数据语义。建议在维护时迁移到 v2，以获得一致的类型检查。

## 迁移旧插件

1. 升级到 `@tx5dr/plugin-api` 2.x。
2. 改用 `definePlugin({ apiVersion: 2, ... })`。
3. 只申请当前功能实际使用的权限。
4. 把 `ctx.operator`、`ctx.radio` 上的旧写操作改为对应 command port。
5. 为日志本查询、写入和同步分别声明权限。
6. 把 raw timer 改为 `ctx.timers.set()` + `hooks.onTimer`。
7. 限制 `onUnload` 只使用 cleanup context。
8. strategy 实现 `checkpoint()`、`restore()`，并从 `decide()` 返回完整的 `transmission` 和 `snapshot`。
9. 重新运行 TypeScript、单元测试和 TX-5DR 加载测试。

Host 目前为少量旧 JavaScript 插件保留了更宽的 cleanup 兼容行为，但它不属于 v2 公共类型契约。新插件不要依赖 `onUnload` 中的 UI 或 native Host dependency；在正常 callback 中主动关闭自己打开的外部资源。

## 常见错误

| 错误 | 含义 |
| --- | --- |
| `PLUGIN_API_INCOMPATIBLE` | strategy 或命令型权限没有声明 v2 |
| 属性在 `ctx` 上不存在 | `permissions` 未声明，或定义被手动扩宽后失去推导 |
| `PLUGIN_DATA_NOT_SERIALIZABLE` | 返回值或 payload 包含不能跨边界的数据 |
| `PLUGIN_INVOCATION_EXPIRED` | callback 已结束、超时，或插件正在 reload/unload |

## 稳定性约定

新增只读能力通常以兼容方式加入。需要改变现有行为、权限或命令契约时，应进入新的 API 主版本；已发布插件不会因为安装新版 typings 就自动获得新的敏感能力。

运行时仍会继续支持可安全兼容的旧 utility 插件。兼容层不是新开发入口，新代码始终以 v2 和当前 Reference 为准。
