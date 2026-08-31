# PluginDefinition

插件入口文件的默认导出结构。

## 导出

- [PluginDefinition](#plugindefinition)
- [AnyPluginDefinition](#anyplugindefinition)
- [definePlugin](#defineplugin)

## PluginDefinition

- 类型: `interface`
- 源码: [definition.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/definition.ts)

Describes a TX-5DR plugin module.

The default export of a plugin package or entry file must satisfy this
interface. It combines declarative metadata, optional UI descriptors and the
runtime callbacks that the host invokes after the plugin is loaded.

A plugin can be one of two categories:
- `strategy`: owns the operator automation state machine and is mutually
  exclusive per operator.
- `utility`: augments the pipeline or UI and can run alongside other utility
  plugins.

The TX-5DR host reads this definition once during load, validates the static
fields and then wires the lifecycle callbacks and hooks into the plugin
subsystem.

**Example**

```js
import { definePlugin } from '@tx5dr/plugin-api';

export default definePlugin({
  apiVersion: 2,
  name: 'my-plugin',
  version: '1.0.0',
  type: 'utility',
  description: 'Annotates interesting decoded stations.',
  permissions: [],
  hooks: {
    onDecode(messages, ctx) {
      ctx.log.info('decoded', { count: messages.length });
    },
  },
});
```

**Example**

```ts
import { definePlugin } from '@tx5dr/plugin-api';

export default definePlugin({
  apiVersion: 2,
  name: 'my-strategy',
  version: '1.0.0',
  type: 'strategy',
  createStrategyRuntime() {
    return {
      checkpoint() {
        return {};
      },
      restore() {},
      decide() {
        return {
          transmission: null,
          snapshot: this.getSnapshot(),
        };
      },
      getTransmitText() {
        return null;
      },
      requestCall() {},
      getSnapshot() {
        return { currentState: 'idle' };
      },
      patchContext() {},
      setState() {},
      setSlotContent() {},
      reset() {},
    };
  },
});
```

```ts
export interface PluginDefinition<Permissions extends readonly PluginPermission[] = readonly [
]> {
    apiVersion?: 2;
    name: string;
    version: string;
    minPluginApiVersion?: string;
    type: PluginType;
    strategyFeatures?: {
        targetQueue?: 1;
        parallelTargetQueue?: 1;
        queueActivation?: 'immediate' | 'operator-toggle';
        manualInitiation?: 1;
        maxConcurrentStreams?: number;
        maxSimultaneousSignals?: number;
    };
    simulationScenarios?: SimulationScenarioDescriptor[];
    instanceScope?: PluginInstanceScope;
    description?: string;
    permissions?: Permissions;
    settings?: Record<string, PluginSettingDescriptor>;
    quickActions?: PluginQuickAction[];
    quickSettings?: PluginQuickSetting[];
    panels?: PluginPanelDescriptor[];
    storage?: {
        scopes: ('global' | 'operator')[];
    };
    ui?: {
        dir?: string;
        pages?: PluginUIPageDescriptor[];
    };
    createStrategyRuntime?(ctx: StrategyPluginContext): StrategyRuntime;
    onLoad?(ctx: PluginContextFor<Permissions>): void | Promise<void>;
    onUnload?(ctx: PluginCleanupContext): void | Promise<void>;
    hooks?: PluginHooks<Permissions>;
    isTransmitControlEnabled?(ctx: PluginEligibilityContext): boolean;
    isAutoCallEnabled?(ctx: PluginEligibilityContext): boolean;
}
```

### PluginDefinition.apiVersion

Public API contract version. All new plugins should use `2`.

API v2 is required for strategy plugins and for utility plugins that request
any mutation capability: `operator:transmit-control`, `radio:control`,
`radio:tuner-control`, `radio:power`, `logbook:write` or `logbook:sync`.

```ts

apiVersion?: 2;

```

### PluginDefinition.name

Stable machine-readable plugin identifier.

This value is used as the plugin's identity in manifests, persisted
configuration, log records and runtime lookups. Treat it as an immutable ID
once the plugin is released.

```ts

name: string;

```

### PluginDefinition.version

Semantic version of the plugin implementation.

The host does not currently enforce a compatibility policy, but publishing a
valid semver string makes diagnostics and upgrades much easier.

```ts

version: string;

```

### PluginDefinition.minPluginApiVersion

Oldest bundled `@tx5dr/plugin-api` version that can safely load this plugin.

This is independent from the TX-5DR product/nightly version. Marketplace
artifacts must declare it and match their catalog entry.

```ts

minPluginApiVersion?: string;

```

### PluginDefinition.type

Declares how the host should schedule and combine this plugin.

- `strategy` plugins provide a [`StrategyRuntime`](./runtime#strategyruntime) and are selected as
  the active automation implementation for an operator.
- `utility` plugins participate in filters, scoring, monitoring and UI, but
  do not own the core automation state machine.

```ts

type: PluginType;

```

### PluginDefinition.strategyFeatures

Optional strategy capabilities advertised to Host UI and routing.

```ts

strategyFeatures?: {
    targetQueue?: 1;
    parallelTargetQueue?: 1;
    queueActivation?: 'immediate' | 'operator-toggle';
    manualInitiation?: 1;
    maxConcurrentStreams?: number;
    maxSimultaneousSignals?: number;
};

```

### PluginDefinition.simulationScenarios

Development-only virtual-radio peer scenarios. The Host owns execution and RF safety.

```ts

simulationScenarios?: SimulationScenarioDescriptor[];

```

### PluginDefinition.instanceScope

Controls whether the host creates one instance per operator or a single
shared instance for the whole station.

Defaults to `operator` when omitted.
Global scope is utility-only. It cannot use operator-scoped settings or
quick settings, and only global-compatible hooks/panels are accepted by the
loader. Use it for station-wide sync, network services and radio policy.

```ts

instanceScope?: PluginInstanceScope;

```

### PluginDefinition.description

Human-readable summary shown in plugin management UIs.

Keep this short and product-oriented so operators can quickly understand the
plugin's purpose.

```ts

description?: string;

```

### PluginDefinition.permissions

Explicitly declares privileged capabilities required by the plugin.

Permissions allow the host to gate sensitive features such as network
access. Always declare the smallest set that the plugin truly needs.

```ts

permissions?: Permissions;

```

### PluginDefinition.settings

Declarative settings schema for generated configuration forms.

Each key becomes a persisted config entry. The host validates and stores the
values, then exposes the resolved runtime config through
[`PluginContext.config`](./context#plugincontext). Use this for durable, user-facing settings
rather than ephemeral runtime state.

```ts

settings?: Record<string, PluginSettingDescriptor>;

```

### PluginDefinition.quickActions

Lightweight button actions shown in operator-facing quick action areas.

These are intended for one-shot commands such as reset, clear or manual
trigger operations. When clicked, the host invokes
[`PluginHooks.onUserAction`](./hooks#pluginhooks-onuseraction) with the configured action id.

```ts

quickActions?: PluginQuickAction[];

```

### PluginDefinition.quickSettings

Quick settings surfaced in compact operator-facing automation panels.

Use these for high-frequency adjustments that operators may need to tweak
during operation, such as a threshold, target list or enable flag.

```ts

quickSettings?: PluginQuickSetting[];

```

### PluginDefinition.panels

Static panel descriptors used to render plugin-owned UI sections.

Structured panels (`key-value`, `table`, `log`, `chart`) receive live data
through [`PluginContext.ui.send`](./context#plugincontext). Iframe panels (`component: 'iframe'`)
render a custom HTML page and communicate via `invoke` / `onPush`.
The host exposes these static descriptors as the reserved `manifest`
contribution group. Plugins that need to add or remove panels at runtime
should use [`PluginContext.ui.setPanelContributions`](./context#plugincontext) instead of
predeclaring placeholder panels.

Each panel has a `slot` that controls where it renders: `'operator'` (the
default, shown in the operator card), `'automation'` (shown in the
top-right automation popover), `'operator-action'` (an icon-and-text page
action beside the operator logbook button), `'main-right'` (the optional far-right main
pane), `'voice-left-top'` (above the voice frequency card),
`'voice-right-top'` (the tabbed top area of the voice right panel),
`'cw-left-top'` (above the CW frequency card),
`'cw-right-top'` (the tabbed top area of the CW right panel), or
`'radio-control-toolbar'` (a global utility iframe button in RadioControl).
An `operator-action` panel must use `component: 'iframe'` and
`openMode: 'page'`; the Host binds it to that operator and opens the
referenced custom UI as a standalone page.
Panels may also declare a preferred `width`, such as `'full'`, so hosts can
promote more important live panels.

```ts

panels?: PluginPanelDescriptor[];

```

### PluginDefinition.storage

Declares which persistent storage scopes should be provisioned.

Request `global` storage for data shared by the whole station, and
`operator` storage for per-operator state. The corresponding stores are then
available via [`PluginContext.store`](./context#plugincontext).

```ts

storage?: {
    scopes: ('global' | 'operator')[];
};

```

### PluginDefinition.ui

Declares custom UI pages served from the plugin's static file directory.

Pages are rendered inside an iframe by the host's `PluginIframeHost`
component. The host automatically injects CSS design tokens and a
communication bridge SDK. Plugins can use any web technology inside the
iframe.

Pages are declarative — they only define _what_ exists, not _where_ it is
rendered. The rendering location is decided by consumers (e.g. a logbook
sync host renders the page in a settings modal tab, while a future
dashboard host may render it in a side panel).

```ts

ui?: {
    dir?: string;
    pages?: PluginUIPageDescriptor[];
};

```

### PluginDefinition.createStrategyRuntime

Creates the strategy runtime for a `strategy` plugin.

This method is required when [`PluginDefinition.type`](./definition#plugindefinition-type) is `strategy` and
should be omitted for utility plugins. The returned runtime becomes the
operator's active automation controller.

```ts

createStrategyRuntime?(ctx: StrategyPluginContext): StrategyRuntime;

```

### PluginDefinition.onLoad

Runs after the plugin instance has been loaded and the context is ready.

Use this for startup work such as warming caches, scheduling Host timers or
sending initial panel data. Await required asynchronous work before returning;
do not detach continuations that retain Host capabilities after the callback.

```ts

onLoad?(ctx: PluginContextFor<Permissions>): void | Promise<void>;

```

### PluginDefinition.onUnload

Runs before the plugin instance is unloaded.

Use this to release external resources or flush state that is not already
handled through the host abstractions. Any timers created via
[`PluginContext.timers`](./context#plugincontextbase-timers) are cleared automatically by the host.

```ts

onUnload?(ctx: PluginCleanupContext): void | Promise<void>;

```

### PluginDefinition.hooks

Event and pipeline hooks implemented by the plugin.

Hooks let utility plugins observe or transform the message flow, and let the
active strategy participate in decision making.

```ts

hooks?: PluginHooks<Permissions>;

```

### PluginDefinition.isTransmitControlEnabled

Safety gate for the operator command port.

Plugins that declare `operator:transmit-control` must implement this or
`isAutoCallEnabled`. The host evaluates it immediately before each
command so disabled remote-control or integration features cannot retain
command authority.

```ts

isTransmitControlEnabled?(ctx: PluginEligibilityContext): boolean;

```

### PluginDefinition.isAutoCallEnabled

Marks an operator-scoped plugin as an automatic calling controller and
reports whether that behavior is currently enabled.

The host uses this declaration for the auto-call indicator and pause UI.
It also acts as the command-port safety gate when
`isTransmitControlEnabled` is omitted. Integrations that can submit
occasional external commands but are not auto-call controllers should
implement only `isTransmitControlEnabled`.

```ts

isAutoCallEnabled?(ctx: PluginEligibilityContext): boolean;

```
## AnyPluginDefinition

- 类型: `type`
- 源码: [definition.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/definition.ts)

Type-erased plugin definition used by the host after module loading.

```ts
export type AnyPluginDefinition = PluginDefinition<any>;
```
## definePlugin

- 类型: `function`
- 源码: [definition.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/definition.ts)

Defines a plugin while preserving literal permissions for capability-aware
callback context inference. New plugins should use this helper instead of
widening their definition to `PluginDefinition`.

```ts
export function definePlugin<const Permissions extends readonly PluginPermission[] = readonly [
]>(definition: PluginDefinition<Permissions>): PluginDefinition<Permissions> {
    return definition;
}
```
