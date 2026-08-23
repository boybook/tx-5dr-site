# 快速开始

本页会创建一个 TypeScript utility 插件，把它链接到本机 TX-5DR，并在插件日志中看到第一条解码记录。

## 准备工作

- Node.js 22
- 一套可正常启动的 TX-5DR
- `@tx5dr/plugin-api` 2.x

## 创建项目

```bash
npx create-tx5dr-plugin decode-observer
cd decode-observer
npm install
```

脚手架默认生成 TypeScript utility 插件、测试、两种语言文件和本地链接脚本。需要 UI 或 strategy 时，可以直接选择对应模板：

```bash
npx create-tx5dr-plugin my-panel --template ui-react
npx create-tx5dr-plugin my-strategy --type strategy
```

生成的 `src/index.ts` 应包含 `apiVersion: 2` 和 `definePlugin()`。如果没有，请先升级脚手架和 `@tx5dr/plugin-api`。

## 编写插件

把 `src/index.ts` 的插件定义简化为：

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
      ctx.log.info('Decoded messages', {
        count: messages.length,
        operatorId: ctx.operator.id,
      });
    },
  },
});

export default plugin;
```

这段代码只使用基础 context，因此 `permissions` 保持为空。需要网络、电台、日志本或宿主设置时，再添加对应权限。

## 构建和测试

```bash
npm run build
npm test
```

TypeScript 会同时检查 Hook 参数和 capability 权限。例如没有声明 `radio:control` 时，`ctx.radioCommands` 不会出现在类型中。

## 链接到 TX-5DR

```bash
npm run link
```

链接脚本会把 `dist/` 链接到当前系统的 TX-5DR 插件目录，并创建 `.hotreload` 标记。自定义数据目录时：

```bash
TX5DR_DATA_DIR=/path/to/data npm run link
```

然后在 TX-5DR 中：

1. 打开“设置 -> 插件”。
2. 点击“重载插件”。
3. 打开“插件运行日志”。
4. 等待一次解码，确认出现 `Decoded messages`。

如果插件没有加载，先看运行日志中的入口文件、导出校验和权限错误。运行时支持的入口文件名为 `plugin.js`、`plugin.mjs`、`index.js` 和 `index.mjs`。

## 开发循环

基础 TypeScript 模板可以使用：

```bash
npm run dev
```

React 或 Vue UI 模板分别监听后端和界面构建：

```bash
npm run dev:server
npm run dev:ui
```

链接目录包含 `.hotreload` 时，TX-5DR 开发服务会在构建产物变化后重载插件。

## 不使用脚手架

简单实验也可以直接创建 `<插件目录>/hello/plugin.js`：

```js
export default {
  apiVersion: 2,
  name: 'hello-drop-in',
  version: '1.0.0',
  type: 'utility',
  permissions: [],
  hooks: {
    onDecode(messages, ctx) {
      ctx.log.info('Decoded messages', { count: messages.length });
    },
  },
};
```

这种方式不提供 TypeScript 的权限推导、测试模板和构建流程。正式插件优先使用脚手架。

## 下一步

- [插件如何运行](./concepts)：后端、iframe、数据所有权和 callback 生命周期
- [权限与能力](./permissions)：为网络、电台、日志本等能力选择最小权限
- [按需求选择指南](./learning-path)：从目标直接进入对应开发页面
- [API Reference](./reference/)：核对字段和类型签名
