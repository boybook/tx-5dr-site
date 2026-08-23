# Contracts Re-exports

Contract types and values re-exported by `@tx5dr/plugin-api`.

## Type exports

- [FT8Message](#ft8message)
- [FT8MessageBase](#ft8messagebase)
- [FT8MessageCQ](#ft8messagecq)
- [FT8MessageCall](#ft8messagecall)
- [FT8MessageSignalReport](#ft8messagesignalreport)
- [FT8MessageRogerReport](#ft8messagerogerreport)
- [FT8MessageRRR](#ft8messagerrr)
- [FT8MessageSeventyThree](#ft8messageseventythree)
- [FT8MessageFoxRR73](#ft8messagefoxrr73)
- [FT8MessageCustom](#ft8messagecustom)
- [FT8MessageUnknown](#ft8messageunknown)
- [ParsedFT8Message](#parsedft8message)
- [LogbookAnalysis](#logbookanalysis)
- [SlotInfo](#slotinfo)
- [SlotPack](#slotpack)
- [FrequencyState](#frequencystate)
- [QSORecord](#qsorecord)
- [FrameMessage](#framemessage)
- [ModeDescriptor](#modedescriptor)
- [OperatorSlots](#operatorslots)
- [DxccStatus](#dxccstatus)
- [TargetSelectionPriorityMode](#targetselectionprioritymode)
- [PluginType](#plugintype)
- [PluginInstanceScope](#plugininstancescope)
- [PluginPermission](#pluginpermission)
- [PluginSettingType](#pluginsettingtype)
- [PluginSettingDescriptor](#pluginsettingdescriptor)
- [PluginSettingScope](#pluginsettingscope)
- [PluginQuickAction](#pluginquickaction)
- [PluginQuickSetting](#pluginquicksetting)
- [PluginCapability](#plugincapability)
- [PluginPanelDescriptor](#pluginpaneldescriptor)
- [PluginPanelComponent](#pluginpanelcomponent)
- [PluginPanelWidth](#pluginpanelwidth)
- [PluginPanelOpenMode](#pluginpanelopenmode)
- [PluginPanelUISize](#pluginpaneluisize)
- [PluginUIPanelContributionGroup](#pluginuipanelcontributiongroup)
- [PluginUIPanelContributionTarget](#pluginuipanelcontributiontarget)
- [PluginObjectArrayField](#pluginobjectarrayfield)
- [PluginKeyedStringArrayKey](#pluginkeyedstringarraykey)
- [PluginSettingCondition](#pluginsettingcondition)
- [PluginSettingConditionalDescription](#pluginsettingconditionaldescription)
- [PluginSettingOption](#pluginsettingoption)
- [PluginStorageScope](#pluginstoragescope)
- [PluginStorageConfig](#pluginstorageconfig)
- [PluginManifest](#pluginmanifest)
- [PluginStatus](#pluginstatus)
- [PluginUIPageDescriptor](#pluginuipagedescriptor)
- [PluginUIConfig](#pluginuiconfig)
- [CapabilityList](#capabilitylist)
- [CapabilityState](#capabilitystate)
- [CapabilityDescriptor](#capabilitydescriptor)
- [CapabilityValue](#capabilityvalue)
- [WriteCapabilityPayload](#writecapabilitypayload)
- [RadioPowerRequest](#radiopowerrequest)
- [RadioPowerResponse](#radiopowerresponse)
- [RadioPowerState](#radiopowerstate)
- [RadioPowerStateEvent](#radiopowerstateevent)
- [RadioPowerSupportInfo](#radiopowersupportinfo)
- [RadioPowerTarget](#radiopowertarget)
- [DecodeWindowSettings](#decodewindowsettings)
- [RealtimeSettings](#realtimesettings)
- [RealtimeSettingsResponseData](#realtimesettingsresponsedata)
- [PresetFrequency](#presetfrequency)
- [StationInfo](#stationinfo)
- [PSKReporterConfig](#pskreporterconfig)
- [NtpServerListSettings](#ntpserverlistsettings)
- [UpdateNtpServerListRequest](#updatentpserverlistrequest)

## Value exports


## FT8Message

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageSchema`

Union of every structured FT8 message variant recognized by TX-5DR.

### Data structure

```ts
export const FT8MessageSchema = z.discriminatedUnion('type', [
    FT8MessageCQSchema,
    FT8MessageCallSchema,
    FT8MessageSignalReportSchema,
    FT8MessageRogerReportSchema,
    FT8MessageRRRSchema,
    FT8MessageSeventyThreeSchema,
    FT8MessageFoxRR73Schema,
    FT8MessageCustomSchema,
    FT8MessageUnknownSchema,
]);
```

### Type declaration

```ts
export type FT8Message = z.infer<typeof FT8MessageSchema>;
```
## FT8MessageBase

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageBaseSchema`

Base FT8 message type containing only the discriminant field.

### Data structure

```ts
export const FT8MessageBaseSchema = z.object({
    type: FT8MessageTypeSchema,
});
```

### Type declaration

```ts
export type FT8MessageBase = z.infer<typeof FT8MessageBaseSchema>;
```
## FT8MessageCQ

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageCQSchema`

Structured CQ message with sender identity and optional grid/modifier metadata.

### Data structure

```ts
export const FT8MessageCQSchema = FT8MessageBaseSchema.extend({
    type: z.literal('cq'),
    senderCallsign: z.string(),
    flag: z.string().optional(),
    grid: z.string().optional(),
});
```

### Type declaration

```ts
export type FT8MessageCQ = z.infer<typeof FT8MessageCQSchema>;
```
## FT8MessageCall

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageCallSchema`

Structured directed-call message between a sender and a target station.

### Data structure

```ts
export const FT8MessageCallSchema = FT8MessageBaseSchema.extend({
    type: z.literal('call'),
    senderCallsign: z.string(),
    targetCallsign: z.string(),
    grid: z.string().optional(),
});
```

### Type declaration

```ts
export type FT8MessageCall = z.infer<typeof FT8MessageCallSchema>;
```
## FT8MessageSignalReport

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageSignalReportSchema`

Structured signal-report exchange message carrying a numeric report.

### Data structure

```ts
export const FT8MessageSignalReportSchema = FT8MessageBaseSchema.extend({
    type: z.literal('signal_report'),
    senderCallsign: z.string(),
    targetCallsign: z.string(),
    report: z.number(),
});
```

### Type declaration

```ts
export type FT8MessageSignalReport = z.infer<typeof FT8MessageSignalReportSchema>;
```
## FT8MessageRogerReport

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageRogerReportSchema`

Structured "roger + report" exchange message.

### Data structure

```ts
export const FT8MessageRogerReportSchema = FT8MessageBaseSchema.extend({
    type: z.literal('roger_report'),
    senderCallsign: z.string(),
    targetCallsign: z.string(),
    report: z.number(),
});
```

### Type declaration

```ts
export type FT8MessageRogerReport = z.infer<typeof FT8MessageRogerReportSchema>;
```
## FT8MessageRRR

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageRRRSchema`

Structured `RRR` completion/acknowledgement message.

### Data structure

```ts
export const FT8MessageRRRSchema = FT8MessageBaseSchema.extend({
    type: z.literal('rrr'),
    senderCallsign: z.string(),
    targetCallsign: z.string(),
});
```

### Type declaration

```ts
export type FT8MessageRRR = z.infer<typeof FT8MessageRRRSchema>;
```
## FT8MessageSeventyThree

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageSeventyThreeSchema`

Structured final `73` closing message.

### Data structure

```ts
export const FT8MessageSeventyThreeSchema = FT8MessageBaseSchema.extend({
    type: z.literal('73'),
    senderCallsign: z.string(),
    targetCallsign: z.string(),
});
```

### Type declaration

```ts
export type FT8MessageSeventyThree = z.infer<typeof FT8MessageSeventyThreeSchema>;
```
## FT8MessageFoxRR73

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageFoxRR73Schema`

Structured Fox/Hound `RR73` completion-and-invite message.

### Data structure

```ts
export const FT8MessageFoxRR73Schema = FT8MessageBaseSchema.extend({
    type: z.literal('fox_rr73'),
    senderCallsign: z.string().optional(),
    completedCallsign: z.string(),
    nextCallsign: z.string(),
    foxHash: z.string().optional(),
    snrForNext: z.number().optional(),
});
```

### Type declaration

```ts
export type FT8MessageFoxRR73 = z.infer<typeof FT8MessageFoxRR73Schema>;
```
## FT8MessageCustom

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageCustomSchema`

Structured custom FT8 message whose payload is intentionally not further
parsed by the core parser.

### Data structure

```ts
export const FT8MessageCustomSchema = FT8MessageBaseSchema.extend({
    type: z.literal('custom'),
});
```

### Type declaration

```ts
export type FT8MessageCustom = z.infer<typeof FT8MessageCustomSchema>;
```
## FT8MessageUnknown

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageUnknownSchema`

Structured fallback FT8 message for unclassified decoder output.

### Data structure

```ts
export const FT8MessageUnknownSchema = FT8MessageBaseSchema.extend({
    type: z.literal('unknown'),
});
```

### Type declaration

```ts
export type FT8MessageUnknown = z.infer<typeof FT8MessageUnknownSchema>;
```
## ParsedFT8Message

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `ParsedFT8MessageSchema`

Primary plugin-facing FT8 decode model.

Prefer this type when filtering targets, scoring candidates or reacting to
decoded traffic in plugin hooks.

### Data structure

```ts
export const ParsedFT8MessageSchema = z.object({
    snr: z.number(),
    dt: z.number(),
    df: z.number(),
    rawMessage: z.string(),
    message: FT8MessageSchema,
    slotId: z.string(),
    timestamp: z.number(),
    isPartialDecode: z.boolean().optional(),
    logbookAnalysis: LogbookAnalysisSchema.optional(),
});
```

### Type declaration

```ts
export type ParsedFT8Message = z.infer<typeof ParsedFT8MessageSchema>;
```
## LogbookAnalysis

- Kind: `type`
- Source: [schema/slot-info.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/slot-info.schema.ts)
- Related schema: `LogbookAnalysisSchema`

Logbook-derived enrichment attached to a decoded message when available.

### Data structure

```ts
export const LogbookAnalysisSchema = z.object({
    isNewCallsign: z.boolean().optional(),
    isNewDxccEntity: z.boolean().optional(),
    isNewBandDxccEntity: z.boolean().optional(),
    isConfirmedDxcc: z.boolean().optional(),
    isNewGrid: z.boolean().optional(),
    callsign: z.string().optional(),
    grid: z.string().optional(),
    prefix: z.string().optional(),
    state: z.string().optional(),
    stateConfidence: SubdivisionConfidenceSchema.optional(),
    dxccId: z.number().int().positive().optional(),
    dxccEntity: z.string().optional(),
    dxccStatus: DxccStatusSchema.optional(),
});
```

### Type declaration

```ts
export type LogbookAnalysis = z.infer<typeof LogbookAnalysisSchema>;
```
## SlotInfo

- Kind: `type`
- Source: [schema/slot-info.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/slot-info.schema.ts)
- Related schema: `SlotInfoSchema`

Timing and identity of one FT8/FT4 receive or transmit slot.

`startMs` is the calibrated Unix epoch start in milliseconds; `phaseMs` is
elapsed time inside the slot; `driftMs` is the clock correction; `cycleNumber`
is the absolute slot index (use modulo two for even/odd); and `utcSeconds` is
the integer epoch-second form used for display and logs.

### Data structure

```ts
export const SlotInfoSchema = z.object({
    id: z.string(),
    startMs: z.number(),
    phaseMs: z.number(),
    driftMs: z.number().default(0),
    cycleNumber: z.number(),
    utcSeconds: z.number(),
    mode: z.string()
});
```

### Type declaration

```ts
export type SlotInfo = z.infer<typeof SlotInfoSchema>;
```
## SlotPack

- Kind: `type`
- Source: [schema/slot-info.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/slot-info.schema.ts)
- Related schema: `SlotPackSchema`

Deduplicated best-frame collection for one slot, including decode statistics,
history and the dial-frequency context captured when the slot began.
`startMs`, `endMs` and history timestamps use Unix epoch milliseconds.

### Data structure

```ts
export const SlotPackSchema = z.object({
    slotId: z.string(),
    startMs: z.number(),
    endMs: z.number(),
    frames: z.array(FrameMessageSchema),
    stats: z.object({
        totalDecodes: z.number().default(0),
        successfulDecodes: z.number().default(0),
        totalFramesBeforeDedup: z.number().default(0),
        totalFramesAfterDedup: z.number().default(0),
        lastUpdated: z.number().default(() => Date.now()),
        updateSeq: z.number().int().nonnegative().optional()
    }).default({}),
    decodeHistory: z.array(z.object({
        windowIdx: z.number(),
        timestamp: z.number(),
        frameCount: z.number(),
        processingTimeMs: z.number()
    })).default([]),
    frequencyContext: SlotPackFrequencyContextSchema.optional()
});
```

### Type declaration

```ts
export type SlotPack = z.infer<typeof SlotPackSchema>;
```
## FrequencyState

- Kind: `type`
- Source: [schema/websocket.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/websocket.schema.ts)
- Related schema: `FrequencyStateSchema`

Current dial-frequency projection broadcast to plugins and clients.

`frequency` is RF dial frequency in hertz; `mode` is the TX-5DR engine mode;
`band` and `description` are display labels; `radioMode` is the underlying
modulation when known. `source` distinguishes application changes from
updates reported by the radio.

### Data structure

```ts
export const FrequencyStateSchema = z.object({
    frequency: z.number(),
    mode: z.string(),
    band: z.string(),
    description: z.string(),
    radioMode: z.string().optional(),
    radioConnected: z.boolean(),
    source: z.enum(['program', 'radio']).optional(),
});
```

### Type declaration

```ts
export type FrequencyState = z.infer<typeof FrequencyStateSchema>;
```
## QSORecord

- Kind: `type`
- Source: [schema/qso.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/qso.schema.ts)
- Related schema: `QSORecordSchema`

Canonical persisted QSO record used by TX-5DR logbooks and plugin hooks.

Plugin authors will most commonly encounter this in completion hooks and
logbook queries.

### Data structure

```ts
export const QSORecordSchema = z.object({
    id: z.string(),
    callsign: z.string(),
    grid: z.string().optional(),
    frequency: z.number(),
    mode: z.string(),
    submode: z.string().optional(),
    startTime: z.number(),
    endTime: z.number().optional(),
    reportSent: z.string().optional(),
    reportReceived: z.string().optional(),
    messageHistory: z.array(z.string()),
    comment: z.string().optional(),
    myCallsign: z.string().optional(),
    myGrid: z.string().optional(),
    qth: z.string().optional(),
    dxccId: z.number().int().positive().optional(),
    dxccEntity: z.string().optional(),
    dxccStatus: DxccStatusSchema.optional(),
    countryCode: z.string().optional(),
    cqZone: z.number().int().positive().optional(),
    ituZone: z.number().int().positive().optional(),
    dxccSource: DxccSourceSchema.optional(),
    dxccConfidence: DxccConfidenceSchema.optional(),
    dxccResolvedAt: z.number().optional(),
    dxccResolverVersion: z.string().optional(),
    dxccNeedsReview: z.boolean().optional(),
    stationLocationId: z.string().optional(),
    myDxccId: z.number().int().positive().optional(),
    myCqZone: z.number().int().positive().optional(),
    myItuZone: z.number().int().positive().optional(),
    myState: z.string().optional(),
    myCounty: z.string().optional(),
    myIota: z.string().optional(),
    lotwQslSent: QslSentStatusSchema,
    lotwQslReceived: QslReceivedStatusSchema,
    lotwQslSentDate: z.number().optional(),
    lotwQslReceivedDate: z.number().optional(),
    qrzQslSent: QslSimpleStatusSchema,
    qrzQslReceived: QslSimpleStatusSchema,
    qrzQslSentDate: z.number().optional(),
    qrzQslReceivedDate: z.number().optional(),
    notes: z.string().optional(),
});
```

### Type declaration

```ts
export type QSORecord = z.infer<typeof QSORecordSchema>;
```
## FrameMessage

- Kind: `type`
- Source: [schema/slot-info.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/slot-info.schema.ts)
- Related schema: `FrameMessageSchema`

Original decoder frame with RF metrics and unparsed message text.
`snr` is dB, `freq` is audio offset in hertz, `dt` is seconds, and
`confidence` is normalized to 0..1.

### Data structure

```ts
export const FrameMessageSchema = z.object({
    snr: z.number(),
    freq: z.number(),
    dt: z.number(),
    message: z.string(),
    confidence: z.number().min(0).max(1).default(1.0),
    logbookAnalysis: LogbookAnalysisSchema.optional(),
    operatorId: z.string().optional()
});
```

### Type declaration

```ts
export type FrameMessage = z.infer<typeof FrameMessageSchema>;
```
## ModeDescriptor

- Kind: `type`
- Source: [schema/mode.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/mode.schema.ts)
- Related schema: `ModeDescriptorSchema`

Timing, decoder and display parameters for a digital mode such as FT8 or FT4.

### Data structure

```ts
export const ModeDescriptorSchema = z.object({
    name: z.string(),
    slotMs: z.number().nonnegative(),
    toleranceMs: z.number().nonnegative().default(100),
    windowTiming: z.array(z.number()),
    transmitTiming: z.number().nonnegative(),
    encodeAdvance: z.number().nonnegative().default(400)
});
```

### Type declaration

```ts
export type ModeDescriptor = z.infer<typeof ModeDescriptorSchema>;
```
## OperatorSlots

- Kind: `type`
- Source: [schema/transmission.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/transmission.schema.ts)
- Related schema: `OperatorSlotsSchema`

Transmit-message templates for the six logical slots of one operator.

### Data structure

```ts
export const OperatorSlotsSchema = z.object({
    TX1: z.string().optional(),
    TX2: z.string().optional(),
    TX3: z.string().optional(),
    TX4: z.string().optional(),
    TX5: z.string().optional(),
    TX6: z.string().optional(),
});
```

### Type declaration

```ts
export type OperatorSlots = z.infer<typeof OperatorSlotsSchema>;
```
## DxccStatus

- Kind: `type`
- Source: [schema/qso.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/qso.schema.ts)
- Related schema: `DxccStatusSchema`

Current work status of a resolved DXCC entity in local logbook context.

### Data structure

```ts
export const DxccStatusSchema = z.enum([
    'current',
    'deleted',
    'none',
    'unknown',
]);
```

### Type declaration

```ts
export type DxccStatus = z.infer<typeof DxccStatusSchema>;
```
## TargetSelectionPriorityMode

- Kind: `type`
- Source: [schema/qso.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/qso.schema.ts)
- Related schema: `TargetSelectionPriorityModeSchema`

Candidate-ranking policy used when choosing which station to answer first.

### Data structure

```ts
export const TargetSelectionPriorityModeSchema = z.enum([
    'balanced',
    'dxcc_first',
    'new_callsign_first',
]);
```

### Type declaration

```ts
export type TargetSelectionPriorityMode = z.infer<typeof TargetSelectionPriorityModeSchema>;
```
## PluginType

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginTypeSchema`

High-level plugin category used by manifests and runtime status objects.

### Data structure

```ts
export const PluginTypeSchema = z.enum(['strategy', 'utility']);
```

### Type declaration

```ts
export type PluginType = z.infer<typeof PluginTypeSchema>;
```
## PluginInstanceScope

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginInstanceScopeSchema`

Runtime instance scope for a plugin.

### Data structure

```ts
export const PluginInstanceScopeSchema = z.enum(['operator', 'global']);
```

### Type declaration

```ts
export type PluginInstanceScope = z.infer<typeof PluginInstanceScopeSchema>;
```
## PluginPermission

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginPermissionSchema`

Explicit permission declarations requested by a plugin.

### Data structure

```ts
export const PluginPermissionSchema = z.enum([
    'network',
    'plugin:event-bus',
    'host:hamlib',
    'operator:transmit-control',
    'radio:read',
    'radio:control',
    'radio:tuner-control',
    'radio:power',
    'logbook:read',
    'logbook:write',
    'logbook:sync',
    'settings:ft8',
    'settings:decode-windows',
    'settings:realtime',
    'settings:frequency-presets',
    'settings:station',
    'settings:psk-reporter',
    'settings:ntp',
]);
```

### Type declaration

```ts
export type PluginPermission = z.infer<typeof PluginPermissionSchema>;
```
## PluginSettingType

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginSettingTypeSchema`

Supported generated-form field types for plugin settings.

### Data structure

```ts
export const PluginSettingTypeSchema = z.enum([
    'boolean',
    'number',
    'string',
    'string[]',
    'object[]',
    'keyedStringArrays',
    'keyedObjectArrays',
    'keyedObjects',
    'info',
]);
```

### Type declaration

```ts
export type PluginSettingType = z.infer<typeof PluginSettingTypeSchema>;
```
## PluginSettingDescriptor

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginSettingDescriptorSchema`

Declarative description of a persisted plugin setting.

`default` is the resolved fallback value, `label`/`description` power the UI,
`min` and `max` constrain numeric fields, `options` enumerates valid choices
for select-like inputs, and `scope` controls whether the value is shared or
operator-specific.

### Data structure

```ts
export const PluginSettingDescriptorSchema = z.object({
    type: PluginSettingTypeSchema,
    default: z.unknown(),
    label: z.string(),
    description: z.string().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    options: z.array(PluginSettingOptionSchema).optional(),
    itemFields: z.array(PluginObjectArrayFieldSchema).optional(),
    keys: z.array(PluginKeyedStringArrayKeySchema).optional(),
    visibleWhen: PluginSettingConditionSchema.optional(),
    descriptionWhen: z.array(PluginSettingConditionalDescriptionSchema).optional(),
    hidden: z.boolean().optional(),
    scope: PluginSettingScopeSchema.optional().default('global'),
});
```

### Type declaration

```ts
export type PluginSettingDescriptor = z.infer<typeof PluginSettingDescriptorSchema>;
```
## PluginSettingScope

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginSettingScopeSchema`

Persistence and UI scope for a plugin setting.

### Data structure

```ts
export const PluginSettingScopeSchema = z.enum(['global', 'operator']);
```

### Type declaration

```ts
export type PluginSettingScope = z.infer<typeof PluginSettingScopeSchema>;
```
## PluginQuickAction

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginQuickActionSchema`

Declarative quick-action button shown in operator-facing plugin UI.

### Data structure

```ts
export const PluginQuickActionSchema = z.object({
    id: z.string(),
    label: z.string(),
    icon: z.string().optional(),
});
```

### Type declaration

```ts
export type PluginQuickAction = z.infer<typeof PluginQuickActionSchema>;
```
## PluginQuickSetting

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginQuickSettingSchema`

Shortcut reference to an operator-scope setting that should be surfaced in a
compact quick-settings panel.

### Data structure

```ts
export const PluginQuickSettingSchema = z.object({
    settingKey: z.string(),
});
```

### Type declaration

```ts
export type PluginQuickSetting = z.infer<typeof PluginQuickSettingSchema>;
```
## PluginCapability

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginCapabilitySchema`

Host-derived capability tags exposed to the frontend.

### Data structure

```ts
export const PluginCapabilitySchema = z.enum([
    'auto_call_control',
    'auto_call_candidate',
    'auto_call_execution',
]);
```

### Type declaration

```ts
export type PluginCapability = z.infer<typeof PluginCapabilitySchema>;
```
## PluginPanelDescriptor

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginPanelDescriptorSchema`

Declarative definition of a plugin-owned panel in the frontend.

### Data structure

```ts
export const PluginPanelDescriptorSchema = z.object({
    id: z.string(),
    title: z.string(),
    component: PluginPanelComponentSchema,
    pageId: z.string().optional(),
    params: z.record(z.string(), z.string()).optional(),
    slot: PluginPanelSlotSchema.optional(),
    width: PluginPanelWidthSchema.optional(),
    icon: z.string().optional(),
    openMode: PluginPanelOpenModeSchema.optional(),
    uiSize: PluginPanelUISizeSchema.optional(),
}).superRefine((panel, ctx) => {
    if (panel.slot !== 'radio-control-toolbar') {
        return;
    }
    if (panel.component !== 'iframe') {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['component'],
            message: 'radio-control-toolbar panels must use iframe component',
        });
    }
    if (!panel.pageId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['pageId'],
            message: 'radio-control-toolbar panels must declare pageId',
        });
    }
});
```

### Type declaration

```ts
export type PluginPanelDescriptor = z.infer<typeof PluginPanelDescriptorSchema>;
```
## PluginPanelComponent

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginPanelComponentSchema`

Built-in frontend renderer kinds supported by declarative plugin panels.

### Data structure

```ts
export const PluginPanelComponentSchema = z.enum(['table', 'key-value', 'chart', 'log', 'iframe']);
```

### Type declaration

```ts
export type PluginPanelComponent = z.infer<typeof PluginPanelComponentSchema>;
```
## PluginPanelWidth

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginPanelWidthSchema`

Preferred width hint for plugin-owned panels.

### Data structure

```ts
export const PluginPanelWidthSchema = z.enum(['half', 'full']);
```

### Type declaration

```ts
export type PluginPanelWidth = z.infer<typeof PluginPanelWidthSchema>;
```
## PluginPanelOpenMode

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginPanelOpenModeSchema`

How an iframe panel is opened when rendered as a toolbar entry.

### Data structure

```ts
export const PluginPanelOpenModeSchema = z.enum(['popover', 'modal']);
```

### Type declaration

```ts
export type PluginPanelOpenMode = z.infer<typeof PluginPanelOpenModeSchema>;
```
## PluginPanelUISize

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginPanelUISizeSchema`

Controlled size hint for iframe panels rendered as popovers or modals.

### Data structure

```ts
export const PluginPanelUISizeSchema = z.enum(['sm', 'md', 'lg']);
```

### Type declaration

```ts
export type PluginPanelUISize = z.infer<typeof PluginPanelUISizeSchema>;
```
## PluginUIPanelContributionGroup

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginUIPanelContributionGroupSchema`

A normalized group of plugin UI panels.

Static `PluginDefinition.panels` are emitted by the host as the reserved
`manifest` group. Runtime groups are replaced by
`ctx.ui.setPanelContributions(groupId, panels)` and cleared by publishing an
empty panel list for the same group.

### Data structure

```ts
export const PluginUIPanelContributionGroupSchema = z.object({
    pluginName: z.string(),
    groupId: z.string(),
    source: z.enum(['manifest', 'runtime']),
    instanceTarget: PluginUIPanelContributionTargetSchema.optional(),
    panels: z.array(PluginPanelDescriptorSchema),
});
```

### Type declaration

```ts
export type PluginUIPanelContributionGroup = z.infer<typeof PluginUIPanelContributionGroupSchema>;
```
## PluginUIPanelContributionTarget

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginUIPanelContributionTargetSchema`

Plugin instance that owns a runtime panel contribution: the single global
instance or one explicitly identified operator instance.

### Data structure

```ts
export const PluginUIPanelContributionTargetSchema = z.discriminatedUnion('kind', [
    z.object({ kind: z.literal('global') }),
    z.object({ kind: z.literal('operator'), operatorId: z.string() }),
]);
```

### Type declaration

```ts
export type PluginUIPanelContributionTarget = z.infer<typeof PluginUIPanelContributionTargetSchema>;
```
## PluginObjectArrayField

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginObjectArrayFieldSchema`

Field descriptor used for each item in an `object[]` or `keyedObjectArrays`
setting editor. `key` becomes the object property; `type` controls the Host
input; `required` and `default` are applied per item.

### Data structure

```ts
export const PluginObjectArrayFieldSchema = z.object({
    key: z.string(),
    type: z.enum(['string', 'number', 'boolean']).optional().default('string'),
    label: z.string(),
    description: z.string().optional(),
    placeholder: z.string().optional(),
    required: z.boolean().optional(),
    default: z.unknown().optional(),
});
```

### Type declaration

```ts
export type PluginObjectArrayField = z.infer<typeof PluginObjectArrayFieldSchema>;
```
## PluginKeyedStringArrayKey

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginKeyedStringArrayKeySchema`

Fixed key exposed by keyed setting editors. `key` is persisted in the value;
`label` and `description` are literal text or plugin locale keys.

### Data structure

```ts
export const PluginKeyedStringArrayKeySchema = z.object({
    key: z.string(),
    label: z.string(),
    description: z.string().optional(),
});
```

### Type declaration

```ts
export type PluginKeyedStringArrayKey = z.infer<typeof PluginKeyedStringArrayKeySchema>;
```
## PluginSettingCondition

- Kind: `interface`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)

Declarative condition evaluated against values in the same settings form.
A leaf compares one `setting` with `equals` or `notEquals`; `allOf` requires
every nested condition and `anyOf` requires at least one. Nested groups may
be combined recursively.

```ts
export interface PluginSettingCondition {
    setting?: string;
    equals?: unknown;
    notEquals?: unknown;
    allOf?: PluginSettingCondition[];
    anyOf?: PluginSettingCondition[];
}
```

### PluginSettingCondition.setting

Single setting key to compare. Preserves the original condition shape.

```ts

setting?: string;

```

### PluginSettingCondition.equals

Match when the referenced value is strictly equal to this value.

```ts

equals?: unknown;

```

### PluginSettingCondition.notEquals

Match when the referenced value is not strictly equal to this value.

```ts

notEquals?: unknown;

```

### PluginSettingCondition.allOf

All nested conditions must match.

```ts

allOf?: PluginSettingCondition[];

```

### PluginSettingCondition.anyOf

At least one nested condition must match.

```ts

anyOf?: PluginSettingCondition[];

```
## PluginSettingConditionalDescription

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginSettingConditionalDescriptionSchema`

Description override selected when its condition matches.

### Data structure

```ts
export const PluginSettingConditionalDescriptionSchema = z.object({
    when: PluginSettingConditionSchema,
    description: z.string(),
});
```

### Type declaration

```ts
export type PluginSettingConditionalDescription = z.infer<typeof PluginSettingConditionalDescriptionSchema>;
```
## PluginSettingOption

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginSettingOptionSchema`

Label/value pair used by select-like plugin settings.

### Data structure

```ts
export const PluginSettingOptionSchema = z.object({
    label: z.string(),
    value: z.string(),
});
```

### Type declaration

```ts
export type PluginSettingOption = z.infer<typeof PluginSettingOptionSchema>;
```
## PluginStorageScope

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginStorageScopeSchema`

Storage scope requested by a plugin.

### Data structure

```ts
export const PluginStorageScopeSchema = z.enum(['global', 'operator']);
```

### Type declaration

```ts
export type PluginStorageScope = z.infer<typeof PluginStorageScopeSchema>;
```
## PluginStorageConfig

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginStorageConfigSchema`

Declares which persistent storage scopes the host should provision.

### Data structure

```ts
export const PluginStorageConfigSchema = z.object({
    scopes: z.array(PluginStorageScopeSchema),
});
```

### Type declaration

```ts
export type PluginStorageConfig = z.infer<typeof PluginStorageConfigSchema>;
```
## PluginManifest

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginManifestSchema`

Normalized manifest describing a plugin's static metadata and declarations.

### Data structure

```ts
export const PluginManifestSchema = z.object({
    apiVersion: z.literal(2).optional(),
    name: z.string(),
    version: z.string(),
    type: PluginTypeSchema,
    strategyFeatures: StrategyFeaturesSchema,
    instanceScope: PluginInstanceScopeSchema.optional().default('operator'),
    description: z.string().optional(),
    permissions: z.array(PluginPermissionSchema).optional(),
    settings: z.record(z.string(), PluginSettingDescriptorSchema).optional(),
    quickActions: z.array(PluginQuickActionSchema).optional(),
    quickSettings: z.array(PluginQuickSettingSchema).optional(),
    panels: z.array(PluginPanelDescriptorSchema).optional(),
    storage: PluginStorageConfigSchema.optional(),
    ui: PluginUIConfigSchema.optional(),
});
```

### Type declaration

```ts
export type PluginManifest = z.infer<typeof PluginManifestSchema>;
```
## PluginStatus

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginStatusSchema`

Runtime-facing plugin status snapshot exposed to the frontend.

### Data structure

```ts
export const PluginStatusSchema = z.object({
    name: z.string(),
    type: PluginTypeSchema,
    strategyFeatures: StrategyFeaturesSchema,
    instanceScope: PluginInstanceScopeSchema.optional().default('operator'),
    version: z.string(),
    description: z.string().optional(),
    isBuiltIn: z.boolean(),
    loaded: z.boolean().default(true),
    enabled: z.boolean(),
    autoDisabled: z.boolean().optional().default(false),
    errorCount: z.number(),
    lastError: z.string().optional(),
    assignedOperatorIds: z.array(z.string()).optional(),
    settings: z.record(z.string(), PluginSettingDescriptorSchema).optional(),
    quickActions: z.array(PluginQuickActionSchema).optional(),
    quickSettings: z.array(PluginQuickSettingSchema).optional(),
    panels: z.array(PluginPanelDescriptorSchema).optional(),
    permissions: z.array(PluginPermissionSchema).optional(),
    capabilities: z.array(PluginCapabilitySchema).optional(),
    autoCallEnabledOperatorIds: z.array(z.string()).optional(),
    pausedOperatorIds: z.array(z.string()).optional(),
    ui: PluginUIConfigSchema.optional(),
    locales: PluginLocalesSchema.optional(),
    source: PluginSourceSchema.optional(),
});
```

### Type declaration

```ts
export type PluginStatus = z.infer<typeof PluginStatusSchema>;
```
## PluginUIPageDescriptor

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginUIPageDescriptorSchema`

Declarative descriptor for a custom UI page served from a plugin's static
file directory.

### Data structure

```ts
export const PluginUIPageDescriptorSchema = z.object({
    id: z.string(),
    title: z.string(),
    entry: z.string(),
    icon: z.string().optional(),
    accessScope: z.enum(['admin', 'operator']).optional().default('admin'),
    resourceBinding: z.enum(['none', 'callsign', 'operator']).optional().default('none'),
});
```

### Type declaration

```ts
export type PluginUIPageDescriptor = z.infer<typeof PluginUIPageDescriptorSchema>;
```
## PluginUIConfig

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginUIConfigSchema`

Declares that a plugin provides custom UI pages hosted in an iframe.

### Data structure

```ts
export const PluginUIConfigSchema = z.object({
    dir: z.string().optional().default('ui'),
    pages: z.array(PluginUIPageDescriptorSchema).optional().default([]),
});
```

### Type declaration

```ts
export type PluginUIConfig = z.infer<typeof PluginUIConfigSchema>;
```
## CapabilityList

- Kind: `type`
- Source: [schema/radio-capability.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/radio-capability.schema.ts)
- Related schema: `CapabilityListSchema`

Complete descriptor/state snapshot returned by radio capability APIs.

### Data structure

```ts
export const CapabilityListSchema = z.object({
    descriptors: z.array(CapabilityDescriptorSchema),
    capabilities: z.array(CapabilityStateSchema),
});
```

### Type declaration

```ts
export type CapabilityList = z.infer<typeof CapabilityListSchema>;
```
## CapabilityState

- Kind: `type`
- Source: [schema/radio-capability.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/radio-capability.schema.ts)
- Related schema: `CapabilityStateSchema`

Dynamic support, availability and value state for one capability.

### Data structure

```ts
export const CapabilityStateSchema = z.object({
    id: z.string(),
    supported: z.boolean(),
    availability: CapabilityAvailabilitySchema.optional(),
    availabilityReason: CapabilityAvailabilityReasonSchema.optional(),
    lastError: z.string().optional(),
    value: CapabilityValueSchema.nullable(),
    meta: z.record(z.unknown()).optional(),
    updatedAt: z.number(),
});
```

### Type declaration

```ts
export type CapabilityState = z.infer<typeof CapabilityStateSchema>;
```
## CapabilityDescriptor

- Kind: `type`
- Source: [schema/radio-capability.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/radio-capability.schema.ts)
- Related schema: `CapabilityDescriptorSchema`

Host-provided descriptor that defines one capability for the current session.

### Data structure

```ts
export const CapabilityDescriptorSchema = z.object({
    id: z.string(),
    category: CapabilityCategorySchema,
    valueType: CapabilityValueTypeSchema,
    range: z.object({
        min: z.number(),
        max: z.number(),
        step: z.number().optional(),
    }).optional(),
    discreteOptions: z.array(CapabilityOptionSchema).optional(),
    options: z.array(CapabilityOptionSchema).optional(),
    readable: z.boolean(),
    writable: z.boolean(),
    updateMode: CapabilityUpdateModeSchema,
    pollIntervalMs: z.number().optional(),
    compoundGroup: z.string().optional(),
    compoundRole: z.enum(['switch', 'action']).optional(),
    labelI18nKey: z.string(),
    descriptionI18nKey: z.string().optional(),
    display: CapabilityDisplaySchema.optional(),
    hasSurfaceControl: z.boolean(),
    surfaceGroup: z.string().optional(),
});
```

### Type declaration

```ts
export type CapabilityDescriptor = z.infer<typeof CapabilityDescriptorSchema>;
```
## CapabilityValue

- Kind: `type`
- Source: [schema/radio-capability.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/radio-capability.schema.ts)
- Related schema: `CapabilityValueSchema`

Runtime value carried by a radio capability state.

### Data structure

```ts
export const CapabilityValueSchema = z.union([z.boolean(), z.number(), z.string()]);
```

### Type declaration

```ts
export type CapabilityValue = z.infer<typeof CapabilityValueSchema>;
```
## WriteCapabilityPayload

- Kind: `type`
- Source: [schema/radio-capability.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/radio-capability.schema.ts)
- Related schema: `WriteCapabilityPayloadSchema`

Legacy WebSocket payload for writing a generic radio capability.
Plugin API v2 uses explicit radio/tuner command ports instead.

### Data structure

```ts
export const WriteCapabilityPayloadSchema = z.object({
    id: z.string(),
    value: CapabilityValueSchema.optional(),
    action: z.boolean().optional(),
});
```

### Type declaration

```ts
export type WriteCapabilityPayload = z.infer<typeof WriteCapabilityPayloadSchema>;
```
## RadioPowerRequest

- Kind: `type`
- Source: [schema/radio-power.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/radio-power.schema.ts)
- Related schema: `RadioPowerRequestSchema`

Request to transition one radio profile to a physical/controller power state.
`profileId` selects the profile, `state` is the requested target, and
`autoEngine` controls whether TX-5DR starts after a successful power-on.

### Data structure

```ts
export const RadioPowerRequestSchema = z.object({
    profileId: z.string().min(1),
    state: RadioPowerTargetSchema,
    autoEngine: z.boolean().optional().default(true),
});
```

### Type declaration

```ts
export type RadioPowerRequest = z.infer<typeof RadioPowerRequestSchema>;
```
## RadioPowerResponse

- Kind: `type`
- Source: [schema/radio-power.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/radio-power.schema.ts)
- Related schema: `RadioPowerResponseSchema`

Result returned by the REST endpoint and `ctx.radioPowerCommands.submit()`.

### Data structure

```ts
export const RadioPowerResponseSchema = z.object({
    success: z.boolean(),
    target: RadioPowerTargetSchema,
    state: RadioPowerStateSchema,
});
```

### Type declaration

```ts
export type RadioPowerResponse = z.infer<typeof RadioPowerResponseSchema>;
```
## RadioPowerState

- Kind: `type`
- Source: [schema/radio-power.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/radio-power.schema.ts)
- Related schema: `RadioPowerStateSchema`

High-level runtime state tracked by the RadioPowerController.

- `off`: radio is known to be off (or was never connected).
- `waking`: physical power-on command sent, waiting for the radio to respond.
- `awake`: radio is physically responding; software engine startup is optional.
- `shutting_down`: physical power-off command is being applied.
- `entering_standby`: physical standby command is being applied.
- `failed`: last transition failed; UI should show an error + retry.

### Data structure

```ts
export const RadioPowerStateSchema = z.enum([
    'off',
    'waking',
    'awake',
    'shutting_down',
    'entering_standby',
    'failed',
]);
```

### Type declaration

```ts
export type RadioPowerState = z.infer<typeof RadioPowerStateSchema>;
```
## RadioPowerStateEvent

- Kind: `type`
- Source: [schema/radio-power.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/radio-power.schema.ts)
- Related schema: `RadioPowerStateEventSchema`

Last known power transition state exposed through WebSocket events and
`ctx.radioPower.getState()`. `state` is the controller's high-level state;
`stage` is finer progress; errors use a localized key plus diagnostic detail.

### Data structure

```ts
export const RadioPowerStateEventSchema = z.object({
    profileId: z.string().optional(),
    state: RadioPowerStateSchema,
    stage: RadioPowerStageSchema,
    errorKey: z.string().optional(),
    errorDetail: z.string().optional(),
});
```

### Type declaration

```ts
export type RadioPowerStateEvent = z.infer<typeof RadioPowerStateEventSchema>;
```
## RadioPowerSupportInfo

- Kind: `type`
- Source: [schema/radio-power.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/radio-power.schema.ts)
- Related schema: `RadioPowerSupportInfoSchema`

Power operations supported by one radio profile, returned by REST and
`ctx.radioPower.getSupport()`. `reason` explains why wake is unavailable;
`supportedStates` lists connected-state transitions the Host may accept.
The Host resolves manufacturer/model names through Hamlib.

### Data structure

```ts
export const RadioPowerSupportInfoSchema = z.object({
    profileId: z.string(),
    canPowerOn: z.boolean(),
    canPowerOff: z.boolean(),
    supportedStates: z.array(z.enum(['operate', 'standby', 'off'])).default([]),
    reason: z.enum(['model-unsupported', 'network-mode-no-wake', 'none-mode']).optional(),
    rigInfo: z
        .object({
        mfgName: z.string(),
        modelName: z.string(),
    })
        .optional(),
});
```

### Type declaration

```ts
export type RadioPowerSupportInfo = z.infer<typeof RadioPowerSupportInfoSchema>;
```
## RadioPowerTarget

- Kind: `type`
- Source: [schema/radio-power.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/radio-power.schema.ts)
- Related schema: `RadioPowerTargetSchema`

Power targets accepted by Host commands. `on`/`off` control physical power;
`standby`/`operate` switch a responding radio between controller states.

### Data structure

```ts
export const RadioPowerTargetSchema = z.enum(['on', 'off', 'standby', 'operate']);
```

### Type declaration

```ts
export type RadioPowerTarget = z.infer<typeof RadioPowerTargetSchema>;
```
## DecodeWindowSettings

- Kind: `type`
- Source: [schema/mode.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/mode.schema.ts)
- Related schema: `DecodeWindowSettingsSchema`

Per-mode decode-window presets and optional custom timing windows.

### Data structure

```ts
export const DecodeWindowSettingsSchema = z.object({
    ft8: z.object({
        preset: z.enum(['maximum', 'balanced', 'lightweight', 'minimum', 'custom']).default('balanced'),
        customWindowTiming: z.array(z.number().int().min(-5000).max(1000)).optional(),
    }).optional(),
    ft4: z.object({
        preset: z.enum(['maximum', 'balanced', 'lightweight', 'custom']).default('balanced'),
        customWindowTiming: z.array(z.number().int().min(-5000).max(1000)).optional(),
    }).optional(),
});
```

### Type declaration

```ts
export type DecodeWindowSettings = z.infer<typeof DecodeWindowSettingsSchema>;
```
## RealtimeSettings

- Kind: `type`
- Source: [schema/realtime.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/realtime.schema.ts)
- Related schema: `RealtimeSettingsSchema`

Persisted realtime-audio transport preferences.

`transportPolicy` selects automatic or explicit transport behavior. The
optional public host/UDP port advertise an RTC data-audio endpoint to remote
clients; null/omitted values disable that public candidate.

### Data structure

```ts
export const RealtimeSettingsSchema = z.object({
    transportPolicy: RealtimeTransportPolicySchema.optional(),
    rtcDataAudioPublicHost: RtcDataAudioPublicHostSchema.optional(),
    rtcDataAudioPublicUdpPort: RtcDataAudioPublicUdpPortSchema.optional(),
});
```

### Type declaration

```ts
export type RealtimeSettings = z.infer<typeof RealtimeSettingsSchema>;
```
## RealtimeSettingsResponseData

- Kind: `type`
- Source: [schema/realtime.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/realtime.schema.ts)
- Related schema: `RealtimeSettingsResponseDataSchema`

Realtime settings plus the Host's current resolved runtime projection.

### Data structure

```ts
export const RealtimeSettingsResponseDataSchema = RealtimeSettingsSchema.extend({
    runtime: RealtimeSettingsRuntimeSchema.optional(),
});
```

### Type declaration

```ts
export type RealtimeSettingsResponseData = z.infer<typeof RealtimeSettingsResponseDataSchema>;
```
## PresetFrequency

- Kind: `type`
- Source: [schema/radio.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/radio.schema.ts)
- Related schema: `PresetFrequencySchema`

Saved dial-frequency preset with band, digital mode and radio modulation.

### Data structure

```ts
export const PresetFrequencySchema = z.object({
    band: z.string(),
    mode: z.string(),
    radioMode: z.string().optional(),
    frequency: z.number(),
    description: z.string().optional(),
    repeaterShift: RepeaterShiftSchema.optional(),
    repeaterOffsetHz: z.number().int().positive().optional(),
    toneMode: ToneSquelchModeSchema.optional(),
    ctcssToneTenthsHz: z.number().int().positive().optional(),
    dcsCode: z.number().int().positive().optional(),
}).superRefine((preset, ctx) => {
    const isVoiceFmPreset = preset.mode === 'VOICE' && preset.radioMode?.toUpperCase() === 'FM';
    const hasRepeaterDuplex = preset.repeaterShift === 'minus' || preset.repeaterShift === 'plus';
    if (hasRepeaterDuplex && !isVoiceFmPreset) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['repeaterShift'],
            message: 'repeater duplex is only supported for VOICE FM presets',
        });
    }
    if (hasRepeaterDuplex
        && preset.repeaterOffsetHz === undefined) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['repeaterOffsetHz'],
            message: 'repeaterOffsetHz is required when repeaterShift is plus or minus',
        });
    }
    if (!isVoiceFmPreset && preset.toneMode && preset.toneMode !== 'none') {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['toneMode'],
            message: 'tone squelch is only supported for VOICE FM presets',
        });
    }
    if (preset.toneMode === 'ctcss') {
        if (preset.ctcssToneTenthsHz === undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['ctcssToneTenthsHz'],
                message: 'ctcssToneTenthsHz is required when toneMode is ctcss',
            });
        }
        if (preset.dcsCode !== undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['dcsCode'],
                message: 'dcsCode cannot be set when toneMode is ctcss',
            });
        }
    }
    if (preset.toneMode === 'dcs') {
        if (preset.dcsCode === undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['dcsCode'],
                message: 'dcsCode is required when toneMode is dcs',
            });
        }
        if (preset.ctcssToneTenthsHz !== undefined) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                path: ['ctcssToneTenthsHz'],
                message: 'ctcssToneTenthsHz cannot be set when toneMode is dcs',
            });
        }
    }
    if ((preset.toneMode === undefined || preset.toneMode === 'none')
        && (preset.ctcssToneTenthsHz !== undefined || preset.dcsCode !== undefined)) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['toneMode'],
            message: 'toneMode must be ctcss or dcs when tone values are set',
        });
    }
});
```

### Type declaration

```ts
export type PresetFrequency = z.infer<typeof PresetFrequencySchema>;
```
## StationInfo

- Kind: `type`
- Source: [schema/station-info.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/station-info.schema.ts)
- Related schema: `StationInfoSchema`

Public station profile shown to clients and exposed through plugin settings.
It contains optional display identity, callsign, Markdown description and QTH
coordinates/grid; it never contains authentication or radio credentials.

### Data structure

```ts
export const StationInfoSchema = z.object({
    name: z.string().max(100).optional(),
    callsign: z.string().max(20).optional(),
    description: z.string().max(2000).optional(),
    qth: StationQthSchema.optional(),
});
```

### Type declaration

```ts
export type StationInfo = z.infer<typeof StationInfoSchema>;
```
## PSKReporterConfig

- Kind: `type`
- Source: [schema/pskreporter.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/pskreporter.schema.ts)
- Related schema: `PSKReporterConfigSchema`

PSK Reporter publishing identity, antenna metadata, interval and counters.

### Data structure

```ts
export const PSKReporterConfigSchema = z.object({
    enabled: z.boolean().default(false),
    receiverCallsign: z.string().default(''),
    receiverLocator: z.string().default(''),
    decodingSoftware: z.string().default('TX-5DR'),
    antennaInformation: z.string().max(64, '天线信息不能超过64字符').default(''),
    reportIntervalSeconds: z.number().min(10).max(60).default(30),
    useTestServer: z.boolean().default(false),
    stats: PSKReporterStatsSchema.default({}),
});
```

### Type declaration

```ts
export type PSKReporterConfig = z.infer<typeof PSKReporterConfigSchema>;
```
## NtpServerListSettings

- Kind: `type`
- Source: [schema/system.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/system.schema.ts)
- Related schema: `NtpServerListSettingsSchema`

Active NTP server list together with the Host-provided default list.

### Data structure

```ts
export const NtpServerListSettingsSchema = z.object({
    servers: NtpServerArraySchema,
    defaultServers: NtpServerArraySchema,
});
```

### Type declaration

```ts
export type NtpServerListSettings = z.infer<typeof NtpServerListSettingsSchema>;
```
## UpdateNtpServerListRequest

- Kind: `type`
- Source: [schema/system.schema.ts](https://github.com/boybook/tx-5dr/blob/main/packages/contracts/src/schema/system.schema.ts)
- Related schema: `UpdateNtpServerListRequestSchema`

Complete replacement list accepted by `ctx.settings.ntp.update()`.

### Data structure

```ts
export const UpdateNtpServerListRequestSchema = z.object({
    servers: NtpServerArraySchema,
});
```

### Type declaration

```ts
export type UpdateNtpServerListRequest = z.infer<typeof UpdateNtpServerListRequestSchema>;
```
