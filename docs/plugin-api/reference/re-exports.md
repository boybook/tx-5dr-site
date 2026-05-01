# Re-exports

该页列出 `index.ts` 对外转出的本包接口和 contracts 类型。

> 自动生成自 `../tx-5dr/packages/plugin-api/src/index.ts`

## plugin-api 本地导出

- `./definition.js`: `PluginDefinition`
- `./context.js`: `PluginContext`
- `./hooks.js`: `PluginHooks`、`AutoCallProposal`、`AutoCallExecutionRequest`、`AutoCallExecutionPlan`、`ScoredCandidate`、`StrategyDecision`、`StrategyDecisionMeta`、`LastMessageInfo`、`QSOFailureInfo`
- `./runtime.js`: `StrategyRuntime`、`StrategyRuntimeContext`、`StrategyRuntimeSnapshot`、`StrategyRuntimeSlot`、`StrategyRuntimeSlotContentUpdate`
- `./settings.js`: `HostSettingsControl`、`HostSettingsNamespace`、`HostFrequencyPresetsSettingsNamespace`、`HostFT8Settings`、`HostFT8SettingsPatch`、`HostFrequencyPresetsSettings`、`HostStationInfoPatch`、`HostPSKReporterSettingsPatch`
- `./helpers.js`: `KVStore`、`PluginLogger`、`PluginTimers`、`OperatorControl`、`RadioControl`、`RadioCapabilitiesControl`、`RadioPowerControl`、`RadioPowerSetOptions`、`LogbookAccess`、`CallsignLogbookAccess`、`QSOQueryFilter`、`BandAccess`、`IdleTransmitFrequencyOptions`、`AutoTargetEligibilityReason`、`AutoTargetEligibilityDecision`、`UIBridge`、`PanelMeta`、`PluginUIHandler`、`PluginUIRequestContext`、`PluginUIRequestUser`、`PluginUIBoundResource`、`PluginUIInstanceTarget`、`PluginUIPageSessionInfo`、`PluginUIPageContext`、`PluginFileStore`
- `./sync.js`: `LogbookSyncProvider`、`LogbookSyncRegistrar`、`SyncAction`、`SyncTestResult`、`SyncUploadOptions`、`SyncUploadResult`、`SyncPreflightIssue`、`SyncUploadPreflightResult`、`SyncDownloadResult`、`SyncDownloadOptions`
- `./ft8-message-type.js`: `FT8MessageType`
- `./utils/callsign.js`: `normalizeCallsign`
- `./utils/adif.js`: `parseADIFContent`、`parseADIFRecord`、`parseADIFFields`、`convertQSOToADIF`、`generateADIFFile`、`formatADIFDate`、`formatADIFTime`、`parseADIFDateTime`
- `./utils/page-scope.js`: `getPluginPageFileScopePath`、`getPluginPageScopePath`、`getPluginPageScopeSegments`、`getPluginPageStorePath`
- `./utils/page-scope.js`: `PluginPageBoundResource`
- `./utils/qso-text-fields.js`: `parseLegacyComment`、`resolveQsoComment`、`buildCommentFromMessageHistory`、`normalizeMessageHistory`

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
- [`PluginInstanceScope`](./contracts#plugininstancescope)
- [`PluginPermission`](./contracts#pluginpermission)
- [`PluginSettingType`](./contracts#pluginsettingtype)
- [`PluginSettingDescriptor`](./contracts#pluginsettingdescriptor)
- [`PluginSettingScope`](./contracts#pluginsettingscope)
- [`PluginQuickAction`](./contracts#pluginquickaction)
- [`PluginQuickSetting`](./contracts#pluginquicksetting)
- [`PluginCapability`](./contracts#plugincapability)
- [`PluginPanelDescriptor`](./contracts#pluginpaneldescriptor)
- [`PluginPanelComponent`](./contracts#pluginpanelcomponent)
- [`PluginPanelWidth`](./contracts#pluginpanelwidth)
- [`PluginUIPanelContributionGroup`](./contracts#pluginuipanelcontributiongroup)
- [`PluginUIPanelContributionTarget`](./contracts#pluginuipanelcontributiontarget)
- [`PluginObjectArrayField`](./contracts#pluginobjectarrayfield)
- [`PluginSettingOption`](./contracts#pluginsettingoption)
- [`PluginStorageScope`](./contracts#pluginstoragescope)
- [`PluginStorageConfig`](./contracts#pluginstorageconfig)
- [`PluginManifest`](./contracts#pluginmanifest)
- [`PluginStatus`](./contracts#pluginstatus)
- [`PluginUIPageDescriptor`](./contracts#pluginuipagedescriptor)
- [`PluginUIConfig`](./contracts#pluginuiconfig)
- [`CapabilityList`](./contracts#capabilitylist)
- [`CapabilityState`](./contracts#capabilitystate)
- [`CapabilityDescriptor`](./contracts#capabilitydescriptor)
- [`CapabilityValue`](./contracts#capabilityvalue)
- [`WriteCapabilityPayload`](./contracts#writecapabilitypayload)
- [`RadioPowerRequest`](./contracts#radiopowerrequest)
- [`RadioPowerResponse`](./contracts#radiopowerresponse)
- [`RadioPowerState`](./contracts#radiopowerstate)
- [`RadioPowerStateEvent`](./contracts#radiopowerstateevent)
- [`RadioPowerSupportInfo`](./contracts#radiopowersupportinfo)
- [`RadioPowerTarget`](./contracts#radiopowertarget)
- [`DecodeWindowSettings`](./contracts#decodewindowsettings)
- [`RealtimeSettings`](./contracts#realtimesettings)
- [`RealtimeSettingsResponseData`](./contracts#realtimesettingsresponsedata)
- [`PresetFrequency`](./contracts#presetfrequency)
- [`StationInfo`](./contracts#stationinfo)
- [`PSKReporterConfig`](./contracts#pskreporterconfig)
- [`NtpServerListSettings`](./contracts#ntpserverlistsettings)
- [`UpdateNtpServerListRequest`](./contracts#updatentpserverlistrequest)

## 来自 @tx5dr/contracts 的值导出

