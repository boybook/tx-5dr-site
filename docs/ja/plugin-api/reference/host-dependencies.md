# Host Dependencies

Host がロードし、権限を通じて公開する native 依存インターフェースです。

## エクスポート

- [HamlibSupportedRotatorInfo](#hamlibsupportedrotatorinfo)
- [HamlibRotatorConnectionInfo](#hamlibrotatorconnectioninfo)
- [HamlibRotatorPosition](#hamlibrotatorposition)
- [HamlibRotatorStatus](#hamlibrotatorstatus)
- [HamlibRotatorDirection](#hamlibrotatordirection)
- [HamlibRotatorResetType](#hamlibrotatorresettype)
- [HamlibConfigFieldType](#hamlibconfigfieldtype)
- [HamlibConfigFieldDescriptor](#hamlibconfigfielddescriptor)
- [HamlibPortCaps](#hamlibportcaps)
- [HamlibRotatorCaps](#hamlibrotatorcaps)
- [HamlibRotatorConstructor](#hamlibrotatorconstructor)
- [HamlibRotator](#hamlibrotator)
- [HamlibHostDependency](#hamlibhostdependency)
- [HostDependencies](#hostdependencies)

## HamlibSupportedRotatorInfo

- 種別: `interface`
- ソース: [host-dependencies.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/host-dependencies.ts)

Runtime dependencies that are owned and loaded by the TX-5DR host process.

Plugins should use these handles instead of importing host-native packages by
package name. This keeps development, marketplace installs, and packaged
Electron/server deployments on the same module instance and native addon.

One rotator backend reported by the Host-owned Hamlib installation.

```ts
export interface HamlibSupportedRotatorInfo {
    rotModel: number;
    modelName: string;
    mfgName: string;
    version: string;
    status: string;
    rotType: 'azimuth' | 'elevation' | 'azel' | 'other';
    rotTypeMask: number;
}
```

### HamlibSupportedRotatorInfo.rotModel

Hamlib numeric rotator model ID used by the constructor.

```ts

rotModel: number;

```

### HamlibSupportedRotatorInfo.modelName

Human-readable model name.

```ts

modelName: string;

```

### HamlibSupportedRotatorInfo.mfgName

Manufacturer name.

```ts

mfgName: string;

```

### HamlibSupportedRotatorInfo.version

Backend/driver version string.

```ts

version: string;

```

### HamlibSupportedRotatorInfo.status

Hamlib support status label for this backend.

```ts

status: string;

```

### HamlibSupportedRotatorInfo.rotType

Axes supported by the backend.

```ts

rotType: 'azimuth' | 'elevation' | 'azel' | 'other';

```

### HamlibSupportedRotatorInfo.rotTypeMask

Raw Hamlib rotator-type bit mask.

```ts

rotTypeMask: number;

```
## HamlibRotatorConnectionInfo

- 種別: `interface`
- ソース: [host-dependencies.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/host-dependencies.ts)

Current transport/model state of one Host-owned rotator object.

```ts
export interface HamlibRotatorConnectionInfo {
    connectionType: 'serial' | 'network';
    portPath: string;
    isOpen: boolean;
    originalModel: number;
    currentModel: number;
    connected?: boolean;
    actualModel?: number;
}
```

### HamlibRotatorConnectionInfo.connectionType

Serial device or network transport.

```ts

connectionType: 'serial' | 'network';

```

### HamlibRotatorConnectionInfo.portPath

Configured serial path or network endpoint.

```ts

portPath: string;

```

### HamlibRotatorConnectionInfo.isOpen

Whether the wrapper currently owns an open Hamlib handle.

```ts

isOpen: boolean;

```

### HamlibRotatorConnectionInfo.originalModel

Model ID requested by the plugin.

```ts

originalModel: number;

```

### HamlibRotatorConnectionInfo.currentModel

Model ID currently selected after any backend probing.

```ts

currentModel: number;

```

### HamlibRotatorConnectionInfo.connected

Optional communication-health signal from the backend.

```ts

connected?: boolean;

```

### HamlibRotatorConnectionInfo.actualModel

Model ID detected from the connected device, when available.

```ts

actualModel?: number;

```
## HamlibRotatorPosition

- 種別: `interface`
- ソース: [host-dependencies.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/host-dependencies.ts)

Rotator position in degrees.

```ts
export interface HamlibRotatorPosition {
    azimuth: number;
    elevation: number;
}
```

### HamlibRotatorPosition.azimuth

Azimuth in degrees.

```ts

azimuth: number;

```

### HamlibRotatorPosition.elevation

Elevation in degrees.

```ts

elevation: number;

```
## HamlibRotatorStatus

- 種別: `interface`
- ソース: [host-dependencies.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/host-dependencies.ts)

Raw Hamlib status mask plus decoded flag names.

```ts
export interface HamlibRotatorStatus {
    mask: number;
    flags: string[];
}
```

### HamlibRotatorStatus.mask

Raw backend status bit mask.

```ts

mask: number;

```

### HamlibRotatorStatus.flags

Human-readable names for set status bits.

```ts

flags: string[];

```
## HamlibRotatorDirection

- 種別: `type`
- ソース: [host-dependencies.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/host-dependencies.ts)

Direction accepted by `HamlibRotator.move()`; numeric values are raw Hamlib constants.

```ts
export type HamlibRotatorDirection = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'CCW' | 'CW' | 'UP_LEFT' | 'UP_RIGHT' | 'DOWN_LEFT' | 'DOWN_RIGHT' | 'UP_CCW' | 'UP_CW' | 'DOWN_CCW' | 'DOWN_CW' | number;
```
## HamlibRotatorResetType

- 種別: `type`
- ソース: [host-dependencies.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/host-dependencies.ts)

Reset target accepted by Hamlib; `ALL` resets every supported subsystem.

```ts
export type HamlibRotatorResetType = 'ALL' | number;
```
## HamlibConfigFieldType

- 種別: `type`
- ソース: [host-dependencies.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/host-dependencies.ts)

Input renderer hint reported by a Hamlib configuration field.

```ts
export type HamlibConfigFieldType = 'string' | 'number' | 'boolean' | 'select' | 'range' | string;
```
## HamlibConfigFieldDescriptor

- 種別: `interface`
- ソース: [host-dependencies.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/host-dependencies.ts)

Metadata used to render and validate one rotator backend configuration value.

```ts
export interface HamlibConfigFieldDescriptor {
    token: string;
    name: string;
    label: string;
    tooltip?: string;
    defaultValue?: string | number | boolean;
    type: HamlibConfigFieldType;
    min?: number;
    max?: number;
    step?: number;
    options?: Array<{
        label: string;
        value: string | number | boolean;
    }>;
}
```

### HamlibConfigFieldDescriptor.token

Hamlib configuration token passed to `setConf`/`getConf`.

```ts

token: string;

```

### HamlibConfigFieldDescriptor.name

Stable machine-readable field name.

```ts

name: string;

```

### HamlibConfigFieldDescriptor.label

Human-readable field label.

```ts

label: string;

```

### HamlibConfigFieldDescriptor.tooltip

Optional explanatory text.

```ts

tooltip?: string;

```

### HamlibConfigFieldDescriptor.defaultValue

Backend-provided default value.

```ts

defaultValue?: string | number | boolean;

```

### HamlibConfigFieldDescriptor.type

Suggested input renderer.

```ts

type: HamlibConfigFieldType;

```

### HamlibConfigFieldDescriptor.min

Optional numeric lower bound.

```ts

min?: number;

```

### HamlibConfigFieldDescriptor.max

Optional numeric upper bound.

```ts

max?: number;

```

### HamlibConfigFieldDescriptor.step

Optional numeric increment.

```ts

step?: number;

```

### HamlibConfigFieldDescriptor.options

Allowed values for select-like fields.

```ts

options?: Array<{
    label: string;
    value: string | number | boolean;
}>;

```
## HamlibPortCaps

- 種別: `interface`
- ソース: [host-dependencies.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/host-dependencies.ts)

Serial/network timing and framing capabilities reported by a rotator backend.

```ts
export interface HamlibPortCaps {
    portType: string;
    serialRateMin?: number;
    serialRateMax?: number;
    serialDataBits?: number[];
    stopBits?: number[];
    parity?: string[];
    handshake?: string[];
    writeDelay?: number;
    postWriteDelay?: number;
    timeout?: number;
    retry?: number;
}
```

### HamlibPortCaps.portType

Backend port type label.

```ts

portType: string;

```

### HamlibPortCaps.serialRateMin

Minimum supported serial baud rate.

```ts

serialRateMin?: number;

```

### HamlibPortCaps.serialRateMax

Maximum supported serial baud rate.

```ts

serialRateMax?: number;

```

### HamlibPortCaps.serialDataBits

Supported serial data-bit counts.

```ts

serialDataBits?: number[];

```

### HamlibPortCaps.stopBits

Supported serial stop-bit counts.

```ts

stopBits?: number[];

```

### HamlibPortCaps.parity

Supported parity modes.

```ts

parity?: string[];

```

### HamlibPortCaps.handshake

Supported handshaking modes.

```ts

handshake?: string[];

```

### HamlibPortCaps.writeDelay

Recommended pre-write delay in milliseconds.

```ts

writeDelay?: number;

```

### HamlibPortCaps.postWriteDelay

Recommended post-write delay in milliseconds.

```ts

postWriteDelay?: number;

```

### HamlibPortCaps.timeout

Backend operation timeout in milliseconds.

```ts

timeout?: number;

```

### HamlibPortCaps.retry

Recommended retry count.

```ts

retry?: number;

```
## HamlibRotatorCaps

- 種別: `interface`
- ソース: [host-dependencies.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/host-dependencies.ts)

Movement ranges and status features reported by a rotator backend.

```ts
export interface HamlibRotatorCaps {
    rotType: 'azimuth' | 'elevation' | 'azel' | 'other';
    rotTypeMask: number;
    minAz: number;
    maxAz: number;
    minEl: number;
    maxEl: number;
    supportedStatuses: string[];
}
```

### HamlibRotatorCaps.rotType

Axes supported by the backend.

```ts

rotType: 'azimuth' | 'elevation' | 'azel' | 'other';

```

### HamlibRotatorCaps.rotTypeMask

Raw Hamlib rotator-type bit mask.

```ts

rotTypeMask: number;

```

### HamlibRotatorCaps.minAz

Minimum azimuth in degrees.

```ts

minAz: number;

```

### HamlibRotatorCaps.maxAz

Maximum azimuth in degrees.

```ts

maxAz: number;

```

### HamlibRotatorCaps.minEl

Minimum elevation in degrees.

```ts

minEl: number;

```

### HamlibRotatorCaps.maxEl

Maximum elevation in degrees.

```ts

maxEl: number;

```

### HamlibRotatorCaps.supportedStatuses

Status flag names supported by the backend.

```ts

supportedStatuses: string[];

```
## HamlibRotatorConstructor

- 種別: `interface`
- ソース: [host-dependencies.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/host-dependencies.ts)

Host-owned Hamlib Rotator constructor and static discovery helpers.

```ts
export interface HamlibRotatorConstructor {
    new (model: number, port?: string): HamlibRotator;
    getSupportedRotators(): HamlibSupportedRotatorInfo[];
    getHamlibVersion(): string;
    setDebugLevel(level: number): void;
    getCopyright?(): string;
    getLicense?(): string;
}
```

### HamlibRotatorConstructor.(member)

Creates a rotator capability for a model ID and optional port/endpoint.

```ts

new (model: number, port?: string): HamlibRotator;

```

### HamlibRotatorConstructor.getSupportedRotators

Lists rotator backends compiled into the Host's Hamlib build.

```ts

getSupportedRotators(): HamlibSupportedRotatorInfo[];

```

### HamlibRotatorConstructor.getHamlibVersion

Returns the Host's Hamlib version.

```ts

getHamlibVersion(): string;

```

### HamlibRotatorConstructor.setDebugLevel

Sets the process-wide Hamlib debug level.

```ts

setDebugLevel(level: number): void;

```

### HamlibRotatorConstructor.getCopyright

Returns Hamlib copyright text when exposed by the native wrapper.

```ts

getCopyright?(): string;

```

### HamlibRotatorConstructor.getLicense

Returns Hamlib license text when exposed by the native wrapper.

```ts

getLicense?(): string;

```
## HamlibRotator

- 種別: `interface`
- ソース: [host-dependencies.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/host-dependencies.ts)

Live Host-owned rotator capability.

Methods are valid only during a current Host callback and must not be sent
through UI/EventBus/data results. Close/destroy a plugin-opened connection in
an active callback when disabling it; `PluginCleanupContext` does not expose
native Host dependencies, and the Host revokes the capability on unload.

```ts
export interface HamlibRotator {
    open(): Promise<number>;
    close(): Promise<number>;
    destroy(): void;
    getConnectionInfo(): HamlibRotatorConnectionInfo;
    setPosition(azimuth: number, elevation: number): Promise<number>;
    getPosition(): Promise<HamlibRotatorPosition>;
    move(direction: HamlibRotatorDirection, speed: number): Promise<number>;
    stop(): Promise<number>;
    park(): Promise<number>;
    reset(resetType: HamlibRotatorResetType): Promise<number>;
    getInfo(): Promise<string>;
    getStatus(): Promise<HamlibRotatorStatus>;
    setConf(name: string, value: string): Promise<number>;
    getConf(name: string): Promise<string>;
    getConfigSchema(): HamlibConfigFieldDescriptor[];
    getPortCaps(): HamlibPortCaps;
    getRotatorCaps(): HamlibRotatorCaps;
    setLevel(level: string, value: number): Promise<number>;
    getLevel(level: string): Promise<number>;
    getSupportedLevels(): string[];
    setFunction(func: string, enable: boolean): Promise<number>;
    getFunction(func: string): Promise<boolean>;
    getSupportedFunctions(): string[];
    setParm(parm: string, value: number): Promise<number>;
    getParm(parm: string): Promise<number>;
    getSupportedParms(): string[];
}
```

### HamlibRotator.open

Opens the configured backend and returns the native Hamlib result code.

```ts

open(): Promise<number>;

```

### HamlibRotator.close

Closes the backend and returns the native Hamlib result code.

```ts

close(): Promise<number>;

```

### HamlibRotator.destroy

Releases native wrapper resources after close.

```ts

destroy(): void;

```

### HamlibRotator.getConnectionInfo

Returns current transport and model-selection state.

```ts

getConnectionInfo(): HamlibRotatorConnectionInfo;

```

### HamlibRotator.setPosition

Commands an absolute azimuth/elevation position in degrees.

```ts

setPosition(azimuth: number, elevation: number): Promise<number>;

```

### HamlibRotator.getPosition

Reads the current azimuth/elevation position in degrees.

```ts

getPosition(): Promise<HamlibRotatorPosition>;

```

### HamlibRotator.move

Starts continuous motion in a direction at a backend-specific speed.

```ts

move(direction: HamlibRotatorDirection, speed: number): Promise<number>;

```

### HamlibRotator.stop

Stops current movement.

```ts

stop(): Promise<number>;

```

### HamlibRotator.park

Moves to the backend-defined park position.

```ts

park(): Promise<number>;

```

### HamlibRotator.reset

Resets the requested subsystem.

```ts

reset(resetType: HamlibRotatorResetType): Promise<number>;

```

### HamlibRotator.getInfo

Returns backend-specific informational text.

```ts

getInfo(): Promise<string>;

```

### HamlibRotator.getStatus

Reads raw and decoded rotator status flags.

```ts

getStatus(): Promise<HamlibRotatorStatus>;

```

### HamlibRotator.setConf

Writes one Hamlib configuration token.

```ts

setConf(name: string, value: string): Promise<number>;

```

### HamlibRotator.getConf

Reads one Hamlib configuration token.

```ts

getConf(name: string): Promise<string>;

```

### HamlibRotator.getConfigSchema

Returns descriptors for backend configuration fields.

```ts

getConfigSchema(): HamlibConfigFieldDescriptor[];

```

### HamlibRotator.getPortCaps

Returns backend transport capabilities.

```ts

getPortCaps(): HamlibPortCaps;

```

### HamlibRotator.getRotatorCaps

Returns movement-range and status capabilities.

```ts

getRotatorCaps(): HamlibRotatorCaps;

```

### HamlibRotator.setLevel

Writes a numeric Hamlib level.

```ts

setLevel(level: string, value: number): Promise<number>;

```

### HamlibRotator.getLevel

Reads a numeric Hamlib level.

```ts

getLevel(level: string): Promise<number>;

```

### HamlibRotator.getSupportedLevels

Lists supported level names.

```ts

getSupportedLevels(): string[];

```

### HamlibRotator.setFunction

Enables or disables a named Hamlib function.

```ts

setFunction(func: string, enable: boolean): Promise<number>;

```

### HamlibRotator.getFunction

Reads a named Hamlib function state.

```ts

getFunction(func: string): Promise<boolean>;

```

### HamlibRotator.getSupportedFunctions

Lists supported function names.

```ts

getSupportedFunctions(): string[];

```

### HamlibRotator.setParm

Writes a numeric Hamlib parameter.

```ts

setParm(parm: string, value: number): Promise<number>;

```

### HamlibRotator.getParm

Reads a numeric Hamlib parameter.

```ts

getParm(parm: string): Promise<number>;

```

### HamlibRotator.getSupportedParms

Lists supported parameter names.

```ts

getSupportedParms(): string[];

```
## HamlibHostDependency

- 種別: `interface`
- ソース: [host-dependencies.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/host-dependencies.ts)

Host-provided Hamlib surface exposed by the `host:hamlib` permission.

```ts
export interface HamlibHostDependency {
    Rotator: HamlibRotatorConstructor;
    PASSBAND: {
        NORMAL: 0;
        NOCHANGE: -1;
    };
}
```

### HamlibHostDependency.Rotator

Guarded Rotator constructor and static helpers.

```ts

Rotator: HamlibRotatorConstructor;

```

### HamlibHostDependency.PASSBAND

Common passband constants exported by the Host's Hamlib wrapper.

```ts

PASSBAND: {
    NORMAL: 0;
    NOCHANGE: -1;
};

```
## HostDependencies

- 種別: `interface`
- ソース: [host-dependencies.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/host-dependencies.ts)

Optional native dependencies supplied by the Host instead of plugin imports.

```ts
export interface HostDependencies {
    readonly hamlib?: HamlibHostDependency;
}
```

### HostDependencies.hamlib

Host-owned node-hamlib Rotator surface. Requires the `host:hamlib` plugin permission.

```ts

readonly hamlib?: HamlibHostDependency;

```
