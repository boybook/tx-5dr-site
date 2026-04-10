# Docker 部署

镜像：[`boybook/tx-5dr:latest`](https://hub.docker.com/r/boybook/tx-5dr)

Docker 部署适合已有 `docker compose` 基础设施的环境。

## 两种运行模式

TX-5DR 的语音传输支持两种模式，你可以根据自己的需求选择：

| | 独立模式（默认） | LiveKit 模式 |
|--|:---:|:---:|
| **容器数量** | 1 个 (`tx5dr`) | 3 个 (`tx5dr` + `livekit` + `livekit-init`) |
| **语音传输** | WebSocket 音频（ws-compat） | WebRTC（LiveKit） |
| **典型延迟** | 50–100 ms | 20–50 ms |
| **部署复杂度** | 一条命令启动 | 需要额外端口和 UDP 放通 |
| **FT8 解码 / 电台控制** | 完全可用 | 完全可用 |
| **语音监听 / 发射** | 完全可用 | 完全可用 |

**简单来说**：如果你不确定选哪个，先用独立模式。所有功能完全可用，之后随时可以加装 LiveKit 获得更低延迟。

## 前置要求

- Docker Engine 24+ 和 Docker Compose V2 (2.20+)
- 宿主机可识别电台相关硬件（USB 声卡、串口设备）

在宿主机上运行以下命令确认硬件状态：

```bash
lsusb                                           # USB 设备总览
aplay -l                                        # 音频播放设备
arecord -l                                      # 音频录制设备
ls -l /dev/ttyUSB* /dev/ttyACM* 2>/dev/null     # 串口设备
ls -l /dev/serial/by-id/ 2>/dev/null            # 稳定设备名
```

## 快速开始（独立模式）

仓库根目录的 [`docker-compose.yml`](https://github.com/boybook/tx-5dr/blob/main/docker-compose.yml) 是基线配置。下载或编写好 Compose 文件后：

```bash
# 1. 创建数据目录
mkdir -p data/{config,plugins,logs,cache,realtime}

# 2. 拉取镜像
docker compose pull

# 3. 启动
docker compose up -d

# 4. 获取管理员令牌
docker exec tx5dr cat /app/data/config/.admin-token
```

浏览器访问 `http://<宿主机IP>:8076`，使用管理员令牌登录。此时 TX-5DR 已完全可用。

## 启用 LiveKit（可选）

如果你希望获得更低延迟的语音体验，可以额外启用 LiveKit。LiveKit 通过 WebRTC 传输音频，延迟通常可以降低到 20–50 ms，适合对语音实时性要求较高的场景。

```bash
# 启动全部服务（含 LiveKit）
docker compose --profile livekit -f docker-compose.yml -f docker-compose.livekit.yml up -d
```

首次运行时，`livekit-init` 会自动生成凭据到 `./data/realtime/`。主应用启动后会自动检测 LiveKit 是否可用，并在可用时自动切换到 LiveKit 传输。

::: tip 分阶段排查
如果 LiveKit 启动遇到问题，可以分步执行以便定位：
```bash
docker compose --profile livekit run --rm livekit-init       # 生成凭据
docker compose --profile livekit up -d livekit               # 启动 LiveKit
docker compose logs -f livekit                               # 确认正常后 Ctrl-C
docker compose -f docker-compose.yml -f docker-compose.livekit.yml up -d tx5dr
```
:::

### 从独立模式切换到 LiveKit 模式

如果你已经在独立模式下运行，只需停止后以 LiveKit 模式重新启动：

```bash
docker compose down
docker compose --profile livekit -f docker-compose.yml -f docker-compose.livekit.yml up -d
```

配置和数据不受影响。

### 从 LiveKit 模式切回独立模式

```bash
docker compose down
docker compose up -d
```

## Compose 配置说明

### 服务

| 服务 | Profile | 作用 | 生命周期 |
|------|---------|------|---------|
| `tx5dr` | *（始终启动）* | 主应用（nginx 反代 + tx5dr-server，supervisor 管理） | 持续运行 |
| `livekit-init` | `livekit` | 生成 LiveKit 凭据和配置到 `./data/realtime/` | 一次性运行后退出 |
| `livekit` | `livekit` | LiveKit 信令 + 媒体服务器 | 持续运行 |

### 持久化目录

以下卷必须映射，否则重启后数据丢失：

| 目录 | 内容 |
|------|------|
| `./data/config` | 应用配置、管理员令牌、认证数据 |
| `./data/plugins` | 用户插件 |
| `./data/logs` | 应用日志 |
| `./data/cache` | 缓存数据 |
| `./data/realtime` | LiveKit 凭据和配置（由 livekit-init 生成，仅 LiveKit 模式使用） |

## 设备映射

设备映射是 Docker 部署中最容易出错的部分。

### 串口设备（CAT 电台控制）

::: warning 关键
`/dev/bus/usb` 只暴露 USB 总线，**不会**自动把宿主机的 `/dev/ttyUSB*` 或 `/dev/ttyACM*` 节点传入容器。必须额外映射具体的 tty 设备。
:::

先在宿主机确认设备类型：

```bash
ls -l /dev/ttyUSB* /dev/ttyACM* 2>/dev/null
ls -l /dev/serial/by-id/ 2>/dev/null
```

常见对应关系：

| 设备节点 | 典型硬件 | 举例 |
|---------|---------|------|
| `/dev/ttyUSB*` | CP2102、CH340、FTDI 等 USB 转串口芯片 | Yaesu FT-710、Elecraft K3 |
| `/dev/ttyACM*` | USB CDC ACM（原生 USB） | ICOM IC-705、IC-7300 |

在 `docker-compose.yml` 的 `devices:` 中添加：

```yaml
devices:
  - /dev/bus/usb:/dev/bus/usb:rwm
  - /dev/snd:/dev/snd:rwm
  # 根据实际硬件取消注释：
  - /dev/ttyUSB0:/dev/ttyUSB0:rwm    # CP2102/CH340 等
  - /dev/ttyUSB1:/dev/ttyUSB1:rwm
  # 或 ICOM / CDC ACM 设备：
  - /dev/ttyACM0:/dev/ttyACM0:rwm
  - /dev/ttyACM1:/dev/ttyACM1:rwm
```

### 音频设备

USB 声卡需要同时在 `volumes` 和 `devices` 中映射 `/dev/snd`：

```yaml
volumes:
  - /dev/snd:/dev/snd:rw
devices:
  - /dev/snd:/dev/snd:rwm
```

### 权限组

容器进程需要 `audio` 和 `dialout` 两个组才能访问音频和串口硬件：

```yaml
group_add:
  - audio      # /dev/snd 访问
  - dialout    # /dev/ttyUSB*、/dev/ttyACM* 访问
```

::: danger 二者缺一不可
- 缺少 `audio` → 音频设备列表只显示 "Default"，无法选择具体声卡
- 缺少 `dialout` → 连接电台时报 "Permission denied"
:::

## LiveKit 网络

> 以下内容仅在启用 LiveKit 时适用。独立模式无需关心这些端口。

| 端口 | 协议 | 用途 |
|------|------|------|
| 7881 | TCP | RTC 媒体传输 |
| 50000-50100 | UDP | 媒体端口范围 |

浏览器客户端通过当前站点的同源 `/livekit` 路径接入信令，因此通常**不需要**公网暴露 `7880/tcp`。

如果反向代理或域名配置导致 `/livekit` 路径不可达，需要在系统设置中配置自定义实时语音入口。

## 更新

```bash
# 独立模式
docker compose pull && docker compose up -d

# LiveKit 模式
docker compose pull && docker compose --profile livekit -f docker-compose.yml -f docker-compose.livekit.yml up -d
```

::: warning
重新部署时**不要删除** `./data/` 目录，其中包含配置、管理员令牌、LiveKit 凭据和日志。
:::

## 故障排查

| 现象 | 原因 | 解决方法 |
|------|------|---------|
| `/api/radio/serial-ports` 返回 500 | 镜像缺少 `udevadm` | 升级到最新镜像 |
| 串口 "Permission denied" | 进程缺少 `dialout` 组 | `group_add` 中添加 `dialout`，重建容器 |
| 音频设备只显示 "Default" | 进程缺少 `audio` 组 | `group_add` 中添加 `audio`，重建容器 |
| 容器不断重启 | `supervisord` 配置解析错误 | `docker compose build --no-cache` 或 `docker compose pull` |
| 宿主机有 USB 但容器无 tty | 只映射了 `/dev/bus/usb` | 在 `devices` 中映射具体 `/dev/ttyUSB*` 或 `/dev/ttyACM*` |
| 电台连接正常但无音频 | USB 声卡未映射 | 在 `volumes` 和 `devices` 中映射 `/dev/snd` |

## 进阶话题

以下内容见主仓库 [`docs/docker-deployment.md`](https://github.com/boybook/tx-5dr/blob/main/docs/docker-deployment.md)：

- PVE / ESXi / VMware 虚拟机中的 USB 直通
- `/dev/serial/by-id` 稳定设备命名
- PulseAudio 配置
- GitHub Actions 自动构建镜像
- 本地多架构手动构建

## 与其他形态的区别

Docker 形态把运行环境、配置目录和设备映射交给容器编排处理。若部署环境不以容器为主，通常更适合使用 [桌面版安装](./desktop) 或 [Linux 服务器安装](./linux-server)。
