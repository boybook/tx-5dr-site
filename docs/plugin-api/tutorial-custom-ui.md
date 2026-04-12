# 第 6 章：自定义 UI 与 iframe 面板

第 4 章展示了结构化面板 —— `key-value`、`table`、`log`、`chart` 四种组件，配合 `ctx.ui.send(...)` 就能把数据推到前端。它们适合展示简单数据，但如果你需要表单输入、图表交互、或者完全定制的界面，就需要 iframe 面板。

## 结构化面板 vs iframe 面板

先搞清楚两者的差异：

| | 结构化面板 | iframe 面板 |
|---|---|---|
| 声明方式 | `component: 'key-value'` 等 | `component: 'iframe'` + `pageId` |
| 数据通道 | `ctx.ui.send(panelId, data)` | `invoke` / `onPush` 双向通信 |
| 渲染内容 | 宿主负责渲染 | 插件自己写 HTML/CSS/JS |
| 适用场景 | 统计、日志、状态展示 | 表单、交互控件、自定义图表 |
| 开发成本 | 低 | 中等 |

什么时候用结构化面板就够了：

- 只需要显示几行键值对
- 只需要一张表格或日志列表
- 不需要用户输入

什么时候该用 iframe 面板：

- 需要按钮、输入框、下拉菜单等交互控件
- 需要完全自定义的布局和样式
- 需要 iframe 和服务端双向实时通信

## 最小 iframe 面板

先看一个最小可运行的 iframe 面板插件。

### 目录结构

```text
my-iframe-plugin/
├── plugin.js
├── ui/
│   └── dashboard.html
└── locales/
    ├── zh.json
    └── en.json
```

### 插件定义

```ts
import type { PluginDefinition } from '@tx5dr/plugin-api';

const plugin: PluginDefinition = {
  name: 'my-iframe-plugin',
  version: '1.0.0',
  type: 'utility',
  panels: [
    {
      id: 'dashboard',
      title: 'dashboardPanel',
      component: 'iframe',
      pageId: 'dashboard',
    },
  ],
  ui: {
    dir: 'ui',
    pages: [
      { id: 'dashboard', title: 'Dashboard', entry: 'dashboard.html' },
    ],
  },
};

export default plugin;
```

这里有三个关键点：

1. `panels` 里的 `component` 设为 `'iframe'`
2. `pageId` 引用 `ui.pages` 中的某个页面 id
3. `ui.pages` 声明页面的入口 HTML 文件

### HTML 文件

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
</head>
<body>
  <div style="padding: 12px;">
    <p>Hello from iframe!</p>
  </div>
</body>
</html>
```

这就能运行了。宿主在加载 HTML 时会自动注入两样东西：

- **tokens.css** —— CSS 设计变量（颜色、字体、间距等）
- **bridge.js** —— Bridge SDK，挂载到 `window.tx5dr`

你不需要自己引入它们，宿主会在 `</head>` 之前自动插入。

## Bridge SDK

iframe 内可以通过 `window.tx5dr` 访问 Bridge SDK。它提供以下 API：

| API | 说明 |
|---|---|
| `tx5dr.params` | 只读，宿主传入的初始化参数 |
| `tx5dr.theme` | 当前主题，`'dark'` 或 `'light'` |
| `tx5dr.locale` | 当前语言，如 `'zh'`、`'en'` |
| `tx5dr.invoke(action, data)` | 发送请求到服务端，返回 Promise |
| `tx5dr.onPush(action, callback)` | 监听服务端主动推送 |
| `tx5dr.offPush(action, callback)` | 取消推送监听 |
| `tx5dr.resize(height)` | 通知宿主调整 iframe 高度 |
| `tx5dr.onThemeChange(callback)` | 监听主题切换 |
| `tx5dr.requestClose()` | 请求宿主关闭当前面板/页面 |
| `tx5dr.storeGet(key, default)` | 读取 KV 存储 |
| `tx5dr.storeSet(key, value)` | 写入 KV 存储 |
| `tx5dr.storeDelete(key)` | 删除 KV 存储项 |
| `tx5dr.fileUpload(path, file)` | 上传文件到插件沙盒存储 |
| `tx5dr.fileRead(path)` | 读取插件沙盒文件 |
| `tx5dr.fileDelete(path)` | 删除插件沙盒文件 |
| `tx5dr.fileList(prefix?)` | 列出插件沙盒文件 |

其中最核心的两对是 `invoke` / `registerPageHandler` 和 `onPush` / `pushToPage`。

## invoke：从 iframe 请求服务端

这是最常用的通信模式。iframe 通过 `tx5dr.invoke()` 发起请求，服务端通过 `ctx.ui.registerPageHandler()` 处理。

### 服务端

```ts
onLoad(ctx) {
  ctx.ui.registerPageHandler({
    async onMessage(pageId, action, data) {
      switch (action) {
        case 'getState':
          return {
            counter: ctx.store.operator.get('counter', 0),
          };
        case 'increment': {
          const next = ctx.store.operator.get<number>('counter', 0) + 1;
          ctx.store.operator.set('counter', next);
          return { counter: next };
        }
        default:
          throw new Error('Unknown action: ' + action);
      }
    },
  });
},
```

几点说明：

- `registerPageHandler` 在 `onLoad` 中调用，整个插件只注册一个 handler
- `onMessage` 的第一个参数 `pageId` 标识请求来自哪个页面
- 返回值会作为 Promise 结果返回给 iframe
- 抛出异常会导致 iframe 侧的 Promise reject

### iframe 侧

```js
var bridge = window.tx5dr;

