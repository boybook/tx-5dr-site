# 指南

本节说明 TX-5DR 的安装方式、部署形态和首次配置流程。相关内容对应当前站点提供的三类入口：桌面版安装包、Linux 服务器安装包和 Docker 镜像。

## 文档分组

### 安装与选型

[选型与安装](./installation) 说明三种分发形态的适用前提、运行位置和维护方式。该页同时列出 nightly 发布入口，便于与首页下载区保持一致。

### 首次配置

[首次进入与基本使用](./first-steps) 说明首次进入 Web UI 后的基本操作顺序，包括 `Profile`、电台连接、音频链路和操作员配置。相关名词与主项目中的 `ProfileManager`、操作员模型和浏览器界面一致。

### 实时语音与 WebRTC UDP

[实时语音与 WebRTC UDP](./realtime-audio) 专门说明当前内置的低延迟语音链路：默认使用 `rtc-data-audio` WebRTC DataChannel，经单个 UDP 端口传输媒体；如果 UDP/ICE 不可用，会自动降级到 `ws-compat` TCP 兼容路径。

### 部署与维护

[桌面版安装](./desktop)、[Linux 服务器安装](./linux-server)、[Docker 部署](./docker) 和 [部署建议与升级](./deployment) 分别说明不同部署方式的结构差异、常用命令和维护边界。

## 推荐阅读顺序

1. 先阅读 [选型与安装](./installation)，确定分发形态
2. 再阅读对应安装页，如 [桌面版安装](./desktop) 或 [Linux 服务器安装](./linux-server)
3. 安装完成后阅读 [首次进入与基本使用](./first-steps)
4. 需要配置实时语音、FRP、静态 NAT 或反向代理时，继续阅读 [实时语音与 WebRTC UDP](./realtime-audio)
5. 需要长期运行或升级维护时，继续阅读 [部署建议与升级](./deployment)
6. 需要了解设计和内部结构时，转到 [Wiki](../wiki/)
7. 需要编写插件时，转到 [插件 API](../plugin-api/)

## 相关页面

- [桌面版安装](./desktop)
- [Linux 服务器安装](./linux-server)
- [Docker 部署](./docker)
- [实时语音与 WebRTC UDP](./realtime-audio)
