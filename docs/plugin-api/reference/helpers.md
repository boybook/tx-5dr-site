# Helper Interfaces

该页列出 `KVStore`、日志、定时器、操作员控制等辅助接口。

> 自动生成自 `../tx-5dr/packages/plugin-api/src/helpers.ts`

## 导出

- [KVStore](#kvstore)
- [PluginLogger](#pluginlogger)
- [PluginTimers](#plugintimers)
- [OperatorControl](#operatorcontrol)
- [RadioControl](#radiocontrol)
- [LogbookAccess](#logbookaccess)
- [BandAccess](#bandaccess)
- [UIBridge](#uibridge)

## KVStore

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Simple persistent key-value store exposed to plugins.

Values are serialized by the host. Keep payloads reasonably small and prefer
plain JSON-compatible data for maximum portability.

```ts
export interface KVStore {
  /**
   * Reads a stored value.
   *
   * When the key is missing, the provided `defaultValue` is returned instead.
   */
  get<T = unknown>(key: string, defaultValue?: T): T;

  /**
   * Persists a value under the given key.
   */
  set(key: string, value: unknown): void;

  /**
   * Removes a stored key and its value.
   */
  delete(key: string): void;

  /**
   * Returns a shallow snapshot of all stored entries in this scope.
   */
  getAll(): Record<string, unknown>;
}
```

## 成员

### get

Reads a stored value.

When the key is missing, the provided `defaultValue` is returned instead.

```ts

get<T = unknown>(key: string, defaultValue?: T): T;

```

### set

Persists a value under the given key.

```ts

set(key: string, value: unknown): void;

```

### delete

Removes a stored key and its value.

```ts

delete(key: string): void;

```

### getAll

Returns a shallow snapshot of all stored entries in this scope.

```ts

getAll(): Record<string, unknown>;

```
## PluginLogger

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Structured logger dedicated to a plugin instance.

Messages should be concise and machine-friendly because they may appear in
both backend logs and operator-facing diagnostics.

```ts
export interface PluginLogger {
  /** Writes a verbose diagnostic message. */
  debug(message: string, data?: Record<string, unknown>): void;
  /** Writes a lifecycle or informational message. */
  info(message: string, data?: Record<string, unknown>): void;
  /** Writes a warning that does not stop plugin execution. */
  warn(message: string, data?: Record<string, unknown>): void;
  /** Writes an error with optional structured details or an exception object. */
  error(message: string, error?: unknown): void;
}
```

## 成员

### debug

Writes a verbose diagnostic message.

```ts

debug(message: string, data?: Record<string, unknown>): void;

```

### info

Writes a lifecycle or informational message.

```ts

info(message: string, data?: Record<string, unknown>): void;

```

### warn

Writes a warning that does not stop plugin execution.

```ts

warn(message: string, data?: Record<string, unknown>): void;

```

### error

Writes an error with optional structured details or an exception object.

```ts

error(message: string, error?: unknown): void;

```
## PluginTimers

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Host-managed named timers for plugin code.

```ts
export interface PluginTimers {
  /**
   * Starts or replaces a named interval timer.
   *
   * When the timer fires, the host invokes {@link PluginHooks.onTimer} with the
   * same id.
   */
  set(id: string, intervalMs: number): void;

  /** Clears a named timer if it exists. */
  clear(id: string): void;

  /** Clears all timers owned by the current plugin instance. */
  clearAll(): void;
}
```

## 成员

### set

Starts or replaces a named interval timer.

When the timer fires, the host invokes {@link PluginHooks.onTimer} with the
same id.

```ts

set(id: string, intervalMs: number): void;

```

### clear

Clears a named timer if it exists.

```ts

clear(id: string): void;

```

### clearAll

Clears all timers owned by the current plugin instance.

```ts

clearAll(): void;

```
## OperatorControl

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Control surface for the active operator instance.

This interface lets plugins inspect operator state and request host-managed
actions such as starting automation, calling a target or notifying the UI.

```ts
export interface OperatorControl {
  /** Unique operator identifier used by the host. */
  readonly id: string;
  /** Whether this operator is currently transmitting or otherwise armed. */
  readonly isTransmitting: boolean;
  /** Configured callsign of the operator/station. */
  readonly callsign: string;
  /** Configured grid locator of the operator/station. */
  readonly grid: string;
  /** Current audio offset frequency in Hz within the passband. */
  readonly frequency: number;
  /** Active digital mode descriptor, for example FT8 or FT4. */
  readonly mode: ModeDescriptor;
  /** Current transmit cycle selection where `0` is even and `1` is odd. */
  readonly transmitCycles: number[];
  /** Current automation runtime snapshot visible to the operator UI. */
  readonly automation: StrategyRuntimeSnapshot | null;

  /** Enables transmission/automation for the current operator. */
  startTransmitting(): void;

  /** Disables transmission/automation for the current operator. */
  stopTransmitting(): void;

  /**
   * Requests that the operator call the specified target station.
   *
   * Passing `lastMessage` helps the host preserve the triggering context.
   */
  call(callsign: string, lastMessage?: { message: FrameMessage; slotInfo: SlotInfo }): void;

  /**
   * Updates the operator's transmit cycle preference.
   *
   * Pass a single value or an array to support alternating or multi-cycle modes.
   */
  setTransmitCycles(cycles: number | number[]): void;

  /**
   * Checks whether this operator has previously worked the given callsign.
   */
  hasWorkedCallsign(callsign: string): Promise<boolean>;

  /**
   * Checks whether another operator with the same station identity is already
   * working the target callsign.
   */
  isTargetBeingWorkedByOthers(targetCallsign: string): boolean;

  /**
   * Records a completed QSO through the host logbook pipeline.
   */
  recordQSO(record: QSORecord): void;

  /**
   * Pushes updated slot text content to the frontend operator view.
   */
  notifySlotsUpdated(slots: OperatorSlots): void;

  /**
   * Pushes a strategy state change notification to the frontend operator view.
   */
  notifyStateChanged(state: string): void;
}
```

## 成员

### id

Unique operator identifier used by the host.

```ts

readonly id: string;

```

### isTransmitting

Whether this operator is currently transmitting or otherwise armed.

```ts

readonly isTransmitting: boolean;

```

### callsign

Configured callsign of the operator/station.

```ts

readonly callsign: string;

```

### grid

Configured grid locator of the operator/station.

```ts

readonly grid: string;

```

### frequency

Current audio offset frequency in Hz within the passband.

```ts

readonly frequency: number;

```

### mode

Active digital mode descriptor, for example FT8 or FT4.

```ts

readonly mode: ModeDescriptor;

```

### transmitCycles

Current transmit cycle selection where `0` is even and `1` is odd.

```ts

readonly transmitCycles: number[];

```

### automation

Current automation runtime snapshot visible to the operator UI.

```ts

readonly automation: StrategyRuntimeSnapshot | null;

```

### startTransmitting

Enables transmission/automation for the current operator.

```ts

startTransmitting(): void;

```

### stopTransmitting

Disables transmission/automation for the current operator.

```ts

stopTransmitting(): void;

```

### call

Requests that the operator call the specified target station.

Passing `lastMessage` helps the host preserve the triggering context.

```ts

call(callsign: string, lastMessage?: { message: FrameMessage; slotInfo: SlotInfo }): void;

```

### setTransmitCycles

Updates the operator's transmit cycle preference.

Pass a single value or an array to support alternating or multi-cycle modes.

```ts

setTransmitCycles(cycles: number | number[]): void;

```

### hasWorkedCallsign

Checks whether this operator has previously worked the given callsign.

```ts

hasWorkedCallsign(callsign: string): Promise<boolean>;

```

### isTargetBeingWorkedByOthers

Checks whether another operator with the same station identity is already
working the target callsign.

```ts

isTargetBeingWorkedByOthers(targetCallsign: string): boolean;

```

### recordQSO

Records a completed QSO through the host logbook pipeline.

```ts

recordQSO(record: QSORecord): void;

```

### notifySlotsUpdated

Pushes updated slot text content to the frontend operator view.

```ts

notifySlotsUpdated(slots: OperatorSlots): void;

```

### notifyStateChanged

Pushes a strategy state change notification to the frontend operator view.

```ts

notifyStateChanged(state: string): void;

```
## RadioControl

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Read/write access to radio state that is safe for plugins.

```ts
export interface RadioControl {
  /** Current tuned radio frequency in Hz. */
  readonly frequency: number;
  /** Human-readable current band label, for example `20m`. */
  readonly band: string;
  /** Whether the radio transport is currently connected. */
  readonly isConnected: boolean;

  /**
   * Requests a frequency change.
   *
   * The host remains responsible for serializing hardware access and enforcing
   * any safety or capability constraints.
   */
  setFrequency(freq: number): Promise<void>;
}
```

## 成员

### frequency

Current tuned radio frequency in Hz.

```ts

readonly frequency: number;

```

### band

Human-readable current band label, for example `20m`.

```ts

readonly band: string;

```

### isConnected

Whether the radio transport is currently connected.

```ts

readonly isConnected: boolean;

```

### setFrequency

Requests a frequency change.

The host remains responsible for serializing hardware access and enforcing
any safety or capability constraints.

```ts

setFrequency(freq: number): Promise<void>;

```
## LogbookAccess

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Read-only helpers backed by the station logbook.

```ts
export interface LogbookAccess {
  /** Checks whether the callsign has already been worked. */
  hasWorked(callsign: string): Promise<boolean>;
  /** Checks whether the DXCC entity has already been worked. */
  hasWorkedDXCC(dxccEntity: string): Promise<boolean>;
  /** Checks whether the Maidenhead grid has already been worked. */
  hasWorkedGrid(grid: string): Promise<boolean>;
}
```

## 成员

### hasWorked

Checks whether the callsign has already been worked.

```ts

hasWorked(callsign: string): Promise<boolean>;

```

### hasWorkedDXCC

Checks whether the DXCC entity has already been worked.

```ts

hasWorkedDXCC(dxccEntity: string): Promise<boolean>;

```

### hasWorkedGrid

Checks whether the Maidenhead grid has already been worked.

```ts

hasWorkedGrid(grid: string): Promise<boolean>;

```
## BandAccess

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Read-only access to the current decode environment.

```ts
export interface BandAccess {
  /**
   * Returns the active CQ-like callers known in the current slot context.
   */
  getActiveCallers(): ParsedFT8Message[];

  /**
   * Returns the latest slot pack snapshot, or `null` if no slot has been
   * processed yet.
   */
  getLatestSlotPack(): SlotPack | null;
}
```

## 成员

### getActiveCallers

Returns the active CQ-like callers known in the current slot context.

```ts

getActiveCallers(): ParsedFT8Message[];

```

### getLatestSlotPack

Returns the latest slot pack snapshot, or `null` if no slot has been
processed yet.

```ts

getLatestSlotPack(): SlotPack | null;

```
## UIBridge

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Minimal bridge for sending structured data to plugin panels in the frontend.

```ts
export interface UIBridge {
  /**
   * Publishes new panel data for the given declarative panel id.
   */
  send(panelId: string, data: unknown): void;
}
```

## 成员

### send

Publishes new panel data for the given declarative panel id.

```ts

send(panelId: string, data: unknown): void;

```
