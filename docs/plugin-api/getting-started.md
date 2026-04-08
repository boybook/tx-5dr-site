# 快速开始

本页说明最小插件示例、基础依赖和文档同步流程。示例代码使用 `@tx5dr/plugin-api` 作为唯一公共入口。

## 依赖入口

```ts
import type { PluginDefinition } from '@tx5dr/plugin-api';
```

独立插件项目建议直接依赖 `@tx5dr/plugin-api`，避免直接引用主项目内部目录。

## 最小示例

```ts
import type { PluginDefinition } from '@tx5dr/plugin-api';

const plugin: PluginDefinition = {
  name: 'hello-plugin',
  version: '1.0.0',
  type: 'utility',
  hooks: {
    onDecode(messages, ctx) {
      ctx.log.info('decoded messages', { count: messages.length });
    },
  },
};

export default plugin;
```

该示例包含以下最小要素：

- `PluginDefinition`：定义插件元数据
- `type: 'utility'`：声明插件类型
- `hooks.onDecode`：接入解码事件
- `ctx.log`：调用宿主日志接口

## 开发顺序

### 第一步：确定插件类型

- 需要筛选、打分、面板数据或事件监听时，通常使用 `utility`
- 需要接管自动化运行时时，通常使用 `strategy`

### 第二步：确认依赖接口

常见接口包括：

- `ctx.config`：读取设置值
- `ctx.log`：写入日志
- `ctx.store`：读写持久化数据
- `ctx.ui.send()`：推送面板数据
- `ctx.operator` / `ctx.radio`：访问操作员或电台控制接口

### 第三步：查阅接口文档

字段和类型定义可在 [Reference](./reference/) 中查阅。Reference 适合核对签名；设计边界仍以本节和 [心智模型](./concepts) 为主。

## 同步命令

Reference 页面由以下命令生成：

```bash
npm run docs:sync-plugin-api
```

该命令会从主项目 `feature/plugin-system` 分支的 `packages/plugin-api/src` 读取接口定义并生成 Markdown。
