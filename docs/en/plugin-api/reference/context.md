# PluginContext

Runtime contexts provided to plugins by the Host.

## Exports

- [PluginContextBase](#plugincontextbase)
- [PluginContextFor](#plugincontextfor)
- [PluginContext](#plugincontext)
- [PluginCleanupContext](#plugincleanupcontext)
- [RuntimePluginContext](#runtimeplugincontext)
- [StrategyPluginContext](#strategyplugincontext)
- [PluginEligibilityContext](#plugineligibilitycontext)

## PluginContextBase

- Kind: `interface`
- Source: [context.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/context.ts)

Runtime services exposed to a plugin instance.

The host creates a [`PluginContext`](./context#plugincontext) for each loaded plugin/operator
combination. It is the main entry point for everything that a plugin can do
at runtime: read resolved settings, persist state, control the operator,
interact with the radio, publish UI updates and, when permitted, perform HTTP
requests.

The context is intentionally capability-oriented. If a method is not exposed
here, plugin code should treat it as unavailable rather than reaching into
TX-5DR internals.

```ts
export interface PluginContextBase {
    readonly config: Readonly<Record<string, unknown>>;
    updateConfig(patch: Record<string, unknown>): Promise<void>;
    readonly store: {
        readonly global: KVStore;
        readonly operator: KVStore;
    };
    readonly log: PluginLogger;
    readonly timers: PluginTimers;
    readonly operator: OperatorSnapshot;
    readonly radio: RadioView;
    readonly band: BandAccess;
    readonly ui: UIBridge;
    readonly files: PluginFileStore;
}
```

### PluginContextBase.config

Resolved plugin configuration values.

The host validates and persists settings, then supplies a detached snapshot
before invoking hooks or lifecycle methods. Mutating nested values does not
update persistence; call [`PluginContextBase.updateConfig`](./context#plugincontextbase-updateconfig) instead. Use
[`PluginHooks.onConfigChange`](./hooks#pluginhooks-onconfigchange) to react to updates.

```ts

readonly config: Readonly<Record<string, unknown>>;

```

### PluginContextBase.updateConfig

Applies a partial patch to this plugin's settings.

The patch is shallow-merged with existing resolved settings
according to the instance scope (operator or global).
After the update, the host persists the change, notifies
all instances via [`PluginHooks.onConfigChange`](./hooks#pluginhooks-onconfigchange), and
pushes the new status to the frontend.

```ts

updateConfig(patch: Record<string, unknown>): Promise<void>;

```

### PluginContextBase.store

Persistent key-value stores provisioned for the plugin.

Each scope is isolated by plugin identity. Use `global` for shared plugin
data and `operator` for values that should not leak across operators.

```ts

readonly store: {
    readonly global: KVStore;
    readonly operator: KVStore;
};

```

### PluginContextBase.log

Structured logger scoped to the plugin.

Messages typically appear in backend logs and, when applicable, in frontend
plugin log views.

```ts

readonly log: PluginLogger;

```

### PluginContextBase.timers

Named timer manager owned by the host.

Timers created here are automatically cleaned up when the plugin unloads, so
prefer this over raw `setInterval` calls inside plugin code.

```ts

readonly timers: PluginTimers;

```

### PluginContextBase.operator

Read-only snapshot and query surface for the current operator.

```ts

readonly operator: OperatorSnapshot;

```

### PluginContextBase.radio

Read-only projection of the physical radio state.

```ts

readonly radio: RadioView;

```

### PluginContextBase.band

Read-only access to current-band and slot decode data.

```ts

readonly band: BandAccess;

```

### PluginContextBase.ui

Bridge for pushing structured data into declarative plugin panels and
for communicating with custom iframe UI pages.

```ts

readonly ui: UIBridge;

```

### PluginContextBase.files

Persistent binary file storage sandboxed to the plugin.

Files are stored in the plugin data directory under a host-managed sandbox.
Use this for binary assets such as certificates, images or cached data.
For structured JSON data, prefer [`PluginContext.store`](./context#plugincontextbase-store) instead.

```ts

readonly files: PluginFileStore;

```
## PluginContextFor

- Kind: `type`
- Source: [context.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/context.ts)

Plugin context whose privileged ports are derived from literal manifest
permissions. Capabilities that were not declared do not exist in the type.

Host handles are invocation-scoped. In particular, a `Response` returned by
`ctx.fetch` and its Headers/body reader must be consumed before the current
Host callback settles; retaining the native handle for later use results in
`PLUGIN_INVOCATION_EXPIRED`.

```ts
export type PluginContextFor<Permissions extends readonly PluginPermission[]> = PluginContextBase & CapabilityProperty<Permissions, 'operator:transmit-control', {
    readonly operatorCommands: OperatorCommandPort;
}> & CapabilityProperty<Permissions, 'radio:read', {
    readonly radioCapabilities: RadioCapabilitiesView;
    readonly radioPower: RadioPowerView;
}> & CapabilityProperty<Permissions, 'radio:control', {
    readonly radioCommands: RadioCommandPort;
}> & CapabilityProperty<Permissions, 'radio:tuner-control', {
    readonly radioTunerCommands: RadioTunerCommandPort;
}> & CapabilityProperty<Permissions, 'radio:power', {
    readonly radioPowerCommands: RadioPowerCommandPort;
}> & LogbookCapability<Permissions> & CapabilityProperty<Permissions, 'logbook:sync', {
    readonly logbookSync: LogbookSyncRegistrar;
}> & SettingsCapability<Permissions> & CapabilityProperty<Permissions, 'network', {
    readonly network: PluginNetworkControl;
    readonly fetch: (url: string, init?: RequestInit) => Promise<Response>;
}> & CapabilityProperty<Permissions, 'plugin:event-bus', {
    readonly eventBus: PluginEventBus;
}> & CapabilityProperty<Permissions, 'host:hamlib', {
    readonly hostDependencies: HostDependencies & Required<Pick<HostDependencies, 'hamlib'>>;
}>;
```
## PluginContext

- Kind: `type`
- Source: [context.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/context.ts)

Safe default context for code that has not declared literal permissions.

```ts
export type PluginContext = PluginContextFor<readonly [
]>;
```
## PluginCleanupContext

- Kind: `type`
- Source: [context.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/context.ts)

Teardown-only context passed to `onUnload`.

Cleanup may inspect the read-only operator state, flush plugin-owned state
and release plugin-owned files. The Host also permits previously acquired
native-resource and UI handles to finish cleanup, but does not reopen radio,
network, event-bus, logbook or command capabilities while the instance is
being revoked.

```ts
export type PluginCleanupContext = Pick<PluginContextBase, 'store' | 'log' | 'timers' | 'files' | 'operator'>;
```
## RuntimePluginContext

- Kind: `type`
- Source: [context.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/context.ts)

Host-side erased runtime shape. Public plugin definitions should use `definePlugin()`.

```ts
export type RuntimePluginContext = PluginContextBase & Partial<{
    operatorCommands: OperatorCommandPort;
    radioCapabilities: RadioCapabilitiesView;
    radioCommands: RadioCommandPort;
    radioTunerCommands: RadioTunerCommandPort;
    radioPower: RadioPowerView;
    radioPowerCommands: RadioPowerCommandPort;
    logbook: LogbookReadAccess | LogbookAccess;
    logbookSync: LogbookSyncRegistrar;
    settings: Partial<HostSettingsControl>;
    network: PluginNetworkControl;
    eventBus: PluginEventBus;
    hostDependencies: HostDependencies;
    fetch: (url: string, init?: RequestInit) => Promise<Response>;
}>;
```
## StrategyPluginContext

- Kind: `interface`
- Source: [context.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/context.ts)

Deliberately narrow context captured by a speculative strategy runtime.
Decisions can inspect operator state and emit a result, but cannot retain a
command, radio, logbook-write, network, timer or UI capability.

```ts
export interface StrategyPluginContext {
    readonly config: Readonly<Record<string, unknown>>;
    readonly log: PluginLogger;
    readonly operator: OperatorSnapshot;
}
```

### StrategyPluginContext.config

Detached snapshot of the strategy plugin's resolved configuration.

```ts

readonly config: Readonly<Record<string, unknown>>;

```

### StrategyPluginContext.log

Logger scoped to this strategy instance.

```ts

readonly log: PluginLogger;

```

### StrategyPluginContext.operator

Read-only operator snapshot; mutation ports are deliberately absent.

```ts

readonly operator: OperatorSnapshot;

```
## PluginEligibilityContext

- Kind: `interface`
- Source: [context.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/context.ts)

Minimal context used to evaluate a transmit-control eligibility predicate.

```ts
export interface PluginEligibilityContext {
    readonly config: Readonly<Record<string, unknown>>;
}
```

### PluginEligibilityContext.config

Current detached configuration snapshot used by the synchronous gate.

```ts

readonly config: Readonly<Record<string, unknown>>;

```
