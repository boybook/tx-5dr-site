# 选型与安装

本页用于区分 TX-5DR 当前提供的三种分发形态：桌面版、Linux 服务器版和 Docker。三者共享同一套核心后端与 Web 界面，但运行位置、部署方式和维护边界不同。

## 分发形态对照

| 方式 | 运行位置 | 典型场景 | 额外要求 |
| --- | --- | --- | --- |
| **桌面版** | 本地桌面主机 | 电台旁边的单机工作位 | 需要图形界面 |
| **Linux 服务器** | 独立 Linux 主机 | 长期在线、远程访问、多人共用 | 需要 Debian 12+ 或 Ubuntu 22.04+ |
| **Docker** | 容器环境 | 已有 Compose 或容器基础设施 | 需要处理卷映射、设备映射和网络端口 |

## 选择依据

### 桌面版

桌面版适合把 TX-5DR 运行在本地桌面环境中。发布物为 Electron 安装包，应用内包含服务端和浏览器界面，因此安装后即可在本机直接完成配置。

### Linux 服务器版

Linux 服务器版适合把电台控制主机与操作终端分离。安装脚本会部署 `tx5dr`、`livekit-server` 和 `nginx`，自动配置 HTTPS（自签名证书），并通过浏览器入口提供访问地址和管理员令牌。

### Docker

Docker 形态适合已有 `docker compose` 基础设施的环境。该方式通常需要显式配置 `./data` 卷、`/dev/snd`、USB 设备映射以及对外端口。

## 下载入口

- **桌面版 nightly**：<https://github.com/boybook/tx-5dr/releases/tag/nightly-app>
- **Linux 服务器 nightly**：<https://github.com/boybook/tx-5dr/releases/tag/nightly-server>
- **Docker nightly**：<https://github.com/boybook/tx-5dr/releases/tag/nightly-docker>

当前官网首页会依据浏览器环境识别平台与架构，并结合站点里的发布元数据推荐安装包。该逻辑在 [下载与分发策略](../wiki/distribution) 中有说明。

## 后续页面

- 本地桌面主机：阅读 [桌面版安装](./desktop)
- 独立 Linux 主机：阅读 [Linux 服务器安装](./linux-server)
- 容器环境：阅读 [Docker 部署](./docker)
