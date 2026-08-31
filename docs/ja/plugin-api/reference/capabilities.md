# Capabilities

権限から runtime context capability への公開マッピングです。

## エクスポート

- [PLUGIN_CONTEXT_CAPABILITY_KEYS](#plugin-context-capability-keys)
- [PluginContextCapabilityPermission](#plugincontextcapabilitypermission)
- [PluginContextCapabilityKey](#plugincontextcapabilitykey)
- [PLUGIN_COMMAND_CAPABILITY_PERMISSIONS](#plugin-command-capability-permissions)
- [getPluginContextCapabilityKeys](#getplugincontextcapabilitykeys)

## PLUGIN_CONTEXT_CAPABILITY_KEYS

- 種別: `value`
- ソース: [capabilities.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/capabilities.ts)

Top-level context properties granted by each manifest permission.

The host consumes this registry when it constructs and guards a runtime
context. Keeping the mapping in the public API package prevents the type
contract and runtime capability surface from drifting apart.

```ts
export const PLUGIN_CONTEXT_CAPABILITY_KEYS = {
    'operator:transmit-control': ['operatorCommands'],
    'radio:read': ['radioCapabilities', 'radioPower'],
    'radio:control': ['radioCommands'],
    'radio:tuner-control': ['radioTunerCommands'],
    'radio:power': ['radioPowerCommands'],
    'logbook:read': ['logbook'],
    'logbook:write': ['logbook'],
    'logbook:session': ['logbook'],
    'logbook:sync': ['logbookSync'],
    'settings:ft8': ['settings'],
    'settings:decode-windows': ['settings'],
    'settings:realtime': ['settings'],
    'settings:frequency-presets': ['settings'],
    'settings:station': ['settings'],
    'settings:psk-reporter': ['settings'],
    'settings:ntp': ['settings'],
    network: ['network', 'fetch'],
    'plugin:event-bus': ['eventBus'],
    'host:hamlib': ['hostDependencies'],
} as const satisfies Partial<Record<PluginPermission, readonly string[]>>;
```
## PluginContextCapabilityPermission

- 種別: `type`
- ソース: [capabilities.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/capabilities.ts)

Permission names that add one or more top-level runtime context properties.

```ts
export type PluginContextCapabilityPermission = keyof typeof PLUGIN_CONTEXT_CAPABILITY_KEYS;
```
## PluginContextCapabilityKey

- 種別: `type`
- ソース: [capabilities.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/capabilities.ts)

Top-level runtime context property controlled by a manifest permission.

```ts
export type PluginContextCapabilityKey = (typeof PLUGIN_CONTEXT_CAPABILITY_KEYS)[PluginContextCapabilityPermission][number];
```
## PLUGIN_COMMAND_CAPABILITY_PERMISSIONS

- 種別: `value`
- ソース: [capabilities.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/capabilities.ts)

Permissions that expose host-arbitrated mutation ports and therefore require API v2.

```ts
export const PLUGIN_COMMAND_CAPABILITY_PERMISSIONS = [
    'operator:transmit-control',
    'radio:control',
    'radio:tuner-control',
    'radio:power',
    'logbook:write',
    'logbook:session',
    'logbook:sync',
] as const satisfies readonly PluginPermission[];
```
## getPluginContextCapabilityKeys

- 種別: `function`
- ソース: [capabilities.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/capabilities.ts)

Returns the unique context-property allowlist implied by a permission list.

```ts
export function getPluginContextCapabilityKeys(permissions: readonly PluginPermission[] | undefined): PluginContextCapabilityKey[] {
    const keys = new Set<PluginContextCapabilityKey>();
    for (const permission of permissions ?? []) {
        const capabilityKeys = PLUGIN_CONTEXT_CAPABILITY_KEYS[permission as PluginContextCapabilityPermission];
        for (const key of capabilityKeys ?? []) {
            keys.add(key);
        }
    }
    return [...keys];
}
```
