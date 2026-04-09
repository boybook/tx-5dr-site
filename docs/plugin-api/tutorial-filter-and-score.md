# 第 2 章：过滤与评分

这一章解决一个很常见的问题：**我想影响候选目标的选择，但不想直接接管整个自动化流程。**

在 TX-5DR 里，这类需求通常优先用两种 Hook：

- `onFilterCandidates(...)`
- `onScoreCandidates(...)`

## 先分清两种问题

### 硬过滤

“这些候选我根本不要。”

例如：

- 只保留某些前缀
- 信噪比低于阈值直接丢弃
- 黑名单呼号完全不考虑

这类需求优先用 `onFilterCandidates(...)`。

### 软偏置

“这些候选都可以考虑，但我更偏好其中某些。”

例如：

- 未通联过的呼号优先
- 稀有实体加分
- 已通联过的台降低优先级

这类需求优先用 `onScoreCandidates(...)`。

## 一个最小过滤插件

下面这个例子只保留 `JA` 前缀：

```ts
import type { PluginDefinition } from '@tx5dr/plugin-api';

const plugin: PluginDefinition = {
  name: 'ja-only-filter',
  version: '1.0.0',
  type: 'utility',
  hooks: {
    onFilterCandidates(candidates) {
      return candidates.filter((candidate) => {
        const message = candidate.message;
        return 'senderCallsign' in message
          && typeof message.senderCallsign === 'string'
          && message.senderCallsign.startsWith('JA');
      });
    },
  },
};

export default plugin;
```

这类插件的心智模型很简单：输入一个候选列表，输出一个更小的候选列表。

## 一个最小评分插件

下面这个例子模仿 `worked-station-bias`：如果已经通联过，就减分；否则加分。

```ts
import type { PluginDefinition } from '@tx5dr/plugin-api';

const plugin: PluginDefinition = {
  name: 'worked-bias-demo',
  version: '1.0.0',
  type: 'utility',
  hooks: {
    async onScoreCandidates(candidates, ctx) {
      return Promise.all(candidates.map(async (candidate) => {
        const message = candidate.message;
        const callsign = 'senderCallsign' in message ? message.senderCallsign : '';
        if (typeof callsign !== 'string' || callsign.length === 0) {
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

## 为什么“已通联偏置”应该走评分 Hook

这是一个很重要的设计习惯：

- 它的目标不是“发现后立即起呼”
- 它的目标是“让候选排序更合理”

所以 `worked-station-bias` 的正确位置是 `onScoreCandidates(...)`，而不是任何“直接控制呼叫”的入口。

它本质上是个**偏好函数**：

- 新台：加分
- 已通联台：减分

最后是否真的被选中，仍由 Host 和当前活跃策略共同决定。

## 过滤与评分可以叠加

一个典型组合可能是：

1. `snr-filter` 先丢掉低质量信号
2. `callsign-prefix-filter` 再保留目标前缀
3. `worked-station-bias` 最后对剩余候选做偏置

这就是 TX-5DR 插件链的设计意图：**每个插件只表达自己那一层能力。**

## 何时不要用评分 Hook

如果你的规则是“绝不允许进入候选列表”，不要用极端分数伪装过滤。直接用 `onFilterCandidates(...)` 更清晰。

经验判断：

- “不许考虑” → `onFilterCandidates(...)`
- “可以考虑，但优先级不同” → `onScoreCandidates(...)`

## 这一章你应该学会什么

- `onFilterCandidates(...)` 负责硬过滤
- `onScoreCandidates(...)` 负责软偏置
- `worked-station-bias` 代表的是“评分型插件”，不是“自动起呼插件”

下一章进入另一条非常常见、也更容易产生竞态的路径：守候与自动起呼。
