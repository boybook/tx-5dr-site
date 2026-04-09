# StrategyRuntime

该页对应 `strategy` 类型插件的运行时接口。

> 自动生成自 `../tx-5dr/packages/plugin-api/src/runtime.ts`

## 导出

- [StrategyRuntimeSlot](#strategyruntimeslot)
- [StrategyRuntimeContext](#strategyruntimecontext)
- [StrategyRuntimeSnapshot](#strategyruntimesnapshot)
- [StrategyRuntimeSlotContentUpdate](#strategyruntimeslotcontentupdate)
- [StrategyRuntime](#strategyruntime)

## StrategyRuntimeSlot

- Kind: `type`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Logical FT8 transmit slot identifiers used by the built-in automation model.

These labels correspond to the six sequential transmit messages in a typical
FT8 QSO flow and are used for status snapshots and UI updates.

```ts
export type StrategyRuntimeSlot = 'TX1' | 'TX2' | 'TX3' | 'TX4' | 'TX5' | 'TX6';
```
## StrategyRuntimeContext

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Mutable strategy context maintained by the host/runtime pair.

This object captures the operator's current conversation target and selected
radio metadata. Strategy implementations can patch it incrementally through
{@link StrategyRuntime.patchContext}.

```ts
export interface StrategyRuntimeContext {
  /** Currently selected target callsign, if any. */
  targetCallsign?: string;
  /** Grid locator reported by the target station, if known. */
  targetGrid?: string;
  /** Signal report sent to the target station. */
  reportSent?: number;
  /** Signal report received from the target station. */
  reportReceived?: number;
  /** Actual RF/audio frequency being used for the active QSO. */
  actualFrequency?: number;
}
```

## 成员

### targetCallsign

Currently selected target callsign, if any.

```ts

targetCallsign?: string;

```

### targetGrid

Grid locator reported by the target station, if known.

```ts

targetGrid?: string;

```

### reportSent

Signal report sent to the target station.

```ts

reportSent?: number;

```

### reportReceived

Signal report received from the target station.

```ts

reportReceived?: number;

```

### actualFrequency

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
  /** Stable or semi-stable state identifier chosen by the strategy runtime. */
  currentState: string;
  /** Text currently queued or associated with each logical transmit slot. */
  slots?: Partial<Record<StrategyRuntimeSlot, string>>;
  /** Current conversation metadata tracked by the runtime. */
  context?: StrategyRuntimeContext;
  /** Optional list of user-visible next states, modes or branch hints. */
  availableSlots?: string[];
}
```

## 成员

### currentState

Stable or semi-stable state identifier chosen by the strategy runtime.

```ts

currentState: string;

```

### slots

Text currently queued or associated with each logical transmit slot.

```ts

slots?: Partial<Record<StrategyRuntimeSlot, string>>;

```

### context

Current conversation metadata tracked by the runtime.

```ts

context?: StrategyRuntimeContext;

```

### availableSlots

Optional list of user-visible next states, modes or branch hints.

```ts

availableSlots?: string[];

```
## StrategyRuntimeSlotContentUpdate

- Kind: `interface`
- Source: [runtime.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/runtime.ts)

Describes a slot text mutation emitted by the strategy runtime.

```ts
export interface StrategyRuntimeSlotContentUpdate {
  /** Logical slot whose rendered content should be updated. */
  slot: StrategyRuntimeSlot;
  /** Human-readable content for the slot, usually an FT8 message template. */
  content: string;
}
```

## 成员

### slot

Logical slot whose rendered content should be updated.

```ts

slot: StrategyRuntimeSlot;

```

### content

Human-readable content for the slot, usually an FT8 message template.

```ts

content: string;

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
  /**
   * Re-evaluates the current automation state using the latest decoded messages.
   *
   * Return `{ stop: true }` to ask the host to stop transmitting. Any other
   * decision fields can be added in future API revisions, so plugins should
   * return an object rather than a bare boolean.
   */
  decide(
    messages: ParsedFT8Message[],
    meta?: StrategyDecisionMeta,
  ): Promise<StrategyDecision> | StrategyDecision;

  /**
   * Returns the exact text that should be transmitted next, or `null` when no
   * transmission should be queued.
   */
  getTransmitText(): string | null;

  /**
   * Requests that the runtime initiate or resume a call to a target station.
   *
   * The optional `lastMessage` provides the frame that triggered the call, which
   * is useful when reacting to a specific CQ or completion signal.
   */
  requestCall(
    callsign: string,
    lastMessage?: { message: FrameMessage; slotInfo: SlotInfo },
  ): void;

  /**
   * Produces a serializable runtime snapshot for diagnostics and UI.
   */
  getSnapshot(): StrategyRuntimeSnapshot;

  /**
   * Applies a partial update to the runtime context.
   */
  patchContext(patch: Partial<StrategyRuntimeContext>): void;

  /**
   * Switches the runtime to a specific logical transmit slot/state.
   */
  setState(state: StrategyRuntimeSlot): void;

  /**
   * Updates the human-readable content associated with a logical slot.
   */
  setSlotContent(update: StrategyRuntimeSlotContentUpdate): void;

  /**
   * Clears transient state and returns the runtime to an idle baseline.
   *
   * The optional `reason` is intended for logging or diagnostics only.
   */
  reset(reason?: string): void;

  /**
   * Optional notification that a transmission has just been queued by the host.
   *
   * Use this to mirror queued text into internal state when needed.
   */
  onTransmissionQueued?(transmission: string): void;
}
```

## 成员

### decide

Re-evaluates the current automation state using the latest decoded messages.

Return `{ stop: true }` to ask the host to stop transmitting. Any other
decision fields can be added in future API revisions, so plugins should
return an object rather than a bare boolean.

```ts

decide(
    messages: ParsedFT8Message[],
    meta?: StrategyDecisionMeta,
  ): Promise<StrategyDecision> | StrategyDecision;

```

### getTransmitText

Returns the exact text that should be transmitted next, or `null` when no
transmission should be queued.

```ts

getTransmitText(): string | null;

```

### requestCall

Requests that the runtime initiate or resume a call to a target station.

The optional `lastMessage` provides the frame that triggered the call, which
is useful when reacting to a specific CQ or completion signal.

```ts

requestCall(
    callsign: string,
    lastMessage?: { message: FrameMessage; slotInfo: SlotInfo },
  ): void;

```

### getSnapshot

Produces a serializable runtime snapshot for diagnostics and UI.

```ts

getSnapshot(): StrategyRuntimeSnapshot;

```

### patchContext

Applies a partial update to the runtime context.

```ts

patchContext(patch: Partial<StrategyRuntimeContext>): void;

```

### setState

Switches the runtime to a specific logical transmit slot/state.

```ts

setState(state: StrategyRuntimeSlot): void;

```

### setSlotContent

Updates the human-readable content associated with a logical slot.

```ts

setSlotContent(update: StrategyRuntimeSlotContentUpdate): void;

```

### reset

Clears transient state and returns the runtime to an idle baseline.

The optional `reason` is intended for logging or diagnostics only.

```ts

reset(reason?: string): void;

```

### onTransmissionQueued

Optional notification that a transmission has just been queued by the host.

Use this to mirror queued text into internal state when needed.

```ts

onTransmissionQueued?(transmission: string): void;

```
