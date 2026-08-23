# StrategyRuntime

`strategy` 插件的运行时接口。

## 导出

- [StrategyRuntimeSlot](#strategyruntimeslot)
- [StrategyRuntimeContext](#strategyruntimecontext)
- [StrategyRuntimeSnapshot](#strategyruntimesnapshot)
- [AssistedQueueDisplayState](#assistedqueuedisplaystate)
- [AssistedQueuePauseReason](#assistedqueuepausereason)
- [AssistedQueueTone](#assistedqueuetone)
- [AssistedQueueIcon](#assistedqueueicon)
- [AssistedQueueRow](#assistedqueuerow)
- [AssistedQueueSnapshot](#assistedqueuesnapshot)
- [QueuedStrategyObservationMeta](#queuedstrategyobservationmeta)
- [QueuedStrategyTargetRequest](#queuedstrategytargetrequest)
- [QueuedStrategyMutationResult](#queuedstrategymutationresult)
- [QueuedStrategyRuntime](#queuedstrategyruntime)
- [isQueuedStrategyRuntime](#isqueuedstrategyruntime)
- [StrategyRuntimeSlotContentUpdate](#strategyruntimeslotcontentupdate)
- [StrategyDecisionSource](#strategydecisionsource)
- [StrategyDecisionMetaV2](#strategydecisionmetav2)
- [StrategyRuntimeCheckpoint](#strategyruntimecheckpoint)
- [StrategyQSOCompletionEffect](#strategyqsocompletioneffect)
- [StrategyQSOCompletionSettlement](#strategyqsocompletionsettlement)
- [StrategyDecisionResult](#strategydecisionresult)
- [StrategyRuntime](#strategyruntime)

## StrategyRuntimeSlot

- 类型: `type`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Logical FT8 transmit slot identifiers used by the built-in automation model.

These labels correspond to the six sequential transmit messages in a typical
FT8 QSO flow and are used for status snapshots and UI updates.

```ts
export type StrategyRuntimeSlot = 'TX1' | 'TX2' | 'TX3' | 'TX4' | 'TX5' | 'TX6';
```
## StrategyRuntimeContext

- 类型: `interface`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Mutable strategy context maintained by the host/runtime pair.

This object captures the operator's current conversation target and selected
radio metadata. Strategy implementations can patch it incrementally through
[`StrategyRuntime.patchContext`](./runtime#strategyruntime-patchcontext).

```ts
export interface StrategyRuntimeContext {
    targetCallsign?: string;
    targetGrid?: string;
    reportSent?: number;
    reportReceived?: number;
    actualFrequency?: number;
}
```

### StrategyRuntimeContext.targetCallsign

Currently selected target callsign, if any.

```ts

targetCallsign?: string;

```

### StrategyRuntimeContext.targetGrid

Grid locator reported by the target station, if known.

```ts

targetGrid?: string;

```

### StrategyRuntimeContext.reportSent

Signal report sent to the target station.

```ts

reportSent?: number;

```

### StrategyRuntimeContext.reportReceived

Signal report received from the target station.

```ts

reportReceived?: number;

```

### StrategyRuntimeContext.actualFrequency

Actual RF/audio frequency being used for the active QSO.

```ts

actualFrequency?: number;

```
## StrategyRuntimeSnapshot

- 类型: `interface`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Serializable snapshot of the strategy runtime.

The host forwards this structure to operator-facing UI so users can inspect
the current automation state without coupling the UI to strategy internals.

```ts
export interface StrategyRuntimeSnapshot {
    currentState: string;
    slots?: Partial<Record<StrategyRuntimeSlot, string>>;
    context?: StrategyRuntimeContext;
    availableSlots?: string[];
    qsoLifecycleEpoch?: number;
    queue?: AssistedQueueSnapshot;
}
```

### StrategyRuntimeSnapshot.currentState

Stable or semi-stable state identifier chosen by the strategy runtime.

```ts

currentState: string;

```

### StrategyRuntimeSnapshot.slots

Text currently queued or associated with each logical transmit slot.

```ts

slots?: Partial<Record<StrategyRuntimeSlot, string>>;

```

### StrategyRuntimeSnapshot.context

Current conversation metadata tracked by the runtime.

```ts

context?: StrategyRuntimeContext;

```

### StrategyRuntimeSnapshot.availableSlots

Optional list of user-visible next states, modes or branch hints.

```ts

availableSlots?: string[];

```

### StrategyRuntimeSnapshot.qsoLifecycleEpoch

Host correlation token for QSO persistence; it is not an RF decision epoch.

```ts

qsoLifecycleEpoch?: number;

```

### StrategyRuntimeSnapshot.queue

Optional compact projection exposed by queue-capable strategies.

```ts

queue?: AssistedQueueSnapshot;

```
## AssistedQueueDisplayState

- 类型: `type`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

User-facing phase shown for one row in a queue-capable strategy.

```ts
export type AssistedQueueDisplayState = 'TX1' | 'TX2' | 'TX3' | 'TX4' | 'TX5' | 'engaged' | 'closing' | 'paused' | 'no-response' | 'later' | 'review';
```
## AssistedQueuePauseReason

- 类型: `type`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Why a queued target is temporarily paused instead of being selected.

```ts
export type AssistedQueuePauseReason = 'target-busy' | 'stale';
```
## AssistedQueueTone

- 类型: `type`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Semantic color treatment requested for an assisted queue row.

```ts
export type AssistedQueueTone = 'neutral' | 'active' | 'success' | 'warning' | 'danger';
```
## AssistedQueueIcon

- 类型: `type`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Host icon identifier requested for an assisted queue row.

```ts
export type AssistedQueueIcon = 'circle' | 'radio' | 'check-circle' | 'loader-circle' | 'clock' | 'pause' | 'triangle-alert';
```
## AssistedQueueRow

- 类型: `interface`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Stable, serializable UI projection of one queued target.

```ts
export interface AssistedQueueRow {
    entryId: string;
    callsign: string;
    order: number;
    draggable: boolean;
    displayState: AssistedQueueDisplayState;
    tone: AssistedQueueTone;
    icon: AssistedQueueIcon;
    pauseReason?: AssistedQueuePauseReason;
    noResponseCycles?: number;
    targetGrid?: string;
    lastSnr?: number;
    lastHeardCyclesAgo?: number;
}
```

### AssistedQueueRow.entryId

Queue-entry identity used by reorder/remove/retry commands.

```ts

entryId: string;

```

### AssistedQueueRow.callsign

Target station callsign.

```ts

callsign: string;

```

### AssistedQueueRow.order

Zero-based display order in the current snapshot.

```ts

order: number;

```

### AssistedQueueRow.draggable

Whether the UI may offer drag-to-reorder for this row.

```ts

draggable: boolean;

```

### AssistedQueueRow.displayState

Current protocol or queue phase shown to the operator.

```ts

displayState: AssistedQueueDisplayState;

```

### AssistedQueueRow.tone

Semantic visual treatment for the row.

```ts

tone: AssistedQueueTone;

```

### AssistedQueueRow.icon

Icon chosen by the strategy for the current state.

```ts

icon: AssistedQueueIcon;

```

### AssistedQueueRow.pauseReason

Why this row is paused, when `displayState` is `paused`.

```ts

pauseReason?: AssistedQueuePauseReason;

```

### AssistedQueueRow.noResponseCycles

Consecutive no-response cycles observed for this target.

```ts

noResponseCycles?: number;

```

### AssistedQueueRow.targetGrid

Last known Maidenhead grid locator for the target.

```ts

targetGrid?: string;

```

### AssistedQueueRow.lastSnr

Most recently decoded signal report in dB.

```ts

lastSnr?: number;

```

### AssistedQueueRow.lastHeardCyclesAgo

Receive cycles elapsed since this target was last decoded.

```ts

lastHeardCyclesAgo?: number;

```
## AssistedQueueSnapshot

- 类型: `interface`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Versioned queue projection embedded in `StrategyRuntimeSnapshot.queue`.

```ts
export interface AssistedQueueSnapshot {
    version: number;
    activeEntryId?: string;
    rows: AssistedQueueRow[];
}
```

### AssistedQueueSnapshot.version

Monotonically increasing revision used for optimistic mutations.

```ts

version: number;

```

### AssistedQueueSnapshot.activeEntryId

Entry currently owned by the active QSO lifecycle, when any.

```ts

activeEntryId?: string;

```

### AssistedQueueSnapshot.rows

Queue rows in display order.

```ts

rows: AssistedQueueRow[];

```
## QueuedStrategyObservationMeta

- 类型: `interface`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Metadata supplied when a queue-capable strategy observes decoded messages.

```ts
export interface QueuedStrategyObservationMeta {
    slotInfo: SlotInfo;
    source: StrategyDecisionSource;
    signal: AbortSignal;
}
```

### QueuedStrategyObservationMeta.slotInfo

Slot that produced the decoded messages.

```ts

slotInfo: SlotInfo;

```

### QueuedStrategyObservationMeta.source

Why the Host is asking the strategy to observe this batch.

```ts

source: StrategyDecisionSource;

```

### QueuedStrategyObservationMeta.signal

Aborts when this observation is superseded or the instance stops.

```ts

signal: AbortSignal;

```
## QueuedStrategyTargetRequest

- 类型: `interface`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Target and optional triggering frame submitted to an assisted queue.

```ts
export interface QueuedStrategyTargetRequest {
    callsign: string;
    lastMessage?: {
        message: FrameMessage;
        slotInfo: SlotInfo;
    };
}
```

### QueuedStrategyTargetRequest.callsign

Callsign to normalize and enqueue.

```ts

callsign: string;

```

### QueuedStrategyTargetRequest.lastMessage

Authentic decoder frame/slot pair that triggered the request, when known.

```ts

lastMessage?: {
    message: FrameMessage;
    slotInfo: SlotInfo;
};

```
## QueuedStrategyMutationResult

- 类型: `interface`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Result of an assisted queue mutation, including the authoritative snapshot.

```ts
export interface QueuedStrategyMutationResult {
    outcome: 'accepted' | 'duplicate' | 'rejected';
    reason?: 'queue_full' | 'invalid_target' | 'entry_not_found' | 'entry_not_retryable' | 'active_entry' | 'version_conflict';
    snapshot: AssistedQueueSnapshot;
}
```

### QueuedStrategyMutationResult.outcome

Whether the mutation changed the queue, was already satisfied, or was rejected.

```ts

outcome: 'accepted' | 'duplicate' | 'rejected';

```

### QueuedStrategyMutationResult.reason

Machine-readable rejection reason.

```ts

reason?: 'queue_full' | 'invalid_target' | 'entry_not_found' | 'entry_not_retryable' | 'active_entry' | 'version_conflict';

```

### QueuedStrategyMutationResult.snapshot

Authoritative queue state after the attempted mutation.

```ts

snapshot: AssistedQueueSnapshot;

```
## QueuedStrategyRuntime

- 类型: `interface`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Optional capability implemented by strategies that own a target queue.

```ts
export interface QueuedStrategyRuntime extends StrategyRuntime {
    observeDecodedMessages(messages: ParsedFT8Message[], meta: QueuedStrategyObservationMeta): boolean;
    enqueueTarget(request: QueuedStrategyTargetRequest): QueuedStrategyMutationResult;
    reorderTarget(entryId: string, beforeEntryId: string | null, expectedVersion: number): QueuedStrategyMutationResult;
    removeTarget(entryId: string, expectedVersion: number): QueuedStrategyMutationResult;
    retryTarget?(entryId: string, expectedVersion: number): QueuedStrategyMutationResult;
    clearTargets?(expectedVersion: number): QueuedStrategyMutationResult;
    getQueueSnapshot(): AssistedQueueSnapshot;
}
```

### QueuedStrategyRuntime.observeDecodedMessages

Incorporates a decoded batch and returns whether the queue projection changed.

```ts

observeDecodedMessages(messages: ParsedFT8Message[], meta: QueuedStrategyObservationMeta): boolean;

```

### QueuedStrategyRuntime.enqueueTarget

Adds a target unless it is invalid, duplicated or the queue is full.

```ts

enqueueTarget(request: QueuedStrategyTargetRequest): QueuedStrategyMutationResult;

```

### QueuedStrategyRuntime.reorderTarget

Moves an entry before another entry, or to the end when `beforeEntryId` is null.

```ts

reorderTarget(entryId: string, beforeEntryId: string | null, expectedVersion: number): QueuedStrategyMutationResult;

```

### QueuedStrategyRuntime.removeTarget

Removes a non-active entry using optimistic version validation.

```ts

removeTarget(entryId: string, expectedVersion: number): QueuedStrategyMutationResult;

```

### QueuedStrategyRuntime.retryTarget

Makes a retryable failed/no-response entry eligible again.

```ts

retryTarget?(entryId: string, expectedVersion: number): QueuedStrategyMutationResult;

```

### QueuedStrategyRuntime.clearTargets

Removes every non-active entry using optimistic version validation.

```ts

clearTargets?(expectedVersion: number): QueuedStrategyMutationResult;

```

### QueuedStrategyRuntime.getQueueSnapshot

Returns the current detached queue snapshot.

```ts

getQueueSnapshot(): AssistedQueueSnapshot;

```
## isQueuedStrategyRuntime

- 类型: `function`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Runtime type guard for the optional assisted-target queue capability.

```ts
export function isQueuedStrategyRuntime(runtime: StrategyRuntime): runtime is QueuedStrategyRuntime {
    const candidate = runtime as Partial<QueuedStrategyRuntime>;
    return typeof candidate.observeDecodedMessages === 'function'
        && typeof candidate.enqueueTarget === 'function'
        && typeof candidate.reorderTarget === 'function'
        && typeof candidate.removeTarget === 'function'
        && typeof candidate.getQueueSnapshot === 'function';
}
```
## StrategyRuntimeSlotContentUpdate

- 类型: `interface`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Describes a slot text mutation emitted by the strategy runtime.

```ts
export interface StrategyRuntimeSlotContentUpdate {
    slot: StrategyRuntimeSlot;
    content: string;
}
```

### StrategyRuntimeSlotContentUpdate.slot

Logical slot whose rendered content should be updated.

```ts

slot: StrategyRuntimeSlot;

```

### StrategyRuntimeSlotContentUpdate.content

Human-readable content for the slot, usually an FT8 message template.

```ts

content: string;

```
## StrategyDecisionSource

- 类型: `type`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Trigger that caused the Host to request a strategy decision.

```ts
export type StrategyDecisionSource = 'slot-auto' | 'late-decode';
```
## StrategyDecisionMetaV2

- 类型: `interface`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Invocation metadata for a speculative API v2 strategy decision.

```ts
export interface StrategyDecisionMetaV2 {
    epoch: number;
    source: StrategyDecisionSource;
    isReDecision: boolean;
    signal: AbortSignal;
}
```

### StrategyDecisionMetaV2.epoch

Monotonic Host decision epoch; newer epochs supersede older decisions.

```ts

epoch: number;

```

### StrategyDecisionMetaV2.source

Slot progression or late-decode event that triggered the decision.

```ts

source: StrategyDecisionSource;

```

### StrategyDecisionMetaV2.isReDecision

`true` when new information caused the current slot to be evaluated again.

```ts

isReDecision: boolean;

```

### StrategyDecisionMetaV2.signal

Aborts when this decision is superseded, times out or the instance stops.

```ts

signal: AbortSignal;

```
## StrategyRuntimeCheckpoint

- 类型: `type`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Strategy-owned state captured before a speculative decision.

The value must be structured-clone compatible and must not contain Host
capabilities, functions, promises or external resource handles.

```ts
export type StrategyRuntimeCheckpoint = unknown;
```
## StrategyQSOCompletionEffect

- 类型: `interface`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Declarative request for the Host to durably commit one completed QSO.

```ts
export interface StrategyQSOCompletionEffect {
    record: QSORecord;
    lifecycleEpoch: number;
}
```

### StrategyQSOCompletionEffect.record

Complete QSO record to validate and persist.

```ts

record: QSORecord;

```

### StrategyQSOCompletionEffect.lifecycleEpoch

Stable within one strategy runtime generation; distinct from RF decision epochs.

```ts

lifecycleEpoch: number;

```
## StrategyQSOCompletionSettlement

- 类型: `interface`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Host acknowledgement for a previously returned QSO completion effect.

```ts
export interface StrategyQSOCompletionSettlement {
    lifecycleEpoch: number;
    recordId: string;
    status: 'committed' | 'failed';
}
```

### StrategyQSOCompletionSettlement.lifecycleEpoch

Lifecycle epoch copied from the effect being settled.

```ts

lifecycleEpoch: number;

```

### StrategyQSOCompletionSettlement.recordId

Record ID from the accepted completion effect after Host persistence settles.

```ts

recordId: string;

```

### StrategyQSOCompletionSettlement.status

Whether the Host committed the record or the durable operation failed.

```ts

status: 'committed' | 'failed';

```
## StrategyDecisionResult

- 类型: `interface`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Complete output of one speculative strategy decision.

```ts
export interface StrategyDecisionResult extends StrategyDecision {
    transmission: string | null;
    snapshot: StrategyRuntimeSnapshot;
    qsoCompletion?: StrategyQSOCompletionEffect;
    requestedTransmitCycle?: number;
}
```

### StrategyDecisionResult.transmission

Exact text to queue next, or `null` when this decision should not transmit.

```ts

transmission: string | null;

```

### StrategyDecisionResult.snapshot

UI/diagnostic snapshot produced from the same post-decision state.

```ts

snapshot: StrategyRuntimeSnapshot;

```

### StrategyDecisionResult.qsoCompletion

Optional QSO persistence effect executed by the Host after acceptance.

```ts

qsoCompletion?: StrategyQSOCompletionEffect;

```

### StrategyDecisionResult.requestedTransmitCycle

Optional cycle selected from the triggering RX frame; applied by the host after target reservation.

```ts

requestedTransmitCycle?: number;

```
## StrategyRuntime

- 类型: `interface`
- 源码: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Active controller for a `strategy` plugin.

The host delegates core automation flow to this runtime. A strategy runtime is
expected to be lightweight, synchronous where possible and deterministic with
respect to the incoming slot/decode stream.

```ts
export interface StrategyRuntime {
    checkpoint(): StrategyRuntimeCheckpoint;
    restore(checkpoint: StrategyRuntimeCheckpoint): void;
    settleQSOCompletion?(settlement: StrategyQSOCompletionSettlement): void;
    decide(messages: ParsedFT8Message[], meta: StrategyDecisionMetaV2): Promise<StrategyDecisionResult> | StrategyDecisionResult;
    getTransmitText(): string | null;
    requestCall(callsign: string, lastMessage?: {
        message: FrameMessage;
        slotInfo: SlotInfo;
    }): boolean | void;
    getSnapshot(): StrategyRuntimeSnapshot;
    patchContext(patch: Partial<StrategyRuntimeContext>): void;
    setState(state: StrategyRuntimeSlot): void;
    setSlotContent(update: StrategyRuntimeSlotContentUpdate): void;
    reset(reason?: string): void;
    onTransmissionQueued?(transmission: string): void;
}
```

### StrategyRuntime.checkpoint

Captures all mutable state needed to roll back the next decision.

```ts

checkpoint(): StrategyRuntimeCheckpoint;

```

### StrategyRuntime.restore

Restores a previously captured checkpoint after a decision is discarded.

```ts

restore(checkpoint: StrategyRuntimeCheckpoint): void;

```

### StrategyRuntime.settleQSOCompletion

Optional acknowledgement for a declarative QSO effect. Implementations may
use it to prevent a completed contact from leaking into the next lifecycle.
The Host invokes it only for an accepted effect from the same runtime
generation and reports whether durable persistence committed or failed.

```ts

settleQSOCompletion?(settlement: StrategyQSOCompletionSettlement): void;

```

### StrategyRuntime.decide

Re-evaluates the current automation state using the latest decoded messages.

Return `{ stop: true }` to stop this operator's automation and prevent new
frames. It never grants an RF interrupt: an already committed/on-air frame
is allowed to finish. Explicit operator contribution removal is available
only through the invocation-guarded `operator:transmit-control` command
port outside speculative strategy execution.

```ts

decide(messages: ParsedFT8Message[], meta: StrategyDecisionMetaV2): Promise<StrategyDecisionResult> | StrategyDecisionResult;

```

### StrategyRuntime.getTransmitText

Returns the exact text that should be transmitted next, or `null` when no
transmission should be queued.

```ts

getTransmitText(): string | null;

```

### StrategyRuntime.requestCall

Requests that the runtime initiate or resume a call to a target station.

The optional `lastMessage` provides the frame that triggered the call, which
is useful when reacting to a specific CQ or completion signal.
Return exactly `false` to reject the target; `true` or `void` means the
runtime accepted it and the Host may start the operator.

```ts

requestCall(callsign: string, lastMessage?: {
    message: FrameMessage;
    slotInfo: SlotInfo;
}): boolean | void;

```

### StrategyRuntime.getSnapshot

Produces a serializable runtime snapshot for diagnostics and UI.

```ts

getSnapshot(): StrategyRuntimeSnapshot;

```

### StrategyRuntime.patchContext

Applies a partial update to the runtime context.

```ts

patchContext(patch: Partial<StrategyRuntimeContext>): void;

```

### StrategyRuntime.setState

Switches the runtime to a specific logical transmit slot/state.

```ts

setState(state: StrategyRuntimeSlot): void;

```

### StrategyRuntime.setSlotContent

Updates the human-readable content associated with a logical slot.

```ts

setSlotContent(update: StrategyRuntimeSlotContentUpdate): void;

```

### StrategyRuntime.reset

Clears transient state and returns the runtime to an idle baseline.

The optional `reason` is intended for logging or diagnostics only.

```ts

reset(reason?: string): void;

```

### StrategyRuntime.onTransmissionQueued

Optional notification that a transmission has just been queued by the host.

Use this to mirror queued text into internal state when needed.

```ts

onTransmissionQueued?(transmission: string): void;

```
