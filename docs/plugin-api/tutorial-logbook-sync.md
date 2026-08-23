# 日志同步 Provider

外部日志服务应实现 `LogbookSyncProvider`，由 Host 统一管理连接测试、手动同步、自动上传和设置页。WaveLog、LoTW、QRZ.com 和 Club Log 都使用这套接口。

## 最小定义

```ts
import {
  createSyncFailure,
  definePlugin,
  type LogbookSyncProvider,
} from '@tx5dr/plugin-api';

export default definePlugin({
  apiVersion: 2,
  name: 'my-logbook-sync',
  version: '1.0.0',
  type: 'utility',
  instanceScope: 'global',
  permissions: [
    'network',
    'logbook:read',
    'logbook:write',
    'logbook:sync',
  ],
  storage: { scopes: ['global'] },

  ui: {
    dir: 'ui',
    pages: [{
      id: 'settings',
      title: 'Settings',
      entry: 'settings.html',
      accessScope: 'operator',
      resourceBinding: 'callsign',
    }],
  },

  async onLoad(ctx) {
    const provider: LogbookSyncProvider = {
      id: 'my-service',
      displayName: 'My Service',
      settingsPageId: 'settings',
      accessScope: 'operator',

      async testConnection(callsign) {
        const config = ctx.store.global.get<{ apiKey?: string }>(`config:${callsign}`, {});
        if (!config.apiKey) {
          return { success: false, message: 'API key is required' };
        }
        const response = await ctx.fetch('https://api.example.com/status', {
          headers: { Authorization: `Bearer ${config.apiKey}` },
        });
        return { success: response.ok, message: response.statusText };
      },

      async upload() {
        return { uploaded: 0, skipped: 0, failed: 0 };
      },

      async download() {
        return { downloaded: 0, matched: 0, updated: 0 };
      },

      isConfigured(callsign) {
        const config = ctx.store.global.get<{ apiKey?: string }>(`config:${callsign}`, {});
        return Boolean(config.apiKey);
      },

      isAutoUploadEnabled(callsign) {
        const config = ctx.store.global.get<{ autoUpload?: boolean }>(`config:${callsign}`, {});
        return config.autoUpload === true;
      },
    };

    ctx.logbookSync.register(provider);
  },
});
```

日志同步通常使用 global utility，避免为每个 operator 重复注册同一个服务。所有 Provider 方法仍以 `callsign` 为显式边界。

## 配置页面

设置页必须绑定 Host 验证后的 callsign：

```ts
ui: {
  pages: [{
    id: 'settings',
    title: 'Settings',
    entry: 'settings.html',
    accessScope: 'operator',
    resourceBinding: 'callsign',
  }],
},
```

在 `onLoad` 中注册页面 handler：

```ts
ctx.ui.registerPageHandler({
  async onMessage(pageId, action, data, requestContext) {
    if (pageId !== 'settings') return null;
    if (requestContext.resource?.kind !== 'callsign') {
      throw new Error('Callsign binding is required');
    }

    const callsign = requestContext.resource.value;
    const key = `config:${callsign}`;

    if (action === 'getConfig') {
      return ctx.store.global.get(key, {
        apiKey: '',
        autoUpload: false,
      });
    }

    if (action === 'saveConfig') {
      const input = data as { apiKey?: unknown; autoUpload?: unknown };
      if (typeof input.apiKey !== 'string'
          || typeof input.autoUpload !== 'boolean') {
        throw new Error('Invalid sync configuration');
      }
      ctx.store.global.set(key, {
        apiKey: input.apiKey,
        autoUpload: input.autoUpload,
      });
      return { ok: true };
    }

    return null;
  },
});
```

iframe 读取配置：

```js
await window.tx5dr.ready;
const config = await window.tx5dr.invoke('getConfig');
```

配置和返回结果都是 JSON 快照。Host 会把结果复制到 iframe；插件不需要手动 clone，也不要返回 `ctx`、Provider、文件句柄或带方法的类实例。

## 上传

上传方法通常按以下顺序工作：

1. 从 `ctx.store.global` 读取当前 callsign 的配置。
2. 优先使用 `options.records` 中 Host 提供的自动上传批次。
3. 手动上传时通过 `ctx.logbook.forCallsign(callsign).queryQSOs()` 查找待上传记录。
4. 使用 `ctx.fetch` 发送请求。
5. 在远端确认接受后更新本地 QSO 或插件自己的同步索引。
6. 返回准确的计数和 `failures`。

```ts
async upload(callsign, options) {
  const logbook = ctx.logbook.forCallsign(callsign);
  const records = options?.records ?? await logbook.queryQSOs({});

  // 过滤已上传项、提交远端请求，并在成功后记录状态。
  return {
    submitted: records.length,
    uploaded,
    skipped,
    failed: failures.length,
    failures: failures.length > 0 ? failures : undefined,
  };
}
```

`SyncUploadResult` 使用 `failures`，不是旧版示例中的 `errors`。单项失败尽量包含稳定 `code`、`operation`、`providerId`、`qsoId` 和 `retryable`。

## 下载

下载方法拉取远端数据后，使用 callsign-bound logbook accessor 匹配或写入：

```ts
const logbook = ctx.logbook.forCallsign(callsign);
const existing = await logbook.queryQSOs({
  callsign: remote.callsign,
  timeRange: {
    start: remote.startTime - 60_000,
    end: remote.startTime + 60_000,
  },
  limit: 1,
});

if (existing.length > 0) {
  await logbook.updateQSO(existing[0].id, updates);
} else {
  await logbook.addQSO(remoteRecord);
}
```

批量完成后调用 `await logbook.notifyUpdated()`。返回值包含：

```ts
return {
  downloaded,
  matched,
  updated,
  imported,
  failures: failures.length > 0 ? failures : undefined,
};
```

远端数据必须先转换为公开 `QSORecord` 结构。不要依赖旧字段名，例如 `theirCallsign` 或通用 `qslStatus`。

## 失败和密钥

使用 `createSyncFailure()` 或 `errorToSyncFailure()` 构造结构化失败，并把 API key、密码和 Token 放入 `secrets` 以便脱敏：

```ts
const failure = createSyncFailure({
  code: 'remote_upload_failed',
  message: error instanceof Error ? error.message : 'Upload failed',
  source: 'remote',
  operation: 'upload',
  providerId: 'my-service',
  qsoId: qso.id,
  qsoCallsign: qso.callsign,
  retryable: true,
  secrets: [config.apiKey],
});
```

不要把完整远端响应、授权 header 或私钥写进日志和 `detail`。

## 文件和自定义操作

证书、签名产物和较大 ADIF 文件使用 `ctx.files`；小型配置和同步游标使用 `ctx.store.global`。

Provider 可以通过 `actions` 声明直接 `upload` / `download` / `full_sync` 操作，或用 `pageId` 打开日期范围、证书选择等自定义页面。

## 参考实现

- `qrz-sync`：较简单的 HTTP 上传和 ADIF 下载
- `wavelog-sync`：自定义服务器、API key 和 station 列表
- `clublog-sync`：preflight、批量上传和结构化失败
- `lotw-sync`：证书、签名、进度和多窗口下载

接口签名见 [Logbook Sync Reference](./reference/sync)，页面通信见 [自定义 UI](./tutorial-custom-ui)。
