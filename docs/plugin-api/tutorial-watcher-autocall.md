# 第 3 章：守候与自动起呼

这一章讲的是最容易“写得能跑，但不够兼容”的一类插件：**守候命中后自动起呼**。

当前推荐的新写法不是直接 `ctx.operator.call(...)`，而是实现：

- `onAutoCallCandidate(slotInfo, messages, ctx)`

由插件返回 proposal，再由 Host 统一仲裁。

## 为什么不推荐直接 `call()`

如果多个插件都在 `onSlotStart` / `onDecode` 中直接起呼，就会出现几个问题：

- 谁先执行完全依赖 Hook 时序
- 多个插件很难稳定组合
- 不同插件之间的优先级无法解释
- 调试时很难知道到底是谁“抢到了”自动起呼

proposal 模式就是为了解决这个问题。

## Proposal 长什么样

```ts
{
  callsign: string;
  priority?: number;
  lastMessage?: { message: FrameMessage; slotInfo: SlotInfo };
}
```

它表达的意思不是“现在立刻呼叫”，而是：

> “我建议下一步自动起呼这个目标，并附带我的优先级和触发依据。”

## 一个最小守候插件

```ts
import type { PluginDefinition } from '@tx5dr/plugin-api';

const plugin: PluginDefinition = {
  name: 'ja-watcher',
  version: '1.0.0',
  type: 'utility',
  hooks: {
    onAutoCallCandidate(slotInfo, messages, ctx) {
      const matched = messages.find((message) => message.rawMessage.startsWith('CQ JA1'));
      if (!matched) {
        return null;
      }

      if (ctx.operator.isTargetBeingWorkedByOthers('JA1XXX')) {
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

## Host 会怎么处理

当多个 utility 插件同时返回 proposal 时，Host 会统一按下面顺序仲裁：

1. `priority` 高者优先
2. 命中消息在当前时隙里的顺序更靠前者优先
3. 插件名稳定排序

最后，Host 最多只会执行一次真正的 `requestCall(...)`。

## `priority` 应该怎么理解

推荐把它理解成“插件意图强弱”：

- `100+`：强指令型守候，例如显式 watch list、sked、朋友台
- `60~99`：高价值机会型守候，例如新 DXCC / 新网格 / 新呼号
- `1~59`：弱偏好补充
- `0`：未显式设置优先级时的默认层级

当前内置插件就是按这个思路设计的：

- `watched-callsign-autocall` 默认更高
- `watched-novelty-autocall` 默认略低，但更适合和其他插件组合

## `lastMessage` 为什么很重要

如果你已经知道是哪一条消息触发了 proposal，建议始终把 `lastMessage` 带上。

它的作用有两个：

- 让 Host 可以在同优先级下按命中消息顺序稳定排序
- 更好保留触发时的 slot 上下文

更关键的是，`lastMessage.slotInfo` 应表达**触发消息真正所属的 RX 时隙**。自动起呼后续会依据这个时隙去推导应该在哪个相反周期回复，因此它不能只是“当前 hook 正在处理的时隙参数”。如果插件只能拿到命中的 `ParsedFT8Message`，Host 也会尽量根据消息自己的 `timestamp/slotId` 恢复正确来源时隙，但插件若能明确提供，语义会更清晰。

## proposal 之后还有什么

proposal 被 Host 接受后，还会继续进入 `onConfigureAutoCallExecution(request, plan, ctx)` 这条执行策略管线。

这一层适合放：

- 自动起呼前是否先换到更空闲的音频频率
- 多个自动起呼插件共享的执行策略
- 其他不属于“目标发现”的统一执行行为

例如内置 `autocall-controls` 就会在这里调用 `ctx.band.findIdleTransmitFrequency(...)`，复用宿主已有的空闲频率选择逻辑。

## 插件内部自己仍要判断什么

proposal 机制不是把业务判断都交给 Host。插件内部仍然应该自己负责：

- trigger mode（例如只看 CQ）
- 是否已经被其他操作员占用
- 是否命中自己的黑白名单
- 是否忽略 deleted DXCC
- 是否满足自己的“新类型”定义

Host 负责的是“统一收集、统一仲裁、统一执行”。

## 两个内置案例

### watched-callsign-autocall

适合“明确守候谁”的场景：

- watch list
- 支持精确匹配与正则
- 默认优先级更高

### watched-novelty-autocall

适合“有新机会就追”的场景：

- 新 DXCC
- 新网格
- 新呼号

它依赖 Host 提供的 operator 视角日志分析结果，因此特别适合与其他守候插件并行启用。

## 这一章你应该学会什么

- 自动起呼插件优先用 `onAutoCallCandidate(...)`
- proposal 是“提议”，不是“立即执行”
- 优先级和 `lastMessage` 都是为了让多插件组合更稳定

下一章我们离开“自动化决策”本身，转向插件如何与用户交互：按钮、定时器和面板。
