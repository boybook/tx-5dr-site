# StrategyRuntime

Runtime interfaces for `strategy` plugins.

## Exports

- [StrategyRuntimeSlot](#strategyruntimeslot)
- [StrategyRuntimeContext](#strategyruntimecontext)
- [StrategyRuntimeSnapshot](#strategyruntimesnapshot)
- [StrategyMessagePresentationTone](#strategymessagepresentationtone)
- [StrategyMessagePresentationBadge](#strategymessagepresentationbadge)
- [StrategyMessagePresentationTokenMatch](#strategymessagepresentationtokenmatch)
- [StrategyMessagePresentationClass](#strategymessagepresentationclass)
- [StrategyMessagePresentationNoveltyRule](#strategymessagepresentationnoveltyrule)
- [StrategyMessagePresentationTagRule](#strategymessagepresentationtagrule)
- [StrategyMessagePresentationProjection](#strategymessagepresentationprojection)
- [StrategyTransmitGate](#strategytransmitgate)
- [StrategyActionTone](#strategyactiontone)
- [StrategyActionPresentation](#strategyactionpresentation)
- [StrategyActionInput](#strategyactioninput)
- [StrategyActionDescriptor](#strategyactiondescriptor)
- [StrategyAttention](#strategyattention)
- [StrategyCompletionProjection](#strategycompletionprojection)
- [StrategyStateOption](#strategystateoption)
- [StrategyStreamSnapshot](#strategystreamsnapshot)
- [StrategyActionTarget](#strategyactiontarget)
- [StrategyActionInvocation](#strategyactioninvocation)
- [StrategyLogbookSessionEffect](#strategylogbooksessioneffect)
- [StrategyActionResult](#strategyactionresult)
- [StrategyStreamStateUpdate](#strategystreamstateupdate)
- [StrategyTransmission](#strategytransmission)
- [StreamPhysicalReceipt](#streamphysicalreceipt)
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
- [StrategyOperatorTransmitCyclesChanged](#strategyoperatortransmitcycleschanged)
- [StrategyQSOCompletionEffect](#strategyqsocompletioneffect)
- [StrategyQSOCompletionSettlement](#strategyqsocompletionsettlement)
- [StrategyDecisionResult](#strategydecisionresult)
- [StrategyRuntime](#strategyruntime)

## StrategyRuntimeSlot

- Kind: `type`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Legacy identifiers for the six selectable FT8 transmit messages.

These labels describe message choices, not T/R time slots or parallel QSO
streams. User-facing interfaces should call them Tx messages.

```ts
export type StrategyRuntimeSlot = 'TX1' | 'TX2' | 'TX3' | 'TX4' | 'TX5' | 'TX6';
```
## StrategyRuntimeContext

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

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

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

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
    streams?: StrategyStreamSnapshot[];
    queue?: AssistedQueueSnapshot;
    actions?: StrategyActionDescriptor[];
    attentions?: StrategyAttention[];
    messagePresentation?: StrategyMessagePresentationProjection;
    transmitGate?: StrategyTransmitGate;
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

Optional legacy list of user-visible next Tx messages or branch hints.

```ts

availableSlots?: string[];

```

### StrategyRuntimeSnapshot.qsoLifecycleEpoch

Host correlation token for QSO persistence; it is not an RF decision epoch.

```ts

qsoLifecycleEpoch?: number;

```

### StrategyRuntimeSnapshot.streams

Active protocol lanes owned by a parallel-capable strategy.

```ts

streams?: StrategyStreamSnapshot[];

```

### StrategyRuntimeSnapshot.queue

Optional compact projection exposed by queue-capable strategies.

```ts

queue?: AssistedQueueSnapshot;

```

### StrategyRuntimeSnapshot.actions

Plugin-declared operator controls rendered without business interpretation.

```ts

actions?: StrategyActionDescriptor[];

```

### StrategyRuntimeSnapshot.attentions

Plugin-declared operator attention items.

```ts

attentions?: StrategyAttention[];

```

### StrategyRuntimeSnapshot.messagePresentation

Optional strategy-owned presentation for decoded message history.

```ts

messagePresentation?: StrategyMessagePresentationProjection;

```

### StrategyRuntimeSnapshot.transmitGate

Strategy-owned operator-start gate, enforced by both Host UI and Server.

```ts

transmitGate?: StrategyTransmitGate;

```
## StrategyMessagePresentationTone

- Kind: `type`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Semantic tone requested by strategy-owned message presentation rules.

```ts
export type StrategyMessagePresentationTone = 'neutral' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
```
## StrategyMessagePresentationBadge

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Compact label and semantic tone rendered beside a decoded message.

```ts
export interface StrategyMessagePresentationBadge {
    label: string;
    tone: StrategyMessagePresentationTone;
}
```

### StrategyMessagePresentationBadge.label

Literal label or plugin locale key.

```ts

label: string;

```

### StrategyMessagePresentationBadge.tone

Host-themed semantic tone; plugins cannot provide CSS.

```ts

tone: StrategyMessagePresentationTone;

```
## StrategyMessagePresentationTokenMatch

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Bounded token matcher evaluated by the Host against normalized message tokens.

```ts
export interface StrategyMessagePresentationTokenMatch {
    firstTokenIn?: string[];
    anyTokenIn?: string[];
}
```

### StrategyMessagePresentationTokenMatch.firstTokenIn

Exact, case-insensitive token matching; arbitrary regular expressions are not accepted.

```ts

firstTokenIn?: string[];

```

### StrategyMessagePresentationTokenMatch.anyTokenIn

Matches when any normalized message token equals one of these values.

```ts

anyTokenIn?: string[];

```
## StrategyMessagePresentationClass

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Named visual class assigned by a strategy presentation projection.

```ts
export interface StrategyMessagePresentationClass {
    badge?: {
        label: string;
        tone: StrategyMessagePresentationTone;
    };
    badges?: StrategyMessagePresentationBadge[];
    row?: {
        tone: StrategyMessagePresentationTone;
        background?: 'none' | 'soft';
        accent?: boolean;
    };
    emphasisWhen?: StrategyMessagePresentationTokenMatch[];
    textDecoration?: 'line-through';
    opacity?: 'normal' | 'muted';
}
```

### StrategyMessagePresentationClass.badge

> **Deprecated:** Use `badges`; retained for API v2 snapshot compatibility.

```ts

badge?: {
    label: string;
    tone: StrategyMessagePresentationTone;
};

```

### StrategyMessagePresentationClass.badges

Badges revealed when the optional emphasis matcher succeeds.

```ts

badges?: StrategyMessagePresentationBadge[];

```

### StrategyMessagePresentationClass.row

Semantic row treatment; Host maps tones to its theme and never accepts plugin CSS.

```ts

row?: {
    tone: StrategyMessagePresentationTone;
    background?: 'none' | 'soft';
    accent?: boolean;
};

```

### StrategyMessagePresentationClass.emphasisWhen

Only expose badges and soft row emphasis when any matcher succeeds.
The accent, text decoration and opacity remain visible when none match.

```ts

emphasisWhen?: StrategyMessagePresentationTokenMatch[];

```

### StrategyMessagePresentationClass.textDecoration

Optional semantic strike-through for completed or excluded rows.

```ts

textDecoration?: 'line-through';

```

### StrategyMessagePresentationClass.opacity

Optional semantic opacity treatment.

```ts

opacity?: 'normal' | 'muted';

```
## StrategyMessagePresentationNoveltyRule

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Assigns a class when a Host-extracted fact is new within a partition.

```ts
export interface StrategyMessagePresentationNoveltyRule {
    fact: 'grid-field-2';
    knownValuesByPartition: Record<string, string[]>;
    classId: string;
}
```

### StrategyMessagePresentationNoveltyRule.fact

Canonical message fact extracted by Host before comparing plugin-owned known values.

```ts

fact: 'grid-field-2';

```

### StrategyMessagePresentationNoveltyRule.knownValuesByPartition

Plugin-owned known values keyed by the configured partition.

```ts

knownValuesByPartition: Record<string, string[]>;

```

### StrategyMessagePresentationNoveltyRule.classId

Presentation class used when the extracted fact is not known.

```ts

classId: string;

```
## StrategyMessagePresentationTagRule

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Adds a badge when a bounded token matcher accepts the decoded message.

```ts
export interface StrategyMessagePresentationTagRule {
    id: string;
    match: StrategyMessagePresentationTokenMatch;
    badge: StrategyMessagePresentationBadge;
}
```

### StrategyMessagePresentationTagRule.id

Stable rule identity for diagnostics and replacement.

```ts

id: string;

```

### StrategyMessagePresentationTagRule.match

Host-evaluated token matcher.

```ts

match: StrategyMessagePresentationTokenMatch;

```

### StrategyMessagePresentationTagRule.badge

Badge rendered when the matcher succeeds.

```ts

badge: StrategyMessagePresentationBadge;

```
## StrategyMessagePresentationProjection

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Complete strategy-owned, data-only presentation projection for decoded messages.

```ts
export interface StrategyMessagePresentationProjection {
    revision: number;
    mode: 'replace-logbook' | 'augment';
    subject: 'sender-callsign';
    partitionBy: 'band' | 'mode' | 'none';
    eligiblePartitions?: string[];
    defaultClass?: string;
    classes: Record<string, StrategyMessagePresentationClass>;
    assignments: Array<{
        subject: string;
        partition?: string;
        classId: string;
    }>;
    noveltyRules?: StrategyMessagePresentationNoveltyRule[];
    tagRules?: StrategyMessagePresentationTagRule[];
}
```

### StrategyMessagePresentationProjection.revision

Monotonic plugin revision used to replace stale projections.

```ts

revision: number;

```

### StrategyMessagePresentationProjection.mode

Whether the projection replaces logbook presentation or augments it.

```ts

mode: 'replace-logbook' | 'augment';

```

### StrategyMessagePresentationProjection.subject

Canonical message subject classified by the projection.

```ts

subject: 'sender-callsign';

```

### StrategyMessagePresentationProjection.partitionBy

Partition used for assignments and novelty checks.

```ts

partitionBy: 'band' | 'mode' | 'none';

```

### StrategyMessagePresentationProjection.eligiblePartitions

Optional partition allowlist.

```ts

eligiblePartitions?: string[];

```

### StrategyMessagePresentationProjection.defaultClass

Class applied when no assignment or rule selects another class.

```ts

defaultClass?: string;

```

### StrategyMessagePresentationProjection.classes

Strategy-defined presentation classes keyed by stable ID.

```ts

classes: Record<string, StrategyMessagePresentationClass>;

```

### StrategyMessagePresentationProjection.assignments

Explicit subject-to-class assignments.

```ts

assignments: Array<{
    subject: string;
    partition?: string;
    classId: string;
}>;

```

### StrategyMessagePresentationProjection.noveltyRules

Optional Host-evaluated novelty rules.

```ts

noveltyRules?: StrategyMessagePresentationNoveltyRule[];

```

### StrategyMessagePresentationProjection.tagRules

Optional Host-evaluated tag rules.

```ts

tagRules?: StrategyMessagePresentationTagRule[];

```
## StrategyTransmitGate

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Strategy-owned reason that prevents an operator from starting transmission.

```ts
export interface StrategyTransmitGate {
    allowed: false;
    reason: string;
    actionId?: string;
}
```

### StrategyTransmitGate.allowed

Always false while the gate is present.

```ts

allowed: false;

```

### StrategyTransmitGate.reason

Literal message or plugin locale key shown to the operator.

```ts

reason: string;

```

### StrategyTransmitGate.actionId

Optional strategy action that can resolve the gate.

```ts

actionId?: string;

```
## StrategyActionTone

- Kind: `type`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Semantic tone used for strategy-owned operator actions.

```ts
export type StrategyActionTone = 'default' | 'primary' | 'success' | 'warning' | 'danger';
```
## StrategyActionPresentation

- Kind: `type`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Host layout requested for a strategy-owned action.

```ts
export type StrategyActionPresentation = 'primary' | 'secondary' | 'menu' | 'segmented';
```
## StrategyActionInput

- Kind: `type`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Optional value editor attached to a strategy-owned action.

```ts
export type StrategyActionInput = {
    kind: 'text';
    label?: string;
    value?: string;
    placeholder?: string;
    maxLength?: number;
} | {
    kind: 'number' | 'audio-frequency';
    label?: string;
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    spectrumPick?: boolean;
};
```
## StrategyActionDescriptor

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

One context-sensitive command wholly owned by a strategy plugin.

```ts
export interface StrategyActionDescriptor {
    id: string;
    label: string;
    description?: string;
    icon?: string;
    tone?: StrategyActionTone;
    presentation?: StrategyActionPresentation;
    groupId?: string;
    selected?: boolean;
    disabledReason?: string;
    previewText?: string;
    confirmation?: {
        title: string;
        description?: string;
        confirmLabel?: string;
        cancelLabel?: string;
    };
    input?: StrategyActionInput;
    navigation?: {
        kind: 'plugin-page';
        pageId: string;
    };
}
```

### StrategyActionDescriptor.id

Stable action identifier passed back to the owning runtime.

```ts

id: string;

```

### StrategyActionDescriptor.label

Literal label or plugin locale key.

```ts

label: string;

```

### StrategyActionDescriptor.description

Optional literal description or plugin locale key.

```ts

description?: string;

```

### StrategyActionDescriptor.icon

Host icon identifier.

```ts

icon?: string;

```

### StrategyActionDescriptor.tone

Semantic action tone.

```ts

tone?: StrategyActionTone;

```

### StrategyActionDescriptor.presentation

Preferred Host layout for this command.

```ts

presentation?: StrategyActionPresentation;

```

### StrategyActionDescriptor.groupId

Optional group identity used by menus and segmented controls.

```ts

groupId?: string;

```

### StrategyActionDescriptor.selected

Whether a toggle-like action is currently selected.

```ts

selected?: boolean;

```

### StrategyActionDescriptor.disabledReason

Explanation shown while the action is disabled.

```ts

disabledReason?: string;

```

### StrategyActionDescriptor.previewText

Optional exact transmission preview.

```ts

previewText?: string;

```

### StrategyActionDescriptor.confirmation

Confirmation dialog requested before invocation.

```ts

confirmation?: {
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
};

```

### StrategyActionDescriptor.input

Optional text, number, or audio-frequency editor.

```ts

input?: StrategyActionInput;

```

### StrategyActionDescriptor.navigation

Host-validated navigation to a page declared by the owning plugin.

```ts

navigation?: {
    kind: 'plugin-page';
    pageId: string;
};

```
## StrategyAttention

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Strategy-owned operator attention item with optional actions and notification.

```ts
export interface StrategyAttention {
    id: string;
    tone: 'info' | 'warning' | 'danger' | 'success';
    title: string;
    description?: string;
    params?: Record<string, string | number>;
    notify?: boolean;
    expiresAt?: number;
    actionIds?: string[];
}
```

### StrategyAttention.id

Stable identity used to replace or dismiss the item.

```ts

id: string;

```

### StrategyAttention.tone

Semantic severity rendered by the Host.

```ts

tone: 'info' | 'warning' | 'danger' | 'success';

```

### StrategyAttention.title

Literal title or plugin locale key.

```ts

title: string;

```

### StrategyAttention.description

Optional literal description or plugin locale key.

```ts

description?: string;

```

### StrategyAttention.params

Locale interpolation parameters.

```ts

params?: Record<string, string | number>;

```

### StrategyAttention.notify

Whether the Host may surface an out-of-page notification.

```ts

notify?: boolean;

```

### StrategyAttention.expiresAt

Epoch milliseconds after which the Host may discard the item.

```ts

expiresAt?: number;

```

### StrategyAttention.actionIds

Strategy action IDs offered with the item.

```ts

actionIds?: string[];

```
## StrategyCompletionProjection

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Durable QSO completion state projected by one strategy stream.

```ts
export interface StrategyCompletionProjection {
    state: 'not-ready' | 'ready' | 'committing' | 'committed' | 'failed';
    label?: string;
    recordId?: string;
}
```

### StrategyCompletionProjection.state

Current preparation or commit phase.

```ts

state: 'not-ready' | 'ready' | 'committing' | 'committed' | 'failed';

```

### StrategyCompletionProjection.label

Optional literal label or plugin locale key.

```ts

label?: string;

```

### StrategyCompletionProjection.recordId

Durable record ID once the Host commits the QSO.

```ts

recordId?: string;

```
## StrategyStateOption

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

One user-selectable state exposed by a strategy-owned state machine.

```ts
export interface StrategyStateOption {
    id: string;
    label?: string;
    transmitText?: string;
}
```

### StrategyStateOption.id

Stable state identifier understood only by the owning strategy.

```ts

id: string;

```

### StrategyStateOption.label

Literal label or plugin locale key shown by the Host UI.

```ts

label?: string;

```

### StrategyStateOption.transmitText

Exact transmission produced when this state is selected, when applicable.

```ts

transmitText?: string;

```
## StrategyStreamSnapshot

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

One independently progressing parallel QSO inside an operator strategy.

```ts
export interface StrategyStreamSnapshot {
    streamId: string;
    currentState: string;
    targetCallsign?: string;
    targetGrid?: string;
    audioFrequencyHz: number;
    qsoLifecycleEpoch: number;
    stateOptions?: StrategyStateOption[];
    actions?: StrategyActionDescriptor[];
    attentions?: StrategyAttention[];
    completion?: StrategyCompletionProjection;
    lastReceivedText?: string;
    nextTransmitText?: string;
}
```

### StrategyStreamSnapshot.streamId

Stable identity within the owning strategy runtime.

```ts

streamId: string;

```

### StrategyStreamSnapshot.currentState

Current lane state selected by the protocol implementation.

```ts

currentState: string;

```

### StrategyStreamSnapshot.targetCallsign

Target station currently owned by this lane.

```ts

targetCallsign?: string;

```

### StrategyStreamSnapshot.targetGrid

Last accepted target grid, when known.

```ts

targetGrid?: string;

```

### StrategyStreamSnapshot.audioFrequencyHz

Audio carrier used by this lane in hertz.

```ts

audioFrequencyHz: number;

```

### StrategyStreamSnapshot.qsoLifecycleEpoch

Lane-local lifecycle epoch used to correlate durable QSO effects.

```ts

qsoLifecycleEpoch: number;

```

### StrategyStreamSnapshot.stateOptions

Protocol-approved states that the operator may select for this lane.

```ts

stateOptions?: StrategyStateOption[];

```

### StrategyStreamSnapshot.actions

Context-sensitive actions owned by this lane.

```ts

actions?: StrategyActionDescriptor[];

```

### StrategyStreamSnapshot.attentions

Operator attention items owned by this lane.

```ts

attentions?: StrategyAttention[];

```

### StrategyStreamSnapshot.completion

Durable QSO completion projection for this lane.

```ts

completion?: StrategyCompletionProjection;

```

### StrategyStreamSnapshot.lastReceivedText

Most recent accepted inbound protocol text.

```ts

lastReceivedText?: string;

```

### StrategyStreamSnapshot.nextTransmitText

Exact text this lane plans to transmit next.

```ts

nextTransmitText?: string;

```
## StrategyActionTarget

- Kind: `type`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Optimistic target for a strategy action invocation.

```ts
export type StrategyActionTarget = {
    kind: 'runtime';
} | {
    kind: 'stream';
    streamId: string;
    lifecycleEpoch: number;
} | {
    kind: 'queue-entry';
    entryId: string;
    queueVersion: number;
};
```
## StrategyActionInvocation

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Host-validated invocation of one strategy-owned action.

```ts
export interface StrategyActionInvocation {
    target: StrategyActionTarget;
    actionId: string;
    payload?: unknown;
}
```

### StrategyActionInvocation.target

Runtime, stream, or queue entry that owns the action.

```ts

target: StrategyActionTarget;

```

### StrategyActionInvocation.actionId

Action identifier from the current strategy projection.

```ts

actionId: string;

```

### StrategyActionInvocation.payload

Untrusted action input that the strategy must validate.

```ts

payload?: unknown;

```
## StrategyLogbookSessionEffect

- Kind: `type`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Host-managed plugin logbook session effect returned by an accepted action or decision.

```ts
export type StrategyLogbookSessionEffect = {
    operation: 'open';
    sessionKey: string;
    title: string;
    retention?: 'durable' | 'runtime';
} | {
    operation: 'destroy';
    sessionKey: string;
};
```
## StrategyActionResult

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Declarative effects returned after invoking a strategy-owned action.

```ts
export interface StrategyActionResult {
    requestDecision?: boolean;
    requestOperatorStart?: boolean;
    qsoCompletions?: StrategyQSOCompletionEffect[];
    logbookSessionEffects?: StrategyLogbookSessionEffect[];
    outcome?: {
        code: string;
        message?: string;
    };
}
```

### StrategyActionResult.requestDecision

Requests a fresh speculative decision after the action commits.

```ts

requestDecision?: boolean;

```

### StrategyActionResult.requestOperatorStart

Start this operator through the Host's normal automation path after a direct user action.

```ts

requestOperatorStart?: boolean;

```

### StrategyActionResult.qsoCompletions

QSO effects prepared and committed by the Host.

```ts

qsoCompletions?: StrategyQSOCompletionEffect[];

```

### StrategyActionResult.logbookSessionEffects

Host-managed plugin logbook session operations caused by this explicit action.

```ts

logbookSessionEffects?: StrategyLogbookSessionEffect[];

```

### StrategyActionResult.outcome

Stable action outcome for UI feedback and diagnostics.

```ts

outcome?: {
    code: string;
    message?: string;
};

```
## StrategyStreamStateUpdate

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Optimistic request to move one strategy-owned lane to a user-selectable state.

```ts
export interface StrategyStreamStateUpdate {
    streamId: string;
    stateId: string;
    expectedLifecycleEpoch: number;
}
```

### StrategyStreamStateUpdate.streamId

Lane to update.

```ts

streamId: string;

```

### StrategyStreamStateUpdate.stateId

Strategy-approved target state.

```ts

stateId: string;

```

### StrategyStreamStateUpdate.expectedLifecycleEpoch

Optimistic lane lifecycle epoch from the current projection.

```ts

expectedLifecycleEpoch: number;

```
## StrategyTransmission

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

One independently encoded transmission contributed by a strategy.

```ts
export interface StrategyTransmission {
    streamId: string;
    text: string;
    audioFrequencyHz: number;
}
```

### StrategyTransmission.streamId

Stable lane identity within one operator.

```ts

streamId: string;

```

### StrategyTransmission.text

Exact FT8/FT4 text to encode.

```ts

text: string;

```

### StrategyTransmission.audioFrequencyHz

Audio carrier frequency in hertz.

```ts

audioFrequencyHz: number;

```
## StreamPhysicalReceipt

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Physical confirmation for one transmitted lane in an atomic frame.

```ts
export interface StreamPhysicalReceipt extends StrategyTransmission {
    frameId: string;
    revision: number;
    physicalConfirmed: true;
}
```

### StreamPhysicalReceipt.frameId

Host physical-frame identity.

```ts

frameId: string;

```

### StreamPhysicalReceipt.revision

Monotonic physical-frame revision.

```ts

revision: number;

```

### StreamPhysicalReceipt.physicalConfirmed

Literal proof that this lane reached physical transmission.

```ts

physicalConfirmed: true;

```
## AssistedQueueDisplayState

- Kind: `type`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

User-facing phase shown for one row in a queue-capable strategy.

```ts
export type AssistedQueueDisplayState = 'TX1' | 'TX2' | 'TX3' | 'TX4' | 'TX5' | 'engaged' | 'closing' | 'paused' | 'no-response' | 'later' | 'review' | 'candidate' | 'authorized' | 'dupe';
```
## AssistedQueuePauseReason

- Kind: `type`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Why a queued target is temporarily paused instead of being selected.

```ts
export type AssistedQueuePauseReason = 'target-busy' | 'stale';
```
## AssistedQueueTone

- Kind: `type`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Semantic color treatment requested for an assisted queue row.

```ts
export type AssistedQueueTone = 'neutral' | 'active' | 'success' | 'warning' | 'danger';
```
## AssistedQueueIcon

- Kind: `type`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Host icon identifier requested for an assisted queue row.

```ts
export type AssistedQueueIcon = 'circle' | 'radio' | 'check-circle' | 'loader-circle' | 'clock' | 'pause' | 'triangle-alert';
```
## AssistedQueueRow

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

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
    lastHeardCycle?: 0 | 1;
    streamId?: string;
    audioFrequencyHz?: number;
    authorizationId?: string;
    actions?: StrategyActionDescriptor[];
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

### AssistedQueueRow.lastHeardCycle

Cycle in which the target was most recently decoded transmitting.

```ts

lastHeardCycle?: 0 | 1;

```

### AssistedQueueRow.streamId

Active strategy stream currently processing this entry.

```ts

streamId?: string;

```

### AssistedQueueRow.audioFrequencyHz

Reserved audio carrier when the entry owns a stream.

```ts

audioFrequencyHz?: number;

```

### AssistedQueueRow.authorizationId

Audited operator authorization associated with this entry.

```ts

authorizationId?: string;

```

### AssistedQueueRow.actions

Plugin-declared row actions. Omission preserves legacy queue controls.

```ts

actions?: StrategyActionDescriptor[];

```
## AssistedQueueSnapshot

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Versioned queue projection embedded in `StrategyRuntimeSnapshot.queue`.

```ts
export interface AssistedQueueSnapshot {
    version: number;
    activeEntryId?: string;
    activeEntryIds?: string[];
    maxActiveStreams?: number;
    requestedMaxActiveStreams?: number;
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

### AssistedQueueSnapshot.activeEntryIds

Entries currently owned by parallel QSO lifecycles.

```ts

activeEntryIds?: string[];

```

### AssistedQueueSnapshot.maxActiveStreams

Maximum number of entries that may be active at once.

```ts

maxActiveStreams?: number;

```

### AssistedQueueSnapshot.requestedMaxActiveStreams

User-requested stream count before Host radio-frequency policy is applied.

```ts

requestedMaxActiveStreams?: number;

```

### AssistedQueueSnapshot.rows

Queue rows in display order.

```ts

rows: AssistedQueueRow[];

```
## QueuedStrategyObservationMeta

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

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

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

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

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Result of an assisted queue mutation, including the authoritative snapshot.

```ts
export interface QueuedStrategyMutationResult {
    outcome: 'accepted' | 'duplicate' | 'rejected';
    reason?: 'queue_full' | 'invalid_target' | 'entry_not_found' | 'entry_not_retryable' | 'active_entry' | 'version_conflict';
    snapshot: AssistedQueueSnapshot;
    requestOperatorStart?: boolean;
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

### QueuedStrategyMutationResult.requestOperatorStart

Requests a normal operator start after this explicit manual queue mutation.

```ts

requestOperatorStart?: boolean;

```
## QueuedStrategyRuntime

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

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

- Kind: `function`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

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

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

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

- Kind: `type`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Trigger that caused the Host to request a strategy decision.

```ts
export type StrategyDecisionSource = 'slot-auto' | 'late-decode';
```
## StrategyDecisionMetaV2

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

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

- Kind: `type`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Strategy-owned state captured before a speculative decision.

The value must be structured-clone compatible and must not contain Host
capabilities, functions, promises or external resource handles.

```ts
export type StrategyRuntimeCheckpoint = unknown;
```
## StrategyOperatorTransmitCyclesChanged

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Operator transmit-cycle selection observed by an active strategy runtime.

```ts
export interface StrategyOperatorTransmitCyclesChanged {
    previousTransmitCycles: number[];
    transmitCycles: number[];
    source?: 'manual' | 'plugin' | 'late-decode' | 'slot-auto';
}
```

### StrategyOperatorTransmitCyclesChanged.previousTransmitCycles

Previous Host-selected transmit cycles.

```ts

previousTransmitCycles: number[];

```

### StrategyOperatorTransmitCyclesChanged.transmitCycles

Current Host-selected transmit cycles.

```ts

transmitCycles: number[];

```

### StrategyOperatorTransmitCyclesChanged.source

Source of the accepted cycle change.

```ts

source?: 'manual' | 'plugin' | 'late-decode' | 'slot-auto';

```
## StrategyQSOCompletionEffect

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Declarative request for the Host to durably commit one completed QSO.

```ts
export interface StrategyQSOCompletionEffect {
    record: QSORecord;
    lifecycleEpoch: number;
    streamId?: string;
    persistencePolicy?: 'merge-nearby' | 'preserve-distinct';
    destination?: {
        kind: 'plugin-session';
        sessionId: string;
    } | {
        kind: 'plugin-session-key';
        sessionKey: string;
    };
    metadata?: Record<string, unknown>;
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

### StrategyQSOCompletionEffect.streamId

Lane that produced the completion; omitted by legacy single-lane strategies.

```ts

streamId?: string;

```

### StrategyQSOCompletionEffect.persistencePolicy

Host persistence behavior requested by the strategy.

```ts

persistencePolicy?: 'merge-nearby' | 'preserve-distinct';

```

### StrategyQSOCompletionEffect.destination

Optional Host-issued destination. Omitted effects use the operator's primary logbook.

```ts

destination?: {
    kind: 'plugin-session';
    sessionId: string;
} | {
    kind: 'plugin-session-key';
    sessionKey: string;
};

```

### StrategyQSOCompletionEffect.metadata

Structured-cloneable source metadata returned with post-commit delivery.

```ts

metadata?: Record<string, unknown>;

```
## StrategyQSOCompletionSettlement

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Host acknowledgement for a previously returned QSO completion effect.

```ts
export interface StrategyQSOCompletionSettlement {
    lifecycleEpoch: number;
    recordId: string;
    persistedRecordId?: string;
    status: 'committed' | 'failed';
    streamId?: string;
    metadata?: Record<string, unknown>;
}
```

### StrategyQSOCompletionSettlement.lifecycleEpoch

Lifecycle epoch copied from the effect being settled.

```ts

lifecycleEpoch: number;

```

### StrategyQSOCompletionSettlement.recordId

Record ID from the accepted completion effect, used for correlation.

```ts

recordId: string;

```

### StrategyQSOCompletionSettlement.persistedRecordId

Final durable record ID; differs when the Host merged into an existing QSO.

```ts

persistedRecordId?: string;

```

### StrategyQSOCompletionSettlement.status

Whether the Host committed the record or the durable operation failed.

```ts

status: 'committed' | 'failed';

```

### StrategyQSOCompletionSettlement.streamId

Lane copied from the accepted completion effect.

```ts

streamId?: string;

```

### StrategyQSOCompletionSettlement.metadata

Detached source metadata copied from the accepted completion effect.

```ts

metadata?: Record<string, unknown>;

```
## StrategyDecisionResult

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Complete output of one speculative strategy decision.

```ts
export interface StrategyDecisionResult extends StrategyDecision {
    transmission: string | null;
    transmissions?: StrategyTransmission[];
    snapshot: StrategyRuntimeSnapshot;
    qsoCompletion?: StrategyQSOCompletionEffect;
    qsoCompletions?: StrategyQSOCompletionEffect[];
    logbookSessionEffects?: StrategyLogbookSessionEffect[];
    requestedTransmitCycle?: number;
}
```

### StrategyDecisionResult.transmission

Exact text to queue next, or `null` when this decision should not transmit.

```ts

transmission: string | null;

```

### StrategyDecisionResult.transmissions

Parallel transmissions. New strategies use this instead of `transmission`.

```ts

transmissions?: StrategyTransmission[];

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

### StrategyDecisionResult.qsoCompletions

Parallel QSO effects committed in the same accepted decision.

```ts

qsoCompletions?: StrategyQSOCompletionEffect[];

```

### StrategyDecisionResult.logbookSessionEffects

Host-managed plugin logbook lifecycle effects accepted with this decision.

```ts

logbookSessionEffects?: StrategyLogbookSessionEffect[];

```

### StrategyDecisionResult.requestedTransmitCycle

Optional cycle selected from the triggering RX frame; applied by the host after target reservation.

```ts

requestedTransmitCycle?: number;

```
## StrategyRuntime

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Active controller for a `strategy` plugin.

The host delegates core automation flow to this runtime. A strategy runtime is
expected to be lightweight, synchronous where possible and deterministic with
respect to the incoming slot/decode stream.

```ts
export interface StrategyRuntime {
    checkpoint(): StrategyRuntimeCheckpoint;
    restore(checkpoint: StrategyRuntimeCheckpoint): void;
    onOperatorTransmitCyclesChanged?(change: StrategyOperatorTransmitCyclesChanged): boolean;
    settleQSOCompletion?(settlement: StrategyQSOCompletionSettlement): void;
    decide(messages: ParsedFT8Message[], meta: StrategyDecisionMetaV2): Promise<StrategyDecisionResult> | StrategyDecisionResult;
    getTransmitText(): string | null;
    getTransmissions?(): StrategyTransmission[];
    requestCall(callsign: string, lastMessage?: {
        message: FrameMessage;
        slotInfo: SlotInfo;
    }): boolean | void;
    getSnapshot(): StrategyRuntimeSnapshot;
    patchContext(patch: Partial<StrategyRuntimeContext>): void;
    setState(state: StrategyRuntimeSlot): void;
    setStreamState?(update: StrategyStreamStateUpdate): void;
    invokeAction?(invocation: StrategyActionInvocation): StrategyActionResult | void | Promise<StrategyActionResult | void>;
    setSlotContent(update: StrategyRuntimeSlotContentUpdate): void;
    reset(reason?: string): void;
    onTransmissionQueued?(transmission: string): void;
    onTransmissionsCompleted?(receipts: StreamPhysicalReceipt[]): void;
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

### StrategyRuntime.onOperatorTransmitCyclesChanged

Observes an already-applied Host transmit-cycle selection. Returning true
asks the Host to publish the resulting runtime projection.

```ts

onOperatorTransmitCyclesChanged?(change: StrategyOperatorTransmitCyclesChanged): boolean;

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

### StrategyRuntime.getTransmissions

Returns every lane that should contribute to the next physical frame.
Legacy runtimes may omit this method; the Host then maps getTransmitText()
to the `default` stream at the operator's configured audio frequency.

```ts

getTransmissions?(): StrategyTransmission[];

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

### StrategyRuntime.setStreamState

Switches one independently progressing lane to a strategy-approved state.

```ts

setStreamState?(update: StrategyStreamStateUpdate): void;

```

### StrategyRuntime.invokeAction

Executes one plugin-declared runtime, stream or queue-entry action.

```ts

invokeAction?(invocation: StrategyActionInvocation): StrategyActionResult | void | Promise<StrategyActionResult | void>;

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

### StrategyRuntime.onTransmissionsCompleted

Physical success notification for a complete parallel frame.

```ts

onTransmissionsCompleted?(receipts: StreamPhysicalReceipt[]): void;

```
