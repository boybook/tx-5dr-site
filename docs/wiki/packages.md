# 安装包说明

本页说明 TX-5DR 当前发布物的类型和对应运行位置。发布物来源见主项目 `README.zh-CN.md` 与 GitHub Releases。

## 桌面版发布物

桌面版面向图形桌面环境，当前常见文件类型包括：

- Windows：`.msi`、`.7z`
- macOS：`.dmg`
- Linux 图形环境：`.deb`、`.rpm`

这类发布物通常包含 Electron 宿主、本地服务端和 Web UI。

## Linux 服务器发布物

Linux 服务器版面向无头主机和长期运行场景，当前常见文件类型包括：

- `install-online.sh`
- `server-linux-amd64.deb`
- `server-linux-arm64.deb`
- `server-linux-amd64.rpm`
- `server-linux-arm64.rpm`

该类发布物用于安装 `tx5dr` 和 `nginx` 所需组件。实时语音由 `tx5dr` 后端内置的 `rtc-data-audio` WebRTC DataChannel 端点提供。

## Docker 发布物

Docker 形态以镜像和 Compose 配置为主。宿主机通常需要额外提供以下对象：

- 配置卷
- 日志卷
- 缓存卷
- 音频设备或 USB 设备映射

## 三类发布物的差异

三类发布物共享同一套核心后端和浏览器界面，差异主要在以下方面：

- 宿主进程是桌面应用、Linux 服务还是容器
- 配置文件和日志目录由谁负责持久化
- 设备映射、端口和反向代理由谁负责管理
