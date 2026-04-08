# Re-exports

该页列出 `index.ts` 对外转出的本包接口和 contracts 类型。

> 自动生成自 `../tx-5dr/packages/plugin-api/src/index.ts`

## plugin-api 本地导出

- `./definition.js`: `PluginDefinition`
- `./context.js`: `PluginContext`
- `./hooks.js`: `PluginHooks`、`ScoredCandidate`、`StrategyDecision`、`StrategyDecisionMeta`、`LastMessageInfo`
- `./runtime.js`: `StrategyRuntime`、`StrategyRuntimeContext`、`StrategyRuntimeSnapshot`、`StrategyRuntimeSlot`、`StrategyRuntimeSlotContentUpdate`
- `./helpers.js`: `KVStore`、`PluginLogger`、`PluginTimers`、`OperatorControl`、`RadioControl`、`LogbookAccess`、`BandAccess`、`UIBridge`

## 来自 @tx5dr/contracts 的类型导出

- [`FT8Message`](./contracts#ft8message)
- [`FT8MessageBase`](./contracts#ft8messagebase)
- [`FT8MessageCQ`](./contracts#ft8messagecq)
- [`FT8MessageCall`](./contracts#ft8messagecall)
- [`FT8MessageSignalReport`](./contracts#ft8messagesignalreport)
- [`FT8MessageRogerReport`](./contracts#ft8messagerogerreport)
- [`FT8MessageRRR`](./contracts#ft8messagerrr)
- [`FT8MessageSeventyThree`](./contracts#ft8messageseventythree)
- [`FT8MessageFoxRR73`](./contracts#ft8messagefoxrr73)
- [`FT8MessageCustom`](./contracts#ft8messagecustom)
- [`FT8MessageUnknown`](./contracts#ft8messageunknown)
- [`ParsedFT8Message`](./contracts#parsedft8message)
- [`LogbookAnalysis`](./contracts#logbookanalysis)
- [`SlotInfo`](./contracts#slotinfo)
- [`SlotPack`](./contracts#slotpack)
- [`QSORecord`](./contracts#qsorecord)
- [`FrameMessage`](./contracts#framemessage)
- [`ModeDescriptor`](./contracts#modedescriptor)
- [`OperatorSlots`](./contracts#operatorslots)
- [`DxccStatus`](./contracts#dxccstatus)
- [`TargetSelectionPriorityMode`](./contracts#targetselectionprioritymode)
- [`PluginType`](./contracts#plugintype)
- [`PluginPermission`](./contracts#pluginpermission)
- [`PluginSettingType`](./contracts#pluginsettingtype)
- [`PluginSettingDescriptor`](./contracts#pluginsettingdescriptor)
- [`PluginSettingScope`](./contracts#pluginsettingscope)
- [`PluginQuickAction`](./contracts#pluginquickaction)
- [`PluginQuickSetting`](./contracts#pluginquicksetting)
- [`PluginPanelDescriptor`](./contracts#pluginpaneldescriptor)
- [`PluginPanelComponent`](./contracts#pluginpanelcomponent)
- [`PluginSettingOption`](./contracts#pluginsettingoption)
- [`PluginStorageScope`](./contracts#pluginstoragescope)
- [`PluginStorageConfig`](./contracts#pluginstorageconfig)
- [`PluginManifest`](./contracts#pluginmanifest)
- [`PluginStatus`](./contracts#pluginstatus)

## 来自 @tx5dr/contracts 的值导出

- [`FT8MessageType`](./contracts#ft8messagetype)
