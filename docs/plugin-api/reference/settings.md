# Host Settings

`ctx.settings` 可以访问的 Host 设置命名空间和类型。

## 导出

- [HostFT8Settings](#hostft8settings)
- [HostFT8SettingsPatch](#hostft8settingspatch)
- [HostFrequencyPresetsSettings](#hostfrequencypresetssettings)
- [HostStationInfoPatch](#hoststationinfopatch)
- [HostPSKReporterSettingsPatch](#hostpskreportersettingspatch)
- [HostSettingsNamespace](#hostsettingsnamespace)
- [HostFrequencyPresetsSettingsNamespace](#hostfrequencypresetssettingsnamespace)
- [HostSettingsControl](#hostsettingscontrol)

## HostFT8Settings

- 类型: `interface`
- 源码: [settings.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/settings.ts)

Host-level FT8/FT4 settings that plugins may inspect or adjust when granted
the `settings:ft8` permission.

```ts
export interface HostFT8Settings {
    myCallsign: string;
    myGrid: string;
    frequency: number;
    transmitPower: number;
    autoReply: boolean;
    maxQSOTimeout: number;
    maxSameTransmissionCount: number;
    decodeWhileTransmitting: boolean;
    spectrumWhileTransmitting: boolean;
}
```

### HostFT8Settings.myCallsign

Station callsign used by the digital-mode engine.

```ts

myCallsign: string;

```

### HostFT8Settings.myGrid

Station Maidenhead grid locator.

```ts

myGrid: string;

```

### HostFT8Settings.frequency

Current digital-mode dial frequency in hertz.

```ts

frequency: number;

```

### HostFT8Settings.transmitPower

Configured transmit power in watts.

```ts

transmitPower: number;

```

### HostFT8Settings.autoReply

Whether the Host automatically answers eligible decoded calls.

```ts

autoReply: boolean;

```

### HostFT8Settings.maxQSOTimeout

No-progress receive/transmit cycles before the active QSO times out.

```ts

maxQSOTimeout: number;

```

### HostFT8Settings.maxSameTransmissionCount

Set to 0 to disable the host repeated-transmission guard.

```ts

maxSameTransmissionCount: number;

```

### HostFT8Settings.decodeWhileTransmitting

Whether decoding continues while any operator is transmitting.

```ts

decodeWhileTransmitting: boolean;

```

### HostFT8Settings.spectrumWhileTransmitting

Whether spectrum analysis continues while transmitting.

```ts

spectrumWhileTransmitting: boolean;

```
## HostFT8SettingsPatch

- 类型: `type`
- 源码: [settings.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/settings.ts)

Partial update accepted by `ctx.settings.ft8.update()`.

```ts
export type HostFT8SettingsPatch = Partial<HostFT8Settings>;
```
## HostFrequencyPresetsSettings

- 类型: `interface`
- 源码: [settings.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/settings.ts)

Current frequency preset list and whether it differs from Host defaults.

```ts
export interface HostFrequencyPresetsSettings {
    presets: PresetFrequency[];
    isCustomized: boolean;
}
```

### HostFrequencyPresetsSettings.presets

Presets currently exposed by the Host.

```ts

presets: PresetFrequency[];

```

### HostFrequencyPresetsSettings.isCustomized

`true` when the current list is user- or plugin-customized.

```ts

isCustomized: boolean;

```
## HostStationInfoPatch

- 类型: `type`
- 源码: [settings.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/settings.ts)

Partial station metadata update accepted by the station namespace.

```ts
export type HostStationInfoPatch = Partial<StationInfo>;
```
## HostPSKReporterSettingsPatch

- 类型: `type`
- 源码: [settings.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/settings.ts)

Partial PSK Reporter update accepted by the PSK Reporter namespace.

```ts
export type HostPSKReporterSettingsPatch = Partial<PSKReporterConfig>;
```
## HostSettingsNamespace

- 类型: `interface`
- 源码: [settings.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/settings.ts)

Read/update pair shared by patch- or replacement-based settings namespaces.
The concrete namespace type determines whether `update` is a partial patch or
complete replacement. Host schema validation, normalization or persistence
failures reject the returned Promise.

```ts
export interface HostSettingsNamespace<TValue, TPatch> {
    get(): Promise<TValue>;
    update(patch: TPatch): Promise<TValue>;
}
```

### HostSettingsNamespace.get

Returns the current host setting value for this namespace.

```ts

get(): Promise<TValue>;

```

### HostSettingsNamespace.update

Applies a patch or replacement value and returns the updated value.

```ts

update(patch: TPatch): Promise<TValue>;

```
## HostFrequencyPresetsSettingsNamespace

- 类型: `interface`
- 源码: [settings.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/settings.ts)

Frequency preset namespace with explicit update and reset operations.

```ts
export interface HostFrequencyPresetsSettingsNamespace {
    get(): Promise<HostFrequencyPresetsSettings>;
    update(presets: PresetFrequency[]): Promise<HostFrequencyPresetsSettings>;
    reset(): Promise<HostFrequencyPresetsSettings>;
}
```

### HostFrequencyPresetsSettingsNamespace.get

Returns the current preset list and customization flag.

```ts

get(): Promise<HostFrequencyPresetsSettings>;

```

### HostFrequencyPresetsSettingsNamespace.update

Replaces all presets and returns the normalized Host value.

```ts

update(presets: PresetFrequency[]): Promise<HostFrequencyPresetsSettings>;

```

### HostFrequencyPresetsSettingsNamespace.reset

Restores Host defaults and returns the resulting value.

```ts

reset(): Promise<HostFrequencyPresetsSettings>;

```
## HostSettingsControl

- 类型: `interface`
- 源码: [settings.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/settings.ts)

Permission-gated host settings surface exposed as `ctx.settings`.

Each namespace requires its matching plugin manifest permission, for example
`settings:ft8` for `ctx.settings.ft8`.

```ts
export interface HostSettingsControl {
    readonly ft8: HostSettingsNamespace<HostFT8Settings, HostFT8SettingsPatch>;
    readonly decodeWindows: HostSettingsNamespace<DecodeWindowSettings, DecodeWindowSettings>;
    readonly realtime: HostSettingsNamespace<RealtimeSettings, RealtimeSettings>;
    readonly frequencyPresets: HostFrequencyPresetsSettingsNamespace;
    readonly station: HostSettingsNamespace<StationInfo, HostStationInfoPatch>;
    readonly pskReporter: HostSettingsNamespace<PSKReporterConfig, HostPSKReporterSettingsPatch>;
    readonly ntp: HostSettingsNamespace<NtpServerListSettings, UpdateNtpServerListRequest>;
}
```

### HostSettingsControl.ft8

FT8/FT4 engine settings. Requires `settings:ft8`.

```ts

readonly ft8: HostSettingsNamespace<HostFT8Settings, HostFT8SettingsPatch>;

```

### HostSettingsControl.decodeWindows

Decode window configuration. Requires `settings:decode-windows`.

```ts

readonly decodeWindows: HostSettingsNamespace<DecodeWindowSettings, DecodeWindowSettings>;

```

### HostSettingsControl.realtime

Realtime audio transport configuration. Requires `settings:realtime`.

```ts

readonly realtime: HostSettingsNamespace<RealtimeSettings, RealtimeSettings>;

```

### HostSettingsControl.frequencyPresets

Frequency preset list. Requires `settings:frequency-presets`.

```ts

readonly frequencyPresets: HostFrequencyPresetsSettingsNamespace;

```

### HostSettingsControl.station

Public station metadata. Requires `settings:station`.

```ts

readonly station: HostSettingsNamespace<StationInfo, HostStationInfoPatch>;

```

### HostSettingsControl.pskReporter

PSK Reporter configuration. Requires `settings:psk-reporter`.

```ts

readonly pskReporter: HostSettingsNamespace<PSKReporterConfig, HostPSKReporterSettingsPatch>;

```

### HostSettingsControl.ntp

NTP server list. Requires `settings:ntp`.

```ts

readonly ntp: HostSettingsNamespace<NtpServerListSettings, UpdateNtpServerListRequest>;

```
