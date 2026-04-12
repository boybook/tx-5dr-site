# 插件 UI 开发实战：脚手架、框架模板与实时预览

[第 6 章](./tutorial-custom-ui) 讲了 iframe 面板的原理 —— Bridge SDK、invoke/onPush、CSS 变量。本篇聚焦于**怎么高效地开发**这些 UI 页面：从零创建项目、用 React 或 Vue 编写交互界面、一键链接到运行中的 TX-5DR、以及修改代码后自动编译和重载。

## 创建项目

使用 `create-tx5dr-plugin` 脚手架。它可以生成四种模板：

| 模板 | 说明 |
|------|------|
| `basic` | 纯服务端插件，没有 UI |
| `ui-vanilla` | 插件 + 原生 HTML/JS/CSS 页面 |
| `ui-react` | 插件 + React + Vite 项目 |
| `ui-vue` | 插件 + Vue + Vite 项目 |

```bash
# 创建一个带 React UI 的插件项目
npx create-tx5dr-plugin my-plugin --template ui-react

# 或者 Vue
npx create-tx5dr-plugin my-plugin --template ui-vue

# 原生 HTML（不需要构建步骤）
npx create-tx5dr-plugin my-plugin --template ui-vanilla
```

不传 `--template` 会进入交互式提问。

## 生成了什么

以 `--template ui-react` 为例，生成的目录结构如下：

```text
my-plugin/
├── package.json              # 依赖 + 构建脚本
├── tsconfig.json             # 服务端 TS 编译配置
├── src/
│   ├── index.ts              # 插件定义（含 ui.pages 声明和 registerPageHandler）
│   ├── locales/
│   │   ├── zh.json
│   │   └── en.json
│   └── __tests__/
│       └── plugin.test.ts
├── ui/                       # ← 前端 Vite 项目
│   ├── vite.config.ts        # 多页面构建配置
│   ├── tsconfig.json         # 前端 TS 配置（含 Bridge SDK 类型）
│   ├── settings.html         # HTML 入口文件
│   └── src/
│       ├── main.tsx          # React 挂载入口
│       ├── App.tsx           # 主组件（示例 invoke/onPush 用法）
│       └── App.css           # 使用 --tx5dr-* CSS 变量
└── scripts/
    └── link.mjs              # 链接脚本（下面详细说）
```

`--template ui-vue` 的结构几乎一样，只是 `.tsx` 变成 `.vue` SFC。

### 两个 tsconfig 的区别

- **根目录的 `tsconfig.json`**：编译 `src/` 下的服务端插件代码（Node.js 环境），输出到 `dist/`
- **`ui/tsconfig.json`**：编译 `ui/src/` 下的前端代码（浏览器环境），配置了 `jsx: 'react-jsx'` 和 `types: ['@tx5dr/plugin-api/bridge']`

前端 tsconfig 里的 `types: ['@tx5dr/plugin-api/bridge']` 就是让 `window.tx5dr` 有完整智能提示的关键。安装 `@tx5dr/plugin-api` 后，在 React/Vue 组件里直接写 `tx5dr.invoke(...)` 就能看到参数和返回值的类型提示。

## 构建

```bash
cd my-plugin
npm install
npm run build
```

`npm run build` 做两件事：

1. `tsc` —— 编译 `src/index.ts` → `dist/index.js`（服务端插件入口）
2. `vite build` —— 编译 `ui/` → `dist/ui/settings.html`（独立完整的 HTML 页面）

构建完成后，`dist/` 目录就是一个可以直接放进 TX-5DR 的完整插件：

```text
dist/
├── index.js              # 服务端插件代码
├── locales/
│   ├── zh.json
│   └── en.json
└── ui/
    └── settings.html     # Vite 编译后的完整 HTML（CSS/JS 已内联或分块）
```

## 链接到 TX-5DR

构建好了，怎么让运行中的 TX-5DR 加载它？

### link 做了什么

每个生成的项目都有一个 `scripts/link.mjs`，运行方式：

```bash
npm run link
```

