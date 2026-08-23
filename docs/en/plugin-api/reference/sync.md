# Logbook Sync

Logbook sync providers, results, progress events, and failure types.

## Exports

- [LogbookSyncProvider](#logbooksyncprovider)
- [SyncAction](#syncaction)
- [SyncFailureSource](#syncfailuresource)
- [SyncFailureOperation](#syncfailureoperation)
- [SyncFailure](#syncfailure)
- [SyncFailureInput](#syncfailureinput)
- [sanitizeSyncFailureText](#sanitizesyncfailuretext)
- [createSyncFailure](#createsyncfailure)
- [errorToSyncFailure](#errortosyncfailure)
- [failureMessage](#failuremessage)
- [SyncTestResult](#synctestresult)
- [SyncUploadResult](#syncuploadresult)
- [SyncUploadProgress](#syncuploadprogress)
- [SyncUploadOptions](#syncuploadoptions)
- [SyncUploadPreflightOptions](#syncuploadpreflightoptions)
- [SyncPreflightIssue](#syncpreflightissue)
- [SyncUploadPreflightResult](#syncuploadpreflightresult)
- [SyncDownloadResult](#syncdownloadresult)
- [SyncDownloadProgress](#syncdownloadprogress)
- [SyncDownloadOptions](#syncdownloadoptions)
- [LogbookSyncRegistrar](#logbooksyncregistrar)

## LogbookSyncProvider

- Kind: `interface`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

Logbook sync provider interfaces.

A utility plugin registers a sync provider via `ctx.logbookSync.register()`
during `onLoad`. The host manages per-callsign lifecycle, auto-upload on QSO
completion, and renders the provider's settings page in the sync modal.
Registration requires a global API v2 utility with `logbook:sync`; the
referenced settings page must use `resourceBinding: 'callsign'`.

A logbook sync provider implements the communication logic with a single
external log service (e.g. LoTW, QRZ.com, WaveLog).

All methods receive a `callsign` parameter because sync configuration and
data are organized per-callsign. The provider is responsible for managing
its own per-callsign state (typically via `ctx.store.global` keyed by
callsign).

A typical provider declares `network`, `logbook:read`, `logbook:write` and
`logbook:sync`. It is responsible for querying, writing and deduplicating QSO
records internally. The host routes actions and passes narrow auto-upload
batches; it does not invent provider-specific synchronization behavior.

Every method runs inside a fresh Host invocation. Results that complete after
unload/reload are discarded. Return structured `failures` for expected
operational problems; reserve thrown errors for unexpected failures. Provider
results, details and progress payloads must remain JSON-compatible.

```ts
export interface LogbookSyncProvider {
    readonly id: string;
    readonly displayName: string;
    readonly icon?: string;
    readonly color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
    readonly accessScope?: 'admin' | 'operator';
    readonly settingsPageId: string;
    readonly actions?: SyncAction[];
    testConnection(callsign: string): Promise<SyncTestResult>;
    upload(callsign: string, options?: SyncUploadOptions): Promise<SyncUploadResult>;
    getUploadPreflight?(callsign: string, options?: SyncUploadPreflightOptions): Promise<SyncUploadPreflightResult>;
    download(callsign: string, options?: SyncDownloadOptions): Promise<SyncDownloadResult>;
    isConfigured(callsign: string): boolean;
    isAutoUploadEnabled(callsign: string): boolean;
}
```

### LogbookSyncProvider.id

Stable service identifier (e.g. 'lotw', 'qrz', 'wavelog').

```ts

readonly id: string;

```

### LogbookSyncProvider.displayName

Display name (i18n key or literal text).

```ts

readonly displayName: string;

```

### LogbookSyncProvider.icon

Optional icon identifier (FontAwesome icon name or URL).

```ts

readonly icon?: string;

```

### LogbookSyncProvider.color

Optional button color hint for the frontend (HeroUI color name).

```ts

readonly color?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';

```

### LogbookSyncProvider.accessScope

Which audience may access Host routes for this provider. Defaults to `admin`.

```ts

readonly accessScope?: 'admin' | 'operator';

```

### LogbookSyncProvider.settingsPageId

ID of the settings page declared in `PluginDefinition.ui.pages`.
The host renders this page inside `<PluginIframeHost>` in the sync
settings modal, passing `{ callsign }` as params.

```ts

readonly settingsPageId: string;

```

### LogbookSyncProvider.actions

Custom sync action menu items. When declared, these replace the default
three-item dropdown (download / upload / full_sync).

Each action either performs an operation directly (`operation`) or opens
an iframe page for user input before proceeding (`pageId`).

```ts

readonly actions?: SyncAction[];

```

### LogbookSyncProvider.testConnection

Tests credentials/connectivity and returns a user-displayable result.

```ts

testConnection(callsign: string): Promise<SyncTestResult>;

```

### LogbookSyncProvider.upload

Uploads QSO records to the external service.

Manual uploads typically query the logbook via `ctx.logbook.queryQSOs()`
internally to determine which records to upload. Auto-upload may pass a
narrow `options.records` batch so providers can upload only the freshly
completed QSOs without re-scanning the entire logbook.

Providers remain responsible for updating any per-QSO sync fields
(e.g. `lotwQslSent`) via `ctx.logbook.updateQSO()`.

```ts

upload(callsign: string, options?: SyncUploadOptions): Promise<SyncUploadResult>;

```

### LogbookSyncProvider.getUploadPreflight

Optional host-visible upload readiness check.

When implemented, the host may call this before upload/full-sync actions
to surface blocked QSOs or missing configuration without starting upload.

```ts

getUploadPreflight?(callsign: string, options?: SyncUploadPreflightOptions): Promise<SyncUploadPreflightResult>;

```

### LogbookSyncProvider.download

Downloads QSO confirmations/records from the external service.

The provider writes downloaded records or QSL updates directly into the
logbook via `ctx.logbook.addQSO()` / `ctx.logbook.updateQSO()`. It
should call `ctx.logbook.notifyUpdated()` when done.

```ts

download(callsign: string, options?: SyncDownloadOptions): Promise<SyncDownloadResult>;

```

### LogbookSyncProvider.isConfigured

Returns `true` when the provider is fully configured for this callsign.

```ts

isConfigured(callsign: string): boolean;

```

### LogbookSyncProvider.isAutoUploadEnabled

Returns `true` when auto-upload is enabled for this callsign.

```ts

isAutoUploadEnabled(callsign: string): boolean;

```
## SyncAction

- Kind: `interface`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

Describes a single sync action menu item displayed in the frontend dropdown.

Either `operation` or `pageId` must be set (not both):
- `operation`: the host directly calls the corresponding provider method
- `pageId`: the host opens an iframe page where the user provides input;
  the page then triggers the operation via `bridge.invoke()`.

```ts
export interface SyncAction {
    id: string;
    label: string;
    description?: string;
    icon?: 'download' | 'upload' | 'sync';
    pageId?: string;
    operation?: 'upload' | 'download' | 'full_sync';
}
```

### SyncAction.id

Unique action identifier within this provider.

```ts

id: string;

```

### SyncAction.label

Display label for the menu item.

```ts

label: string;

```

### SyncAction.description

Optional description text shown below the label.

```ts

description?: string;

```

### SyncAction.icon

Icon hint: download / upload / sync.

```ts

icon?: 'download' | 'upload' | 'sync';

```

### SyncAction.pageId

When set, clicking this action opens the iframe page (registered in
`PluginDefinition.ui.pages`) instead of directly executing an operation.
The page is responsible for collecting user input and calling
`bridge.invoke()` to trigger the actual sync.

```ts

pageId?: string;

```

### SyncAction.operation

When set (and `pageId` is not), clicking this action directly triggers
the corresponding provider method.

```ts

operation?: 'upload' | 'download' | 'full_sync';

```
## SyncFailureSource

- Kind: `type`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

Layer that produced a synchronization failure.

```ts
export type SyncFailureSource = 'provider' | 'host' | 'remote' | 'network' | 'logbook';
```
## SyncFailureOperation

- Kind: `type`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

User-visible synchronization operation associated with a failure.

```ts
export type SyncFailureOperation = 'upload' | 'download' | 'full_sync' | 'preflight' | 'test_connection';
```
## SyncFailure

- Kind: `interface`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

Structured failure intended for logs and plugin UI.

Construct failures with `createSyncFailure()` or `errorToSyncFailure()` so
common credentials are redacted. Direct object construction performs no
automatic sanitization.

```ts
export interface SyncFailure {
    code: string;
    message: string;
    source?: SyncFailureSource;
    operation?: SyncFailureOperation;
    providerId?: string;
    qsoId?: string;
    qsoCallsign?: string;
    httpStatus?: number;
    retryable?: boolean;
    detail?: string;
}
```

### SyncFailure.code

Stable machine-readable code owned by the provider or Host.

```ts

code: string;

```

### SyncFailure.message

Short display message; callers constructing directly must sanitize secrets.

```ts

message: string;

```

### SyncFailure.source

Layer that produced the failure.

```ts

source?: SyncFailureSource;

```

### SyncFailure.operation

Sync operation that was in progress.

```ts

operation?: SyncFailureOperation;

```

### SyncFailure.providerId

Provider ID when the failure crosses a shared Host surface.

```ts

providerId?: string;

```

### SyncFailure.qsoId

Local QSO record ID for a per-record failure.

```ts

qsoId?: string;

```

### SyncFailure.qsoCallsign

Remote station callsign for a per-record failure.

```ts

qsoCallsign?: string;

```

### SyncFailure.httpStatus

HTTP response status when a remote request reached the server.

```ts

httpStatus?: number;

```

### SyncFailure.retryable

Whether retrying later without changing input may succeed.

```ts

retryable?: boolean;

```

### SyncFailure.detail

Optional diagnostic detail; callers constructing directly must sanitize it.

```ts

detail?: string;

```
## SyncFailureInput

- Kind: `type`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

Input accepted by `createSyncFailure`, including values that must be redacted.

```ts
export type SyncFailureInput = Omit<SyncFailure, 'message' | 'detail'> & {
    message?: string;
    detail?: string;
    secrets?: Array<string | undefined | null>;
};
```
## sanitizeSyncFailureText

- Kind: `function`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

Best-effort redaction of explicit secrets and common credential-bearing URL/query patterns.

```ts
export function sanitizeSyncFailureText(value: unknown, secrets: Array<string | undefined | null> = []): string {
    let text = typeof value === 'string' ? value : String(value ?? '');
    for (const secret of secrets) {
        if (!secret || secret.length < 4) {
            continue;
        }
        text = text.replace(new RegExp(`(?<![A-Za-z0-9])${escapeRegExp(secret)}(?![A-Za-z0-9])`, 'g'), '[redacted]');
    }
    return text
        .replace(SECRET_QUERY_PARAM_PATTERN, '$1[redacted]')
        .replace(WAVELOG_STATION_INFO_KEY_PATTERN, '$1[redacted]');
}
```
## createSyncFailure

- Kind: `function`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

Builds a normalized failure after sanitizing its message and detail.

```ts
export function createSyncFailure(input: SyncFailureInput): SyncFailure {
    const secrets = input.secrets ?? [];
    const message = sanitizeSyncFailureText(input.message || input.code || 'Sync failed', secrets);
    const detail = input.detail ? sanitizeSyncFailureText(input.detail, secrets) : undefined;
    return {
        code: input.code,
        message,
        source: input.source,
        operation: input.operation,
        providerId: input.providerId,
        qsoId: input.qsoId,
        qsoCallsign: input.qsoCallsign,
        httpStatus: input.httpStatus,
        retryable: input.retryable,
        detail,
    };
}
```
## errorToSyncFailure

- Kind: `function`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

Converts an unknown thrown value into a normalized, sanitized failure.

```ts
export function errorToSyncFailure(error: unknown, defaults: SyncFailureInput): SyncFailure {
    const message = error instanceof Error
        ? error.message
        : (typeof error === 'string' ? error : defaults.message);
    const errorCause = error instanceof Error
        ? (error as unknown as {
            cause?: unknown;
        }).cause
        : undefined;
    const cause = errorCause instanceof Error ? errorCause.message : undefined;
    return createSyncFailure({
        ...defaults,
        message: message || defaults.message || defaults.code,
        detail: defaults.detail ?? cause,
    });
}
```
## failureMessage

- Kind: `function`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

Formats one failure for compact user-facing lists.

```ts
export function failureMessage(failure: SyncFailure): string {
    const prefix = failure.qsoCallsign ? `${failure.qsoCallsign}: ` : '';
    const suffix = failure.httpStatus ? ` (HTTP ${failure.httpStatus})` : '';
    return `${prefix}${failure.message}${suffix}`;
}
```
## SyncTestResult

- Kind: `interface`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

Result returned by `LogbookSyncProvider.testConnection()`.

```ts
export interface SyncTestResult {
    success: boolean;
    message?: string;
    details?: unknown;
    failures?: SyncFailure[];
}
```

### SyncTestResult.success

Whether credentials and the tested remote operation succeeded.

```ts

success: boolean;

```

### SyncTestResult.message

Human-readable result description.

```ts

message?: string;

```

### SyncTestResult.details

Additional service-specific details (e.g. account info, logbook count).

```ts

details?: unknown;

```

### SyncTestResult.failures

Structured failures when the test did not fully succeed.

```ts

failures?: SyncFailure[];

```
## SyncUploadResult

- Kind: `interface`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

Aggregate result returned after an upload attempt.

```ts
export interface SyncUploadResult {
    submitted?: number;
    verified?: number;
    uploaded: number;
    skipped: number;
    failed: number;
    failures?: SyncFailure[];
}
```

### SyncUploadResult.submitted

Number of records submitted to the external service.

```ts

submitted?: number;

```

### SyncUploadResult.verified

> **Deprecated:** Upload providers should not verify by querying the external service; download sync owns confirmation.

```ts

verified?: number;

```

### SyncUploadResult.uploaded

Records accepted by the remote service and committed to local sync state.

```ts

uploaded: number;

```

### SyncUploadResult.skipped

Records intentionally not submitted, for example because they were already sent.

```ts

skipped: number;

```

### SyncUploadResult.failed

Records that could not be uploaded.

```ts

failed: number;

```

### SyncUploadResult.failures

Structured per-record or operation failures.

```ts

failures?: SyncFailure[];

```
## SyncUploadProgress

- Kind: `interface`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

Incremental upload status sent to an optional in-process progress callback.

```ts
export interface SyncUploadProgress {
    stage: 'preparing' | 'prepared' | 'batch_uploading' | 'batch_accepted' | 'batch_failed' | 'updating_local' | 'finished';
    callsign?: string;
    batchIndex?: number;
    batchCount?: number;
    qsoCount?: number;
    pendingCount?: number;
    uploadableCount?: number;
    blockedCount?: number;
    submitted?: number;
    uploaded?: number;
    verified?: number;
    skipped?: number;
    failed?: number;
    failureCount?: number;
    message?: string;
}
```

### SyncUploadProgress.stage

Current upload pipeline phase.

```ts

stage: 'preparing' | 'prepared' | 'batch_uploading' | 'batch_accepted' | 'batch_failed' | 'updating_local' | 'finished';

```

### SyncUploadProgress.callsign

Station callsign whose logbook is being synchronized.

```ts

callsign?: string;

```

### SyncUploadProgress.batchIndex

One-based current batch number.

```ts

batchIndex?: number;

```

### SyncUploadProgress.batchCount

Total number of upload batches.

```ts

batchCount?: number;

```

### SyncUploadProgress.qsoCount

QSO records represented by the current progress event.

```ts

qsoCount?: number;

```

### SyncUploadProgress.pendingCount

Records discovered as pending upload.

```ts

pendingCount?: number;

```

### SyncUploadProgress.uploadableCount

Pending records eligible for this upload.

```ts

uploadableCount?: number;

```

### SyncUploadProgress.blockedCount

Pending records blocked by preflight validation.

```ts

blockedCount?: number;

```

### SyncUploadProgress.submitted

Records submitted to the remote service so far.

```ts

submitted?: number;

```

### SyncUploadProgress.uploaded

Records accepted and reflected in local sync state so far.

```ts

uploaded?: number;

```

### SyncUploadProgress.verified

> **Deprecated:** Upload providers should not verify by querying the external service; download sync owns confirmation.

```ts

verified?: number;

```

### SyncUploadProgress.skipped

Records intentionally skipped so far.

```ts

skipped?: number;

```

### SyncUploadProgress.failed

Records whose upload failed so far.

```ts

failed?: number;

```

### SyncUploadProgress.failureCount

Structured failures accumulated so far.

```ts

failureCount?: number;

```

### SyncUploadProgress.message

Optional short status text for custom UIs.

```ts

message?: string;

```
## SyncUploadOptions

- Kind: `interface`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

Optional range, source batch and progress callback for an upload.

```ts
export interface SyncUploadOptions {
    trigger?: 'manual' | 'auto';
    since?: number;
    until?: number;
    includeAlreadyUploaded?: boolean;
    skipBlockedQsos?: boolean;
    onProgress?: (progress: SyncUploadProgress) => void;
    records?: import('@tx5dr/contracts').QSORecord[];
}
```

### SyncUploadOptions.trigger

Distinguishes manual uploads from auto-upload triggered by QSO completion.

```ts

trigger?: 'manual' | 'auto';

```

### SyncUploadOptions.since

Upload records starting at this timestamp (epoch ms), inclusive.

```ts

since?: number;

```

### SyncUploadOptions.until

Upload records ending at this timestamp (epoch ms), inclusive.

```ts

until?: number;

```

### SyncUploadOptions.includeAlreadyUploaded

Include records already marked as uploaded/sent locally. Defaults to false.

```ts

includeAlreadyUploaded?: boolean;

```

### SyncUploadOptions.skipBlockedQsos

Continue with uploadable records when preflight only found per-QSO blockers.

```ts

skipBlockedQsos?: boolean;

```

### SyncUploadOptions.onProgress

Optional in-process progress callback for custom sync UIs.

```ts

onProgress?: (progress: SyncUploadProgress) => void;

```

### SyncUploadOptions.records

Optional explicit QSO batch supplied by the host.

When present, providers should prefer this list over performing another
logbook scan so auto-upload can stay scoped to the just-completed QSOs.

```ts

records?: import('@tx5dr/contracts').QSORecord[];

```
## SyncUploadPreflightOptions

- Kind: `interface`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

Range and inclusion rules used by an upload readiness check.

```ts
export interface SyncUploadPreflightOptions {
    since?: number;
    until?: number;
    includeAlreadyUploaded?: boolean;
}
```

### SyncUploadPreflightOptions.since

Check records starting at this timestamp (epoch ms), inclusive.

```ts

since?: number;

```

### SyncUploadPreflightOptions.until

Check records ending at this timestamp (epoch ms), inclusive.

```ts

until?: number;

```

### SyncUploadPreflightOptions.includeAlreadyUploaded

Include records already marked as uploaded/sent locally. Defaults to false.

```ts

includeAlreadyUploaded?: boolean;

```
## SyncPreflightIssue

- Kind: `interface`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

One actionable issue discovered before upload starts.

```ts
export interface SyncPreflightIssue {
    code: string;
    severity: 'info' | 'warning' | 'error';
    message: string;
    detail?: string;
    qsoId?: string;
    qsoCallsign?: string;
}
```

### SyncPreflightIssue.code

Stable provider-owned issue code.

```ts

code: string;

```

### SyncPreflightIssue.severity

Whether the issue is informational, cautionary or blocking.

```ts

severity: 'info' | 'warning' | 'error';

```

### SyncPreflightIssue.message

Short user-facing explanation.

```ts

message: string;

```

### SyncPreflightIssue.detail

Optional sanitized diagnostic or remediation detail.

```ts

detail?: string;

```

### SyncPreflightIssue.qsoId

Local QSO ID when the issue concerns one record.

```ts

qsoId?: string;

```

### SyncPreflightIssue.qsoCallsign

Target callsign when the issue concerns one record.

```ts

qsoCallsign?: string;

```
## SyncUploadPreflightResult

- Kind: `interface`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

Aggregate readiness result shown before an upload or full sync.

```ts
export interface SyncUploadPreflightResult {
    ready: boolean;
    pendingCount: number;
    uploadableCount: number;
    blockedCount: number;
    issues?: SyncPreflightIssue[];
    canSkipBlocked?: boolean;
    guidance?: string[];
}
```

### SyncUploadPreflightResult.ready

Whether upload can start without skipping blocking records.

```ts

ready: boolean;

```

### SyncUploadPreflightResult.pendingCount

Records currently awaiting upload.

```ts

pendingCount: number;

```

### SyncUploadPreflightResult.uploadableCount

Pending records that can be uploaded now.

```ts

uploadableCount: number;

```

### SyncUploadPreflightResult.blockedCount

Pending records blocked by validation or missing data.

```ts

blockedCount: number;

```

### SyncUploadPreflightResult.issues

Structured issues for the operation or individual records.

```ts

issues?: SyncPreflightIssue[];

```

### SyncUploadPreflightResult.canSkipBlocked

Whether the provider supports continuing with only uploadable records.

```ts

canSkipBlocked?: boolean;

```

### SyncUploadPreflightResult.guidance

Optional ordered remediation hints for the UI.

```ts

guidance?: string[];

```
## SyncDownloadResult

- Kind: `interface`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

Aggregate result returned after downloading and reconciling remote data.

```ts
export interface SyncDownloadResult {
    downloaded: number;
    matched: number;
    updated: number;
    imported?: number;
    windowCount?: number;
    failures?: SyncFailure[];
}
```

### SyncDownloadResult.downloaded

Number of records downloaded from the external service.

```ts

downloaded: number;

```

### SyncDownloadResult.matched

Number of records matched to existing local QSOs.

```ts

matched: number;

```

### SyncDownloadResult.updated

Number of local QSOs whose QSL status was updated.

```ts

updated: number;

```

### SyncDownloadResult.imported

Number of downloaded records imported because no local match existed.

```ts

imported?: number;

```

### SyncDownloadResult.windowCount

Number of provider request windows used to download the range.

```ts

windowCount?: number;

```

### SyncDownloadResult.failures

Structured request, parsing or per-record failures.

```ts

failures?: SyncFailure[];

```
## SyncDownloadProgress

- Kind: `interface`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

Incremental status sent while a provider downloads one or more windows.

```ts
export interface SyncDownloadProgress {
    stage: 'preparing' | 'window_waiting' | 'window_downloading' | 'window_retrying' | 'window_processing' | 'window_done' | 'window_failed' | 'finished';
    callsign?: string;
    windowIndex?: number;
    windowCount?: number;
    range?: string;
    waitSeconds?: number;
    attempt?: number;
    recordCount?: number;
    downloaded?: number;
    matched?: number;
    updated?: number;
    imported?: number;
    failed?: number;
    failureCount?: number;
    message?: string;
}
```

### SyncDownloadProgress.stage

Current download pipeline phase.

```ts

stage: 'preparing' | 'window_waiting' | 'window_downloading' | 'window_retrying' | 'window_processing' | 'window_done' | 'window_failed' | 'finished';

```

### SyncDownloadProgress.callsign

Station callsign whose logbook is being synchronized.

```ts

callsign?: string;

```

### SyncDownloadProgress.windowIndex

One-based current request-window number.

```ts

windowIndex?: number;

```

### SyncDownloadProgress.windowCount

Total request windows planned for the selected range.

```ts

windowCount?: number;

```

### SyncDownloadProgress.range

Human-readable date/time range represented by the current window.

```ts

range?: string;

```

### SyncDownloadProgress.waitSeconds

Provider-mandated wait before the next request.

```ts

waitSeconds?: number;

```

### SyncDownloadProgress.attempt

One-based retry attempt for the current window.

```ts

attempt?: number;

```

### SyncDownloadProgress.recordCount

Remote records returned by the current window.

```ts

recordCount?: number;

```

### SyncDownloadProgress.downloaded

Remote records downloaded so far.

```ts

downloaded?: number;

```

### SyncDownloadProgress.matched

Remote records matched to existing local QSOs so far.

```ts

matched?: number;

```

### SyncDownloadProgress.updated

Existing local QSOs updated so far.

```ts

updated?: number;

```

### SyncDownloadProgress.imported

New remote records imported so far.

```ts

imported?: number;

```

### SyncDownloadProgress.failed

Records/windows that failed so far.

```ts

failed?: number;

```

### SyncDownloadProgress.failureCount

Structured failures accumulated so far.

```ts

failureCount?: number;

```

### SyncDownloadProgress.message

Optional short status text for custom UIs.

```ts

message?: string;

```
## SyncDownloadOptions

- Kind: `interface`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

Optional date range and progress callback for a download.

```ts
export interface SyncDownloadOptions {
    since?: number;
    until?: number;
    onProgress?: (progress: SyncDownloadProgress) => void;
}
```

### SyncDownloadOptions.since

Download records since this timestamp (epoch ms).

```ts

since?: number;

```

### SyncDownloadOptions.until

Download records until this timestamp (epoch ms).

```ts

until?: number;

```

### SyncDownloadOptions.onProgress

Optional in-process progress callback for custom sync UIs.

```ts

onProgress?: (progress: SyncDownloadProgress) => void;

```
## LogbookSyncRegistrar

- Kind: `interface`
- Source: [sync.ts](https://github.com/boybook/tx-5dr/blob/main/packages/plugin-api/src/sync.ts)

Registration entry point exposed via `ctx.logbookSync`.

```ts
export interface LogbookSyncRegistrar {
    register(provider: LogbookSyncProvider): void;
}
```

### LogbookSyncRegistrar.register

Registers a logbook sync provider. The host stores the reference and
exposes it through the sync settings UI and auto-upload pipeline.

A single plugin may register multiple providers (e.g. one plugin
supporting both upload and download for different services).
The Host unregisters every provider owned by the plugin generation during
disable, reload or unload.

```ts

register(provider: LogbookSyncProvider): void;

```
