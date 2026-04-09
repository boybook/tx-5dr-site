# 第 1 章：Hello Utility

这一章先不讨论复杂自动化，只做一个最小可运行的 `utility` 插件。目标是让你先建立“插件到底长什么样”的直觉。

## 先记住这三个事实

- 插件入口默认导出一个 `PluginDefinition`
- 最容易上手的插件类型是 `type: 'utility'`
- 最容易验证的 Hook 是 `onDecode(...)`

## 最小目录结构

```text
my-plugin/
├── plugin.js
├── locales/
│   ├── zh.json
│   └── en.json
└── README.md
```

对用户插件来说，通常只要先把 `plugin.js` 跑起来，其他文件都可以后补。

## 第一个插件

```ts
import type { PluginDefinition } from '@tx5dr/plugin-api';

const plugin: PluginDefinition = {
  name: 'hello-plugin',
  version: '1.0.0',
  type: 'utility',
  hooks: {
    onDecode(messages, ctx) {
      ctx.log.info('hello plugin observed decode', {
        count: messages.length,
        operatorId: ctx.operator.id,
      });
    },
  },
};

export default plugin;
```

这段代码已经具备了一个可工作的最小插件形态：

- 有唯一名称 `name`
- 有语义化版本 `version`
- 声明为 `utility`
- 注册了一个 Hook

## 这段代码在做什么

`onDecode(messages, ctx)` 会在宿主收到解码结果时触发。它的特点是：

- 即使当前操作员没有发射，也会触发
- 适合做观察、统计、缓存、轻量日志
- 不适合一上来就承担复杂流程控制

所以它非常适合作为入门 Hook。

## 给插件加一个设置项

接下来给插件加一个简单开关：

```ts
import type { PluginDefinition } from '@tx5dr/plugin-api';

const plugin: PluginDefinition = {
  name: 'hello-plugin',
  version: '1.0.0',
  type: 'utility',
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
      if (ctx.config.enabledNotice !== true) {
        return;
      }
      ctx.log.info('hello plugin observed decode', {
        count: messages.length,
      });
    },
  },
};

export default plugin;
```

## 配套本地化

```json
{
  "enabledNotice": "启用日志提示",
  "enabledNoticeDesc": "收到解码结果时在插件日志中写入一条记录。"
}
```

这就是插件设置和 UI 自动生成的基础机制：你声明 `settings`，宿主负责渲染。

## 这一章你应该学会什么

到这里，你应该已经掌握了：

- 什么是 `PluginDefinition`
- `utility` 插件的最小结构
- 如何注册一个最基础的 Hook
- 如何声明一个简单设置项

下一章开始，我们会进入真正影响自动化行为的第一类能力：过滤和评分。
