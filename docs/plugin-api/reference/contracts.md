# Contracts Re-exports

该页列出 `@tx5dr/plugin-api` 转出的 `@tx5dr/contracts` 类型和值定义。

> 自动生成自 `../tx-5dr/packages/plugin-api/src/index.ts` 与 `../tx-5dr/packages/contracts/src/index.ts`

## 类型导出

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
- [PluginSettingOption](#pluginsettingoption)
- [PluginStorageScope](#pluginstoragescope)
- [PluginStorageConfig](#pluginstorageconfig)
- [PluginManifest](#pluginmanifest)
- [PluginStatus](#pluginstatus)
- [PluginUIPageDescriptor](#pluginuipagedescriptor)
- [PluginUIConfig](#pluginuiconfig)

## 值导出


## FT8Message

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageSchema`

Union of every structured FT8 message variant recognized by TX-5DR.

### 数据结构

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

### 类型导出

```ts
export type FT8Message = z.infer<typeof FT8MessageSchema>;
```
## FT8MessageBase

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageBaseSchema`

Base FT8 message type containing only the discriminant field.

### 数据结构

```ts
export const FT8MessageBaseSchema = z.object({
  type: FT8MessageTypeSchema,
});
```

### 类型导出

```ts
export type FT8MessageBase = z.infer<typeof FT8MessageBaseSchema>;
```
## FT8MessageCQ

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageCQSchema`

Structured CQ message with sender identity and optional grid/modifier metadata.

### 数据结构

```ts
export const FT8MessageCQSchema = FT8MessageBaseSchema.extend({
  type: z.literal('cq'),
  senderCallsign: z.string(),
  // Reuses the legacy field name for compatibility. The value can be a
  // directed-CQ modifier such as DX/EU/JA or a callback token such as 290.
  flag: z.string().optional(),
  grid: z.string().optional(),
});
```

### 类型导出

```ts
export type FT8MessageCQ = z.infer<typeof FT8MessageCQSchema>;
```
## FT8MessageCall

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageCallSchema`

Structured directed-call message between a sender and a target station.

### 数据结构

```ts
export const FT8MessageCallSchema = FT8MessageBaseSchema.extend({
  type: z.literal('call'),
  senderCallsign: z.string(),
  targetCallsign: z.string(),
  grid: z.string().optional(),
});
```

### 类型导出

```ts
export type FT8MessageCall = z.infer<typeof FT8MessageCallSchema>;
```
## FT8MessageSignalReport

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageSignalReportSchema`

Structured signal-report exchange message carrying a numeric report.

### 数据结构

```ts
export const FT8MessageSignalReportSchema = FT8MessageBaseSchema.extend({
  type: z.literal('signal_report'),
  senderCallsign: z.string(),
  targetCallsign: z.string(),
  report: z.number(),
});
```

### 类型导出

```ts
export type FT8MessageSignalReport = z.infer<typeof FT8MessageSignalReportSchema>;
```
## FT8MessageRogerReport

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageRogerReportSchema`

Structured "roger + report" exchange message.

### 数据结构

```ts
export const FT8MessageRogerReportSchema = FT8MessageBaseSchema.extend({
  type: z.literal('roger_report'),
  senderCallsign: z.string(),
  targetCallsign: z.string(),
  report: z.number(),
});
```

### 类型导出

```ts
export type FT8MessageRogerReport = z.infer<typeof FT8MessageRogerReportSchema>;
```
## FT8MessageRRR

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageRRRSchema`

Structured `RRR` completion/acknowledgement message.

### 数据结构

```ts
export const FT8MessageRRRSchema = FT8MessageBaseSchema.extend({
  type: z.literal('rrr'),
  senderCallsign: z.string(),
  targetCallsign: z.string(),
});
```

### 类型导出

```ts
export type FT8MessageRRR = z.infer<typeof FT8MessageRRRSchema>;
```
## FT8MessageSeventyThree

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageSeventyThreeSchema`

Structured final `73` closing message.

### 数据结构

```ts
export const FT8MessageSeventyThreeSchema = FT8MessageBaseSchema.extend({
  type: z.literal('73'),
  senderCallsign: z.string(),
  targetCallsign: z.string(),
});
```

### 类型导出

```ts
export type FT8MessageSeventyThree = z.infer<typeof FT8MessageSeventyThreeSchema>;
```
## FT8MessageFoxRR73

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageFoxRR73Schema`

Structured Fox/Hound `RR73` completion-and-invite message.

### 数据结构

```ts
export const FT8MessageFoxRR73Schema = FT8MessageBaseSchema.extend({
  type: z.literal('fox_rr73'),
  completedCallsign: z.string(), // 已完成QSO的Hound呼号
  nextCallsign: z.string(),      // 下一个被邀请的Hound呼号
  foxHash: z.string().optional(), // Fox的哈希码（去掉尖括号后的值）
  snrForNext: z.number().optional(), // Fox告知下一个Hound的信号强度（如+04→4）
});
```

### 类型导出

```ts
export type FT8MessageFoxRR73 = z.infer<typeof FT8MessageFoxRR73Schema>;
```
## FT8MessageCustom

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageCustomSchema`

Structured custom FT8 message whose payload is intentionally not further
parsed by the core parser.

### 数据结构

```ts
export const FT8MessageCustomSchema = FT8MessageBaseSchema.extend({
  type: z.literal('custom'),
});
```

### 类型导出

```ts
export type FT8MessageCustom = z.infer<typeof FT8MessageCustomSchema>;
```
## FT8MessageUnknown

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `FT8MessageUnknownSchema`

Structured fallback FT8 message for unclassified decoder output.

### 数据结构

```ts
export const FT8MessageUnknownSchema = FT8MessageBaseSchema.extend({
  type: z.literal('unknown'),
});
```

### 类型导出

```ts
export type FT8MessageUnknown = z.infer<typeof FT8MessageUnknownSchema>;
```
## ParsedFT8Message

- Kind: `type`
- Source: [schema/ft8.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/ft8.schema.ts)
- Related schema: `ParsedFT8MessageSchema`

Primary plugin-facing FT8 decode model.

Prefer this type when filtering targets, scoring candidates or reacting to
decoded traffic in plugin hooks.

### 数据结构

```ts
export const ParsedFT8MessageSchema = z.object({
  snr: z.number(),
  dt: z.number(),
  df: z.number(),
  rawMessage: z.string(),
  message: FT8MessageSchema,
  slotId: z.string(),
  timestamp: z.number(),
  logbookAnalysis: LogbookAnalysisSchema.optional(),
});
```

### 类型导出

```ts
export type ParsedFT8Message = z.infer<typeof ParsedFT8MessageSchema>;
```
## LogbookAnalysis

- Kind: `type`
- Source: [schema/slot-info.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/slot-info.schema.ts)
- Related schema: `LogbookAnalysisSchema`

基于日志本的消息分析结果

### 数据结构

```ts
export const LogbookAnalysisSchema = z.object({
  /** 是否为新呼号（之前没有通联过） */
  isNewCallsign: z.boolean().optional(),
  /** 是否为新 DXCC 实体（之前没有通联过该实体） */
  isNewDxccEntity: z.boolean().optional(),
  /** 是否为该波段的新 DXCC 实体 */
  isNewBandDxccEntity: z.boolean().optional(),
  /** 是否为已确认 DXCC */
  isConfirmedDxcc: z.boolean().optional(),
  /** 是否为新网格（之前没有通联过此网格） */
  isNewGrid: z.boolean().optional(),
  /** 解析出的呼号（如果有） */
  callsign: z.string().optional(),
  /** 解析出的网格（如果有） */
  grid: z.string().optional(),
  /** 解析出的前缀（如果有） */
  prefix: z.string().optional(),
  /** DXCC 实体编号 */
  dxccId: z.number().int().positive().optional(),
  /** DXCC 实体名 */
  dxccEntity: z.string().optional(),
  /** 实体状态 */
  dxccStatus: DxccStatusSchema.optional(),
});
```

### 类型导出

```ts
export type LogbookAnalysis = z.infer<typeof LogbookAnalysisSchema>;
```
## SlotInfo

- Kind: `type`
- Source: [schema/slot-info.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/slot-info.schema.ts)
- Related schema: `SlotInfoSchema`

时隙周期（偶数奇数）

时隙信息

### 数据结构

```ts
export const SlotInfoSchema = z.object({
  /** 时隙唯一标识符 */
  id: z.string(),
  /** 时隙开始时间戳（毫秒） */
  startMs: z.number(),
  /** 相位偏移（毫秒） */
  phaseMs: z.number(),
  /** 时钟漂移（毫秒） */
  driftMs: z.number().default(0),
  /** 时隙周期号 */
  cycleNumber: z.number(),
  /** 时隙UTC时间戳（秒） */
  utcSeconds: z.number(),
  /** 时隙类型（FT8/FT4） */
  mode: z.string()
});
```

### 类型导出

```ts
export type SlotInfo = z.infer<typeof SlotInfoSchema>;
```
## SlotPack

- Kind: `type`
- Source: [schema/slot-info.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/slot-info.schema.ts)
- Related schema: `SlotPackSchema`

时隙封装信息（去重和多次解码取优）

### 数据结构

```ts
export const SlotPackSchema = z.object({
  /** 时隙ID */
  slotId: z.string(),
  /** 时隙开始时间戳（毫秒） */
  startMs: z.number(),
  /** 时隙结束时间戳（毫秒） */
  endMs: z.number(),
  /** 去重后的最优解码结果 */
  frames: z.array(FrameMessageSchema),
  /** 解码统计信息 */
  stats: z.object({
    /** 总解码次数 */
    totalDecodes: z.number().default(0),
    /** 成功解码次数 */
    successfulDecodes: z.number().default(0),
    /** 去重前的总帧数 */
    totalFramesBeforeDedup: z.number().default(0),
    /** 去重后的帧数 */
    totalFramesAfterDedup: z.number().default(0),
    /** 最后更新时间戳 */
    lastUpdated: z.number().default(() => Date.now())
  }).default({}),
  /** 解码历史（用于调试） */
  decodeHistory: z.array(z.object({
    windowIdx: z.number(),
    timestamp: z.number(),
    frameCount: z.number(),
    processingTimeMs: z.number()
  })).default([])
});
```

### 类型导出

```ts
export type SlotPack = z.infer<typeof SlotPackSchema>;
```
## QSORecord

- Kind: `type`
- Source: [schema/qso.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/qso.schema.ts)
- Related schema: `QSORecordSchema`

Canonical persisted QSO record used by TX-5DR logbooks and plugin hooks.

Plugin authors will most commonly encounter this in completion hooks and
logbook queries.

### 数据结构

```ts
export const QSORecordSchema = z.object({
  id: z.string(),
  callsign: z.string(),        // 对方呼号
  grid: z.string().optional(), // 对方网格定位
  frequency: z.number(),       // 频率
  mode: z.string(),            // 模式（FT8）
  submode: z.string().optional(), // ADIF 子模式（如 FT4）
  startTime: z.number(),       // 开始时间
  endTime: z.number().optional(), // 结束时间
  reportSent: z.string().optional(),     // 发送的信号报告
  reportReceived: z.string().optional(), // 接收的信号报告
  messages: z.array(z.string()), // 消息历史
  myCallsign: z.string().optional(), // 我的呼号（操作员呼号）
  myGrid: z.string().optional(), // 我的网格定位（操作员网格）
  qth: z.string().optional(), // 对方 QTH（地点，语音通联常用）
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

  // LoTW QSL 确认状态
  lotwQslSent: QslSentStatusSchema,
  lotwQslReceived: QslReceivedStatusSchema,
  lotwQslSentDate: z.number().optional(),     // 发送日期 (timestamp)
  lotwQslReceivedDate: z.number().optional(), // 确认日期 (timestamp)

  // QRZ QSL 确认状态
  qrzQslSent: QslSimpleStatusSchema,
  qrzQslReceived: QslSimpleStatusSchema,
  qrzQslSentDate: z.number().optional(),
  qrzQslReceivedDate: z.number().optional(),

  // 备注（对应 ADIF NOTES 字段）
  remarks: z.string().optional(),
});
```

### 类型导出

```ts
export type QSORecord = z.infer<typeof QSORecordSchema>;
```
## FrameMessage

- Kind: `type`
- Source: [schema/slot-info.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/slot-info.schema.ts)
- Related schema: `FrameMessageSchema`

FT8 帧数据

### 数据结构

```ts
export const FrameMessageSchema = z.object({
  /** 信号强度 (dB) */
  snr: z.number(),
  /** 频率偏移 (Hz) */
  freq: z.number(),
  /** 时间偏移 (秒) */
  dt: z.number(),
  /** 解码消息 */
  message: z.string(),
  /** 置信度 0-1 */
  confidence: z.number().min(0).max(1).default(1.0),
  /** 基于日志本的分析结果（可选，仅在客户端定制化数据中提供） */
  logbookAnalysis: LogbookAnalysisSchema.optional(),
  /** 操作员ID（可选，仅 TX 帧使用，用于多操作员覆盖识别） */
  operatorId: z.string().optional()
});
```

### 类型导出

```ts
export type FrameMessage = z.infer<typeof FrameMessageSchema>;
```
## ModeDescriptor

- Kind: `type`
- Source: [schema/mode.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/mode.schema.ts)
- Related schema: `ModeDescriptorSchema`

模式描述符 - 定义 FT8/FT4 等模式的时序参数

### 数据结构

```ts
export const ModeDescriptorSchema = z.object({
  /** 模式名称，如 "FT8", "FT4" */
  name: z.string(),
  /** 时隙长度（毫秒），FT8=15000, FT4=7500, VOICE=0 */
  slotMs: z.number().nonnegative(),
  /** 时钟容差（毫秒） */
  toleranceMs: z.number().nonnegative().default(100),
  /** 
   * 窗口时机（毫秒）- 必需
   * 使用这些时机作为从时隙结束时间的偏移量
   * 每个窗口都会获取固定长度的解码数据（FT8: 15秒，FT4: 7.5秒）
   * 数组长度决定了子窗口的数量
   * 支持负偏移，可以获取时隙结束前或其他周期的音频数据
   */
  windowTiming: z.array(z.number()),
  /**
   * 发射时机（毫秒）- 从时隙开始的延迟
   * FT8: 500ms (WSJT-X 标准：信号在时隙边界后 ~0.5s 开始，留 ~1.86s 给解码)
   * FT4: 约550ms (使6.4秒的音频在7.5秒时隙中居中)
   */
  transmitTiming: z.number().nonnegative(),
  /**
   * 编码提前量（毫秒）- 在transmitTiming之前多久开始编码
   * 默认400ms,用于补偿编码+混音时间
   */
  encodeAdvance: z.number().nonnegative().default(400)
});
```

### 类型导出

```ts
export type ModeDescriptor = z.infer<typeof ModeDescriptorSchema>;
```
## OperatorSlots

- Kind: `type`
- Source: [schema/transmission.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/transmission.schema.ts)
- Related schema: `OperatorSlotsSchema`

传输请求（已在 websocket.schema.ts 中定义）
TransmitRequestSchema

操作员时隙配置

### 数据结构

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

### 类型导出

```ts
export type OperatorSlots = z.infer<typeof OperatorSlotsSchema>;
```
## DxccStatus

- Kind: `type`
- Source: [schema/qso.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/qso.schema.ts)
- Related schema: `DxccStatusSchema`

Current work status of a resolved DXCC entity in local logbook context.

### 数据结构

```ts
export const DxccStatusSchema = z.enum([
  'current',
  'deleted',
  'none',
  'unknown',
]);
```

### 类型导出

```ts
export type DxccStatus = z.infer<typeof DxccStatusSchema>;
```
## TargetSelectionPriorityMode

- Kind: `type`
- Source: [schema/qso.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/qso.schema.ts)
- Related schema: `TargetSelectionPriorityModeSchema`

Candidate-ranking policy used when choosing which station to answer first.

### 数据结构

```ts
export const TargetSelectionPriorityModeSchema = z.enum([
  'balanced',
  'dxcc_first',
  'new_callsign_first',
]);
```

### 类型导出

```ts
export type TargetSelectionPriorityMode = z.infer<typeof TargetSelectionPriorityModeSchema>;
```
## PluginType

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginTypeSchema`

High-level plugin category used by manifests and runtime status objects.

### 数据结构

```ts
export const PluginTypeSchema = z.enum(['strategy', 'utility']);
```

### 类型导出

```ts
export type PluginType = z.infer<typeof PluginTypeSchema>;
```
## PluginInstanceScope

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginInstanceScopeSchema`

Runtime instance scope for a plugin.

### 数据结构

```ts
export const PluginInstanceScopeSchema = z.enum(['operator', 'global']);
```

### 类型导出

```ts
export type PluginInstanceScope = z.infer<typeof PluginInstanceScopeSchema>;
```
## PluginPermission

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginPermissionSchema`

Explicit permission declarations requested by a plugin.

### 数据结构

```ts
export const PluginPermissionSchema = z.enum(['network']);
```

### 类型导出

```ts
export type PluginPermission = z.infer<typeof PluginPermissionSchema>;
```
## PluginSettingType

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginSettingTypeSchema`

Supported generated-form field types for plugin settings.

### 数据结构

```ts
export const PluginSettingTypeSchema = z.enum(['boolean', 'number', 'string', 'string[]', 'info']);
```

### 类型导出

```ts
export type PluginSettingType = z.infer<typeof PluginSettingTypeSchema>;
```
## PluginSettingDescriptor

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginSettingDescriptorSchema`

Declarative description of a persisted plugin setting.

`default` is the resolved fallback value, `label`/`description` power the UI,
`min` and `max` constrain numeric fields, `options` enumerates valid choices
for select-like inputs, and `scope` controls whether the value is shared or
operator-specific.

### 数据结构

```ts
export const PluginSettingDescriptorSchema = z.object({
  type: PluginSettingTypeSchema,
  default: z.unknown(),
  label: z.string(),
  description: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  options: z.array(PluginSettingOptionSchema).optional(),
  /** 设置作用域：global（所有操作员共享）或 operator（每操作员独立），默认 global */
  scope: PluginSettingScopeSchema.optional().default('global'),
});
```

### 类型导出

```ts
export type PluginSettingDescriptor = z.infer<typeof PluginSettingDescriptorSchema>;
```
## PluginSettingScope

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginSettingScopeSchema`

Persistence and UI scope for a plugin setting.

### 数据结构

```ts
export const PluginSettingScopeSchema = z.enum(['global', 'operator']);
```

### 类型导出

```ts
export type PluginSettingScope = z.infer<typeof PluginSettingScopeSchema>;
```
## PluginQuickAction

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginQuickActionSchema`

Declarative quick-action button shown in operator-facing plugin UI.

### 数据结构

```ts
export const PluginQuickActionSchema = z.object({
  id: z.string(),
  label: z.string(),
  icon: z.string().optional(),
});
```

### 类型导出

```ts
export type PluginQuickAction = z.infer<typeof PluginQuickActionSchema>;
```
## PluginQuickSetting

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginQuickSettingSchema`

Shortcut reference to an operator-scope setting that should be surfaced in a
compact quick-settings panel.

### 数据结构

```ts
export const PluginQuickSettingSchema = z.object({
  settingKey: z.string(),
});
```

### 类型导出

```ts
export type PluginQuickSetting = z.infer<typeof PluginQuickSettingSchema>;
```
## PluginCapability

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginCapabilitySchema`

Host-derived capability tags exposed to the frontend.

### 数据结构

```ts
export const PluginCapabilitySchema = z.enum([
  'auto_call_candidate',
  'auto_call_execution',
]);
```

### 类型导出

```ts
export type PluginCapability = z.infer<typeof PluginCapabilitySchema>;
```
## PluginPanelDescriptor

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginPanelDescriptorSchema`

Declarative definition of a plugin-owned panel in the frontend.

### 数据结构

```ts
export const PluginPanelDescriptorSchema = z.object({
  id: z.string(),
  title: z.string(),
  component: PluginPanelComponentSchema,
  /** Required when `component` is `'iframe'`. References a page id from `ui.pages`. */
  pageId: z.string().optional(),
  /** Where the panel renders. Defaults to `'operator'` (operator card live-panel area). */
  slot: PluginPanelSlotSchema.optional(),
  /** Preferred width hint. Defaults to `'half'`. */
  width: PluginPanelWidthSchema.optional(),
});
```

### 类型导出

```ts
export type PluginPanelDescriptor = z.infer<typeof PluginPanelDescriptorSchema>;
```
## PluginPanelComponent

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginPanelComponentSchema`

Built-in frontend renderer kinds supported by declarative plugin panels.

### 数据结构

```ts
export const PluginPanelComponentSchema = z.enum(['table', 'key-value', 'chart', 'log', 'iframe']);
```

### 类型导出

```ts
export type PluginPanelComponent = z.infer<typeof PluginPanelComponentSchema>;
```
## PluginPanelWidth

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginPanelWidthSchema`

Preferred width hint for plugin-owned panels.

### 数据结构

```ts
export const PluginPanelWidthSchema = z.enum(['half', 'full']);
```

### 类型导出

```ts
export type PluginPanelWidth = z.infer<typeof PluginPanelWidthSchema>;
```
## PluginSettingOption

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginSettingOptionSchema`

Label/value pair used by select-like plugin settings.

### 数据结构

```ts
export const PluginSettingOptionSchema = z.object({
  label: z.string(),
  value: z.string(),
});
```

### 类型导出

```ts
export type PluginSettingOption = z.infer<typeof PluginSettingOptionSchema>;
```
## PluginStorageScope

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginStorageScopeSchema`

Storage scope requested by a plugin.

### 数据结构

```ts
export const PluginStorageScopeSchema = z.enum(['global', 'operator']);
```

### 类型导出

```ts
export type PluginStorageScope = z.infer<typeof PluginStorageScopeSchema>;
```
## PluginStorageConfig

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginStorageConfigSchema`

Declares which persistent storage scopes the host should provision.

### 数据结构

```ts
export const PluginStorageConfigSchema = z.object({
  scopes: z.array(PluginStorageScopeSchema),
});
```

### 类型导出

```ts
export type PluginStorageConfig = z.infer<typeof PluginStorageConfigSchema>;
```
## PluginManifest

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginManifestSchema`

Normalized manifest describing a plugin's static metadata and declarations.

### 数据结构

```ts
export const PluginManifestSchema = z.object({
  name: z.string(),
  version: z.string(),
  type: PluginTypeSchema,
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

### 类型导出

```ts
export type PluginManifest = z.infer<typeof PluginManifestSchema>;
```
## PluginStatus

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginStatusSchema`

Runtime-facing plugin status snapshot exposed to the frontend.

### 数据结构

```ts
export const PluginStatusSchema = z.object({
  name: z.string(),
  type: PluginTypeSchema,
  instanceScope: PluginInstanceScopeSchema.optional().default('operator'),
  version: z.string(),
  description: z.string().optional(),
  isBuiltIn: z.boolean(),
  loaded: z.boolean().default(true),
  enabled: z.boolean(),
  /** 是否被自动禁用（连续错误达到阈值） */
  autoDisabled: z.boolean().optional().default(false),
  errorCount: z.number(),
  lastError: z.string().optional(),
  /** 仅对 strategy 插件有意义：当前被哪些 operator 选中 */
  assignedOperatorIds: z.array(z.string()).optional(),
  settings: z.record(z.string(), PluginSettingDescriptorSchema).optional(),
  quickActions: z.array(PluginQuickActionSchema).optional(),
  quickSettings: z.array(PluginQuickSettingSchema).optional(),
  panels: z.array(PluginPanelDescriptorSchema).optional(),
  permissions: z.array(PluginPermissionSchema).optional(),
  capabilities: z.array(PluginCapabilitySchema).optional(),
  ui: PluginUIConfigSchema.optional(),
  locales: z.record(z.string(), z.record(z.string(), z.string())).optional(),
});
```

### 类型导出

```ts
export type PluginStatus = z.infer<typeof PluginStatusSchema>;
```
## PluginUIPageDescriptor

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginUIPageDescriptorSchema`

Declarative descriptor for a custom UI page served from a plugin's static
file directory.

### 数据结构

```ts
export const PluginUIPageDescriptorSchema = z.object({
  /** Unique page identifier within the plugin (e.g. 'settings', 'dashboard'). */
  id: z.string(),
  /** Display title (i18n key or literal text). */
  title: z.string(),
  /** Entry HTML file path relative to the UI directory (e.g. 'settings.html'). */
  entry: z.string(),
  /** Optional icon identifier. */
  icon: z.string().optional(),
  /** Who may access this page through the host iframe bridge. Defaults to admin. */
  accessScope: z.enum(['admin', 'operator']).optional().default('admin'),
  /** Optional resource binding enforced by the host for iframe invoke requests. */
  resourceBinding: z.enum(['none', 'callsign', 'operator']).optional().default('none'),
});
```

### 类型导出

```ts
export type PluginUIPageDescriptor = z.infer<typeof PluginUIPageDescriptorSchema>;
```
## PluginUIConfig

- Kind: `type`
- Source: [schema/plugin.schema.ts](https://github.com/boybook/tx-5dr/blob/feat/plugin-logbook-sync-migration/packages/contracts/src/schema/plugin.schema.ts)
- Related schema: `PluginUIConfigSchema`

Declares that a plugin provides custom UI pages hosted in an iframe.

### 数据结构

```ts
export const PluginUIConfigSchema = z.object({
  /** Static file directory relative to the plugin root (default: 'ui'). */
  dir: z.string().optional().default('ui'),
  /** Registered custom UI pages. */
  pages: z.array(PluginUIPageDescriptorSchema).optional().default([]),
});
```

### 类型导出

```ts
export type PluginUIConfig = z.infer<typeof PluginUIConfigSchema>;
```

