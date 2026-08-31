# Helper Interfaces

Storage, logging, timers, network, operator, radio, logbook, and UI interfaces.

## Exports

- [KVStore](#kvstore)
- [ReadonlyKVStore](#readonlykvstore)
- [DigitalMessagePreflightRequest](#digitalmessagepreflightrequest)
- [DigitalMessagePreflightResult](#digitalmessagepreflightresult)
- [DigitalMessagePreflight](#digitalmessagepreflight)
- [PluginLogger](#pluginlogger)
- [PluginTimers](#plugintimers)
- [PluginUdpRemoteInfo](#pluginudpremoteinfo)
- [PluginUdpBindOptions](#pluginudpbindoptions)
- [PluginUdpSocketOptions](#pluginudpsocketoptions)
- [PluginUdpSocket](#pluginudpsocket)
- [PluginUdpControl](#pluginudpcontrol)
- [PluginNetworkControl](#pluginnetworkcontrol)
- [PluginEventBusMessage](#plugineventbusmessage)
- [PluginEventBus](#plugineventbus)
- [OtherOperatorSnapshot](#otheroperatorsnapshot)
- [OperatorSnapshot](#operatorsnapshot)
- [PluginOperatorCommand](#pluginoperatorcommand)
- [PluginOperatorCommandResult](#pluginoperatorcommandresult)
- [OperatorCommandPort](#operatorcommandport)
- [RadioOperatingMode](#radiooperatingmode)
- [RadioView](#radioview)
- [RadioCapabilitiesView](#radiocapabilitiesview)
- [PluginRadioCommand](#pluginradiocommand)
- [RadioCommandPort](#radiocommandport)
- [PluginRadioTunerCommand](#pluginradiotunercommand)
- [RadioTunerCommandPort](#radiotunercommandport)
- [RadioPowerSetOptions](#radiopowersetoptions)
- [RadioPowerView](#radiopowerview)
- [PluginRadioPowerCommand](#pluginradiopowercommand)
- [RadioPowerCommandPort](#radiopowercommandport)
- [QSOQueryFilter](#qsoqueryfilter)
- [CallsignLogbookReadAccess](#callsignlogbookreadaccess)
- [CallsignLogbookCommandPort](#callsignlogbookcommandport)
- [CallsignLogbookAccess](#callsignlogbookaccess)
- [PluginLogbookSessionDescriptor](#pluginlogbooksessiondescriptor)
- [PluginLogbookSessionAccess](#pluginlogbooksessionaccess)
- [PluginLogbookSessions](#pluginlogbooksessions)
- [LogbookReadAccess](#logbookreadaccess)
- [LogbookCommandPort](#logbookcommandport)
- [LogbookAccess](#logbookaccess)
- [IdleTransmitFrequencyOptions](#idletransmitfrequencyoptions)
- [AutoTargetEligibilityReason](#autotargeteligibilityreason)
- [AutoTargetEligibilityDecision](#autotargeteligibilitydecision)
- [BandAccess](#bandaccess)
- [PanelMeta](#panelmeta)
- [UIBridge](#uibridge)
- [PluginUIHandler](#pluginuihandler)
- [PluginUIHandlerRegistration](#pluginuihandlerregistration)
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
    get<T = unknown>(key: string, defaultValue?: T): T;
    set(key: string, value: unknown): void;
    update<T = unknown>(key: string, reducer: (current: T | undefined) => T | undefined): T | undefined;
    delete(key: string): void;
    getAll(): Record<string, unknown>;
    flush(): Promise<void>;
}
```

### KVStore.get

Reads a stored value.

Stored values are returned by value, so mutating the result does not update
persistence until `set` is called. When the key is missing, the
caller-owned `defaultValue` is returned unchanged.

```ts

get<T = unknown>(key: string, defaultValue?: T): T;

```

### KVStore.set

Persists a JSON-compatible snapshot under the given key.

`undefined` follows JSON object semantics and removes the key. Cycles,
BigInt values, functions and Host capabilities are rejected with
`PLUGIN_DATA_NOT_SERIALIZABLE`.

```ts

set(key: string, value: unknown): void;

```

### KVStore.update

Atomically updates one value shared by every instance of this plugin.

```ts

update<T = unknown>(key: string, reducer: (current: T | undefined) => T | undefined): T | undefined;

```

### KVStore.delete

Removes a stored key and its value.

```ts

delete(key: string): void;

```

### KVStore.getAll

Returns an independent snapshot of all stored entries in this scope.

```ts

getAll(): Record<string, unknown>;

```

### KVStore.flush

Flushes pending writes to persistent storage.

In normal operation the host flushes automatically. Call this explicitly
only when you need to guarantee that recently written data survives a
crash or restart (e.g. during a migration sequence).

```ts

flush(): Promise<void>;

```
## ReadonlyKVStore

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Read-only live view of one plugin storage scope.

```ts
export interface ReadonlyKVStore {
    get<T = unknown>(key: string, defaultValue?: T): T;
    has(key: string): boolean;
    keys(): string[];
}
```

### ReadonlyKVStore.get

Reads a detached stored value or the caller-provided default.

```ts

get<T = unknown>(key: string, defaultValue?: T): T;

```

### ReadonlyKVStore.has

Reports whether the scope currently contains an explicit key.

```ts

has(key: string): boolean;

```

### ReadonlyKVStore.keys

Returns the current key names as a detached array.

```ts

keys(): string[];

```
## DigitalMessagePreflightRequest

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Exact digital-mode text that a plugin wants the Host encoder to validate.

```ts
export interface DigitalMessagePreflightRequest {
    mode: 'FT8' | 'FT4';
    text: string;
}
```

### DigitalMessagePreflightRequest.mode

FT8 or FT4 encoder to use for validation.

```ts

mode: 'FT8' | 'FT4';

```

### DigitalMessagePreflightRequest.text

Operator-visible message text before Host normalization and encoding.

```ts

text: string;

```
## DigitalMessagePreflightResult

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Detached result of validating one message without producing audio or transmitting.

```ts
export interface DigitalMessagePreflightResult {
    encodable: boolean;
    requestedText: string;
    transmittedText?: string;
    reason?: 'empty' | 'encoder_changed_text' | 'encode_failed';
    error?: string;
}
```

### DigitalMessagePreflightResult.encodable

Whether the Host encoder accepts the normalized text exactly.

```ts

encodable: boolean;

```

### DigitalMessagePreflightResult.requestedText

Normalized text that was submitted to the encoder.

```ts

requestedText: string;

```

### DigitalMessagePreflightResult.transmittedText

Exact text recovered from the encoded payload when encoding succeeded.

```ts

transmittedText?: string;

```

### DigitalMessagePreflightResult.reason

Stable reason explaining why exact encoding was rejected.

```ts

reason?: 'empty' | 'encoder_changed_text' | 'encode_failed';

```

### DigitalMessagePreflightResult.error

Sanitized encoder diagnostic intended for plugin logs.

```ts

error?: string;

```
## DigitalMessagePreflight

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Read-only digital-mode validation; no audio or encoder handle is exposed.

```ts
export interface DigitalMessagePreflight {
    check(request: DigitalMessagePreflightRequest): Promise<DigitalMessagePreflightResult>;
}
```

### DigitalMessagePreflight.check

Validates and round-trips one FT8/FT4 message through the Host encoder.

```ts

check(request: DigitalMessagePreflightRequest): Promise<DigitalMessagePreflightResult>;

```
## PluginLogger

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Structured logger dedicated to a plugin instance.

Messages should be concise and machine-friendly because they may appear in
both backend logs and operator-facing diagnostics.

```ts
export interface PluginLogger {
    debug(message: string, data?: Record<string, unknown>): void;
    info(message: string, data?: Record<string, unknown>): void;
    warn(message: string, data?: Record<string, unknown>): void;
    error(message: string, error?: unknown): void;
}
```

### PluginLogger.debug

Writes a verbose diagnostic message.

```ts

debug(message: string, data?: Record<string, unknown>): void;

```

### PluginLogger.info

Writes a lifecycle or informational message.

```ts

info(message: string, data?: Record<string, unknown>): void;

```

### PluginLogger.warn

Writes a warning that does not stop plugin execution.

```ts

warn(message: string, data?: Record<string, unknown>): void;

```

### PluginLogger.error

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
    set(id: string, intervalMs: number): void;
    clear(id: string): void;
    clearAll(): void;
}
```

### PluginTimers.set

Starts or replaces a named interval timer.

When the timer fires, the host invokes [`PluginHooks.onTimer`](./hooks#pluginhooks-ontimer) with the
same id.

```ts

set(id: string, intervalMs: number): void;

```

### PluginTimers.clear

Clears a named timer if it exists.

```ts

clear(id: string): void;

```

### PluginTimers.clearAll

Clears all timers owned by the current plugin instance.

```ts

clearAll(): void;

```
## PluginUdpRemoteInfo

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Remote UDP endpoint metadata for datagrams received by plugin-owned sockets.

```ts
export interface PluginUdpRemoteInfo {
    address: string;
    port: number;
    family: string;
    size: number;
}
```

### PluginUdpRemoteInfo.address

Source IP address reported by the UDP socket.

```ts

address: string;

```

### PluginUdpRemoteInfo.port

Source UDP port.

```ts

port: number;

```

### PluginUdpRemoteInfo.family

Address family reported by Node.js, typically `IPv4` or `IPv6`.

```ts

family: string;

```

### PluginUdpRemoteInfo.size

Datagram size in bytes.

```ts

size: number;

```
## PluginUdpBindOptions

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Local endpoint used when binding a plugin-owned UDP socket.

```ts
export interface PluginUdpBindOptions {
    host?: string;
    port?: number;
}
```

### PluginUdpBindOptions.host

Local interface/address. Omit to use the Host default.

```ts

host?: string;

```

### PluginUdpBindOptions.port

Local port. Omit or use `0` to let the operating system choose one.

```ts

port?: number;

```
## PluginUdpSocketOptions

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Options applied when the Host creates a plugin-owned UDP socket.

```ts
export interface PluginUdpSocketOptions {
    type?: 'udp4' | 'udp6';
    reuseAddr?: boolean;
    broadcast?: boolean;
    multicastTtl?: number;
}
```

### PluginUdpSocketOptions.type

IP family. Defaults to `udp4`.

```ts

type?: 'udp4' | 'udp6';

```

### PluginUdpSocketOptions.reuseAddr

Whether multiple sockets may reuse the local address.

```ts

reuseAddr?: boolean;

```

### PluginUdpSocketOptions.broadcast

Whether the socket may send IPv4 broadcast datagrams.

```ts

broadcast?: boolean;

```

### PluginUdpSocketOptions.multicastTtl

Multicast time-to-live applied to outbound multicast packets.

```ts

multicastTtl?: number;

```
## PluginUdpSocket

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Host-owned UDP socket capability.

The handle may be stored by the plugin, but its methods are invocation
guarded. Close it during unload when possible; Host cleanup also closes all
sockets owned by the plugin instance.

```ts
export interface PluginUdpSocket {
    bind(options?: PluginUdpBindOptions): Promise<void>;
    send(data: Uint8Array | string, port: number, host: string): Promise<void>;
    onMessage(handler: (data: Uint8Array, remote: PluginUdpRemoteInfo) => void | Promise<void>): void;
    onError(handler: (error: Error) => void): void;
    close(): Promise<void>;
}
```

### PluginUdpSocket.bind

Binds the socket and resolves when it is ready to receive datagrams.

```ts

bind(options?: PluginUdpBindOptions): Promise<void>;

```

### PluginUdpSocket.send

Sends one datagram to the exact remote host and port.

```ts

send(data: Uint8Array | string, port: number, host: string): Promise<void>;

```

### PluginUdpSocket.onMessage

Registers the callback used for received datagrams.

```ts

onMessage(handler: (data: Uint8Array, remote: PluginUdpRemoteInfo) => void | Promise<void>): void;

```

### PluginUdpSocket.onError

Registers the callback used for socket-level errors.

```ts

onError(handler: (error: Error) => void): void;

```

### PluginUdpSocket.close

Closes the socket. Calling it again is safe.

```ts

close(): Promise<void>;

```
## PluginUdpControl

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Factory and bulk-cleanup surface for UDP sockets owned by one plugin instance.

```ts
export interface PluginUdpControl {
    createSocket(options?: PluginUdpSocketOptions): PluginUdpSocket;
    closeAll(): Promise<void>;
}
```

### PluginUdpControl.createSocket

Creates an unbound socket with the requested options.

```ts

createSocket(options?: PluginUdpSocketOptions): PluginUdpSocket;

```

### PluginUdpControl.closeAll

Closes every UDP socket created through this control.

```ts

closeAll(): Promise<void>;

```
## PluginNetworkControl

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Network capability exposed when the plugin declares `network`.

```ts
export interface PluginNetworkControl {
    readonly udp: PluginUdpControl;
}
```

### PluginNetworkControl.udp

UDP socket factory. HTTP requests use the sibling `ctx.fetch` capability.

```ts

readonly udp: PluginUdpControl;

```
## PluginEventBusMessage

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

A message delivered through the plugin-to-plugin event bus.

Every message carries metadata about its publisher so subscribers can
apply routing or filtering logic based on the source plugin.

```ts
export interface PluginEventBusMessage {
    topic: string;
    payload: unknown;
    timestamp: number;
    publisher: {
        pluginName: string;
        instanceScope: 'operator' | 'global';
        operatorId?: string;
    };
}
```

### PluginEventBusMessage.topic

The topic this message was published to.

```ts

topic: string;

```

### PluginEventBusMessage.payload

Structured-clone-compatible payload. The host does not interpret its
business schema, but delivers an independent value to each subscriber.

```ts

payload: unknown;

```

### PluginEventBusMessage.timestamp

Epoch milliseconds when the host dispatched the message.

```ts

timestamp: number;

```

### PluginEventBusMessage.publisher

Identity of the plugin instance that published this message.

```ts

publisher: {
    pluginName: string;
    instanceScope: 'operator' | 'global';
    operatorId?: string;
};

```
## PluginEventBus

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Permission-gated pub/sub bus for in-process plugin-to-plugin communication.

Topics are plain strings shared across all plugin instances within the same
host process. Handlers are started synchronously in subscription order.
Async handlers run independently; their errors are captured and logged by
the host rather than propagated to the publisher.

**Lifecycle**: the host automatically removes all subscriptions owned by a
plugin instance when it unloads. Individual subscriptions can be cancelled
earlier by calling the function returned from `subscribe`.

**Topic naming**: use dot-separated, plugin-prefixed names to avoid
collisions — for example `my-plugin.status.changed` or
`callsign-filter.match.found`.

```ts
export interface PluginEventBus {
    publish(topic: string, payload?: unknown): void;
    subscribe(topic: string, handler: (message: PluginEventBusMessage) => void | Promise<void>): () => void;
}
```

### PluginEventBus.publish

Publishes a message to all current subscribers of the given topic.

This is a fire-and-forget operation. The host guarantees that subscriber
exceptions never propagate back to the caller. The call itself throws
synchronously when the payload is not structured-clone compatible or
contains a Host capability.

**Parameters**

- `topic`: Exact topic string to publish to.
- `payload`: Optional structured-clone-compatible data. Keep payloads reasonably small.

```ts

publish(topic: string, payload?: unknown): void;

```

### PluginEventBus.subscribe

Subscribes to messages on the given topic.

The same handler function instance will only be added once per topic.
Different closures with identical logic are treated as distinct subscribers.

**Parameters**

- `topic`: Exact topic string to listen on.
- `handler`: Callback invoked for each matching message. May return a
  `Promise`; the host catches rejections and logs them.

**Returns:** An unsubscribe function. Calling it more than once is a no-op.

```ts

subscribe(topic: string, handler: (message: PluginEventBusMessage) => void | Promise<void>): () => void;

```
## OtherOperatorSnapshot

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Read-only summary of another operator in the same Host.

```ts
export interface OtherOperatorSnapshot {
    readonly id: string;
    readonly callsign: string;
    readonly grid: string;
    readonly audioFrequencyHz: number;
    readonly mode: ModeDescriptor;
    readonly isTransmitting: boolean;
    readonly transmitCycles: number[];
    readonly automation?: StrategyRuntimeSnapshot | null;
}
```

### OtherOperatorSnapshot.id

Unique operator identifier used by the host.

```ts

readonly id: string;

```

### OtherOperatorSnapshot.callsign

Configured callsign of the operator/station.

```ts

readonly callsign: string;

```

### OtherOperatorSnapshot.grid

Configured grid locator of the operator/station.

```ts

readonly grid: string;

```

### OtherOperatorSnapshot.audioFrequencyHz

Current transmit audio offset in Hz within the passband.

```ts

readonly audioFrequencyHz: number;

```

### OtherOperatorSnapshot.mode

Active digital mode descriptor, for example FT8 or FT4.

```ts

readonly mode: ModeDescriptor;

```

### OtherOperatorSnapshot.isTransmitting

Whether this operator is currently transmitting or otherwise armed.

```ts

readonly isTransmitting: boolean;

```

### OtherOperatorSnapshot.transmitCycles

Current transmit cycle selection where `0` is even and `1` is odd.

```ts

readonly transmitCycles: number[];

```

### OtherOperatorSnapshot.automation

Current automation runtime snapshot when available.

```ts

readonly automation?: StrategyRuntimeSnapshot | null;

```
## OperatorSnapshot

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Read-only state and query surface for the current operator-scoped plugin
instance. Mutations are submitted through `ctx.operatorCommands` when the
plugin declares `operator:transmit-control`.

```ts
export interface OperatorSnapshot {
    readonly id: string;
    readonly isTransmitting: boolean;
    readonly callsign: string;
    readonly grid: string;
    readonly frequency: number;
    readonly mode: ModeDescriptor;
    readonly transmitCycles: number[];
    readonly maxConcurrentStreams: number;
    readonly automation: StrategyRuntimeSnapshot | null;
    getOtherOperators(): OtherOperatorSnapshot[];
    hasWorkedCallsign(callsign: string, options?: {
        anyBand?: boolean;
    }): Promise<boolean>;
    isTargetBeingWorkedByOthers(targetCallsign: string): boolean;
}
```

### OperatorSnapshot.id

Unique operator identifier used by the host.

```ts

readonly id: string;

```

### OperatorSnapshot.isTransmitting

Whether this operator is currently transmitting or otherwise armed.

```ts

readonly isTransmitting: boolean;

```

### OperatorSnapshot.callsign

Configured callsign of the operator/station.

```ts

readonly callsign: string;

```

### OperatorSnapshot.grid

Configured grid locator of the operator/station.

```ts

readonly grid: string;

```

### OperatorSnapshot.frequency

Current audio offset frequency in Hz within the passband.

```ts

readonly frequency: number;

```

### OperatorSnapshot.mode

Active digital mode descriptor, for example FT8 or FT4.

```ts

readonly mode: ModeDescriptor;

```

### OperatorSnapshot.transmitCycles

Current transmit cycle selection where `0` is even and `1` is odd.

```ts

readonly transmitCycles: number[];

```

### OperatorSnapshot.maxConcurrentStreams

Host-admitted stream ceiling after radio-frequency and operator safety policy.

```ts

readonly maxConcurrentStreams: number;

```

### OperatorSnapshot.automation

Current automation runtime snapshot visible to the operator UI.

```ts

readonly automation: StrategyRuntimeSnapshot | null;

```

### OperatorSnapshot.getOtherOperators

Returns read-only snapshots for operators other than the current instance.

```ts

getOtherOperators(): OtherOperatorSnapshot[];

```

### OperatorSnapshot.hasWorkedCallsign

Checks whether this operator has previously worked the given callsign.

```ts

hasWorkedCallsign(callsign: string, options?: {
    anyBand?: boolean;
}): Promise<boolean>;

```

### OperatorSnapshot.isTargetBeingWorkedByOthers

Checks whether another operator with the same station identity is already
working the target callsign.

```ts

isTargetBeingWorkedByOthers(targetCallsign: string): boolean;

```
## PluginOperatorCommand

- Kind: `type`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Declarative operator mutations accepted by the host transmission framework.

The command set deliberately contains no PTT, audio, mixer, encoder, raw
transmit or emergency-stop primitive. Plugins can request product actions;
only the host coordinators may translate them into a physical RF lifecycle.

```ts
export type PluginOperatorCommand = {
    type: 'start-automation';
} | {
    type: 'stop-automation';
} | {
    type: 'request-call';
    callsign: string;
    lastMessage?: {
        message: FrameMessage;
        slotInfo: SlotInfo;
    };
} | {
    type: 'reply-to-decode';
    callsign: string;
    lastMessage: {
        message: FrameMessage;
        slotInfo: SlotInfo;
    };
    modifiers?: number;
} | {
    type: 'set-transmit-cycles';
    cycles: number | number[];
} | {
    type: 'remove-contribution';
} | {
    type: 'clear-decodes';
    window?: number;
} | {
    type: 'set-free-text';
    text: string;
} | {
    type: 'send-free-text';
    text?: string;
} | {
    type: 'set-temporary-location';
    location: string;
} | {
    type: 'highlight-callsign';
    callsign: string;
    background?: string | null;
    foreground?: string | null;
    lastOnly?: boolean;
};
```
## PluginOperatorCommandResult

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Settlement returned after the Host accepts an operator command.

```ts
export interface PluginOperatorCommandResult {
    epoch: number;
    outcome: 'completed' | 'superseded';
}
```

### PluginOperatorCommandResult.epoch

Host command epoch allocated before any asynchronous work begins.

```ts

epoch: number;

```

### PluginOperatorCommandResult.outcome

`superseded` means a newer host command revoked this request.

```ts

outcome: 'completed' | 'superseded';

```
## OperatorCommandPort

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Capability-scoped command port for plugins with
`operator:transmit-control` and API v2.

The property is omitted from contexts without that capability. Every submit
is invocation-guarded and enters the host's per-operator intent lane.

```ts
export interface OperatorCommandPort {
    submit(command: PluginOperatorCommand): Promise<PluginOperatorCommandResult>;
}
```

### OperatorCommandPort.submit

Submits one high-level operator command through the Host intent lane.
Rejects when the invocation expired, the plugin safety gate is disabled,
or the current physical lifecycle cannot accept the command.

```ts

submit(command: PluginOperatorCommand): Promise<PluginOperatorCommandResult>;

```
## RadioOperatingMode

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Read-only operating-mode projection that is safe for plugins.

```ts
export interface RadioOperatingMode {
    readonly engineMode: EngineMode;
    readonly mode: string;
    readonly submode?: string;
    readonly radioMode?: string;
    readonly descriptor: ModeDescriptor;
}
```

### RadioOperatingMode.engineMode

TX-5DR engine mode that owns the current radio operating mode.

```ts

readonly engineMode: EngineMode;

```

### RadioOperatingMode.mode

ADIF-compatible main mode, for example `SSB`, `FM`, `CW`, `FT8` or `MFSK`.

```ts

readonly mode: string;

```

### RadioOperatingMode.submode

ADIF-compatible submode when applicable, for example `USB`, `LSB` or `FT4`.

```ts

readonly submode?: string;

```

### RadioOperatingMode.radioMode

Raw radio modulation mode reported or remembered by the host, for example `USB`.

```ts

readonly radioMode?: string;

```

### RadioOperatingMode.descriptor

TX-5DR runtime mode descriptor used by automation and timing subsystems.

```ts

readonly descriptor: ModeDescriptor;

```
## RadioView

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Read-only frequency, band, mode and connection state for the active radio.

```ts
export interface RadioView {
    readonly frequency: number;
    readonly band: string;
    readonly mode: RadioOperatingMode;
    readonly isConnected: boolean;
    readonly isSimulation: boolean;
}
```

### RadioView.frequency

Current tuned radio frequency in Hz.

```ts

readonly frequency: number;

```

### RadioView.band

Human-readable current band label, for example `20m`.

```ts

readonly band: string;

```

### RadioView.mode

Current operating mode projected to ADIF mode/submode semantics.

```ts

readonly mode: RadioOperatingMode;

```

### RadioView.isConnected

Whether the radio transport is currently connected.

```ts

readonly isConnected: boolean;

```

### RadioView.isSimulation

Whether the active radio is a Host-provided simulation rather than physical RF.

```ts

readonly isSimulation: boolean;

```
## RadioCapabilitiesView

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Access to the host-managed radio capability negotiation system.

```ts
export interface RadioCapabilitiesView {
    getSnapshot(): CapabilityList;
    getState(id: string): CapabilityState | null;
    refresh(): Promise<CapabilityList>;
}
```

### RadioCapabilitiesView.getSnapshot

Returns the current capability descriptor/state snapshot.

```ts

getSnapshot(): CapabilityList;

```

### RadioCapabilitiesView.getState

Returns a single capability state from the current snapshot, or null.

```ts

getState(id: string): CapabilityState | null;

```

### RadioCapabilitiesView.refresh

Refreshes readable capability values and returns the updated snapshot.

```ts

refresh(): Promise<CapabilityList>;

```
## PluginRadioCommand

- Kind: `type`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Declarative radio mutations accepted by the host radio coordinator.

```ts
export type PluginRadioCommand = {
    type: 'set-frequency';
    frequency: number;
} | {
    type: 'switch-band';
    frequency: number;
    autoTune?: boolean;
};
```
## RadioCommandPort

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Capability-scoped radio command port.

This port exists only for plugins with `radio:control`. It deliberately does
not expose a radio connection, PTT primitive, mode switch, audio output or
any other physical device object.

```ts
export interface RadioCommandPort {
    submit(command: PluginRadioCommand): Promise<void>;
}
```

### RadioCommandPort.submit

Submits a frequency/band command after Host physical-idle validation.

```ts

submit(command: PluginRadioCommand): Promise<void>;

```
## PluginRadioTunerCommand

- Kind: `type`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Explicit tuner operations; no arbitrary capability identifier is accepted.

```ts
export type PluginRadioTunerCommand = {
    type: 'set-enabled';
    enabled: boolean;
} | {
    type: 'start-manual-tune';
};
```
## RadioTunerCommandPort

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Capability-scoped tuner command port for `radio:tuner-control` plugins.

```ts
export interface RadioTunerCommandPort {
    submit(command: PluginRadioTunerCommand): Promise<void>;
}
```

### RadioTunerCommandPort.submit

Submits one explicit tuner operation after Host safety validation.

```ts

submit(command: PluginRadioTunerCommand): Promise<void>;

```
## RadioPowerSetOptions

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Optional target profile and startup behavior for a radio power command.

```ts
export interface RadioPowerSetOptions {
    profileId?: string;
    autoEngine?: boolean;
}
```

### RadioPowerSetOptions.profileId

Profile to target. Defaults to the active profile.

```ts

profileId?: string;

```

### RadioPowerSetOptions.autoEngine

Start TX-5DR after physical power-on. Defaults to true.

```ts

autoEngine?: boolean;

```
## RadioPowerView

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Access to physical radio power management.

```ts
export interface RadioPowerView {
    getSupport(profileId?: string): Promise<RadioPowerSupportInfo>;
    getState(profileId?: string): RadioPowerStateEvent | null;
}
```

### RadioPowerView.getSupport

Returns power support information for the active or specified profile.

```ts

getSupport(profileId?: string): Promise<RadioPowerSupportInfo>;

```

### RadioPowerView.getState

Returns the last known power transition state for the active or specified profile.

```ts

getState(profileId?: string): RadioPowerStateEvent | null;

```
## PluginRadioPowerCommand

- Kind: `type`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Declarative power-state transition accepted by `ctx.radioPowerCommands`.

```ts
export type PluginRadioPowerCommand = {
    type: 'set-power';
    state: RadioPowerTarget;
    options?: RadioPowerSetOptions;
};
```
## RadioPowerCommandPort

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Capability-scoped physical power command port for `radio:power` plugins.

```ts
export interface RadioPowerCommandPort {
    submit(command: PluginRadioPowerCommand): Promise<RadioPowerResponse>;
}
```

### RadioPowerCommandPort.submit

Requests a power transition and resolves with the Host's final state.

```ts

submit(command: PluginRadioPowerCommand): Promise<RadioPowerResponse>;

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
    callsign?: string;
    timeRange?: {
        start: number;
        end: number;
    };
    frequencyRange?: {
        min: number;
        max: number;
    };
    mode?: string;
    band?: string;
    qslStatus?: 'confirmed' | 'uploaded' | 'none';
    limit?: number;
    offset?: number;
    orderDirection?: 'asc' | 'desc';
}
```

### QSOQueryFilter.callsign

Match a specific callsign (exact match).

```ts

callsign?: string;

```

### QSOQueryFilter.timeRange

Restrict to a time window (epoch ms).

```ts

timeRange?: {
    start: number;
    end: number;
};

```

### QSOQueryFilter.frequencyRange

Restrict to a frequency window (Hz).

```ts

frequencyRange?: {
    min: number;
    max: number;
};

```

### QSOQueryFilter.mode

Mode filter (e.g. 'FT8').

```ts

mode?: string;

```

### QSOQueryFilter.band

Band filter (e.g. '20m'). Compared via getBandFromFrequency on stored records.

```ts

band?: string;

```

### QSOQueryFilter.qslStatus

QSL confirmation status filter.
- `'confirmed'`: at least one platform confirmed
- `'uploaded'`: at least one platform uploaded but not confirmed
- `'none'`: not uploaded to any platform

```ts

qslStatus?: 'confirmed' | 'uploaded' | 'none';

```

### QSOQueryFilter.limit

Maximum number of records to return.

```ts

limit?: number;

```

### QSOQueryFilter.offset

Number of records to skip (for pagination).

```ts

offset?: number;

```

### QSOQueryFilter.orderDirection

Sort direction. Defaults to descending (newest first).

```ts

orderDirection?: 'asc' | 'desc';

```
## CallsignLogbookReadAccess

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Callsign-bound view over a single logbook.

The host resolves an already registered concrete logbook on each operation,
which keeps the handle valid across reloads without implicitly creating data.

```ts
export interface CallsignLogbookReadAccess {
    readonly callsign: string;
    getLogBookId(): Promise<string | null>;
    awaitReady(options?: {
        timeoutMs?: number;
    }): Promise<void>;
    queryQSOs(filter: QSOQueryFilter): Promise<import('@tx5dr/contracts').QSORecord[]>;
    readQsoSnapshot(filter?: QSOQueryFilter): Promise<LogbookQsoSnapshot>;
    countQSOs(filter?: QSOQueryFilter): Promise<number>;
    getStatistics(): Promise<import('@tx5dr/contracts').LogBookStatistics | null>;
}
```

### CallsignLogbookReadAccess.callsign

Normalized callsign that scopes this accessor.

```ts

readonly callsign: string;

```

### CallsignLogbookReadAccess.getLogBookId

Returns the resolved logbook id, or null when no logbook is registered.

```ts

getLogBookId(): Promise<string | null>;

```

### CallsignLogbookReadAccess.awaitReady

Waits until the Host has finished opening this logbook and it is readable.

```ts

awaitReady(options?: {
    timeoutMs?: number;
}): Promise<void>;

```

### CallsignLogbookReadAccess.queryQSOs

Queries QSO records matching the given filter.

```ts

queryQSOs(filter: QSOQueryFilter): Promise<import('@tx5dr/contracts').QSORecord[]>;

```

### CallsignLogbookReadAccess.readQsoSnapshot

Reads records and their content revision from one consistent logbook snapshot.

```ts

readQsoSnapshot(filter?: QSOQueryFilter): Promise<LogbookQsoSnapshot>;

```

### CallsignLogbookReadAccess.countQSOs

Counts QSO records matching the given filter.

```ts

countQSOs(filter?: QSOQueryFilter): Promise<number>;

```

### CallsignLogbookReadAccess.getStatistics

Returns current statistics for this callsign's logbook.

```ts

getStatistics(): Promise<import('@tx5dr/contracts').LogBookStatistics | null>;

```
## CallsignLogbookCommandPort

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Durable mutation operations scoped to one normalized station callsign.

```ts
export interface CallsignLogbookCommandPort {
    readonly callsign: string;
    addQSO(record: import('@tx5dr/contracts').QSORecord): Promise<import('@tx5dr/contracts').QSORecord>;
    updateQSO(qsoId: string, updates: Partial<import('@tx5dr/contracts').QSORecord>): Promise<import('@tx5dr/contracts').QSORecord>;
    applyQsoBatch(mutations: readonly LogbookBatchMutation[], options: {
        expectedRevision: string;
    }): Promise<LogbookBatchResult>;
    notifyUpdated(operatorId?: string): Promise<void>;
}
```

### CallsignLogbookCommandPort.callsign

Normalized callsign that scopes this accessor.

```ts

readonly callsign: string;

```

### CallsignLogbookCommandPort.addQSO

Adds a QSO and resolves with the final record after durable commit.

```ts

addQSO(record: import('@tx5dr/contracts').QSORecord): Promise<import('@tx5dr/contracts').QSORecord>;

```

### CallsignLogbookCommandPort.updateQSO

Updates a QSO and resolves with the final record after durable commit.

```ts

updateQSO(qsoId: string, updates: Partial<import('@tx5dr/contracts').QSORecord>): Promise<import('@tx5dr/contracts').QSORecord>;

```

### CallsignLogbookCommandPort.applyQsoBatch

Applies a revision-guarded set of QSO additions and updates as one durable transaction.

```ts

applyQsoBatch(mutations: readonly LogbookBatchMutation[], options: {
    expectedRevision: string;
}): Promise<LogbookBatchResult>;

```

### CallsignLogbookCommandPort.notifyUpdated

Notifies the frontend that this callsign's logbook changed.

```ts

notifyUpdated(operatorId?: string): Promise<void>;

```
## CallsignLogbookAccess

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Combined read/write callsign-bound logbook capability.

```ts
export interface CallsignLogbookAccess extends CallsignLogbookReadAccess, CallsignLogbookCommandPort {
}
```
## PluginLogbookSessionDescriptor

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Stable descriptor for one Host-managed, plugin-owned logbook session.

```ts
export interface PluginLogbookSessionDescriptor {
    sessionKey: string;
    stationCallsign: string;
    title: string;
    retention?: 'durable' | 'runtime';
}
```

### PluginLogbookSessionDescriptor.sessionKey

Stable key within the owning plugin and station callsign.

```ts

sessionKey: string;

```

### PluginLogbookSessionDescriptor.stationCallsign

Station callsign whose QSOs belong to this session.

```ts

stationCallsign: string;

```

### PluginLogbookSessionDescriptor.title

User-facing session title.

```ts

title: string;

```

### PluginLogbookSessionDescriptor.retention

Durable by default; runtime sessions are deleted when explicitly destroyed or the Host exits.

```ts

retention?: 'durable' | 'runtime';

```
## PluginLogbookSessionAccess

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Read/write access to one plugin-owned logbook session.

```ts
export interface PluginLogbookSessionAccess extends CallsignLogbookAccess {
    readonly id: string;
    readonly title: string;
    destroy(): Promise<void>;
}
```

### PluginLogbookSessionAccess.id

Opaque Host-issued session logbook identifier.

```ts

readonly id: string;

```

### PluginLogbookSessionAccess.title

User-facing title supplied when the session was opened.

```ts

readonly title: string;

```

### PluginLogbookSessionAccess.destroy

Destroys a runtime-retained session. Durable sessions reject this operation.

```ts

destroy(): Promise<void>;

```
## PluginLogbookSessions

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Host-arbitrated access to logbook sessions owned by the current plugin.

```ts
export interface PluginLogbookSessions {
    open(descriptor: PluginLogbookSessionDescriptor): Promise<PluginLogbookSessionAccess>;
    destroy(sessionKey: string): Promise<void>;
}
```

### PluginLogbookSessions.open

Opens or reuses a durable session without changing the station's primary logbook.

```ts

open(descriptor: PluginLogbookSessionDescriptor): Promise<PluginLogbookSessionAccess>;

```

### PluginLogbookSessions.destroy

Destroys an existing runtime-retained session owned by this plugin and operator.

```ts

destroy(sessionKey: string): Promise<void>;

```
## LogbookReadAccess

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Read-only worked-status and QSO query capability for `logbook:read`.

```ts
export interface LogbookReadAccess {
    hasWorked(callsign: string, options?: {
        anyBand?: boolean;
    }): Promise<boolean>;
    hasWorkedDXCC(dxccEntity: string): Promise<boolean>;
    hasWorkedGrid(grid: string): Promise<boolean>;
    queryQSOs(filter: QSOQueryFilter): Promise<import('@tx5dr/contracts').QSORecord[]>;
    readQsoSnapshot(filter?: QSOQueryFilter): Promise<LogbookQsoSnapshot>;
    countQSOs(filter?: QSOQueryFilter): Promise<number>;
    forCallsign(callsign: string): CallsignLogbookReadAccess;
}
```

### LogbookReadAccess.hasWorked

Checks whether the callsign has already been worked.

```ts

hasWorked(callsign: string, options?: {
    anyBand?: boolean;
}): Promise<boolean>;

```

### LogbookReadAccess.hasWorkedDXCC

Checks whether the DXCC entity has already been worked.

```ts

hasWorkedDXCC(dxccEntity: string): Promise<boolean>;

```

### LogbookReadAccess.hasWorkedGrid

Checks whether the Maidenhead grid has already been worked.

```ts

hasWorkedGrid(grid: string): Promise<boolean>;

```

### LogbookReadAccess.queryQSOs

Queries QSO records matching the given filter.

```ts

queryQSOs(filter: QSOQueryFilter): Promise<import('@tx5dr/contracts').QSORecord[]>;

```

### LogbookReadAccess.readQsoSnapshot

Reads records and their content revision from one consistent logbook snapshot.

```ts

readQsoSnapshot(filter?: QSOQueryFilter): Promise<LogbookQsoSnapshot>;

```

### LogbookReadAccess.countQSOs

Counts QSO records matching the given filter.

```ts

countQSOs(filter?: QSOQueryFilter): Promise<number>;

```

### LogbookReadAccess.forCallsign

Returns a read-only callsign-bound accessor suitable for global plugin instances.

```ts

forCallsign(callsign: string): CallsignLogbookReadAccess;

```
## LogbookCommandPort

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Durable mutation operations exposed by the `logbook:write` permission.

```ts
export interface LogbookCommandPort {
    addQSO(record: import('@tx5dr/contracts').QSORecord): Promise<import('@tx5dr/contracts').QSORecord>;
    updateQSO(qsoId: string, updates: Partial<import('@tx5dr/contracts').QSORecord>): Promise<import('@tx5dr/contracts').QSORecord>;
    applyQsoBatch(mutations: readonly LogbookBatchMutation[], options: {
        expectedRevision: string;
    }): Promise<LogbookBatchResult>;
    notifyUpdated(): Promise<void>;
    forCallsign(callsign: string): CallsignLogbookCommandPort;
}
```

### LogbookCommandPort.addQSO

Adds a QSO and resolves with the final record after durable commit.

```ts

addQSO(record: import('@tx5dr/contracts').QSORecord): Promise<import('@tx5dr/contracts').QSORecord>;

```

### LogbookCommandPort.updateQSO

Updates a QSO and resolves with the final record after durable commit.

```ts

updateQSO(qsoId: string, updates: Partial<import('@tx5dr/contracts').QSORecord>): Promise<import('@tx5dr/contracts').QSORecord>;

```

### LogbookCommandPort.applyQsoBatch

Applies a revision-guarded set of QSO additions and updates as one durable transaction.

```ts

applyQsoBatch(mutations: readonly LogbookBatchMutation[], options: {
    expectedRevision: string;
}): Promise<LogbookBatchResult>;

```

### LogbookCommandPort.notifyUpdated

Notifies the frontend to refresh logbook data (call after batch writes).

```ts

notifyUpdated(): Promise<void>;

```

### LogbookCommandPort.forCallsign

Returns a callsign-bound durable mutation port for global plugin instances.

```ts

forCallsign(callsign: string): CallsignLogbookCommandPort;

```
## LogbookAccess

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

> **Deprecated:** Prefer capability-specific LogbookReadAccess and LogbookCommandPort.

```ts
export interface LogbookAccess extends LogbookReadAccess, LogbookCommandPort {
    forCallsign(callsign: string): CallsignLogbookAccess;
}
```

### LogbookAccess.forCallsign

Returns a combined read/write accessor for the requested station callsign.

```ts

forCallsign(callsign: string): CallsignLogbookAccess;

```
## IdleTransmitFrequencyOptions

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Optional constraints used when asking the host for a quieter transmit offset.

```ts
export interface IdleTransmitFrequencyOptions {
    slotId?: string;
    minHz?: number;
    maxHz?: number;
    guardHz?: number;
}
```

### IdleTransmitFrequencyOptions.slotId

Slot identifier to analyze. Defaults to the latest available slot when omitted.

```ts

slotId?: string;

```

### IdleTransmitFrequencyOptions.minHz

Inclusive lower bound in Hz within the passband.

```ts

minHz?: number;

```

### IdleTransmitFrequencyOptions.maxHz

Inclusive upper bound in Hz within the passband.

```ts

maxHz?: number;

```

### IdleTransmitFrequencyOptions.guardHz

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
export type AutoTargetEligibilityReason = 'non_cq_message' | 'plain_cq' | 'missing_callsign_identity' | 'missing_target_identity' | 'unsupported_activity_token' | 'unsupported_callback_token' | 'continent_match' | 'continent_mismatch' | 'dx_match' | 'dx_same_continent' | 'entity_match' | 'entity_mismatch' | 'unknown_modifier';
```
## AutoTargetEligibilityDecision

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Structured result returned by the host for automatic-target eligibility
checks.

```ts
export interface AutoTargetEligibilityDecision {
    eligible: boolean;
    reason: AutoTargetEligibilityReason;
    modifier?: string;
}
```

### AutoTargetEligibilityDecision.eligible

Whether the host would currently allow automation to react to the target.

```ts

eligible: boolean;

```

### AutoTargetEligibilityDecision.reason

Machine-friendly explanation of the decision.

```ts

reason: AutoTargetEligibilityReason;

```

### AutoTargetEligibilityDecision.modifier

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
    getActiveCallers(): ParsedFT8Message[];
    getLatestSlotPack(): SlotPack | null;
    findIdleTransmitFrequency(options?: IdleTransmitFrequencyOptions): number | null;
    evaluateAutoTargetEligibility(message: ParsedFT8Message): AutoTargetEligibilityDecision;
}
```

### BandAccess.getActiveCallers

Returns the active CQ-like callers known in the current slot context.

```ts

getActiveCallers(): ParsedFT8Message[];

```

### BandAccess.getLatestSlotPack

Returns the latest slot pack snapshot, or `null` if no slot has been
processed yet.

```ts

getLatestSlotPack(): SlotPack | null;

```

### BandAccess.findIdleTransmitFrequency

Asks the host to recommend a quieter transmit audio offset for the current
decode environment.

Returns `null` when the host cannot evaluate the slot or when no suitable
idle window is found. A successful result also reserves that offset for the
current operator and analyzed slot so later operators avoid selecting the
same window.

```ts

findIdleTransmitFrequency(options?: IdleTransmitFrequencyOptions): number | null;

```

### BandAccess.evaluateAutoTargetEligibility

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

Dynamic metadata for a plugin panel, sent via [`UIBridge.setPanelMeta`](./helpers#uibridge-setpanelmeta).

```ts
export interface PanelMeta {
    title?: string | null;
    titleValues?: Record<string, unknown>;
    visible?: boolean;
}
```

### PanelMeta.title

Overrides the panel title dynamically.
- i18n key (e.g. `"statusActive"`): resolved from the plugin's locale namespace
- literal string (e.g. `"Active: 5"`): displayed as-is
- empty string `""`: hides the title bar entirely (immersive)
- null / undefined: reverts to the statically declared title

```ts

title?: string | null;

```

### PanelMeta.titleValues

Interpolation values for the title when it is an i18n key.
For example, if the plugin locale defines `"statusActive": "Active: {{count}}"`,
pass `{ count: 5 }` to render "Active: 5".

```ts

titleValues?: Record<string, unknown>;

```

### PanelMeta.visible

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
    send(panelId: string, data: unknown): void;
    setPanelMeta(panelId: string, meta: PanelMeta): void;
    setPanelContributions(groupId: string, panels: PluginPanelDescriptor[]): void;
    clearPanelContributions(groupId: string): void;
    refreshOperatorProjection(): void;
    registerPageHandler(handler: PluginUIHandler, registration?: PluginUIHandlerRegistration): void;
    pushToSession(pageSessionId: string, action: string, data?: unknown): void;
    listActivePageSessions(pageId: string): PluginUIPageSessionInfo[];
    pushToPage(pageId: string, action: string, data?: unknown): void;
}
```

### UIBridge.send

Publishes a JSON-compatible snapshot for the given declarative panel id.
Mutating the caller's object after this call does not alter panel state.

```ts

send(panelId: string, data: unknown): void;

```

### UIBridge.setPanelMeta

Updates the panel's display metadata at runtime. All fields are optional
and use patch semantics. Subsequent calls overwrite previous values for the
same keys.

```ts

setPanelMeta(panelId: string, meta: PanelMeta): void;

```

### UIBridge.setPanelContributions

Replaces one runtime-owned group of plugin UI panels for this plugin
instance. Static `PluginDefinition.panels` are exposed by the host as the
reserved `manifest` group; plugins should use their own stable group ids.

```ts

setPanelContributions(groupId: string, panels: PluginPanelDescriptor[]): void;

```

### UIBridge.clearPanelContributions

Clears a runtime-owned panel contribution group for this plugin instance.

```ts

clearPanelContributions(groupId: string): void;

```

### UIBridge.refreshOperatorProjection

Requests a fresh operator/runtime projection after plugin-owned state changes.

```ts

refreshOperatorProjection(): void;

```

### UIBridge.registerPageHandler

Registers a handler for custom messages sent from iframe UI pages via the
`bridge.invoke()` SDK method. The host routes incoming invoke requests to
the handler and sends the return value back to the iframe.

A registration with `pageIds` only handles those pages and composes with
other page-scoped registrations. Omitting `pageIds` preserves the legacy
fallback behavior; a later fallback registration replaces the previous one.

```ts

registerPageHandler(handler: PluginUIHandler, registration?: PluginUIHandlerRegistration): void;

```

### UIBridge.pushToSession

Pushes a JSON-compatible data snapshot to the specific page session.

Prefer this API whenever the plugin already knows the target session id
(for example from [`PluginUIRequestContext.pageSessionId`](./helpers#pluginuirequestcontext-pagesessionid) or
`requestContext.page.sessionId`).

```ts

pushToSession(pageSessionId: string, action: string, data?: unknown): void;

```

### UIBridge.listActivePageSessions

Lists active page sessions for the current plugin instance and page id.

This is useful for background timers or sync completions that need to
notify every open page tied to the same runtime instance.

```ts

listActivePageSessions(pageId: string): PluginUIPageSessionInfo[];

```

### UIBridge.pushToPage

Pushes a JSON-compatible data snapshot to an iframe UI page by page id.

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
application-defined invoke requests from their iframe-based UIs. The Host
does not interpret the business schema, but it enforces the page/session
authorization and JSON data boundary in both directions.

```ts
export interface PluginUIHandler {
    onMessage(pageId: string, action: string, data: unknown, requestContext: PluginUIRequestContext): Promise<unknown>;
}
```

### PluginUIHandler.onMessage

Called when the iframe sends an invoke request via `bridge.invoke(action, data)`.

**Parameters**

- `pageId`: The page that sent the message.
- `action`: Developer-defined action identifier.
- `data`: JSON-compatible snapshot from the iframe; validate it as
  untrusted input before use.
- `requestContext`: Host-authenticated page context, including any
bound resource for this page session.

**Returns:** A JSON-compatible response snapshot sent back to the iframe.

```ts

onMessage(pageId: string, action: string, data: unknown, requestContext: PluginUIRequestContext): Promise<unknown>;

```
## PluginUIHandlerRegistration

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Optional routing scope for one iframe page handler registration.

```ts
export interface PluginUIHandlerRegistration {
    pageIds?: readonly string[];
}
```

### PluginUIHandlerRegistration.pageIds

Page ids owned by this handler. An explicitly empty list is invalid.

```ts

pageIds?: readonly string[];

```
## PluginUIRequestUser

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Host-authenticated user identity attached to an iframe invoke request.

```ts
export interface PluginUIRequestUser {
    readonly tokenId: string;
    readonly role: 'viewer' | 'operator' | 'admin';
    readonly operatorIds: string[];
    readonly permissionGrants?: PermissionGrant[];
}
```

### PluginUIRequestUser.tokenId

Stable token/session identifier; not the raw credential.

```ts

readonly tokenId: string;

```

### PluginUIRequestUser.role

Effective role at the time the Host authorizes the request.

```ts

readonly role: 'viewer' | 'operator' | 'admin';

```

### PluginUIRequestUser.operatorIds

Operator IDs the current user is allowed to access.

```ts

readonly operatorIds: string[];

```

### PluginUIRequestUser.permissionGrants

Fine-grained grants associated with the authenticated user, when present.

```ts

readonly permissionGrants?: PermissionGrant[];

```
## PluginUIBoundResource

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Resource identity resolved and authorized from the page descriptor binding.

```ts
export interface PluginUIBoundResource {
    readonly kind: 'callsign' | 'operator';
    readonly value: string;
}
```

### PluginUIBoundResource.kind

Kind declared by `resourceBinding`.

```ts

readonly kind: 'callsign' | 'operator';

```

### PluginUIBoundResource.value

Normalized callsign or authorized operator ID.

```ts

readonly value: string;

```
## PluginUIInstanceTarget

- Kind: `type`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Plugin instance selected by the Host for this page request.

```ts
export type PluginUIInstanceTarget = {
    readonly kind: 'global';
} | {
    readonly kind: 'operator';
    readonly operatorId: string;
};
```
## PluginUIPageSessionInfo

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Read-only identity of one active plugin iframe page session.

```ts
export interface PluginUIPageSessionInfo {
    readonly sessionId: string;
    readonly pageId: string;
    readonly resource?: PluginUIBoundResource;
}
```

### PluginUIPageSessionInfo.sessionId

Unique ID used for exact session pushes.

```ts

readonly sessionId: string;

```

### PluginUIPageSessionInfo.pageId

`PluginDefinition.ui.pages` entry rendered by this session.

```ts

readonly pageId: string;

```

### PluginUIPageSessionInfo.resource

Host-authorized resource binding, when the page declares one.

```ts

readonly resource?: PluginUIBoundResource;

```
## PluginUIPageContext

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Page-session identity plus an exact push channel back to that iframe.

```ts
export interface PluginUIPageContext extends PluginUIPageSessionInfo {
    push(action: string, data?: unknown): void;
}
```

### PluginUIPageContext.push

Sends a JSON-compatible snapshot to this exact page session.

```ts

push(action: string, data?: unknown): void;

```
## PluginUIRequestContext

- Kind: `interface`
- Source: [helpers.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/helpers.ts)

Host-authenticated context passed to an iframe page handler.

Treat `data` from the iframe as untrusted input. Use this context, rather
than caller-supplied IDs, for authorization and storage scoping.

```ts
export interface PluginUIRequestContext {
    readonly pageSessionId: string;
    readonly user: PluginUIRequestUser;
    readonly resource?: PluginUIBoundResource;
    readonly instanceTarget: PluginUIInstanceTarget;
    readonly page: PluginUIPageContext;
    readonly files: PluginFileStore;
}
```

### PluginUIRequestContext.pageSessionId

Same exact page session identifier exposed as `page.sessionId`.

```ts

readonly pageSessionId: string;

```

### PluginUIRequestContext.user

User identity authorized by the Host for this request.

```ts

readonly user: PluginUIRequestUser;

```

### PluginUIRequestContext.resource

Bound callsign/operator, when required by the page descriptor.

```ts

readonly resource?: PluginUIBoundResource;

```

### PluginUIRequestContext.instanceTarget

Global or operator plugin instance receiving the request.

```ts

readonly instanceTarget: PluginUIInstanceTarget;

```

### PluginUIRequestContext.page

Exact page session/push capability, valid only during the current handler invocation.

```ts

readonly page: PluginUIPageContext;

```

### PluginUIRequestContext.files

Page-scoped file storage shared with iframe `tx5dr.file*()` calls.

Use this in `registerPageHandler()` handlers to read files uploaded by the
current iframe page session without reconstructing host-internal scope
paths. Both `page` and `files` are exact-invocation capabilities: do not
retain and invoke them after the current `onMessage()` promise settles.

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
    write(path: string, data: Buffer): Promise<void>;
    read(path: string): Promise<Buffer | null>;
    delete(path: string): Promise<boolean>;
    list(prefix?: string): Promise<string[]>;
}
```

### PluginFileStore.write

Writes a copy of the Buffer, creating or replacing the file.

```ts

write(path: string, data: Buffer): Promise<void>;

```

### PluginFileStore.read

Reads a file into a new Buffer. Returns `null` when the path does not exist.

```ts

read(path: string): Promise<Buffer | null>;

```

### PluginFileStore.delete

Deletes a file. Returns `true` if the file existed and was removed.

```ts

delete(path: string): Promise<boolean>;

```

### PluginFileStore.list

Lists file paths under the given prefix (or all files when omitted).

```ts

list(prefix?: string): Promise<string[]>;

```