// 加载初始状态
bridge.invoke('getState').then(function(state) {
  document.getElementById('counter').textContent = state.counter;
});

// 点击按钮递增
document.getElementById('incrementBtn').addEventListener('click', function() {
  bridge.invoke('increment').then(function(result) {
    document.getElementById('counter').textContent = result.counter;
  });
});
```

这就是一次完整的请求-响应循环。iframe 发出 `invoke('increment')`，宿主转发到服务端的 `onMessage`，结果原路返回。

## onPush：服务端主动推送

`invoke` 是 iframe 主动拉取。如果你需要服务端主动向 iframe 推送数据，使用 `pushToPage` 和 `onPush`。

### 服务端推送

```ts
// 在任何地方都可以推送，比如 timer 回调中
hooks: {
  onTimer(timerId, ctx) {
    if (timerId !== 'heartbeat') return;
    ctx.ui.pushToPage('dashboard', 'tick', {
      timestamp: Date.now(),
      signalStrength: -50 + Math.random() * 40,
    });
  },
},
```

`pushToPage` 的三个参数：

1. `pageId` —— 目标页面 id
2. `action` —— 推送事件名
3. `data` —— 任意数据

### iframe 接收

```js
var bridge = window.tx5dr;

bridge.onPush('tick', function(data) {
  document.getElementById('signal').textContent =
    data.signalStrength.toFixed(1) + ' dBm';
});
```

如果需要取消监听，使用 `offPush`：

```js
function handleTick(data) { /* ... */ }
bridge.onPush('tick', handleTick);
// 稍后取消
bridge.offPush('tick', handleTick);
```

## 高度自适应

iframe 默认有一个最小高度。如果你的内容高度是动态的，需要用 `tx5dr.resize()` 通知宿主。

推荐用 `ResizeObserver` 自动跟踪：

```js
var observer = new ResizeObserver(function() {
  var h = document.body.scrollHeight;
  if (h > 0) {
    tx5dr.resize(h);
  }
});
observer.observe(document.body);

