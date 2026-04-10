# 第 5 章：StrategyRuntime

前面几章都在讲 utility 插件：它们负责“补充能力”。这一章讲的是另一类完全不同的插件：**strategy 插件**。

如果你要接管自动化流程本身，就需要：

- `type: 'strategy'`
- `createStrategyRuntime(ctx)`

## 什么时候才应该写 strategy

先给出最重要的判断标准：

如果你的需求只是下面这些之一，通常还不需要 strategy：

- 过滤候选
- 给候选加减分
- 守候后自动起呼
- 推送面板
- 响应按钮

只有当你要控制这些东西时，才进入 strategy：

- QSO 状态推进
- 当前发什么文本
- 收到解码后如何推进阶段
- 用户 / 插件请求呼叫后如何接管流程

## 一个最小 strategy 骨架

```ts
import type {
  PluginDefinition,
  StrategyRuntime,
} from '@tx5dr/plugin-api';

class SimpleRuntime implements StrategyRuntime {
  constructor(private ctx: Parameters<NonNullable<PluginDefinition['createStrategyRuntime']>>[0]) {}

  decide() {
    return {};
  }

  getTransmitText() {
    return '';
  }

  requestCall(callsign) {
    this.ctx.log.info('strategy received requestCall', { callsign });
  }

  getSnapshot() {
    return {
      currentState: 'TX6',
      context: {},
      slots: {},
      availableSlots: [],
    };
  }

  patchContext() {}
  setState() {}
  setSlotContent() {}
  reset() {}
}

const plugin: PluginDefinition = {
  name: 'simple-strategy',
  version: '1.0.0',
  type: 'strategy',
  createStrategyRuntime(ctx) {
    return new SimpleRuntime(ctx);
  },
};

export default plugin;
```

真实策略通常会复杂得多，但骨架就是这样。

## 你真正要关心的四个方法

### `decide(messages, meta)`

每个时隙，Host 会把候选消息送进来，让策略决定下一步是否推进状态。

你可以把它理解为：

> “收到这一批解码后，我当前这场 QSO 应该怎么走？”

这里有一个很关键的宿主语义：

- 普通决策里返回 `{ stop: true }`，表示停止这个 operator 的自动化
- 如果 `meta?.isReDecision === true`，同样的 `{ stop: true }` 还会让 Host 立即中断当前正在播放/PTT 的那次发射

这意味着 strategy 不需要自己偷偷调用别的宿主内部接口来“强停当前发射”；只要显式返回 `stop: true` 即可。

### `getTransmitText()`

Host 在发射时隙会来取当前要发送的文本。

也就是说，strategy 不只是“决定逻辑”，还负责“告诉 Host 这一拍该发什么”。

### `requestCall(callsign, lastMessage?)`

当用户手动点选呼号，或某个 utility 插件的自动起呼 proposal 被 Host 仲裁通过后，最后都会汇总到这里。

这也是为什么：

- 守候型 utility 插件不该自己接管整个流程
- 它们只应该提 proposal
- 真正进入自动化运行时的入口仍然是 strategy 的 `requestCall(...)`

### `getSnapshot()`

前端 UI、调试工具和宿主状态展示都会依赖这份快照。

所以它不只是“为了调试方便”，也是策略对外暴露状态的正式接口。

## 一个非常重要的分层关系

可以把当前插件系统理解成两层：

### 上层：utility

负责：

- 过滤
- 评分
- 守候 proposal
- 面板
- quick action

### 下层：strategy

负责：

- 接住最终被选中的目标
- 维护 QSO 流程状态
- 输出当前发射文本
- 暴露运行时快照

这套分层的好处是：utility 可以很多个一起叠加，但 strategy 始终只有一个活跃实例。

## 学习内置参考时怎么读

建议读 `standard-qso` 时按下面顺序看：

1. 先看插件定义和 `createStrategyRuntime(ctx)`
2. 再看 `requestCall(...)`
3. 再看 `decide(...)`
4. 最后看 snapshot / slots / context 的输出

这样更容易从“外部入口”一路理解到“内部状态机”。

## 这一章你应该学会什么

- `strategy` 用来接管自动化流程，而不是补充小能力
- utility 和 strategy 的职责边界要尽量清晰
- `requestCall(...)` 是很多上层行为最终汇入的统一入口

到这里，你已经可以从最简单的日志型插件，一路写到完整的自动化策略插件了。后续遇到具体字段或类型签名，再回到 [Reference](./reference/) 查即可。
