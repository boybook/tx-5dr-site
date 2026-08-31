# 开发与验证

TX-5DR 主仓库是 Yarn 4 工作区，由 Turborepo 组织跨包任务。发布 workflow 主要使用 Node.js 22，npm 公共包发布使用独立的 Node.js 24 工作流。

## 安装工作区

```bash
corepack enable
yarn install --immutable
```

根目录 `packageManager` 固定了 Yarn `4.9.1`。不应使用 npm 在主仓库生成第二份 lockfile，也不应在单个工作区中独立替换 workspace 依赖。

## 开发运行时

```bash
# Web 界面 + 服务端
yarn dev

# Electron 桌面宿主 + 服务端 + Web 界面
yarn dev:electron

# 开启详细服务端日志
LOG_LEVEL=debug yarn dev
```

`yarn dev` 会管理开发时需要的多个工作区，并保持共享包编译产物与服务端一致。只在调试单个进程边界时直接启动工作区脚本：

```bash
yarn workspace @tx5dr/server dev
yarn workspace @tx5dr/web dev
yarn workspace @tx5dr/electron-main dev
```

## 全局质量门

```bash
yarn build
yarn lint
yarn test
yarn check:i18n
```

| 命令 | 检查的边界 |
| --- | --- |
| `yarn build` | 工作区依赖顺序、TypeScript、Web 产物、内置插件 UI |
| `yarn lint` | 各工作区静态规则 |
| `yarn test` | contracts、core、server、web、Electron 和插件测试 |
| `yarn check:i18n` | 中文、英文、日文资源键对齐 |

根任务会覆盖广泛回归，但调试时可以使用所有者工作区缩短反馈周期。

## 服务端测试层级

```bash
# 单元与边界测试
yarn workspace @tx5dr/server test:unit

# 虚拟电台集成和性能不变式
yarn workspace @tx5dr/server test:virtual-radio-integration

# 日志本性能基线
yarn workspace @tx5dr/server test:logbook-performance
```

服务端总测试命令会依次执行以上三组。影响连接、音频、SlotPack 或日志持久化的变更不应只执行一个局部测试文件。

## 插件公共面

```bash
yarn workspace @tx5dr/plugin-api build
yarn workspace @tx5dr/plugin-api test
yarn workspace @tx5dr/plugin-api smoke:pack
yarn workspace create-tx5dr-plugin build
```

`smoke:pack` 使用真实 npm pack 产物验证第三方消费者，可以捕获“工作区内可导入，发布包中缺文件或子路径”这类普通单元测试无法发现的问题。

## 原生模块

```bash
yarn workspace @tx5dr/server dev:check-native
```

原生检查覆盖 Hamlib、wsjtx-lib、rubato-fft-node、rasterwave-node、ICOM WLAN 等运行时依赖的加载情况。它只能证明当前平台可加载，不能代替 Windows、macOS、Linux x64/arm64 和 Android arm64 的发布矩阵。

## 站点与文档

`tx-5dr-site` 使用 npm 和 VitePress，不与主仓库 Yarn lockfile 共享依赖：

```bash
cd ../tx-5dr-site
npm ci
npm run lint
npm run test
npm run build
```

插件 API Reference 由主仓库公共 TypeScript/JSDoc 生成。修改公共插件签名时，站点仓库还需要执行 `npm run docs:sync-plugin-api` 并确认生成结果幂等。
