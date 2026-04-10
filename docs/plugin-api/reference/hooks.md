# PluginHooks

该页列出插件可注册的 Hook 入口。

> 自动生成自 `../tx-5dr/packages/plugin-api/src/hooks.ts`

## 导出

- [ScoredCandidate](#scoredcandidate)
- [StrategyDecision](#strategydecision)
- [StrategyDecisionMeta](#strategydecisionmeta)
- [LastMessageInfo](#lastmessageinfo)
- [AutoCallProposal](#autocallproposal)
- [AutoCallExecutionRequest](#autocallexecutionrequest)
- [AutoCallExecutionPlan](#autocallexecutionplan)
- [PluginHooks](#pluginhooks)

## ScoredCandidate

- Kind: `interface`
- Source: [hooks.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/hooks.ts)

Candidate message plus an accumulated ranking score.

The host constructs this shape before invoking
{@link PluginHooks.onScoreCandidates}. Each scoring plugin may adjust the
numeric `score`, then the host uses the final values to rank target stations.

```ts
export interface ScoredCandidate extends ParsedFT8Message {
  /**
   * Relative desirability assigned by the scoring pipeline.
   *
   * Higher values are preferred. Plugins may add or subtract from the incoming
   * score, which means scoring logic composes naturally across multiple utility
   * plugins.
   */
  score: number;
}
```

## 成员

### score

Relative desirability assigned by the scoring pipeline.

Higher values are preferred. Plugins may add or subtract from the incoming
score, which means scoring logic composes naturally across multiple utility
plugins.

```ts

score: number;

```
## StrategyDecision

- Kind: `interface`
- Source: [hooks.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/hooks.ts)

Decision returned from {@link StrategyRuntime.decide}.

The shape is intentionally extensible so future API revisions can add new
control signals without breaking existing plugins.

```ts
export interface StrategyDecision {
  /**
   * Requests that the host stop transmitting and leave the active QSO flow.
   *
   * During a late re-decision (`meta.isReDecision === true`), the host treats
   * this as an immediate abort request for the operator's in-flight
   * transmission. In other words, `stop: true` means both:
   * - stop the operator's automation/runtime state; and
   * - interrupt the operator's current audio/PTT contribution right away.
   */
  stop?: boolean;
}
```

## 成员

### stop

Requests that the host stop transmitting and leave the active QSO flow.

When `StrategyRuntime.decide(..., { isReDecision: true })` returns `stop: true`,
the host also immediately interrupts the operator's current live
audio/PTT contribution instead of waiting for the current TX period to finish.

```ts

stop?: boolean;

```
## StrategyDecisionMeta

- Kind: `interface`
- Source: [hooks.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/hooks.ts)

Metadata describing why a strategy decision is being evaluated.

```ts
export interface StrategyDecisionMeta {
  /**
   * Indicates that the host is re-processing a late decode during the same TX
   * window rather than advancing to a brand-new decision cycle.
   *
   * Strategy runtimes can use this to avoid double-counting timeouts or other
   * one-shot transitions.
   */
  isReDecision?: boolean;
}
```

## 成员

### isReDecision

Indicates that the host is re-processing a late decode during the same TX
window rather than advancing to a brand-new decision cycle.

Strategy runtimes can use this to avoid double-counting timeouts or other
one-shot transitions.

```ts

isReDecision?: boolean;

```
## LastMessageInfo

- Kind: `interface`
- Source: [hooks.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/hooks.ts)

Pairing of a received frame and its slot metadata.

This is commonly passed back into strategy/runtime APIs when a plugin wants
to remember which exact message triggered a target selection.

```ts
export interface LastMessageInfo {
  /** Original frame as received from the decoder or playback pipeline. */
  message: FrameMessage;
  /** Slot timing metadata for the frame. */
  slotInfo: SlotInfo;
}
```

## 成员

### message

Original frame as received from the decoder or playback pipeline.

```ts

message: FrameMessage;

```

### slotInfo

Slot timing metadata for the frame.

```ts

slotInfo: SlotInfo;

```
## AutoCallProposal

- Kind: `interface`
- Source: [hooks.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/hooks.ts)

Declarative automatic-call request proposed by a utility plugin.

Utility plugins should prefer returning this shape from
{@link PluginHooks.onAutoCallCandidate} instead of directly invoking
`ctx.operator.call(...)` inside broadcast hooks. This lets the host arbitrate
between multiple simultaneous auto-call plugins in a deterministic way.

```ts
export interface AutoCallProposal {
  /** Target callsign that should be called next. */
  callsign: string;
  /** Optional arbitration priority; higher values win. */
  priority?: number;
  /** Optional triggering frame context used to preserve slot alignment. */
  lastMessage?: LastMessageInfo;
}
```

## 成员

### callsign

Target callsign that should be called next.

```ts

callsign: string;

```

### priority

Optional arbitration priority; higher values win.

```ts

priority?: number;

```

### lastMessage

Optional triggering frame context used to preserve slot alignment.

```ts

lastMessage?: LastMessageInfo;

```
## AutoCallExecutionRequest

- Kind: `interface`
- Source: [hooks.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/hooks.ts)

Immutable metadata about the automatic-call proposal that won arbitration.

```ts
export interface AutoCallExecutionRequest {
  /** Plugin name that produced the winning proposal. */
  sourcePluginName: string;
  /** Target callsign chosen by the arbitration step. */
  callsign: string;
  /** Slot that is currently being processed when the autocall starts. */
  slotInfo: SlotInfo;
  /** Optional triggering frame context preserved from the proposal stage. */
  lastMessage?: LastMessageInfo;
}
```

## 成员

### sourcePluginName

Plugin name that produced the winning proposal.

```ts

sourcePluginName: string;

```

### callsign

Target callsign chosen by the arbitration step.

```ts

callsign: string;

```

### slotInfo

Slot that is currently being processed when the autocall starts.

```ts

slotInfo: SlotInfo;

```

### lastMessage

Optional triggering frame context preserved from the proposal stage.

```ts

lastMessage?: LastMessageInfo;

```
## AutoCallExecutionPlan

- Kind: `interface`
- Source: [hooks.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/hooks.ts)

Host-managed execution plan for an accepted automatic-call proposal.

Utility plugins may refine this plan in
{@link PluginHooks.onConfigureAutoCallExecution}. The host then applies the
merged plan before calling the active strategy runtime.

```ts
export interface AutoCallExecutionPlan {
  /**
   * Optional transmit audio offset to apply before starting the automatic call.
   */
  audioFrequency?: number;
}
```

## 成员

### audioFrequency

Optional transmit audio offset to apply before starting the automatic call.

```ts

audioFrequency?: number;

```
## PluginHooks

- Kind: `interface`
- Source: [hooks.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/hooks.ts)

Hook collection implemented by a plugin.

Hooks fall into three broad categories:
- pipeline hooks transform candidate lists before target selection;
- strategy-only hooks steer the active automation runtime;
- broadcast hooks observe lifecycle events and side effects.

Hooks should be quick and defensive. A misbehaving plugin can delay the whole
decode pipeline, so expensive work should be throttled, cached or deferred.

```ts
export interface PluginHooks {
  /**
   * Proposes an automatic call target while the operator is idle.
   *
   * The host collects proposals from all active utility plugins, resolves
   * conflicts deterministically, and then triggers at most one host-managed
   * `requestCall(...)` action for the winning proposal.
   */
  onAutoCallCandidate?(
    slotInfo: SlotInfo,
    messages: ParsedFT8Message[],
    ctx: PluginContext,
  ): AutoCallProposal | null | undefined | Promise<AutoCallProposal | null | undefined>;

  /**
   * Refines how an accepted automatic-call proposal should be executed.
   *
   * The host runs this as a utility-plugin pipeline after proposal
   * arbitration. Each plugin receives the current execution plan and may return
   * an updated copy. This is the preferred place to centralize execution
   * policies such as pre-call frequency selection.
   */
  onConfigureAutoCallExecution?(
    request: AutoCallExecutionRequest,
    plan: AutoCallExecutionPlan,
    ctx: PluginContext,
  ): AutoCallExecutionPlan | null | undefined | Promise<AutoCallExecutionPlan | null | undefined>;

  /**
   * Filters candidate target messages before the scoring phase.
   *
   * The returned array feeds into the next plugin in the utility pipeline. As a
   * safety mechanism, returning an empty array when the input was non-empty is
   * treated by the host as an accidental full drop and may be ignored.
   */
  onFilterCandidates?(
    candidates: ParsedFT8Message[],
    ctx: PluginContext,
  ): ParsedFT8Message[] | Promise<ParsedFT8Message[]>;

  /**
   * Adjusts ranking scores for the current candidate list.
   *
   * Implementations typically add bonuses or penalties based on DXCC, signal
   * quality, duplicate history or custom operator preferences.
   */
  onScoreCandidates?(
    candidates: ScoredCandidate[],
    ctx: PluginContext,
  ): ScoredCandidate[] | Promise<ScoredCandidate[]>;

  /**
   * Broadcast at the start of every slot with the slot metadata and decoded
   * messages already associated with that slot.
   */
  onSlotStart?(slotInfo: SlotInfo, messages: ParsedFT8Message[], ctx: PluginContext): void;

  /**
   * Broadcast whenever decoded messages become available.
   *
   * This fires even when the operator is idle, which makes it a good place for
   * monitoring, trigger detection and passive analytics.
   */
  onDecode?(messages: ParsedFT8Message[], ctx: PluginContext): void;

  /**
   * Broadcast when the host locks onto a target and a QSO officially starts.
   */
  onQSOStart?(info: { targetCallsign: string; grid?: string }, ctx: PluginContext): void;

  /**
   * Broadcast after a QSO has been completed and recorded.
   */
  onQSOComplete?(record: QSORecord, ctx: PluginContext): void;

  /**
   * Broadcast when an in-progress QSO terminates unsuccessfully.
   */
  onQSOFail?(info: { targetCallsign: string; reason: string }, ctx: PluginContext): void;

  /**
   * Broadcast when a named timer created through {@link PluginContext.timers}
   * fires.
   */
  onTimer?(timerId: string, ctx: PluginContext): void;

  /**
   * Broadcast when the user clicks one of the plugin's declared quick actions.
   */
  onUserAction?(actionId: string, payload: unknown, ctx: PluginContext): void;

  /**
   * Broadcast after one or more persisted plugin settings have changed.
   *
   * The `changes` object contains only the updated keys and their new resolved
   * values.
   */
  onConfigChange?(changes: Record<string, unknown>, ctx: PluginContext): void;
}
```

## 成员

### onAutoCallCandidate

Proposes an automatic call target while the operator is idle.

The host collects proposals from all active utility plugins, resolves
conflicts deterministically, and then triggers at most one host-managed
`requestCall(...)` action for the winning proposal.

```ts

onAutoCallCandidate?(
    slotInfo: SlotInfo,
    messages: ParsedFT8Message[],
    ctx: PluginContext,
  ): AutoCallProposal | null | undefined | Promise<AutoCallProposal | null | undefined>;

```

### onConfigureAutoCallExecution

Refines how an accepted automatic-call proposal should be executed.

The host runs this as a utility-plugin pipeline after proposal
arbitration. Each plugin receives the current execution plan and may return
an updated copy. This is the preferred place to centralize execution
policies such as pre-call frequency selection.

```ts

onConfigureAutoCallExecution?(
    request: AutoCallExecutionRequest,
    plan: AutoCallExecutionPlan,
    ctx: PluginContext,
  ): AutoCallExecutionPlan | null | undefined | Promise<AutoCallExecutionPlan | null | undefined>;

```

### onFilterCandidates

Filters candidate target messages before the scoring phase.

The returned array feeds into the next plugin in the utility pipeline. As a
safety mechanism, returning an empty array when the input was non-empty is
treated by the host as an accidental full drop and may be ignored.

```ts

onFilterCandidates?(
    candidates: ParsedFT8Message[],
    ctx: PluginContext,
  ): ParsedFT8Message[] | Promise<ParsedFT8Message[]>;

```

### onScoreCandidates

Adjusts ranking scores for the current candidate list.

Implementations typically add bonuses or penalties based on DXCC, signal
quality, duplicate history or custom operator preferences.

```ts

onScoreCandidates?(
    candidates: ScoredCandidate[],
    ctx: PluginContext,
  ): ScoredCandidate[] | Promise<ScoredCandidate[]>;

```

### onSlotStart

Broadcast at the start of every slot with the slot metadata and decoded
messages already associated with that slot.

```ts

onSlotStart?(slotInfo: SlotInfo, messages: ParsedFT8Message[], ctx: PluginContext): void;

```

### onDecode

Broadcast whenever decoded messages become available.

This fires even when the operator is idle, which makes it a good place for
monitoring, trigger detection and passive analytics.

```ts

onDecode?(messages: ParsedFT8Message[], ctx: PluginContext): void;

```

### onQSOStart

Broadcast when the host locks onto a target and a QSO officially starts.

```ts

onQSOStart?(info: { targetCallsign: string; grid?: string }, ctx: PluginContext): void;

```

### onQSOComplete

Broadcast after a QSO has been completed and recorded.

```ts

onQSOComplete?(record: QSORecord, ctx: PluginContext): void;

```

### onQSOFail

Broadcast when an in-progress QSO terminates unsuccessfully.

```ts

onQSOFail?(info: { targetCallsign: string; reason: string }, ctx: PluginContext): void;

```

### onTimer

Broadcast when a named timer created through {@link PluginContext.timers}
fires.

```ts

onTimer?(timerId: string, ctx: PluginContext): void;

```

### onUserAction

Broadcast when the user clicks one of the plugin's declared quick actions.

```ts

onUserAction?(actionId: string, payload: unknown, ctx: PluginContext): void;

```

### onConfigChange

Broadcast after one or more persisted plugin settings have changed.

The `changes` object contains only the updated keys and their new resolved
values.

```ts

onConfigChange?(changes: Record<string, unknown>, ctx: PluginContext): void;

```
