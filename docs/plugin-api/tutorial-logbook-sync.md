# 第 7 章：日志同步 Provider

前面的章节都在讨论自动化通联流程。这一章切换到另一个重要场景：把通联记录同步到外部日志服务。

TX-5DR 的日志同步系统基于插件 Provider 模式 -- 每个外部服务（LoTW、QRZ.com、WaveLog 等）都是一个 utility 插件，通过 `ctx.logbookSync.register()` 注册自己的同步能力。

## 为什么用插件

在此之前，所有日志同步逻辑都硬编码在核心代码里。每加一个服务就要改核心，核心代码膨胀，服务之间还会互相影响。

迁移到插件之后：

- 每个服务完全自包含：连接逻辑、设置 UI、证书管理都在一个插件目录里
- 新增服务不需要改核心代码
- 用户可以按需安装，不用的服务不会加载
- 每个插件有独立的存储作用域和文件沙箱

## 最小 Provider 骨架

先写一个能注册但什么都不做的 Provider：

```ts
import type { PluginDefinition } from '@tx5dr/plugin-api';

const plugin: PluginDefinition = {
  name: 'my-sync',
  version: '1.0.0',
  type: 'utility',
  permissions: ['network'],
  ui: {
    dir: 'ui',
    pages: [{ id: 'settings', title: 'Settings', entry: 'settings.html' }],
  },
  storage: { scopes: ['global'] },

  onLoad(ctx) {
    ctx.logbookSync.register({
      id: 'my-service',
      displayName: 'My Service',
      settingsPageId: 'settings',

      async testConnection(callsign) {
        return { success: false, message: 'Not implemented' };
      },

      async upload(callsign) {
        return { uploaded: 0, skipped: 0, failed: 0 };
      },

      async download(callsign, options) {
        return { downloaded: 0, matched: 0, updated: 0 };
      },

      isConfigured(callsign) {
        return false;
      },

      isAutoUploadEnabled(callsign) {
        return false;
      },
    });
  },
};

export default plugin;
```

这段代码已经可以在宿主的日志同步设置页面中看到了。当然它什么都做不了 -- 接下来一步步填充。

## LogbookSyncProvider 接口

完整接口长这样：

```ts
interface LogbookSyncProvider {
  readonly id: string;
  readonly displayName: string;
  readonly icon?: string;
  readonly color?: 'default' | 'primary' | 'secondary'
    | 'success' | 'warning' | 'danger';
  readonly settingsPageId: string;
  readonly accessScope?: 'admin' | 'operator';
  readonly actions?: SyncAction[];

  testConnection(callsign: string): Promise<SyncTestResult>;
  upload(callsign: string): Promise<SyncUploadResult>;
  download(callsign: string, options?: SyncDownloadOptions): Promise<SyncDownloadResult>;
  isConfigured(callsign: string): boolean;
  isAutoUploadEnabled(callsign: string): boolean;
}
```

几个关键点：

- 所有方法都以 `callsign` 为维度。同一个 Provider 可能为不同呼号维护不同的配置
- `settingsPageId` 指向 `ui.pages` 中声明的 iframe 页面，宿主会在设置界面嵌入它
- `accessScope` 决定这个 Provider 的运行期访问范围；日志同步场景通常应声明为 `operator`
- `icon` 是可选的图标标识，`color` 控制在列表中的主题色
- `actions` 用于自定义操作菜单，后面会详细讲

## 设置页面

Provider 需要一个设置 UI 让用户输入 API Key、服务器地址等信息。这里用 iframe 页面实现。

在插件定义中声明页面：

```ts
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
```

然后在 `ui/settings.html` 中写一个最简单的设置页面：

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: var(--tx5dr-font); color: var(--tx5dr-text); background: var(--tx5dr-bg); }
    input { padding: 6px; width: 100%; box-sizing: border-box; }
    button { margin-top: 8px; padding: 6px 16px; }
  </style>
</head>
<body>
  <label>API Key</label>
  <input id="apiKey" type="password" />
  <button id="save">Save</button>
  <button id="test">Test Connection</button>
  <p id="status"></p>

  <script>
    const bridge = window.tx5dr;

    // 页面加载时获取已有配置
    bridge.invoke('getConfig').then(config => {
      if (config?.apiKey) {
        document.getElementById('apiKey').value = config.apiKey;
      }
    });

    document.getElementById('save').onclick = async () => {
      const apiKey = document.getElementById('apiKey').value;
      await bridge.invoke('saveConfig', { apiKey });
      document.getElementById('status').textContent = 'Saved';
    };

    document.getElementById('test').onclick = async () => {
      const result = await bridge.invoke('testConnection');
      document.getElementById('status').textContent =
        result.success ? 'Connected!' : `Failed: ${result.message}`;
    };
  </script>
