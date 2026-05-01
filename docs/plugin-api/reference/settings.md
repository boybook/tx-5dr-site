# Host Settings

该页列出 `ctx.settings` 可访问的宿主设置命名空间与类型。

> 自动生成自 `../tx-5dr/packages/plugin-api/src/settings.ts`

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

- Kind: `interface`
- Source: [settings.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/settings.ts)

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
  /** Set to 0 to disable the host repeated-transmission guard. */
  maxSameTransmissionCount: number;
  decodeWhileTransmitting: boolean;
  spectrumWhileTransmitting: boolean;
}
```

## 成员

### myCallsign

未提供额外注释。

```ts

myCallsign: string;

```

### myGrid

未提供额外注释。

```ts

myGrid: string;

```

### frequency

未提供额外注释。

```ts

frequency: number;

```

### transmitPower

未提供额外注释。

```ts

transmitPower: number;

```

### autoReply

未提供额外注释。

```ts

autoReply: boolean;

```

### maxQSOTimeout

未提供额外注释。

```ts

maxQSOTimeout: number;

```

### maxSameTransmissionCount

Set to 0 to disable the host repeated-transmission guard.

```ts

maxSameTransmissionCount: number;

```

### decodeWhileTransmitting

未提供额外注释。

```ts

decodeWhileTransmitting: boolean;

```

### spectrumWhileTransmitting

未提供额外注释。

```ts

spectrumWhileTransmitting: boolean;

```
## HostFT8SettingsPatch

- Kind: `type`
- Source: [settings.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/settings.ts)

未提供额外注释。

```ts
export type HostFT8SettingsPatch = Partial<HostFT8Settings>;
```
## HostFrequencyPresetsSettings

- Kind: `interface`
- Source: [settings.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/settings.ts)

未提供额外注释。

```ts
export interface HostFrequencyPresetsSettings {
  presets: PresetFrequency[];
  isCustomized: boolean;
}
```

## 成员

### presets

未提供额外注释。

```ts

presets: PresetFrequency[];

```

### isCustomized

未提供额外注释。

```ts

isCustomized: boolean;

```
## HostStationInfoPatch

- Kind: `type`
- Source: [settings.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/settings.ts)

未提供额外注释。

```ts
export type HostStationInfoPatch = Partial<StationInfo>;
```
## HostPSKReporterSettingsPatch

- Kind: `type`
- Source: [settings.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/settings.ts)

未提供额外注释。

```ts
export type HostPSKReporterSettingsPatch = Partial<PSKReporterConfig>;
```
## HostSettingsNamespace

- Kind: `interface`
- Source: [settings.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/settings.ts)

未提供额外注释。

```ts
export interface HostSettingsNamespace<TValue, TPatch> {
  /** Returns the current host setting value for this namespace. */
  get(): Promise<TValue>;
  /** Applies a patch or replacement value and returns the updated value. */
  update(patch: TPatch): Promise<TValue>;
}
```

## 成员

### get

Returns the current host setting value for this namespace.

```ts

get(): Promise<TValue>;

```

### update

Applies a patch or replacement value and returns the updated value.

```ts

update(patch: TPatch): Promise<TValue>;

```
## HostFrequencyPresetsSettingsNamespace

- Kind: `interface`
- Source: [settings.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/settings.ts)

未提供额外注释。

```ts
export interface HostFrequencyPresetsSettingsNamespace {
  get(): Promise<HostFrequencyPresetsSettings>;
  update(presets: PresetFrequency[]): Promise<HostFrequencyPresetsSettings>;
  reset(): Promise<HostFrequencyPresetsSettings>;
}
```

## 成员

### get

未提供额外注释。

```ts

get(): Promise<HostFrequencyPresetsSettings>;

```

### update

未提供额外注释。

```ts

update(presets: PresetFrequency[]): Promise<HostFrequencyPresetsSettings>;

```

### reset

未提供额外注释。

```ts

reset(): Promise<HostFrequencyPresetsSettings>;

```
## HostSettingsControl

- Kind: `interface`
- Source: [settings.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/settings.ts)

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

## 成员

### ft8

未提供额外注释。

```ts

readonly ft8: HostSettingsNamespace<HostFT8Settings, HostFT8SettingsPatch>;

```

### decodeWindows

未提供额外注释。

```ts

readonly decodeWindows: HostSettingsNamespace<DecodeWindowSettings, DecodeWindowSettings>;

```

### realtime

未提供额外注释。

```ts

readonly realtime: HostSettingsNamespace<RealtimeSettings, RealtimeSettings>;

```

### frequencyPresets

未提供额外注释。

```ts

readonly frequencyPresets: HostFrequencyPresetsSettingsNamespace;

```

### station

未提供额外注释。

```ts

readonly station: HostSettingsNamespace<StationInfo, HostStationInfoPatch>;

```

### pskReporter

未提供额外注释。

```ts

readonly pskReporter: HostSettingsNamespace<PSKReporterConfig, HostPSKReporterSettingsPatch>;

```

### ntp

未提供额外注释。

```ts

readonly ntp: HostSettingsNamespace<NtpServerListSettings, UpdateNtpServerListRequest>;

```
