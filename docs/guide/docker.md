# Docker 部署

镜像：[`boybook/tx-5dr:latest`](https://hub.docker.com/r/boybook/tx-5dr)

Docker 部署适合已有 `docker compose` 基础设施的环境。TX-5DR 的 Docker 方案包含三个容器：主应用、LiveKit 实时音频服务和一次性凭据初始化容器。

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

## 快速开始

仓库根目录的 [`docker-compose.yml`](https://github.com/boybook/tx-5dr/blob/main/docker-compose.yml) 是基线配置。下载或编写好 Compose 文件后，按以下步骤启动：

```bash
# 1. 创建数据目录
mkdir -p data/{config,plugins,logs,cache,realtime}

# 2. 拉取镜像
docker compose pull

# 3. 生成 LiveKit 凭据（仅首次需要，后续自动复用）
docker compose run --rm livekit-init

# 4. 启动 LiveKit
docker compose up -d livekit
docker compose logs -f livekit    # 确认正常后 Ctrl-C

# 5. 启动主应用
docker compose up -d tx5dr
docker compose logs -f tx5dr      # 确认 nginx + tx5dr-server 均 RUNNING 后 Ctrl-C

# 6. 获取管理员令牌
docker exec tx5dr cat /app/data/config/.admin-token
```

浏览器访问 `http://<宿主机IP>:8076`，使用管理员令牌登录。

::: tip 为什么要分阶段启动？
首次部署时，`livekit-init` 失败、LiveKit 端口冲突、主应用启动异常是三类独立的问题。分阶段启动可以逐个定位，而直接 `docker compose up -d` 会把所有问题混在一起。
:::

## Compose 配置说明

### 三个服务

| 服务 | 作用 | 生命周期 |
|------|------|---------|
| `livekit-init` | 生成 LiveKit 凭据和配置到 `./data/realtime/` | 一次性运行后退出 |
| `livekit` | LiveKit 信令 + 媒体服务器 | 持续运行 |
| `tx5dr` | 主应用（nginx 反代 + tx5dr-server，由 supervisor 管理） | 持续运行 |

### 持久化目录

以下卷必须映射，否则重启后数据丢失：

| 目录 | 内容 |
|------|------|
| `./data/config` | 应用配置、管理员令牌、认证数据 |
| `./data/plugins` | 用户插件 |
| `./data/logs` | 应用日志 |
| `./data/cache` | 缓存数据 |
| `./data/realtime` | LiveKit 凭据和配置（由 livekit-init 生成） |

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

| 端口 | 协议 | 用途 |
|------|------|------|
| 7881 | TCP | RTC 媒体传输 |
| 50000-50100 | UDP | 媒体端口范围 |

浏览器客户端通过当前站点的同源 `/livekit` 路径接入信令，因此通常**不需要**公网暴露 `7880/tcp`。

如果反向代理或域名配置导致 `/livekit` 路径不可达，需要在系统设置中配置自定义实时语音入口。

## 更新

```bash
docker compose pull
docker compose up -d
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