// 页面加载后也立即通知一次
tx5dr.resize(document.body.scrollHeight);
```

这段代码加在 JS 文件末尾就行，几乎是固定模板。

## 主题适配

宿主会自动注入一套 CSS 变量。使用这些变量而不是硬编码颜色，就能自动适配明暗主题。

### CSS 设计变量

**背景色：**

| 变量 | 用途 |
|---|---|
| `--tx5dr-bg` | 页面底色 |
| `--tx5dr-bg-content` | 内容区域 / 卡片底色 |
| `--tx5dr-bg-hover` | hover 状态底色 |

**文字色：**

| 变量 | 用途 |
|---|---|
| `--tx5dr-text` | 主文字 |
| `--tx5dr-text-secondary` | 次要文字 |

**语义色：**

| 变量 | 用途 |
|---|---|
| `--tx5dr-primary` | 主色调 / 链接 |
| `--tx5dr-success` | 成功 |
| `--tx5dr-warning` | 警告 |
| `--tx5dr-danger` | 错误 / 危险操作 |

**边框与焦点：**

| 变量 | 用途 |
|---|---|
| `--tx5dr-border` | 边框 |
| `--tx5dr-focus-ring` | 焦点环 |

**圆角、间距、字体：**

| 变量 | 值 |
|---|---|
| `--tx5dr-radius-sm` / `md` / `lg` | 8px / 12px / 16px |
| `--tx5dr-spacing-xs` / `sm` / `md` / `lg` / `xl` | 4px / 8px / 12px / 16px / 24px |
| `--tx5dr-font` | 'Inter', system-ui, sans-serif |
| `--tx5dr-font-mono` | 'JetBrains Mono', monospace |
| `--tx5dr-font-size-sm` / `md` / `lg` | 13px / 14px / 16px |

### 使用示例

```css
.container {
  padding: var(--tx5dr-spacing-md);
}

.card {
  background: var(--tx5dr-bg-content);
  border: 1px solid var(--tx5dr-border);
  border-radius: var(--tx5dr-radius-sm);
  padding: var(--tx5dr-spacing-sm) var(--tx5dr-spacing-md);
}

.card:hover {
  background: var(--tx5dr-bg-hover);
}

input {
  background: var(--tx5dr-bg-content);
  color: var(--tx5dr-text);
  border: 1px solid var(--tx5dr-border);
  border-radius: var(--tx5dr-radius-sm);
  font-family: var(--tx5dr-font);
  font-size: var(--tx5dr-font-size-sm);
}

input:focus {
  border-color: var(--tx5dr-primary);
}

.btn-primary {
  background: var(--tx5dr-primary);
  color: #fff;
  border: none;
  border-radius: var(--tx5dr-radius-sm);
  cursor: pointer;
}
```

### 监听主题切换

宿主切换明暗主题时，CSS 变量会自动更新。如果你有额外的主题逻辑（比如切换图表配色），可以监听主题变化：

```js
tx5dr.onThemeChange(function(theme) {
  // theme 为 'dark' 或 'light'
  if (theme === 'dark') {
    chart.setColors(darkPalette);
  } else {
    chart.setColors(lightPalette);
  }
});
```

大多数情况下你不需要用它 —— 只要所有样式都基于 CSS 变量，主题切换是自动的。

## 面板渲染位置（slot）

每个面板可以通过 `slot` 字段指定渲染位置：

- `'operator'`（默认）—— 展开操作员卡片后的实时面板区域
- `'automation'` —— 右上角自动化快捷操作弹出面板

```ts
panels: [
  // 操作员卡片区域
  {
    id: 'live-monitor',
    title: 'liveMonitorPanel',
    component: 'iframe',
    pageId: 'live-monitor',
    // slot 默认为 'operator'，可省略
  },
  // 自动化弹出面板
  {
    id: 'quick-controls',
    title: 'quickControlsPanel',
    component: 'iframe',
    pageId: 'quick-controls',
    slot: 'automation',
  },
],
```

`operator` slot 适合展示实时监控数据，面积更大，用户在操作员卡片里就能看到。

`automation` slot 适合放快捷控件，面积更紧凑，用户在自动化面板里操作。

同一个插件完全可以在两个位置各放一个面板。

## 跨页面同步

一个常见场景是：用户在 `automation` 面板点击按钮，结果实时反映到 `operator` 面板。

思路很简单：

1. quick-controls iframe 调用 `tx5dr.invoke('increment')`
2. 服务端 handler 处理完成后，调用 `ctx.ui.pushToPage('live-monitor', 'counterUpdated', { counter: next })`
3. live-monitor iframe 通过 `tx5dr.onPush('counterUpdated', ...)` 接收更新

画成图：

```text
quick-controls iframe                Server                    live-monitor iframe
      │                                │                              │
      ├─ invoke('increment') ──────────►│                              │
      │                                ├─ 更新 store                   │
      │                                ├─ pushToPage('live-monitor',   │
      │                                │    'counterUpdated', data) ──►│
      │◄──────── return { counter } ───┤                              ├─ 更新 UI
      ├─ 更新本地 UI                    │                              │