它做了三件事情：

1. **检测 TX-5DR 数据目录** —— 根据操作系统自动定位：
   - macOS: `~/Library/Application Support/TX-5DR/plugins/`
   - Windows: `%LOCALAPPDATA%\TX-5DR\plugins\`
   - Linux: `~/.local/share/TX-5DR/plugins/`
   - 可用环境变量 `TX5DR_DATA_DIR` 覆盖

2. **创建符号链接** —— 将你项目的 `dist/` 目录链接到 TX-5DR 的插件目录：
   ```text
   ~/Library/Application Support/TX-5DR/plugins/my-plugin
     → /path/to/my-plugin/dist/
   ```
   链接之后，TX-5DR 启动时会扫描到这个目录并加载 `dist/index.js`。你不需要每次构建都复制文件。

3. **创建 `.hotreload` 标记文件** —— 在 `dist/` 中写入一个空的 `.hotreload` 文件。TX-5DR 的开发模式会监视包含这个文件的插件目录，文件变化时自动重载插件（下面详细说）。

这个链接是**一次性操作**。创建之后，后续的所有构建输出都会自动出现在 TX-5DR 的插件目录中。

要移除链接：

```bash
npm run link -- --unlink
```

::: tip 为什么用符号链接而不是直接复制？
符号链接让 `dist/` 和 TX-5DR 插件目录**指向同一个位置**。`tsc --watch` 或 `vite build --watch` 每次编译的结果直接就是 TX-5DR 读取的内容，不需要任何拷贝步骤。这是 Obsidian 插件社区的标准做法。
:::

## 开发循环

一切就绪后，日常开发只需要三个终端：

```bash
# 终端 1：启动 TX-5DR（如果还没运行）
cd tx-5dr
yarn dev

# 终端 2：监视服务端代码变化
cd my-plugin
npm run dev:server    # tsc --watch → dist/index.js

# 终端 3：监视 UI 代码变化
cd my-plugin
npm run dev:ui        # vite build --watch → dist/ui/
```

修改代码的流程变成了：

```text
编辑 App.tsx
  → Vite 自动编译到 dist/ui/settings.html（通常 < 1 秒）
    → TX-5DR 检测到 dist/ 变化
      → 自动重载插件（约 750ms 防抖后触发）
        → 在 TX-5DR 界面看到更新
```

::: info Vanilla 模板的 dev 体验
`ui-vanilla` 模板的 UI 文件是直接放在 `ui/` 目录的静态文件，不经过 Vite 编译。你需要手动把 `ui/` 目录的内容放到 `dist/ui/` 下，或者在 package.json 中配置一个复制步骤。React/Vue 模板不需要这个步骤，因为 Vite 的输出目录就是 `dist/ui/`。
:::

## 自动重载（.hotreload）

TX-5DR 在**开发模式**（`NODE_ENV` 不是 `production`）下会自动监视插件目录。规则很简单：

- 如果一个插件目录里存在 `.hotreload` 文件，TX-5DR 会监视它的文件变化
- 检测到变化后，等 750ms（防抖，等待编译完成），然后自动执行 `reloadPlugin`
- `npm run link` 会自动创建这个文件，所以你不需要手动操作

如果你不想自动重载，删掉 `dist/.hotreload` 即可。

如果你没用 `npm run link`（比如手动把 dist 复制到了 plugins 目录），也可以手动创建：

```bash
touch dist/.hotreload
```

或者通过 TX-5DR 的 API 手动触发重载：

```bash
curl -X POST http://localhost:4000/api/plugins/my-plugin/reload
```

## Vite MPA 配置详解

生成的 `ui/vite.config.ts` 使用 Vite 的多页面应用（MPA）模式。这是因为 TX-5DR 的 iframe 宿主期望**每个页面是一个独立的 HTML 文件**，不是一个 SPA 路由。

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: import.meta.dirname,
  build: {
    outDir: '../dist/ui',       // 输出到插件根的 dist/ui/
    emptyOutDir: true,
    rollupOptions: {
      input: {
        settings: resolve(import.meta.dirname, 'settings.html'),
        // 如果有多个页面，在这里添加更多入口：
        // wizard: resolve(import.meta.dirname, 'wizard.html'),
      },
    },
  },
});
```

