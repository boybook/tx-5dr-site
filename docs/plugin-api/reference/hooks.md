# PluginHooks

插件可以实现的 Hook 和相关数据类型。

## 导出

- [ScoredCandidate](#scoredcandidate)
- [QSOFailureInfo](#qsofailureinfo)
- [StrategyDecision](#strategydecision)
- [StrategyDecisionMeta](#strategydecisionmeta)
- [LastMessageInfo](#lastmessageinfo)
- [AutoCallProposal](#autocallproposal)
- [AutoCallExecutionRequest](#autocallexecutionrequest)
- [AutoCallExecutionPlan](#autocallexecutionplan)
- [SlotActivityEvent](#slotactivityevent)
- [FrequencyChangeState](#frequencychangestate)
- [PluginHooks](#pluginhooks)

## ScoredCandidate

- 类型: `interface`
- 源码: [hooks.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/hooks.ts)

Candidate message plus an accumulated ranking score.

The host constructs this shape before invoking
[`PluginHooks.onScoreCandidates`](./hooks#pluginhooks-onscorecandidates). Each scoring plugin may adjust the
numeric `score`, then the host uses the final values to rank target stations.

```ts
export interface ScoredCandidate extends ParsedFT8Message {
    score: number;
}
```

### ScoredCandidate.score

Relative desirability assigned by the scoring pipeline.

Higher values are preferred. Plugins may add or subtract from the incoming
score, which means scoring logic composes naturally across multiple utility
plugins.

```ts

score: number;

```
## QSOFailureInfo

- 类型: `interface`
- 源码: [hooks.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/hooks.ts)

Structured explanation emitted when an active QSO lifecycle fails.

```ts
export interface QSOFailureInfo {
    targetCallsign: string;
    reason: string;
    stage?: string;
    unansweredTransmissions?: number;
    hadTargetReply?: boolean;
}
```

### QSOFailureInfo.targetCallsign

Callsign of the station being worked when the failure occurred.

```ts

targetCallsign: string;

```

### QSOFailureInfo.reason

Human-readable failure summary suitable for diagnostics.

```ts

reason: string;

```

### QSOFailureInfo.stage

Optional protocol/runtime stage identifier, such as `TX2`.

```ts

stage?: string;

```

### QSOFailureInfo.unansweredTransmissions

Number of transmissions that received no response, when applicable.

```ts

unansweredTransmissions?: number;

```

### QSOFailureInfo.hadTargetReply

Whether the target replied at least once before the failure.

```ts

hadTargetReply?: boolean;

```
## StrategyDecision

- 类型: `interface`
- 源码: [hooks.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/hooks.ts)

Decision returned from [`StrategyRuntime.decide`](./runtime#strategyruntime-decide).

The shape is intentionally extensible so future API revisions can add new
control signals without breaking existing plugins.

```ts
export interface StrategyDecision {
    stop?: boolean;
    silentListen?: {
        reason: 'qso-success';
        acceptDirectedCalls: boolean;
        graceSlots?: number;
        excludeCallsigns?: string[];
    };
    qsoFailure?: QSOFailureInfo;
}
```

### StrategyDecision.stop

Requests that the host stop this operator's automation and leave the
active QSO flow. This is a policy stop, not a physical RF interrupt: any
committed/on-air frame is allowed to finish.

```ts

stop?: boolean;

```

### StrategyDecision.silentListen

Requests that the host keep a short receive-only gate after a successful
QSO stop. This lets a strategy turn off CQ/transmit UI while still
accepting direct protocol calls that arrive in the completion window.

```ts

silentListen?: {
    reason: 'qso-success';
    acceptDirectedCalls: boolean;
    graceSlots?: number;
    excludeCallsigns?: string[];
};

```

### StrategyDecision.qsoFailure

Optional structured reason for a strategy-requested QSO failure stop.

```ts

qsoFailure?: QSOFailureInfo;

```
## StrategyDecisionMeta

- 类型: `interface`
- 源码: [hooks.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/hooks.ts)

Metadata describing why a strategy decision is being evaluated.

> **Deprecated:** API v2 strategy runtimes receive `StrategyDecisionMetaV2` from
`runtime.ts`; this legacy shape is retained for source compatibility only.

```ts
export interface StrategyDecisionMeta {
    isReDecision?: boolean;
}
```

### StrategyDecisionMeta.isReDecision

Indicates that the host is re-processing a late decode during the same TX
window rather than advancing to a brand-new decision cycle.

Strategy runtimes can use this to avoid double-counting timeouts or other
one-shot transitions.

```ts

isReDecision?: boolean;

```
## LastMessageInfo

- 类型: `interface`
- 源码: [hooks.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/hooks.ts)

Pairing of a received frame and its slot metadata.

This is commonly passed back into strategy/runtime APIs when a plugin wants
to remember which exact message triggered a target selection.

```ts
export interface LastMessageInfo {
    message: FrameMessage;
    slotInfo: SlotInfo;
}
```

### LastMessageInfo.message

Original frame as received from the decoder or playback pipeline.

```ts

message: FrameMessage;

```

### LastMessageInfo.slotInfo

Slot timing metadata for the frame.

```ts

slotInfo: SlotInfo;

```
## AutoCallProposal

- 类型: `interface`
- 源码: [hooks.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/hooks.ts)

Declarative automatic-call request proposed by a utility plugin.

Utility plugins should prefer returning this shape from
[`PluginHooks.onAutoCallCandidate`](./hooks#pluginhooks-onautocallcandidate) instead of directly submitting a call
command from a broadcast hook. This lets the host arbitrate between multiple
simultaneous auto-call plugins in a deterministic way.

```ts
export interface AutoCallProposal {
    callsign: string;
    priority?: number;
    lastMessage?: LastMessageInfo;
}
```

### AutoCallProposal.callsign

Target callsign that should be called next.

```ts

callsign: string;

```

### AutoCallProposal.priority

Optional arbitration priority; higher values win.

```ts

priority?: number;

```

### AutoCallProposal.lastMessage

Optional triggering frame context used to preserve slot alignment.

```ts

lastMessage?: LastMessageInfo;

```
## AutoCallExecutionRequest

- 类型: `interface`
- 源码: [hooks.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/hooks.ts)

Immutable metadata about the automatic-call proposal that won arbitration.

```ts
export interface AutoCallExecutionRequest {
    sourcePluginName: string;
    callsign: string;
    slotInfo: SlotInfo;
    sourceSlotInfo?: SlotInfo;
    lastMessage?: LastMessageInfo;
}
```

### AutoCallExecutionRequest.sourcePluginName

Plugin name that produced the winning proposal.

```ts

sourcePluginName: string;

```

### AutoCallExecutionRequest.callsign

Target callsign chosen by the arbitration step.

```ts

callsign: string;

```

### AutoCallExecutionRequest.slotInfo

Slot that is currently being processed when the autocall starts.

```ts

slotInfo: SlotInfo;

```

### AutoCallExecutionRequest.sourceSlotInfo

Source receive slot that produced the accepted proposal.

Execution-stage plugins should prefer this slot when they need to inspect
the decode environment that triggered the autocall, such as picking a
quieter transmit offset from the previous RX slot.

```ts

sourceSlotInfo?: SlotInfo;

```

### AutoCallExecutionRequest.lastMessage

Optional triggering frame context preserved from the proposal stage.

```ts

lastMessage?: LastMessageInfo;

```
## AutoCallExecutionPlan

- 类型: `interface`
- 源码: [hooks.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/hooks.ts)

Host-managed execution plan for an accepted automatic-call proposal.

Utility plugins may refine this plan in
[`PluginHooks.onConfigureAutoCallExecution`](./hooks#pluginhooks-onconfigureautocallexecution). The host then applies the
merged plan before calling the active strategy runtime.

```ts
export interface AutoCallExecutionPlan {
    audioFrequency?: number;
}
```

### AutoCallExecutionPlan.audioFrequency

Optional transmit audio offset to apply before starting the automatic call.

```ts

audioFrequency?: number;

```
## SlotActivityEvent

- 类型: `interface`
- 源码: [hooks.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/hooks.ts)

Raw and parsed decode activity for one slot.

This is intentionally protocol-neutral: plugins can consume the original
`SlotPack.frames` when they need decoder metadata such as confidence while
still receiving the host-parsed messages used by normal decision hooks.

```ts
export interface SlotActivityEvent {
    slotInfo: SlotInfo;
    slotPack: SlotPack | null;
    frames: FrameMessage[];
    messages: ParsedFT8Message[];
    source: 'live' | 'replay' | 'reset';
}
```

### SlotActivityEvent.slotInfo

Timing and identity of the slot represented by this event.

```ts

slotInfo: SlotInfo;

```

### SlotActivityEvent.slotPack

Complete decoder slot pack, or `null` for reset/no-pack events.

```ts

slotPack: SlotPack | null;

```

### SlotActivityEvent.frames

Original decoder frames in their received order.

```ts

frames: FrameMessage[];

```

### SlotActivityEvent.messages

Host-parsed messages derived from the frames.

```ts

messages: ParsedFT8Message[];

```

### SlotActivityEvent.source

Whether the data is live, replayed, or clearing prior slot state.

```ts

source: 'live' | 'replay' | 'reset';

```
## FrequencyChangeState

- 类型: `type`
- 源码: [hooks.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/hooks.ts)

Protocol-neutral radio frequency/band change event.

```ts
export type FrequencyChangeState = FrequencyState;
```
## PluginHooks

- 类型: `interface`
- 源码: [hooks.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/hooks.ts)

Hook collection implemented by a plugin.

Hooks fall into three broad categories:
- pipeline hooks transform candidate lists before target selection;
- strategy-only hooks steer the active automation runtime;
- broadcast hooks observe lifecycle events and side effects.

Hooks should be quick and defensive. A misbehaving plugin can delay the whole
decode pipeline, so expensive work should be throttled, cached, or explicitly
awaited with cancellation and error handling rather than detached in the
background.

DTO arguments are detached snapshots and may be inspected or transformed
without mutating Host state. `ctx` properties that perform Host operations are
live capabilities and may only be invoked before the current Hook settles.

```ts
export interface PluginHooks<Permissions extends readonly PluginPermission[] = readonly [
]> {
    onAutoCallCandidate?(slotInfo: SlotInfo, messages: ParsedFT8Message[], ctx: PluginContextFor<Permissions>): AutoCallProposal | null | undefined | Promise<AutoCallProposal | null | undefined>;
    onConfigureAutoCallExecution?(request: AutoCallExecutionRequest, plan: AutoCallExecutionPlan, ctx: PluginContextFor<Permissions>): AutoCallExecutionPlan | null | undefined | Promise<AutoCallExecutionPlan | null | undefined>;
    onFilterCandidates?(candidates: ParsedFT8Message[], ctx: PluginContextFor<Permissions>): ParsedFT8Message[] | Promise<ParsedFT8Message[]>;
    onScoreCandidates?(candidates: ScoredCandidate[], ctx: PluginContextFor<Permissions>): ScoredCandidate[] | Promise<ScoredCandidate[]>;
    onSlotStart?(slotInfo: SlotInfo, messages: ParsedFT8Message[], ctx: PluginContextFor<Permissions>): void | Promise<void>;
    onSlotActivity?(event: SlotActivityEvent, ctx: PluginContextFor<Permissions>): void | Promise<void>;
    onDecode?(messages: ParsedFT8Message[], ctx: PluginContextFor<Permissions>): void | Promise<void>;
    onFrequencyChange?(state: FrequencyChangeState, ctx: PluginContextFor<Permissions>): void | Promise<void>;
    onQSOStart?(info: {
        targetCallsign: string;
        grid?: string;
    }, ctx: PluginContextFor<Permissions>): void | Promise<void>;
    onQSOComplete?(record: QSORecord, ctx: PluginContextFor<Permissions>): void | Promise<void>;
    onQSOFail?(info: QSOFailureInfo, ctx: PluginContextFor<Permissions>): void | Promise<void>;
    onTimer?(timerId: string, ctx: PluginContextFor<Permissions>): void | Promise<void>;
    onUserAction?(actionId: string, payload: unknown, ctx: PluginContextFor<Permissions>): void | Promise<void>;
    onConfigChange?(changes: Record<string, unknown>, ctx: PluginContextFor<Permissions>): void | Promise<void>;
}
```

### PluginHooks.onAutoCallCandidate

Proposes an automatic call target while the operator is idle.

The host collects proposals from all active utility plugins, resolves
conflicts deterministically, and then triggers at most one host-managed
`requestCall(...)` action for the winning proposal.

```ts

onAutoCallCandidate?(slotInfo: SlotInfo, messages: ParsedFT8Message[], ctx: PluginContextFor<Permissions>): AutoCallProposal | null | undefined | Promise<AutoCallProposal | null | undefined>;

```

### PluginHooks.onConfigureAutoCallExecution

Refines how an accepted automatic-call proposal should be executed.

The host runs this as a utility-plugin pipeline after proposal
arbitration. Each plugin receives the current execution plan and may return
an updated copy. This is the preferred place to centralize execution
policies such as pre-call frequency selection.

```ts

onConfigureAutoCallExecution?(request: AutoCallExecutionRequest, plan: AutoCallExecutionPlan, ctx: PluginContextFor<Permissions>): AutoCallExecutionPlan | null | undefined | Promise<AutoCallExecutionPlan | null | undefined>;

```

### PluginHooks.onFilterCandidates

Filters candidate target messages before the scoring phase.

The returned array feeds into the next plugin in the utility pipeline.
Returning an empty array intentionally removes every remaining candidate.

```ts

onFilterCandidates?(candidates: ParsedFT8Message[], ctx: PluginContextFor<Permissions>): ParsedFT8Message[] | Promise<ParsedFT8Message[]>;

```

### PluginHooks.onScoreCandidates

Adjusts ranking scores for the current candidate list.

Implementations typically add bonuses or penalties based on DXCC, signal
quality, duplicate history or custom operator preferences.

```ts

onScoreCandidates?(candidates: ScoredCandidate[], ctx: PluginContextFor<Permissions>): ScoredCandidate[] | Promise<ScoredCandidate[]>;

```

### PluginHooks.onSlotStart

Broadcast at the start of every slot with the slot metadata and decoded
messages already associated with that slot.

```ts

onSlotStart?(slotInfo: SlotInfo, messages: ParsedFT8Message[], ctx: PluginContextFor<Permissions>): void | Promise<void>;

```

### PluginHooks.onSlotActivity

Broadcast with raw slot/frame context plus parsed messages.

Prefer this hook when a plugin needs full decoder metadata or wants to
preserve a cache suitable for replay/status integrations.

```ts

onSlotActivity?(event: SlotActivityEvent, ctx: PluginContextFor<Permissions>): void | Promise<void>;

```

### PluginHooks.onDecode

Broadcast whenever decoded messages become available.

This fires even when the operator is idle, which makes it a good place for
monitoring, trigger detection and passive analytics.

```ts

onDecode?(messages: ParsedFT8Message[], ctx: PluginContextFor<Permissions>): void | Promise<void>;

```

### PluginHooks.onFrequencyChange

Broadcast when the host operating frequency or band changes.

```ts

onFrequencyChange?(state: FrequencyChangeState, ctx: PluginContextFor<Permissions>): void | Promise<void>;

```

### PluginHooks.onQSOStart

Reserved QSO-start notification.

> **Deprecated:** The Host does not currently dispatch this hook. Do not use it
for state transitions; observe decoded/slot activity or the active strategy
snapshot instead until an explicit QSO-start event is implemented.

```ts

onQSOStart?(info: {
    targetCallsign: string;
    grid?: string;
}, ctx: PluginContextFor<Permissions>): void | Promise<void>;

```

### PluginHooks.onQSOComplete

Broadcast after a QSO has been completed and recorded.

```ts

onQSOComplete?(record: QSORecord, ctx: PluginContextFor<Permissions>): void | Promise<void>;

```

### PluginHooks.onQSOFail

Broadcast when an in-progress QSO terminates unsuccessfully.

```ts

onQSOFail?(info: QSOFailureInfo, ctx: PluginContextFor<Permissions>): void | Promise<void>;

```

### PluginHooks.onTimer

Broadcast when a named timer created through [`PluginContext.timers`](./context#plugincontextbase-timers)
fires.

```ts

onTimer?(timerId: string, ctx: PluginContextFor<Permissions>): void | Promise<void>;

```

### PluginHooks.onUserAction

Broadcast when the user clicks one of the plugin's declared quick actions.

```ts

onUserAction?(actionId: string, payload: unknown, ctx: PluginContextFor<Permissions>): void | Promise<void>;

```

### PluginHooks.onConfigChange

Broadcast after one or more persisted plugin settings have changed.

The first argument is the Host's merged persisted settings object for the
affected scope, not only the keys changed by the latest update.

```ts

onConfigChange?(changes: Record<string, unknown>, ctx: PluginContextFor<Permissions>): void | Promise<void>;

```
