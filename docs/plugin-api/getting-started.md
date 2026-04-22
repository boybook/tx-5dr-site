# 快速开始

本页说明最小插件示例、基础依赖和文档同步流程。

在开始前先区分两条路径：

- **Drop-in 路径（可直接运行）**：手写 `plugin.js`，直接放进 TX-5DR 运行时插件目录。
- **源码开发路径（需要构建）**：TypeScript / 脚手架项目，先构建再把产物放进插件目录。

## Drop-in 最小示例（可直接运行）

下面这段是 **可直接运行** 的 `plugin.js`（纯 ESM JavaScript）：

```js
const plugin = {
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

你可以把它放到：

```text
<插件目录>/hello-plugin/plugin.js
```

入口文件名仅支持：`plugin.js`、`plugin.mjs`、`index.js`、`index.mjs`。

## 如何验证是否加载成功

1. 在 TX-5DR 的「设置 → 插件」里查看当前显示的**插件目录**。
2. Docker 部署时，优先看页面里给出的宿主机映射路径，不要只看容器内 `/app/data/plugins`。
3. 放入插件后，点击「重载插件」。
4. 打开「设置 → 插件 → 插件运行日志」。
5. 你应该至少看到：
- `Attempting to load plugin directory`（尝试加载）
- `Plugin loaded: ...` 或明确失败原因（如缺入口文件、导出错误、校验失败）。

## 依赖入口（源码开发）

如果你走 TypeScript / 脚手架开发路径，推荐依赖 `@tx5dr/plugin-api`：

```ts
import type { PluginDefinition } from '@tx5dr/plugin-api';
```

独立插件项目建议直接依赖 `@tx5dr/plugin-api`，避免直接引用主项目内部目录。

## 源码最小示例（需要构建，不能直接当 plugin.js 使用）

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

> 说明：这段是 **TypeScript 源码示例**，不是可直接放进插件目录运行的 `plugin.js`。  
> 请先构建产物（例如 `dist/index.js` 或打包到 `plugin.js`）再部署到运行时插件目录。

该示例包含以下最小要素：

- `PluginDefinition`：定义插件元数据
- `type: 'utility'`：声明插件类型
- `hooks.onDecode`：接入解码事件
- `ctx.log`：调用宿主日志接口

## 守候型插件最小示例（源码示例）

如果你要做“命中目标后自动起呼”的插件，当前推荐从 `onAutoCallCandidate(...)` 开始，而不是直接在 `onSlotStart` / `onDecode` 中调用 `ctx.operator.call(...)`：

```ts
import type { PluginDefinition } from '@tx5dr/plugin-api';

const plugin: PluginDefinition = {
  name: 'my-watcher',
  version: '1.0.0',
  type: 'utility',
  hooks: {
    onAutoCallCandidate(slotInfo, messages) {
      const matched = messages.find((message) => message.rawMessage.startsWith('CQ JA1'));
      if (!matched) {
        return null;
      }

      return {
        callsign: 'JA1XXX',
        priority: 80,
        lastMessage: {
          message: {
            message: matched.rawMessage,
            snr: matched.snr,
            dt: matched.dt,
            freq: matched.df,
          },
          slotInfo,
        },
      };
    },
  },
};

export default plugin;
```

这个写法的好处是：

- 自动起呼会先进入 Host 的 proposal 仲裁，而不是谁先跑到 Hook 就谁抢到
- `lastMessage` 能帮助 Host 保留触发消息的真实时隙语义，避免同一时隙误发
- proposal 胜出后，还可以继续通过 `onConfigureAutoCallExecution(...)` 叠加执行策略，例如先调用 `ctx.band.findIdleTransmitFrequency(...)` 选择更空闲的发射音频频率

- 可与其他自动起呼插件稳定组合
- 由 Host 统一仲裁优先级
- 最终只会执行一次真正的自动起呼

## 偏好排序型插件最小示例（源码示例）

如果你要做“已通联偏置”“稀有台加分”这类插件，推荐使用 `onScoreCandidates(...)`：

```ts
import type { PluginDefinition } from '@tx5dr/plugin-api';

const plugin: PluginDefinition = {
  name: 'worked-bias-demo',
  version: '1.0.0',
  type: 'utility',
  hooks: {
    async onScoreCandidates(candidates, ctx) {
      return Promise.all(candidates.map(async (candidate) => {
        const callsign = 'senderCallsign' in candidate.message
          ? candidate.message.senderCallsign
          : '';
        if (!callsign) {
          return candidate;
        }

        const hasWorked = await ctx.logbook.hasWorked(callsign);
        return {
          ...candidate,
          score: candidate.score + (hasWorked ? -10 : 20),
        };
      }));
    },
  },
};

export default plugin;
```

这个写法适合表达“更倾向谁”，而不是“强制选谁”：

- 多个评分插件会自然叠加
- 最终目标仍由 Host 和当前活跃策略决定
- 如果规则属于硬过滤，应改用 `onFilterCandidates(...)`

## 开发顺序

### 第一步：确定插件类型

- 需要筛选、打分、面板数据或事件监听时，通常使用 `utility`
- 需要接管自动化运行时时，通常使用 `strategy`
- 需要“守候命中后自动起呼”时，也通常使用 `utility`，再配合 `onAutoCallCandidate`

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

该命令会从主项目源码 checkout 的 `packages/plugin-api/src` 读取接口定义并生成 Markdown。
