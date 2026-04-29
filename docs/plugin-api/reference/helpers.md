# Helper Interfaces

该页列出 `KVStore`、日志、定时器、操作员控制等辅助接口。

> 自动生成自 `../tx-5dr/packages/plugin-api/src/helpers.ts`

## 导出

- [KVStore](#kvstore)
- [PluginLogger](#pluginlogger)
- [PluginTimers](#plugintimers)
- [OperatorControl](#operatorcontrol)
- [RadioControl](#radiocontrol)
- [QSOQueryFilter](#qsoqueryfilter)
- [CallsignLogbookAccess](#callsignlogbookaccess)
- [LogbookAccess](#logbookaccess)
- [IdleTransmitFrequencyOptions](#idletransmitfrequencyoptions)
- [AutoTargetEligibilityReason](#autotargeteligibilityreason)
- [AutoTargetEligibilityDecision](#autotargeteligibilitydecision)
- [BandAccess](#bandaccess)
- [PanelMeta](#panelmeta)
- [UIBridge](#uibridge)
- [PluginUIHandler](#pluginuihandler)
- [PluginUIRequestUser](#pluginuirequestuser)
- [PluginUIBoundResource](#pluginuiboundresource)
- [PluginUIInstanceTarget](#pluginuiinstancetarget)
- [PluginUIPageSessionInfo](#pluginuipagesessioninfo)
- [PluginUIPageContext](#pluginuipagecontext)
- [PluginUIRequestContext](#pluginuirequestcontext)
- [PluginFileStore](#pluginfilestore)

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

  /**
   * Flushes pending writes to persistent storage.
   *
   * In normal operation the host flushes automatically. Call this explicitly
   * only when you need to guarantee that recently written data survives a
   * crash or restart (e.g. during a migration sequence).
   */
  flush(): Promise<void>;
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

### flush

Flushes pending writes to persistent storage.

In normal operation the host flushes automatically. Call this explicitly
only when you need to guarantee that recently written data survives a
crash or restart (e.g. during a migration sequence).

```ts

flush(): Promise<void>;

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
## QSOQueryFilter

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Filter criteria for querying QSO records from the logbook.

This type is defined in the plugin-api layer so plugins have no compile-time
dependency on core internals. The host translates it to the storage layer's
native query format.

```ts
export interface QSOQueryFilter {
  /** Match a specific callsign (exact match). */
  callsign?: string;
  /** Restrict to a time window (epoch ms). */
  timeRange?: { start: number; end: number };
  /** Restrict to a frequency window (Hz). */
  frequencyRange?: { min: number; max: number };
  /** Mode filter (e.g. 'FT8'). */
  mode?: string;
  /**
   * QSL confirmation status filter.
   * - `'confirmed'`: at least one platform confirmed
   * - `'uploaded'`: at least one platform uploaded but not confirmed
   * - `'none'`: not uploaded to any platform
   */
  qslStatus?: 'confirmed' | 'uploaded' | 'none';
  /** Maximum number of records to return. */
  limit?: number;
  /** Number of records to skip (for pagination). */
  offset?: number;
  /** Sort direction. Defaults to descending (newest first). */
  orderDirection?: 'asc' | 'desc';
}
```

## 成员

### callsign

Match a specific callsign (exact match).

```ts

callsign?: string;

```

### timeRange

Restrict to a time window (epoch ms).

```ts

timeRange?: { start: number; end: number };

```

### frequencyRange

Restrict to a frequency window (Hz).

```ts

frequencyRange?: { min: number; max: number };

```

### mode

Mode filter (e.g. 'FT8').

```ts

mode?: string;

```

### qslStatus

QSL confirmation status filter.
- `'confirmed'`: at least one platform confirmed
- `'uploaded'`: at least one platform uploaded but not confirmed
- `'none'`: not uploaded to any platform

```ts

qslStatus?: 'confirmed' | 'uploaded' | 'none';

```

### limit

Maximum number of records to return.

```ts

limit?: number;

```

### offset

Number of records to skip (for pagination).

```ts

offset?: number;

```

### orderDirection

Sort direction. Defaults to descending (newest first).

```ts

orderDirection?: 'asc' | 'desc';

```
## CallsignLogbookAccess

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Callsign-bound view over a single logbook.

The host resolves the concrete logbook lazily on each operation, which keeps
the handle valid even if the underlying logbook is created or reloaded later.

```ts
export interface CallsignLogbookAccess {
  /** Normalized callsign that scopes this accessor. */
  readonly callsign: string;

  /** Returns the resolved logbook id, or null when no logbook exists yet. */
  getLogBookId(): Promise<string | null>;

  /** Queries QSO records matching the given filter. */
  queryQSOs(filter: QSOQueryFilter): Promise<import('@tx5dr/contracts').QSORecord[]>;
  /** Counts QSO records matching the given filter. */
  countQSOs(filter?: QSOQueryFilter): Promise<number>;
  /** Adds a new QSO record to this callsign's logbook. */
  addQSO(record: import('@tx5dr/contracts').QSORecord): Promise<void>;
  /** Updates partial fields of an existing QSO record. */
  updateQSO(qsoId: string, updates: Partial<import('@tx5dr/contracts').QSORecord>): Promise<void>;
  /** Returns current statistics for this callsign's logbook. */
  getStatistics(): Promise<import('@tx5dr/contracts').LogBookStatistics | null>;
  /** Notifies the frontend that this callsign's logbook changed. */
  notifyUpdated(operatorId?: string): Promise<void>;
}
```

## 成员

### callsign

Normalized callsign that scopes this accessor.

```ts

readonly callsign: string;

```

### getLogBookId

Returns the resolved logbook id, or null when no logbook exists yet.

```ts

getLogBookId(): Promise<string | null>;

```

### queryQSOs

Queries QSO records matching the given filter.

```ts

queryQSOs(filter: QSOQueryFilter): Promise<import('@tx5dr/contracts').QSORecord[]>;

```

### countQSOs

Counts QSO records matching the given filter.

```ts

countQSOs(filter?: QSOQueryFilter): Promise<number>;

```

### addQSO

Adds a new QSO record to this callsign's logbook.

```ts

addQSO(record: import('@tx5dr/contracts').QSORecord): Promise<void>;

```

### updateQSO

Updates partial fields of an existing QSO record.

```ts

updateQSO(qsoId: string, updates: Partial<import('@tx5dr/contracts').QSORecord>): Promise<void>;

```

### getStatistics

Returns current statistics for this callsign's logbook.

```ts

getStatistics(): Promise<import('@tx5dr/contracts').LogBookStatistics | null>;

```

### notifyUpdated

Notifies the frontend that this callsign's logbook changed.

```ts

notifyUpdated(operatorId?: string): Promise<void>;

```
## LogbookAccess

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Full logbook access for plugins.

Extends the original read-only helpers with query, write and notification
capabilities so that sync providers can self-orchestrate their entire flow
without host-side special handling.

```ts
export interface LogbookAccess {
  // === Read-only helpers (original) ===

  /** Checks whether the callsign has already been worked. */
  hasWorked(callsign: string): Promise<boolean>;
  /** Checks whether the DXCC entity has already been worked. */
  hasWorkedDXCC(dxccEntity: string): Promise<boolean>;
  /** Checks whether the Maidenhead grid has already been worked. */
  hasWorkedGrid(grid: string): Promise<boolean>;

  // === Query ===

  /** Queries QSO records matching the given filter. */
  queryQSOs(filter: QSOQueryFilter): Promise<import('@tx5dr/contracts').QSORecord[]>;
  /** Counts QSO records matching the given filter. */
  countQSOs(filter?: QSOQueryFilter): Promise<number>;

  /** Returns a callsign-bound accessor suitable for global plugin instances. */
  forCallsign(callsign: string): CallsignLogbookAccess;

  // === Write ===

  /** Adds a new QSO record. Deduplication is the caller's responsibility. */
  addQSO(record: import('@tx5dr/contracts').QSORecord): Promise<void>;
  /** Updates partial fields of an existing QSO record (e.g. QSL status). */
  updateQSO(qsoId: string, updates: Partial<import('@tx5dr/contracts').QSORecord>): Promise<void>;

  // === Notification ===

  /** Notifies the frontend to refresh logbook data (call after batch writes). */
  notifyUpdated(): Promise<void>;
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

### queryQSOs

Queries QSO records matching the given filter.

```ts

queryQSOs(filter: QSOQueryFilter): Promise<import('@tx5dr/contracts').QSORecord[]>;

```

### countQSOs

Counts QSO records matching the given filter.

```ts

countQSOs(filter?: QSOQueryFilter): Promise<number>;

```

### forCallsign

Returns a callsign-bound accessor suitable for global plugin instances.

```ts

forCallsign(callsign: string): CallsignLogbookAccess;

```

### addQSO

Adds a new QSO record. Deduplication is the caller's responsibility.

```ts

addQSO(record: import('@tx5dr/contracts').QSORecord): Promise<void>;

```

### updateQSO

Updates partial fields of an existing QSO record (e.g. QSL status).

```ts

updateQSO(qsoId: string, updates: Partial<import('@tx5dr/contracts').QSORecord>): Promise<void>;

```

### notifyUpdated

Notifies the frontend to refresh logbook data (call after batch writes).

```ts

notifyUpdated(): Promise<void>;

```
## IdleTransmitFrequencyOptions

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Optional constraints used when asking the host for a quieter transmit offset.

```ts
export interface IdleTransmitFrequencyOptions {
  /** Slot identifier to analyze. Defaults to the latest available slot when omitted. */
  slotId?: string;
  /** Inclusive lower bound in Hz within the passband. */
  minHz?: number;
  /** Inclusive upper bound in Hz within the passband. */
  maxHz?: number;
  /** Guard bandwidth in Hz to keep around occupied frequencies. */
  guardHz?: number;
}
```

## 成员

### slotId

Slot identifier to analyze. Defaults to the latest available slot when omitted.

```ts

slotId?: string;

```

### minHz

Inclusive lower bound in Hz within the passband.

```ts

minHz?: number;

```

### maxHz

Inclusive upper bound in Hz within the passband.

```ts

maxHz?: number;

```

### guardHz

Guard bandwidth in Hz to keep around occupied frequencies.

```ts

guardHz?: number;

```
## AutoTargetEligibilityReason

- Kind: `type`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Reason codes returned by the host when evaluating whether a decoded target
should be eligible for automatic CQ-style replies.

```ts
export type AutoTargetEligibilityReason =
  | 'non_cq_message'
  | 'plain_cq'
  | 'missing_callsign_identity'
  | 'missing_target_identity'
  | 'unsupported_activity_token'
  | 'unsupported_callback_token'
  | 'continent_match'
  | 'continent_mismatch'
  | 'dx_match'
  | 'dx_same_continent'
  | 'entity_match'
  | 'entity_mismatch'
  | 'unknown_modifier';
```
## AutoTargetEligibilityDecision

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Structured result returned by the host for automatic-target eligibility
checks.

```ts
export interface AutoTargetEligibilityDecision {
  /** Whether the host would currently allow automation to react to the target. */
  eligible: boolean;
  /** Machine-friendly explanation of the decision. */
  reason: AutoTargetEligibilityReason;
  /** Directed CQ modifier/token extracted from the message, when present. */
  modifier?: string;
}
```

## 成员

### eligible

Whether the host would currently allow automation to react to the target.

```ts

eligible: boolean;

```

### reason

Machine-friendly explanation of the decision.

```ts

reason: AutoTargetEligibilityReason;

```

### modifier

Directed CQ modifier/token extracted from the message, when present.

```ts

modifier?: string;

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

  /**
   * Asks the host to recommend a quieter transmit audio offset for the current
   * decode environment.
   *
   * Returns `null` when the host cannot evaluate the slot or when no suitable
   * idle window is found.
   */
  findIdleTransmitFrequency(options?: IdleTransmitFrequencyOptions): number | null;

  /**
   * Evaluates whether the given decoded message is eligible for automatic
   * target selection under the host's built-in CQ modifier rules.
   *
   * This lets third-party plugins reuse the same directed-CQ policy that the
   * host applies to standard autocall and auto-reply flows.
   */
  evaluateAutoTargetEligibility(message: ParsedFT8Message): AutoTargetEligibilityDecision;
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

### findIdleTransmitFrequency

Asks the host to recommend a quieter transmit audio offset for the current
decode environment.

Returns `null` when the host cannot evaluate the slot or when no suitable
idle window is found.

```ts

findIdleTransmitFrequency(options?: IdleTransmitFrequencyOptions): number | null;

```

### evaluateAutoTargetEligibility

Evaluates whether the given decoded message is eligible for automatic
target selection under the host's built-in CQ modifier rules.

This lets third-party plugins reuse the same directed-CQ policy that the
host applies to standard autocall and auto-reply flows.

```ts

evaluateAutoTargetEligibility(message: ParsedFT8Message): AutoTargetEligibilityDecision;

```
## PanelMeta

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Dynamic metadata for a plugin panel, sent via {@link UIBridge.setPanelMeta}.

```ts
export interface PanelMeta {
  /**
   * Overrides the panel title dynamically.
   * - i18n key (e.g. `"statusActive"`): resolved from the plugin's locale namespace
   * - literal string (e.g. `"Active: 5"`): displayed as-is
   * - empty string `""`: hides the title bar entirely (immersive)
   * - null / undefined: reverts to the statically declared title
   */
  title?: string | null;

  /**
   * Interpolation values for the title when it is an i18n key.
   * For example, if the plugin locale defines `"statusActive": "Active: {{count}}"`,
   * pass `{ count: 5 }` to render "Active: 5".
   */
  titleValues?: Record<string, unknown>;

  /**
   * Controls whether the panel is visible.
   * - false: the host hides the panel entirely (it takes no layout space)
   * - true / undefined: normal display
   */
  visible?: boolean;
}
```

## 成员

### title

Overrides the panel title dynamically.
- i18n key (e.g. `"statusActive"`): resolved from the plugin's locale namespace
- literal string (e.g. `"Active: 5"`): displayed as-is
- empty string `""`: hides the title bar entirely (immersive)
- null / undefined: reverts to the statically declared title

```ts

title?: string | null;

```

### titleValues

Interpolation values for the title when it is an i18n key.
For example, if the plugin locale defines `"statusActive": "Active: {{count}}"`,
pass `{ count: 5 }` to render "Active: 5".

```ts

titleValues?: Record<string, unknown>;

```

### visible

Controls whether the panel is visible.
- false: the host hides the panel entirely (it takes no layout space)
- true / undefined: normal display

```ts

visible?: boolean;

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

  /**
   * Updates the panel's display metadata at runtime. All fields are optional
   * and use patch semantics. Subsequent calls overwrite previous values for the
   * same keys.
   */
  setPanelMeta(panelId: string, meta: PanelMeta): void;

  /**
   * Replaces one runtime-owned group of plugin UI panels for this plugin
   * instance. Static `PluginDefinition.panels` are exposed by the host as the
   * reserved `manifest` group; plugins should use their own stable group ids.
   */
  setPanelContributions(groupId: string, panels: PluginPanelDescriptor[]): void;

  /**
   * Clears a runtime-owned panel contribution group for this plugin instance.
   */
  clearPanelContributions(groupId: string): void;

  /**
   * Registers a handler for custom messages sent from iframe UI pages via the
   * `bridge.invoke()` SDK method. The host routes incoming invoke requests to
   * the handler and sends the return value back to the iframe.
   *
   * Only one handler can be registered per plugin instance. Calling this method
   * again replaces the previous handler.
   */
  registerPageHandler(handler: PluginUIHandler): void;

  /**
   * Pushes a custom message to the specific page session.
   *
   * Prefer this API whenever the plugin already knows the target session id
   * (for example from {@link PluginUIRequestContext.pageSessionId} or
   * `requestContext.page.sessionId`).
   */
  pushToSession(pageSessionId: string, action: string, data?: unknown): void;

  /**
   * Lists active page sessions for the current plugin instance and page id.
   *
   * This is useful for background timers or sync completions that need to
   * notify every open page tied to the same runtime instance.
   */
  listActivePageSessions(pageId: string): PluginUIPageSessionInfo[];

  /**
   * Pushes a custom message to an iframe UI page by page id.
   *
   * This compatibility helper only succeeds when exactly one active session of
   * the current plugin instance matches the page id. If multiple sessions are
   * open, the host throws `explicit_page_session_required`.
   */
  pushToPage(pageId: string, action: string, data?: unknown): void;
}
```

## 成员

### send

Publishes new panel data for the given declarative panel id.

```ts

send(panelId: string, data: unknown): void;

```

### setPanelMeta

Updates the panel's display metadata at runtime. All fields are optional
and use patch semantics. Subsequent calls overwrite previous values for the
same keys.

```ts

setPanelMeta(panelId: string, meta: PanelMeta): void;

```

### setPanelContributions

Replaces one runtime-owned group of plugin UI panels for this plugin
instance. Static `PluginDefinition.panels` are exposed by the host as the
reserved `manifest` group; plugins should use their own stable group ids.

```ts

setPanelContributions(groupId: string, panels: PluginPanelDescriptor[]): void;

```

### clearPanelContributions

Clears a runtime-owned panel contribution group for this plugin instance.

```ts

clearPanelContributions(groupId: string): void;

```

### registerPageHandler

Registers a handler for custom messages sent from iframe UI pages via the
`bridge.invoke()` SDK method. The host routes incoming invoke requests to
the handler and sends the return value back to the iframe.

Only one handler can be registered per plugin instance. Calling this method
again replaces the previous handler.

```ts

registerPageHandler(handler: PluginUIHandler): void;

```

### pushToSession

Pushes a custom message to the specific page session.

Prefer this API whenever the plugin already knows the target session id
(for example from {@link PluginUIRequestContext.pageSessionId} or
`requestContext.page.sessionId`).

```ts

pushToSession(pageSessionId: string, action: string, data?: unknown): void;

```

### listActivePageSessions

Lists active page sessions for the current plugin instance and page id.

This is useful for background timers or sync completions that need to
notify every open page tied to the same runtime instance.

```ts

listActivePageSessions(pageId: string): PluginUIPageSessionInfo[];

```

### pushToPage

Pushes a custom message to an iframe UI page by page id.

This compatibility helper only succeeds when exactly one active session of
the current plugin instance matches the page id. If multiple sessions are
open, the host throws `explicit_page_session_required`.

```ts

pushToPage(pageId: string, action: string, data?: unknown): void;

```
## PluginUIHandler

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Handler for custom messages sent from iframe UI pages.

Plugins register a handler via `ctx.ui.registerPageHandler()` to receive
arbitrary invoke requests from their iframe-based UIs. The host acts as a
transparent router — it does not inspect or interpret the action or data.

```ts
export interface PluginUIHandler {
  /**
   * Called when the iframe sends an invoke request via `bridge.invoke(action, data)`.
   *
   * @param pageId - The page that sent the message.
   * @param action - Developer-defined action identifier.
   * @param data - Arbitrary payload from the iframe.
   * @param requestContext - Host-authenticated page context, including any
   * bound resource for this page session.
   * @returns The response value sent back to the iframe.
   */
  onMessage(
    pageId: string,
    action: string,
    data: unknown,
    requestContext: PluginUIRequestContext,
  ): Promise<unknown>;
}
```

## 成员

### onMessage

Called when the iframe sends an invoke request via `bridge.invoke(action, data)`.

@param pageId - The page that sent the message.
@param action - Developer-defined action identifier.
@param data - Arbitrary payload from the iframe.
@param requestContext - Host-authenticated page context, including any
bound resource for this page session.
@returns The response value sent back to the iframe.

```ts

onMessage(
    pageId: string,
    action: string,
    data: unknown,
    requestContext: PluginUIRequestContext,
  ): Promise<unknown>;

```
## PluginUIRequestUser

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

未提供额外注释。

```ts
export interface PluginUIRequestUser {
  readonly tokenId: string;
  readonly role: 'viewer' | 'operator' | 'admin';
  readonly operatorIds: string[];
  readonly permissionGrants?: PermissionGrant[];
}
```

## 成员

### tokenId

未提供额外注释。

```ts

readonly tokenId: string;

```

### role

未提供额外注释。

```ts

readonly role: 'viewer' | 'operator' | 'admin';

```

### operatorIds

未提供额外注释。

```ts

readonly operatorIds: string[];

```

### permissionGrants

未提供额外注释。

```ts

readonly permissionGrants?: PermissionGrant[];

```
## PluginUIBoundResource

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

未提供额外注释。

```ts
export interface PluginUIBoundResource {
  readonly kind: 'callsign' | 'operator';
  readonly value: string;
}
```

## 成员

### kind

未提供额外注释。

```ts

readonly kind: 'callsign' | 'operator';

```

### value

未提供额外注释。

```ts

readonly value: string;

```
## PluginUIInstanceTarget

- Kind: `type`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

未提供额外注释。

```ts
export type PluginUIInstanceTarget =
  | { readonly kind: 'global' }
  | { readonly kind: 'operator'; readonly operatorId: string };
```
## PluginUIPageSessionInfo

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

未提供额外注释。

```ts
export interface PluginUIPageSessionInfo {
  readonly sessionId: string;
  readonly pageId: string;
  readonly resource?: PluginUIBoundResource;
}
```

## 成员

### sessionId

未提供额外注释。

```ts

readonly sessionId: string;

```

### pageId

未提供额外注释。

```ts

readonly pageId: string;

```

### resource

未提供额外注释。

```ts

readonly resource?: PluginUIBoundResource;

```
## PluginUIPageContext

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

未提供额外注释。

```ts
export interface PluginUIPageContext extends PluginUIPageSessionInfo {
  push(action: string, data?: unknown): void;
}
```

## 成员

### push

未提供额外注释。

```ts

push(action: string, data?: unknown): void;

```
## PluginUIRequestContext

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

未提供额外注释。

```ts
export interface PluginUIRequestContext {
  readonly pageSessionId: string;
  readonly user: PluginUIRequestUser;
  readonly resource?: PluginUIBoundResource;
  readonly instanceTarget: PluginUIInstanceTarget;
  readonly page: PluginUIPageContext;
  /**
   * Page-scoped file storage shared with iframe `tx5dr.file*()` calls.
   *
   * Use this in `registerPageHandler()` handlers to read files uploaded by the
   * current iframe page session without reconstructing host-internal scope
   * paths.
   */
  readonly files: PluginFileStore;
}
```

## 成员

### pageSessionId

未提供额外注释。

```ts

readonly pageSessionId: string;

```

### user

未提供额外注释。

```ts

readonly user: PluginUIRequestUser;

```

### resource

未提供额外注释。

```ts

readonly resource?: PluginUIBoundResource;

```

### instanceTarget

未提供额外注释。

```ts

readonly instanceTarget: PluginUIInstanceTarget;

```

### page

未提供额外注释。

```ts

readonly page: PluginUIPageContext;

```

### files

Page-scoped file storage shared with iframe `tx5dr.file*()` calls.

Use this in `registerPageHandler()` handlers to read files uploaded by the
current iframe page session without reconstructing host-internal scope
paths.

```ts

readonly files: PluginFileStore;

```
## PluginFileStore

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Persistent binary file storage for plugins.

Files are stored in a sandboxed directory under the plugin's data path. Path
traversal outside the sandbox is rejected by the host.

```ts
export interface PluginFileStore {
  /** Writes (or overwrites) a file at the given path. */
  write(path: string, data: Buffer): Promise<void>;

  /** Reads a file. Returns `null` when the path does not exist. */
  read(path: string): Promise<Buffer | null>;

  /** Deletes a file. Returns `true` if the file existed and was removed. */
  delete(path: string): Promise<boolean>;

  /** Lists file paths under the given prefix (or all files when omitted). */
  list(prefix?: string): Promise<string[]>;
}
```

## 成员

### write

Writes (or overwrites) a file at the given path.

```ts

write(path: string, data: Buffer): Promise<void>;

```

### read

Reads a file. Returns `null` when the path does not exist.

```ts

read(path: string): Promise<Buffer | null>;

```

### delete

Deletes a file. Returns `true` if the file existed and was removed.

```ts

delete(path: string): Promise<boolean>;

```

### list

Lists file paths under the given prefix (or all files when omitted).

```ts

list(prefix?: string): Promise<string[]>;

```
