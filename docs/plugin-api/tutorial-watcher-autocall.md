# 自动起呼提议

需要在发现特定目标后自动起呼时，实现 `onAutoCallCandidate()` 返回一个 proposal。不要在解码 Hook 中直接提交 `request-call` 命令；proposal 可以和其他插件一起由 Host 统一仲裁。

## 最小示例

```ts
import { definePlugin } from '@tx5dr/plugin-api';

export default definePlugin({
  apiVersion: 2,
  name: 'ja-watcher',
  version: '1.0.0',
  type: 'utility',
  permissions: [],

  hooks: {
    onAutoCallCandidate(_slotInfo, messages, ctx) {
      const matched = messages.find((entry) => (
        entry.message.type === 'cq'
        && entry.message.senderCallsign.startsWith('JA')
      ));
      if (!matched || matched.message.type !== 'cq') return null;

      const callsign = matched.message.senderCallsign;
      if (ctx.operator.isTargetBeingWorkedByOthers(callsign)) return null;

      return {
        callsign,
        priority: 80,
      };
    },
  },
});
```

proposal 表示“建议 Host 选择这个目标”，不是立即发射。多个插件同时返回 proposal 时，Host 会按优先级、消息顺序和稳定插件名排序，最多接受一个目标。

## Proposal 字段

```ts
interface AutoCallProposal {
  callsign: string;
  priority?: number;
  lastMessage?: {
    message: FrameMessage;
    slotInfo: SlotInfo;
  };
}
```

- `callsign`：标准化前的目标呼号。
- `priority`：插件提议的相对优先级，值越大越优先。
- `lastMessage`：可选的真实触发 frame 及其 RX slot。

不要从 `ParsedFT8Message` 临时拼装一个 `FrameMessage`。确实需要 `lastMessage` 时，在 `onSlotActivity(event)` 中保存 Host 提供的 `event.frames` 与 `event.slotInfo`，再为同一条消息附上真实 frame。

## Priority 怎么选

把 priority 当作不同插件之间的意图强度，而不是绝对调度命令：

- `100+`：明确 watch list、sked 或人工预设目标
- `60-99`：新 DXCC、新网格等高价值机会
- `1-59`：弱偏好补充
- `0`：未设置时的默认层级

如果目标都允许，只是更偏好某一类，不要用 proposal 抢占流程，应使用 `onScoreCandidates()`。

## 调整执行计划

proposal 被接受后，Host 会调用 `onConfigureAutoCallExecution(request, plan, ctx)`。这一步适合选择更空闲的发射音频频率：

```ts
hooks: {
  onConfigureAutoCallExecution(_request, plan, ctx) {
    const audioFrequency = ctx.band.findIdleTransmitFrequency({
      minHz: 300,
      maxHz: 2_700,
      guardHz: 60,
    });

    return audioFrequency === null
      ? plan
      : { ...plan, audioFrequency };
  },
}
```

Host 仍负责目标预留、当前 strategy 的 `requestCall()` 和最终发射生命周期。

## 插件仍负责什么

proposal 机制不会替插件做业务判断。插件仍应检查：

- 是否只响应 CQ 或特定 directed CQ
- callsign、DXCC、网格和黑白名单规则
- 是否已被其他操作员处理
- 插件自己的启用状态和去重窗口

需要复用 Host 的 directed-CQ 规则时，可调用 `ctx.band.evaluateAutoTargetEligibility(message)`。

## 要点

- 发现目标使用 `onAutoCallCandidate()`。
- proposal 可组合，Host 统一仲裁并执行。
- `lastMessage` 只能携带真实 frame 和 slot，拿不到时可以省略。
- 只是改变偏好时使用评分 Hook，不要滥用高 priority。
