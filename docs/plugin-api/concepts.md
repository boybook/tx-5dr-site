# 插件如何运行

TX-5DR 插件通常包含两部分：运行在服务端的插件代码，以及可选的 iframe 页面。理解这条边界后，大部分 API 都可以按普通 TypeScript 接口使用。

## 服务端插件

插件入口默认导出 `definePlugin({...})`。Host 根据定义创建一个 operator 或 global 实例，然后调用 `onLoad`、Hook、timer 和页面 handler。

服务端代码可以：

- 监听解码、通联和频率事件
- 使用插件私有的设置、KV 和文件存储
- 向声明式面板推送数据
- 在声明权限后调用网络、日志本、电台或宿主设置能力

插件定义会在加载时校验并冻结。不要在运行期修改 `permissions`、`hooks` 或 UI descriptor。

## iframe 页面

自定义页面运行在浏览器 iframe 中，可以使用 HTML、CSS、React、Vue 和常见浏览器 API。页面不会直接获得服务端 `ctx`。

```text
iframe page -- tx5dr.invoke() --> page handler -- Host capability --> TX-5DR
iframe page <-- tx5dr.onPush() -- page handler / runtime
```

页面通过 `window.tx5dr` 与自己的服务端 handler 通信。用户、operator、callsign 和页面 session 等可信信息来自 `requestContext`，不要用 iframe 自报的数据替代 Host 已验证的绑定。

## 普通数据按值传递

配置、Hook 参数、查询结果、EventBus payload 和 UI 消息都是独立数据。它们跨过边界时会被复制，而不是把 Host 内部对象的引用直接交给插件。EventBus 的发布者和每个 subscriber 也分别获得自己的副本。

```ts
const config = ctx.store.global.get<{ enabled: boolean }>('config');
config.enabled = false; // 只修改本地副本
ctx.store.global.set('config', config); // 明确写回
```

实际开发只需要记住三点：

- 可以缓存、排序或修改收到的普通对象，不会意外改坏 Host 状态。
- 修改 `ctx.config`、查询结果或 UI 返回值不会自动持久化。
- 要改变状态，调用明确的 `ctx.updateConfig()`、`store.set()` 或 command port。

不同通道接受的数据略有不同：

| 通道 | 可以传什么 |
| --- | --- |
| 配置、KV、iframe invoke/push、panel 数据 | JSON 兼容值 |
| Hook、strategy、EventBus 等进程内数据 | structured-clone 兼容值 |
| `ctx.files` | `Buffer` 二进制数据 |

不要跨边界传递函数、Promise、WeakMap、循环 JSON、类方法或 Host capability。对象的原型和方法不是数据契约的一部分。非法值会以 `PLUGIN_DATA_NOT_SERIALIZABLE` 被拒绝。

## Host capability 是受控句柄

`ctx.ui`、`ctx.logbook`、`ctx.radioCommands`、网络 socket 和页面 `requestContext.files` 不是数据快照，而是 Host 提供的实时操作句柄。

这些句柄只能在 Host 发起且仍然有效的 callback 中调用：

- 可以在同一个插件实例中保存句柄，但不要在 callback 返回后启动悬空任务继续调用它。
- 定时工作使用 `ctx.timers.set()`，在下一次 `hooks.onTimer` 中执行。
- 异步 Hook 应 `await` 工作，并响应 strategy 的 `AbortSignal`。
- disable、reload、unload、timeout 或 shutdown 后，旧调用会得到 `PLUGIN_INVOCATION_EXPIRED`。

`onUnload` 只提供 `store`、`log`、`timers`、`files` 和只读 `operator`，用于识别实例并释放插件自己的资源。新插件不能在 cleanup 中使用 UI、网络、电台、EventBus、日志本或 command port。

## 权限决定可见能力

基础 context 始终包含只读 `operator`、只读 `radio`、`config`、`store`、`log`、`timers`、`band`、`ui` 和 `files`。

敏感能力由 `permissions` 添加。例如：

```ts
import { definePlugin } from '@tx5dr/plugin-api';

export default definePlugin({
  apiVersion: 2,
  name: 'band-switcher',
  version: '1.0.0',
  type: 'utility',
  permissions: ['radio:read', 'radio:control'],

  async onLoad(ctx) {
    const capabilities = ctx.radioCapabilities.getSnapshot();
    await ctx.radioCommands.submit({
      type: 'set-frequency',
      frequency: 14_074_000,
    });
    ctx.log.info('Radio updated', { capabilityCount: capabilities.capabilities.length });
  },
});
```

未声明的能力在 TypeScript 和运行时对象中都不存在。完整映射见 [权限与能力](./permissions)。

## 实例作用域

- `instanceScope: 'operator'`：默认值，每个操作员一个实例。
- `instanceScope: 'global'`：整个 Host 一个实例，只适用于 utility。

operator 插件适合候选处理、操作员面板和自动化辅助。global 插件适合站级同步、共享网络服务和全局电台计划。global 插件访问特定日志本时使用 `ctx.logbook.forCallsign(callsign)`。

global scope 只支持 utility，不能声明 operator-scope setting、`quickSettings`、operator panel 或大多数 operator 事件 Hook。

## 安全边界

权限和 callback 生命周期用于提供清晰、可审计的 Host API，并减少插件之间的意外影响。当前服务端插件仍运行在 TX-5DR 的 Node.js 进程中，因此安装插件等同于信任其服务端代码；真正面向不可信代码的隔离需要独立 Worker 或进程。

iframe 页面与服务端 capability 分离。敏感操作应由页面请求服务端 handler，再由 handler 校验 `requestContext` 后调用对应能力。

## 继续阅读

- [API v2 与兼容性](./api-v2)
- [权限与能力](./permissions)
- [自定义 UI](./tutorial-custom-ui)
- [PluginContext Reference](./reference/context)