```

服务端是两个 iframe 之间的协调者。它们不需要直接通信。

## 独立 Pages

到目前为止的例子都是把 iframe 页面绑定在面板上。但 `ui.pages` 声明的页面不一定非得和面板关联。

有些场景不需要面板，而是需要一个独立的全屏或弹窗页面。日志同步类插件就是典型例子：

```ts
ui: {
  dir: 'ui',
  pages: [
    { id: 'settings', title: 'Settings', entry: 'settings.html' },
    { id: 'download-wizard', title: 'Download', entry: 'download-wizard.html' },
  ],
},
```

这些页面不出现在 `panels` 里，而是由宿主在特定上下文中渲染 —— 比如日志同步设置弹窗会加载 `settings` 页面，下载向导则加载 `download-wizard` 页面。

独立页面和面板页面的区别：

- **面板页面**：嵌入在操作员界面的固定位置，跟随操作员生命周期
- **独立页面**：由宿主按需加载，通常在弹窗或专用路由里，用 `params` 接收上下文

独立页面同样可以使用完整的 Bridge SDK —— `invoke`、`onPush`、`storeGet`、`fileUpload` 一样可用。

## 存储与文件

iframe 可以直接访问插件的持久化存储，不需要经过 `invoke` 绕服务端。

### KV 存储

```js
// 读取
var value = await tx5dr.storeGet('lastSync', null);

// 写入
await tx5dr.storeSet('lastSync', Date.now());

// 删除
await tx5dr.storeDelete('lastSync');
```

### 文件存储

```js
// 上传文件（File 对象来自 <input type="file"> 或拖拽）
await tx5dr.fileUpload('certificates/my-cert.p12', fileObject);

// 读取文件，返回 Blob 或 null
var blob = await tx5dr.fileRead('certificates/my-cert.p12');

// 列出文件
var files = await tx5dr.fileList('certificates/');

// 删除文件
await tx5dr.fileDelete('certificates/my-cert.p12');
```

文件存储在插件的沙盒目录下，路径不能逃逸到沙盒外。

## 内置参考

### iframe-panel-demo

这是内置的 iframe 面板演示插件，完整展示了本章涉及的所有模式：

- 两个 iframe 面板分别在 `operator` 和 `automation` slot
- `live-monitor`：接收服务端定时推送，展示信号条和实时日志
- `quick-controls`：表单输入 + 按钮交互，通过 `invoke` 修改服务端状态
- 跨页面同步：quick-controls 操作后，live-monitor 实时反映变化
- 同时有一个结构化 `key-value` 面板做对比

代码在 `packages/server/src/plugin/builtins/iframe-panel-demo/`，建议按这个顺序阅读：

1. `index.ts` —— 插件定义 + handler 注册
2. `ui/quick-controls.html` / `quick-controls.js` —— 交互面板
3. `ui/live-monitor.html` / `live-monitor.js` —— 数据展示面板
4. `ui/quick-controls.css` —— CSS 变量用法示例

## 这一章你应该学会什么

- iframe 面板通过 `component: 'iframe'` + `pageId` + `ui.pages` 声明
- `tx5dr.invoke()` 和 `registerPageHandler` 实现请求-响应通信
- `tx5dr.onPush()` 和 `pushToPage` 实现服务端主动推送
- `ResizeObserver` + `tx5dr.resize()` 实现高度自适应
- CSS 设计变量让 iframe 自动适配明暗主题
- `slot` 控制面板渲染在操作员卡片还是自动化弹窗
- 跨面板同步的标准模式：iframe A invoke -> 服务端 -> pushToPage -> iframe B
- 独立页面用于设置弹窗、向导等场景

下一章将进入日志同步插件的开发，那是独立页面和 Bridge SDK 的一个完整实战应用。
