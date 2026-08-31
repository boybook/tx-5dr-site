# Plugin API Compatibility

Plugin API バージョン比較、最低バージョン検証、互換性エラーです。

## エクスポート

- [comparePluginApiVersions](#comparepluginapiversions)
- [assertPluginApiCompatible](#assertpluginapicompatible)

## comparePluginApiVersions

- 種別: `function`
- ソース: [compatibility.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/compatibility.ts)

Compares Plugin API semantic versions. Build metadata is intentionally ignored.

```ts
export function comparePluginApiVersions(left: string, right: string): number | null {
    const a = parseSemver(left);
    const b = parseSemver(right);
    if (!a || !b)
        return null;
    for (const key of ['major', 'minor', 'patch'] as const) {
        if (a[key] !== b[key])
            return a[key] < b[key] ? -1 : 1;
    }
    return comparePrerelease(a.prerelease, b.prerelease);
}
```
## assertPluginApiCompatible

- 種別: `function`
- ソース: [compatibility.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/compatibility.ts)

Throws when a Host cannot prove it satisfies a plugin's Plugin API floor.

```ts
export function assertPluginApiCompatible(minPluginApiVersion: string | undefined, pluginName: string | undefined, pluginApiVersion: string | undefined): void {
    if (!minPluginApiVersion)
        return;
    const currentVersion = pluginApiVersion?.trim() || 'unavailable';
    const comparison = comparePluginApiVersions(currentVersion, minPluginApiVersion);
    if (comparison === null || comparison < 0) {
        throw new PluginApiCompatibilityError(currentVersion, minPluginApiVersion, pluginName);
    }
}
```