</body>
</html>
```

iframe 页面通过 `bridge.invoke(action, data)` 与插件通信。对于日志同步设置页，宿主会按 `resourceBinding: 'callsign'` 先完成呼号绑定，再把可信的绑定结果放进 `requestContext.resource`。插件端注册对应的处理器：

```ts
onLoad(ctx) {
  // ... register provider ...

  ctx.ui.registerPageHandler({
    async onMessage(pageId, action, data, requestContext) {
      if (pageId !== 'settings') return;

      const callsign = requestContext.resource?.kind === 'callsign'
        ? requestContext.resource.value
        : null;
      if (!callsign) {
        throw new Error('Callsign binding is required');
      }

      if (action === 'getConfig') {
        return ctx.store.global.get(`config:${callsign}`);
      }

      if (action === 'saveConfig') {
        ctx.store.global.set(`config:${callsign}`, data);
        return { ok: true };
      }

      if (action === 'testConnection') {
        // 复用 provider 的 testConnection
        return provider.testConnection(callsign);
      }
    },
  });
},
```

样式方面，宿主会向 iframe 注入一组 CSS 变量（如 `--tx5dr-text`、`--tx5dr-bg`、`--tx5dr-border` 等），你的页面可以直接使用它们来适配亮暗主题。不提供组件库 -- 用原生 HTML 或你喜欢的任何前端框架都行。

## 实现上传

上传的典型模式是：查询未同步的记录 -> 构建请求 -> 发送 -> 更新状态。

```ts
async upload(callsign) {
  const config = ctx.store.global.get<Config>(`config:${callsign}`);
  if (!config?.apiKey) {
    return { uploaded: 0, skipped: 0, failed: 0, errors: ['Not configured'] };
  }

  // 查询未上传的 QSO 记录
  const records = await ctx.logbook.queryQSOs({
    qslStatus: 'none',
    orderDirection: 'asc',
  });

  let uploaded = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const record of records) {
    try {
      const resp = await ctx.fetch!('https://api.example.com/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          callsign: record.theirCallsign,
          band: record.band,
          mode: record.mode,
          datetime: record.startTime,
        }),
      });

      if (resp.ok) {
        await ctx.logbook.updateQSO(record.id, { qslStatus: 'uploaded' });
        uploaded++;
      } else {
        errors.push(`${record.theirCallsign}: HTTP ${resp.status}`);
        failed++;
      }
    } catch (err) {
      errors.push(`${record.theirCallsign}: ${String(err)}`);
      failed++;
    }
  }

  return { uploaded, skipped: 0, failed, errors };
},
```

注意几个细节：

- `ctx.fetch` 需要插件声明 `permissions: ['network']` 才可用
- 上传成功后用 `ctx.logbook.updateQSO()` 标记状态，避免重复上传
- 返回的结果会被宿主展示给用户

## 实现下载

下载的模式是：从外部服务拉取 -> 解析 -> 写入本地日志。

```ts
async download(callsign, options) {
  const config = ctx.store.global.get<Config>(`config:${callsign}`);
  if (!config?.apiKey) {
    return { downloaded: 0, matched: 0, updated: 0, errors: ['Not configured'] };
  }

  const params = new URLSearchParams();
  if (options?.since) params.set('since', String(options.since));
  if (options?.until) params.set('until', String(options.until));

  const resp = await ctx.fetch!(
    `https://api.example.com/download?${params}`,
    { headers: { 'Authorization': `Bearer ${config.apiKey}` } }
  );

  const remoteRecords = await resp.json();

  let downloaded = 0;
  let matched = 0;
  let updated = 0;

  for (const remote of remoteRecords) {
    downloaded++;

    // 查找本地是否有对应记录
    const locals = await ctx.logbook.queryQSOs({
      callsign: remote.callsign,
      timeRange: {
        start: remote.datetime - 60000,
        end: remote.datetime + 60000,
      },
      limit: 1,
    });

    if (locals.length > 0) {
      matched++;
      // 如果远端有 QSL 确认状态，更新本地
      if (remote.qslConfirmed) {
        await ctx.logbook.updateQSO(locals[0].id, { qslStatus: 'confirmed' });
        updated++;
      }
    }
  }

  // 批量写入完成后通知宿主刷新 UI
  ctx.logbook.notifyUpdated();

  return { downloaded, matched, updated };
},
```

关键点：`ctx.logbook.notifyUpdated()` 必须在批量写入完成后调用。它会通知宿主刷新日志列表 UI。如果每写一条就调一次，会造成不必要的频繁刷新。

`SyncDownloadOptions` 的结构很简单：

```ts
interface SyncDownloadOptions {
  since?: number;  // Unix 时间戳 (ms)
  until?: number;
}
```

宿主在调用 `download()` 时可能传入时间范围，也可能不传。插件应该两种情况都处理好。

## 自动上传

Provider 可以支持"通联完成后自动上传"。宿主会在每次 QSO 完成时检查：

1. 调用 `isConfigured(callsign)` -- 该呼号是否已配置
2. 调用 `isAutoUploadEnabled(callsign)` -- 是否启用了自动上传
3. 如果都为 true，自动调用 `upload(callsign)`

典型实现：

```ts
isConfigured(callsign) {
  const config = ctx.store.global.get<Config>(`config:${callsign}`);
  return !!config?.apiKey;
},