几个要点：

- `outDir: '../dist/ui'` —— Vite 的输出直接写到 `dist/ui/`，和 tsc 的输出 `dist/index.js` 合在同一个 `dist/` 下
- `rollupOptions.input` —— 每个 HTML 入口一个条目。Vite 会为每个入口生成一个独立的 HTML 文件，其中 JS/CSS 会被分块或内联
- 添加新页面时：创建新的 `.html` 入口，在 `input` 和插件定义的 `ui.pages` 中各加一条

## Bridge SDK 类型提示

在 React/Vue 组件中写 `tx5dr.invoke(...)` 时，如果 `ui/tsconfig.json` 配置了 `types: ['@tx5dr/plugin-api/bridge']`，你就能得到完整的 TypeScript 提示：

```tsx
// App.tsx — tx5dr 是全局变量，有完整类型
const settings = await tx5dr.invoke('getSettings');
//                     ^— 提示: invoke(action: string, data?: unknown): Promise<unknown>

tx5dr.onPush('updated', (data) => { /* ... */ });
//    ^— 提示: onPush(action: string, callback: (data: any) => void): void

tx5dr.resize(document.body.scrollHeight);
//    ^— 提示: resize(height: number): void
```

对于原生 JS 文件，在文件顶部加一行三斜杠注释也能获得同样的提示：

```js
/// <reference types="@tx5dr/plugin-api/bridge" />
```

## CSS 变量补全

`@tx5dr/plugin-api` 包里附带了一个 `tokens.css` 参考文件。把它复制到项目中，VS Code 的 CSS Language Service 就能在你输入 `var(--tx5dr-` 时自动补全所有可用变量：

```bash
cp node_modules/@tx5dr/plugin-api/tokens.css ./ui/
```

这个文件只是帮助 IDE 认识变量名的参考，**不要**在 HTML 中引入它 —— 宿主会在运行时自动注入真实的 CSS 变量。

## 完整流程回顾

从零到能看到效果的完整步骤：

```bash
# 1. 创建项目
npx create-tx5dr-plugin my-plugin --template ui-react

# 2. 安装依赖
cd my-plugin
npm install

# 3. 首次构建
npm run build

# 4. 链接到 TX-5DR（一次性）
npm run link
# → 创建符号链接: TX-5DR/plugins/my-plugin → dist/
# → 创建 .hotreload 标记

# 5. 启动 TX-5DR
cd ~/tx-5dr && yarn dev

# 6. 开发（两个终端）
cd my-plugin
npm run dev:server    # 终端 A
npm run dev:ui        # 终端 B

# 7. 编辑 ui/src/App.tsx → 自动编译 → 自动重载 → 看到效果
```

## 常见问题

### UI 修改后没有自动重载

检查：

1. `dist/.hotreload` 文件是否存在（`npm run link` 会自动创建）
2. TX-5DR 是否在开发模式下运行（不是 `NODE_ENV=production`）
3. `npm run dev:ui` 是否在运行（Vite watch 是否在编译）

### Vite 构建报错 "Cannot find module 'react'"

确保在插件项目目录下运行了 `npm install`。React/Vue 和 Vite 都是 devDependencies，不会自动安装。

### link 报错 "dist/ not found"

先运行一次 `npm run build`。link 脚本需要 `dist/` 目录已经存在。

### 页面在 TX-5DR 中是空白

检查 `dist/ui/settings.html` 是否存在且内容完整。如果是空文件，可能 Vite 构建失败了 —— 检查 `npm run build:ui` 的输出。

### 想用其他前端框架（Svelte、Solid 等）

脚手架目前支持 React 和 Vue。但原理是通用的：只要 Vite 能编译出独立的 HTML 文件（通过 MPA 模式），任何框架都可以。手动创建一个类似的 `vite.config.ts` 即可。
