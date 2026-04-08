# 架构概览

本页说明 TX-5DR 各主要模块之间的关系。相关模块位于 `packages/contracts`、`packages/core`、`packages/server`、`packages/web`、`packages/electron-main` 和 `packages/plugin-api`。

## 顶层结构

```text
TX-5DR
├─ packages/contracts
├─ packages/core
├─ packages/server
├─ packages/web
├─ packages/electron-main
└─ packages/plugin-api
```

## 模块职责

| 模块 | 位置 | 作用 |
| --- | --- | --- |
| 协议与类型 | `packages/contracts` | 定义 schema、共享类型和事件协议 |
| 共享业务逻辑 | `packages/core` | 提供 WebSocket 客户端、事件模型和通用逻辑 |
| 后端运行时 | `packages/server` | 提供引擎、状态机、插件运行时和对外接口 |
| 浏览器界面 | `packages/web` | 提供表格、频谱、操作员面板和设置界面 |
| 桌面宿主 | `packages/electron-main` | 组合桌面窗口、本地服务端和打包逻辑 |
| 插件公共接口 | `packages/plugin-api` | 向外部插件作者暴露稳定的 TypeScript 接口 |

## 浏览器、桌面和服务端的关系

`packages/web` 负责浏览器界面，`packages/server` 负责后端入口、状态机、资源编排和对外接口。桌面版通过 `packages/electron-main` 启动本地宿主进程，再把服务端和 Web 界面作为一个发布物提供给桌面环境。

该关系意味着：

- 桌面版与服务器版共享同一套后端逻辑
- 浏览器界面不依赖桌面宿主才能工作
- 不同分发形态之间可复用相同的配置模型和接口协议

## 后端内部结构

根目录 `CLAUDE.md` 和 `packages/server/CLAUDE.md` 说明，`DigitalRadioEngine` 是后端入口，内部再拆分为多个子系统：

- `EngineLifecycle`：资源启停和生命周期编排
- `RadioBridge`：电台连接、事件转发和断线恢复
- `TransmissionPipeline`：编码、混音、PTT 和播放时序
- `ClockCoordinator`：时钟、频谱、解码和时隙事件桥接
- `AudioVolumeController`：音量读写和持久化

这些组件共同构成服务端运行时。

## 状态机结构

主项目当前使用两套状态机：

- 引擎状态机：`IDLE / STARTING / RUNNING / STOPPING`
- 电台状态机：`DISCONNECTED / CONNECTING / CONNECTED / RECONNECTING`

该划分用于把“引擎启动停止”和“电台连接状态”分成两条独立流程，便于处理首次连接失败、运行中断线和重连退避等情况。

## 插件位置

插件运行时位于 `packages/server/src/plugin/`。内置插件位于 `packages/server/src/plugin/builtins/`，外部插件通过 `packages/plugin-api` 所暴露的公共接口接入。

当前插件分为两类：

- `strategy`：按操作员互斥，负责自动化运行时
- `utility`：可叠加启用，负责筛选、评分、广播监听或面板数据
