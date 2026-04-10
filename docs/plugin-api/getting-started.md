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

## 守候型插件最小示例

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

## 偏好排序型插件最小示例

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
