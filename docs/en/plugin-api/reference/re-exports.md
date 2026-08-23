# Re-exports

Public exports from the `@tx5dr/plugin-api` package.

## Local plugin-api exports

- `./definition.js`: `definePlugin`
- `./capabilities.js`: `PLUGIN_COMMAND_CAPABILITY_PERMISSIONS`, `PLUGIN_CONTEXT_CAPABILITY_KEYS`, `getPluginContextCapabilityKeys`
- `./capabilities.js`: `PluginContextCapabilityKey`, `PluginContextCapabilityPermission`
- `./definition.js`: `PluginDefinition`, `AnyPluginDefinition`
- `./context.js`: `PluginContext`, `PluginContextBase`, `PluginCleanupContext`, `PluginContextFor`, `RuntimePluginContext`, `StrategyPluginContext`, `PluginEligibilityContext`
- `./host-dependencies.js`: `HostDependencies`, `HamlibHostDependency`, `HamlibRotator`, `HamlibRotatorConstructor`, `HamlibSupportedRotatorInfo`, `HamlibRotatorConnectionInfo`, `HamlibRotatorPosition`, `HamlibRotatorStatus`, `HamlibRotatorDirection`, `HamlibRotatorResetType`, `HamlibConfigFieldDescriptor`, `HamlibPortCaps`, `HamlibRotatorCaps`
- `./hooks.js`: `PluginHooks`, `AutoCallProposal`, `AutoCallExecutionRequest`, `AutoCallExecutionPlan`, `SlotActivityEvent`, `FrequencyChangeState`, `ScoredCandidate`, `StrategyDecision`, `StrategyDecisionMeta`, `LastMessageInfo`, `QSOFailureInfo`
- `./runtime.js`: `StrategyRuntime`, `StrategyRuntimeContext`, `StrategyRuntimeSnapshot`, `StrategyRuntimeSlot`, `StrategyRuntimeSlotContentUpdate`, `StrategyRuntimeCheckpoint`, `StrategyDecisionMetaV2`, `StrategyDecisionResult`, `StrategyDecisionSource`, `StrategyQSOCompletionEffect`, `StrategyQSOCompletionSettlement`, `AssistedQueueDisplayState`, `AssistedQueuePauseReason`, `AssistedQueueTone`, `AssistedQueueIcon`, `AssistedQueueRow`, `AssistedQueueSnapshot`, `QueuedStrategyObservationMeta`, `QueuedStrategyTargetRequest`, `QueuedStrategyMutationResult`, `QueuedStrategyRuntime`
- `./runtime.js`: `isQueuedStrategyRuntime`
- `./settings.js`: `HostSettingsControl`, `HostSettingsNamespace`, `HostFrequencyPresetsSettingsNamespace`, `HostFT8Settings`, `HostFT8SettingsPatch`, `HostFrequencyPresetsSettings`, `HostStationInfoPatch`, `HostPSKReporterSettingsPatch`
- `./helpers.js`: `KVStore`, `PluginLogger`, `PluginTimers`, `OtherOperatorSnapshot`, `OperatorSnapshot`, `OperatorCommandPort`, `PluginOperatorCommand`, `PluginOperatorCommandResult`, `RadioView`, `RadioOperatingMode`, `RadioCapabilitiesView`, `RadioCommandPort`, `PluginRadioCommand`, `RadioTunerCommandPort`, `PluginRadioTunerCommand`, `RadioPowerView`, `RadioPowerCommandPort`, `PluginRadioPowerCommand`, `RadioPowerSetOptions`, `LogbookAccess`, `LogbookReadAccess`, `LogbookCommandPort`, `CallsignLogbookAccess`, `CallsignLogbookReadAccess`, `CallsignLogbookCommandPort`, `QSOQueryFilter`, `BandAccess`, `IdleTransmitFrequencyOptions`, `AutoTargetEligibilityReason`, `AutoTargetEligibilityDecision`, `UIBridge`, `PanelMeta`, `PluginUIHandler`, `PluginUIRequestContext`, `PluginUIRequestUser`, `PluginUIBoundResource`, `PluginUIInstanceTarget`, `PluginUIPageSessionInfo`, `PluginUIPageContext`, `PluginFileStore`, `PluginNetworkControl`, `PluginEventBus`, `PluginEventBusMessage`, `PluginUdpControl`, `PluginUdpSocket`, `PluginUdpSocketOptions`, `PluginUdpBindOptions`, `PluginUdpRemoteInfo`
- `@tx5dr/core`: `getCallsignInfo`, `listDXCCEntities`, `resolveDXCCEntity`
- `@tx5dr/core`: `CallsignInfo`, `DXCCEntity`, `DXCCResolutionResult`
- `./sync.js`: `LogbookSyncProvider`, `LogbookSyncRegistrar`, `SyncAction`, `SyncFailure`, `SyncFailureInput`, `SyncFailureOperation`, `SyncFailureSource`, `SyncTestResult`, `SyncUploadProgress`, `SyncUploadOptions`, `SyncUploadPreflightOptions`, `SyncUploadResult`, `SyncPreflightIssue`, `SyncUploadPreflightResult`, `SyncDownloadProgress`, `SyncDownloadResult`, `SyncDownloadOptions`
- `./sync.js`: `createSyncFailure`, `errorToSyncFailure`, `failureMessage`, `sanitizeSyncFailureText`
- `./ft8-message-type.js`: `FT8MessageType`
- `./utils/callsign.js`: `normalizeCallsign`
- `./utils/adif.js`: `parseADIFContent`, `parseADIFRecord`, `parseADIFFields`, `convertQSOToADIF`, `generateADIFFile`, `formatADIFDate`, `formatADIFTime`, `parseADIFDateTime`
- `./utils/page-scope.js`: `getPluginPageFileScopePath`, `getPluginPageScopePath`, `getPluginPageScopeSegments`, `getPluginPageStorePath`
- `./utils/page-scope.js`: `PluginPageBoundResource`
- `./utils/qso-text-fields.js`: `buildSignalReportComment`, `parseQsoTextFields`, `parseLegacyComment`, `parseMessageHistoryText`, `resolveQsoComment`, `buildCommentFromMessageHistory`, `normalizeMessageHistory`, `sanitizeAdifFieldValue`

## Type exports from @tx5dr/contracts

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
- [`FrequencyState`](./contracts#frequencystate)
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
- [`PluginPanelOpenMode`](./contracts#pluginpanelopenmode)
- [`PluginPanelUISize`](./contracts#pluginpaneluisize)
- [`PluginUIPanelContributionGroup`](./contracts#pluginuipanelcontributiongroup)
- [`PluginUIPanelContributionTarget`](./contracts#pluginuipanelcontributiontarget)
- [`PluginObjectArrayField`](./contracts#pluginobjectarrayfield)
- [`PluginKeyedStringArrayKey`](./contracts#pluginkeyedstringarraykey)
- [`PluginSettingCondition`](./contracts#pluginsettingcondition)
- [`PluginSettingConditionalDescription`](./contracts#pluginsettingconditionaldescription)
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

## Value exports from @tx5dr/contracts
