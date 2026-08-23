# 插件 API

TX-5DR 插件可以监听解码、调整候选排序、扩展操作界面、同步日志，或实现一套完整的通联策略。插件后端使用 JavaScript 或 TypeScript；自定义界面运行在 iframe 中，可以使用任意前端框架。

第一次开发插件，直接从 [快速开始](./getting-started) 创建一个 TypeScript 项目。需要核对字段和返回类型时，再进入 [API Reference](./reference/)；不需要先读完整套参考手册。

## 从这里开始

| 你要做什么 | 从哪里开始 |
| --- | --- |
| 创建并运行第一个插件 | [快速开始](./getting-started) |
| 理解后端、iframe、数据和生命周期 | [插件如何运行](./concepts) |
| 把旧插件迁移到 v2 | [API v2 与兼容性](./api-v2) |
| 监听解码、过滤或调整候选顺序 | [过滤与评分](./tutorial-filter-and-score) |
| 发现目标后请求自动起呼 | [自动起呼提议](./tutorial-watcher-autocall) |
| 添加按钮、定时任务或面板 | [按钮、定时器与面板](./tutorial-ui-actions-and-panels) |
| 创建 React、Vue 或原生 iframe 页面 | [自定义 UI](./tutorial-custom-ui) |
| 实现完整通联状态机 | [StrategyRuntime](./tutorial-strategy-runtime) |
| 接入 WaveLog、LoTW 一类日志服务 | [日志同步 Provider](./tutorial-logbook-sync) |
| 操作电台、网络、日志本或宿主设置 | [权限与能力](./permissions) |
| 为插件编写单元测试 | [测试插件](./testing) |

## 最小示例

```ts
import { definePlugin } from '@tx5dr/plugin-api';

export default definePlugin({
  apiVersion: 2,
  name: 'decode-observer',
  version: '1.0.0',
  type: 'utility',
  permissions: [],

  hooks: {
    onDecode(messages, ctx) {
      ctx.log.info('Decoded messages', { count: messages.length });
    },
  },
});
```

新插件统一使用 `apiVersion: 2` 和 `definePlugin()`。`definePlugin()` 会根据 `permissions` 推导 `ctx` 中真正可用的能力；未声明的敏感能力在类型和运行时对象中都不存在。

## 两类插件

- `utility`：观察、过滤、评分、同步、面板和外部集成。多个 utility 可以同时工作。
- `strategy`：实现一个操作员的通联状态机。每个操作员同时只使用一个 strategy。

大多数插件都应该从 `utility` 开始。只有需要决定通联阶段和下一条发射文本时，才需要实现 `StrategyRuntime`。

## API 的边界

插件收到的配置、消息和查询结果都是独立数据。你可以修改这些对象，但修改不会自动写回 TX-5DR；持久化或控制操作必须调用明确的 `update`、`set` 或 command API。

Host capability 则是受控的实时句柄，例如 `ctx.radioCommands`、`ctx.logbook` 和 `ctx.ui`。它们只能在 Host 发起且仍然有效的 callback 中使用。详细规则见 [插件如何运行](./concepts)。

插件权限用于限制公开的 Host API，但当前服务端插件仍与 TX-5DR 运行在同一 Node.js 进程中。它不是用于执行恶意代码的进程级沙箱。

## Reference 如何更新

[Reference](./reference/) 由站点仓库中的脚本从相邻 TX-5DR 源码生成：

```bash
npm run docs:sync-plugin-api
```

同一次同步会生成[中文](./reference/)、[English](../en/plugin-api/reference/) 和[日本語](../ja/plugin-api/reference/)三套页面；英文 JSDoc 正文保持一致，导航和 Reference 框架按站点语言本地化。手写指南负责解释怎样完成任务；类型签名以生成的 Reference 和 `@tx5dr/plugin-api` 包为准。
