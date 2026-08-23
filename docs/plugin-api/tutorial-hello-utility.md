# 编写 Utility 插件

先完成 [快速开始](./getting-started)，确保脚手架生成的插件已经能在 TX-5DR 中加载。本页只关注怎样在生成模板上添加一个实际行为。

## 监听解码

```ts
import { definePlugin } from '@tx5dr/plugin-api';

export const plugin = definePlugin({
  apiVersion: 2,
  name: 'decode-observer',
  version: '0.1.0',
  type: 'utility',
  permissions: [],

  hooks: {
    onDecode(messages, ctx) {
      for (const message of messages) {
        ctx.log.info('Decoded', {
          raw: message.rawMessage,
          snr: message.snr,
        });
      }
    },
  },
});

export default plugin;
```

`onDecode()` 适合观察、统计和更新插件自己的状态。它不负责推进一场 QSO，也不应该直接操作物理发射。

## 添加设置

```ts
export const plugin = definePlugin({
  apiVersion: 2,
  name: 'decode-observer',
  version: '0.1.0',
  type: 'utility',
  permissions: [],

  settings: {
    enabledNotice: {
      type: 'boolean',
      default: true,
      label: 'enabledNotice',
      description: 'enabledNoticeDesc',
      scope: 'operator',
    },
  },

  hooks: {
    onDecode(messages, ctx) {
      if (ctx.config.enabledNotice !== true) return;
      ctx.log.info('Decoded messages', { count: messages.length });
    },
  },
});
```

Host 会根据 `settings` 生成表单、校验值并持久化。`ctx.config` 是当前合并结果的独立快照；需要由插件更新设置时使用：

```ts
await ctx.updateConfig({ enabledNotice: false });
```

生成表单支持 `boolean`、`number`、`string`、`string[]`、`object[]`、`keyedStringArrays`、`keyedObjectArrays`、`keyedObjects` 和只读 `info`。复杂列表使用 `itemFields` 或固定 `keys`；`visibleWhen` 和 `descriptionWhen` 可以根据同一表单的其他值调整展示。

`quickSettings` 只能引用已经声明的 operator-scope、非 `info` setting。global utility 不能声明 operator setting 或 `quickSettings`。完整字段见 [PluginSettingDescriptor](./reference/contracts#pluginsettingdescriptor)。

## 添加本地化

`src/locales/zh.json`：

```json
{
  "pluginDescription": "记录收到的解码消息",
  "enabledNotice": "启用日志提示",
  "enabledNoticeDesc": "收到解码结果时写入插件日志。"
}
```

`label`、`description` 和插件 `description` 可以引用这些 key。保留脚手架生成的 `locales` 导出，Host 会按当前语言解析。

## 选择下一个入口

- 想排除或偏好某些目标：使用 [过滤与评分](./tutorial-filter-and-score)。
- 想在命中目标后请求自动起呼：使用 [自动起呼提议](./tutorial-watcher-autocall)。
- 想添加按钮或状态面板：使用 [按钮、定时器与面板](./tutorial-ui-actions-and-panels)。
- 想访问网络、电台或日志本：先看 [权限与能力](./permissions)。

只有需要负责 QSO 状态推进和下一条发射文本时，才改写成 `strategy` 插件。