isAutoUploadEnabled(callsign) {
  const config = ctx.store.global.get<Config>(`config:${callsign}`);
  return config?.autoUpload ?? false;
},
```

自动上传的开关应该在设置页面中提供。用户可以按呼号独立配置 -- 比如主呼号开启自动上传，临时呼号关闭。

## 自定义操作菜单（SyncAction）

默认情况下，宿主会为 Provider 生成"上传"和"下载"两个操作按钮。如果你需要更多操作，可以声明 `actions`：

```ts
ctx.logbookSync.register({
  // ...
  actions: [
    {
      id: 'upload',
      label: 'Upload',
      icon: 'upload',
      operation: 'upload',
    },
    {
      id: 'download',
      label: 'Download',
      icon: 'download',
      operation: 'download',
    },
    {
      id: 'full-sync',
      label: 'Full Sync',
      icon: 'sync',
      operation: 'full_sync',
    },
    {
      id: 'download-wizard',
      label: 'Download by Date Range...',
      icon: 'download',
      pageId: 'download-wizard',
    },
  ],
});
```

`SyncAction` 的结构：

```ts
interface SyncAction {
  id: string;
  label: string;
  description?: string;
  icon?: 'download' | 'upload' | 'sync';
  operation?: 'upload' | 'download' | 'full_sync';
  pageId?: string;
}
```

两种类型互斥：

- **operation 型**：点击后直接调用 Provider 对应的方法（upload / download / 先 upload 再 download）
- **pageId 型**：点击后打开一个 iframe 页面，适合需要用户额外输入的场景（比如选择日期范围）

用 `pageId` 时，对应的页面需要在 `ui.pages` 中声明：

```ts
ui: {
  dir: 'ui',
  pages: [
    { id: 'settings', title: 'Settings', entry: 'settings.html' },
    { id: 'download-wizard', title: 'Download Wizard', entry: 'download-wizard.html' },
  ],
},
```

## 文件存储

有些服务需要管理证书或临时文件（例如 LoTW 的 .p12 数字证书）。插件可以通过 `ctx.files` 访问沙箱化的文件存储：

```ts
// 写入证书文件
await ctx.files.write('certs/lotw.p12', certificateBuffer);

// 读取
const cert = await ctx.files.read('certs/lotw.p12');

// 列出目录
const files = await ctx.files.list('certs/');

// 删除
await ctx.files.delete('certs/lotw.p12');
```

文件存储是沙箱化的，路径不能逃逸到插件目录之外。适合存放：

- 认证证书
- 签名工具生成的临时文件
- 缓存的 ADIF 数据

不适合存放用户配置 -- 那些应该放在 `ctx.store.global`。

## 完整示例参考

TX-5DR 内置了三个日志同步插件，复杂度递增，适合作为不同阶段的参考。

### qrz-sync（最简实现）

QRZ.com 的 API 非常简单：一个 API Key + 标准 HTTP 接口。

- 设置页面只有一个 API Key 输入框
- 上传是逐条 POST
- 下载是拉取 ADIF 并解析

如果你要写一个新的 Provider，从这个开始看最合适。

### wavelog-sync（中等复杂度）

WaveLog 是自托管日志服务，需要配置服务器地址和 Station ID。

- 设置页面有服务器 URL、API Key、Station 选择
- 连接测试会验证 URL 可达 + API Key 有效
- Station 列表通过 API 动态获取

它展示了"设置页面需要和外部服务交互"的典型模式。

### lotw-sync（完整实现）

LoTW 是最复杂的场景：

- 需要管理 .p12 数字证书（用 `ctx.files`）
- 上传前需要用 TQ8 格式签名
- 下载需要解析 LoTW 特有的 ADIF 扩展字段
- 有一个"下载向导"页面让用户选择日期范围（SyncAction 的 `pageId` 模式）

如果你要实现一个同样复杂的 Provider，它是最好的参考。

## 什么时候该写 Provider，什么时候用 Hook

简单判断：

- 如果你的需求是"把 QSO 记录同步到某个外部服务"，写 Provider
- 如果你只是"在 QSO 完成时触发一个通知或 HTTP 请求"，用 `onQSOComplete` Hook 就够了

Provider 模式的价值在于它提供了完整的同步生命周期：配置管理、连接测试、双向同步、自动上传、状态追踪。如果你不需要这些，Hook 更轻量。

## 这一章你应该学会什么

- 日志同步 Provider 是 utility 插件，通过 `ctx.logbookSync.register()` 注册
- 所有方法以 `callsign` 为维度，支持多呼号独立配置
- 设置页面用 iframe 实现，页面声明通常应为 `accessScope: 'operator'` + `resourceBinding: 'callsign'`
- 页面通过 `bridge.invoke()` 与插件通信，服务端应优先信任 `requestContext.resource` 里的绑定呼号，而不是 iframe 自报参数
- 上传用 `ctx.logbook.queryQSOs()` 查询 + `ctx.logbook.updateQSO()` 标记状态
- 下载完成后必须调用 `ctx.logbook.notifyUpdated()`
- 文件存储用 `ctx.files`，适合证书等二进制资源
- 自定义操作菜单通过 `actions` 声明，支持直接操作和页面两种模式
