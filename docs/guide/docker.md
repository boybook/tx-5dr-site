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
mkdir -p data/{logs/nginx,logs/supervisor}

# 2. 拉取镜像
docker compose pull

# 3. 启动
docker compose up -d

# 4. 获取管理员令牌
docker exec tx5dr cat /app/data/config/.admin-token
```

浏览器访问 `http://<宿主机IP>:8076`（或 `https://<宿主机IP>:8443`），使用管理员令牌登录。此时 TX-5DR 已完全可用。

::: tip HTTPS 已自动启用
容器首次启动时会自动生成自签名 SSL 证书，HTTPS 默认可通过 `8443` 端口访问。浏览器会提示安全警告——点击「高级」→「继续前往」即可。如需使用自己的证书，参见下方 [HTTPS 与 SSL 证书](#https-与-ssl-证书) 章节。
:::

## 启用 LiveKit（可选）

如果你希望获得更低延迟的语音体验，可以额外启用 LiveKit。LiveKit 通过 WebRTC 传输音频，延迟通常可以降低到 20–50 ms，适合对语音实时性要求较高的场景。

仓库提供了两个独立的 Compose 文件：

| 文件 | 模式 | 启动命令 |
|------|------|---------|
| `docker-compose.yml` | 独立模式（WebSocket 音频） | `docker compose up -d` |
| `docker-compose.livekit.yml` | LiveKit 模式（WebRTC 低延迟） | `docker compose -f docker-compose.livekit.yml up -d` |

使用 LiveKit 模式：

```bash
docker compose -f docker-compose.livekit.yml up -d
```

首次运行时，`livekit-init` 会自动生成凭据到 `./data/realtime/`，并根据系统设置生成托管的 `livekit.resolved.yaml`。主应用启动后会自动检测 LiveKit 是否可用，并在可用时自动切换到 LiveKit 传输。

::: info 统一配置方式
LiveKit 的浏览器入口、媒体网络模式和手动公网 IPv4 统一从“系统设置 > 实时音频”配置。不要再手工编辑 `./data/realtime/livekit.resolved.yaml`。
:::

::: tip 分阶段排查
如果 LiveKit 启动遇到问题，可以分步执行以便定位：
```bash
docker compose -f docker-compose.livekit.yml run --rm livekit-init   # 生成凭据与运行配置
docker compose -f docker-compose.livekit.yml up -d livekit           # 启动 LiveKit
docker compose -f docker-compose.livekit.yml logs -f livekit         # 确认正常后 Ctrl-C
docker compose -f docker-compose.livekit.yml up -d tx5dr             # 启动主应用
```
:::

### 从独立模式切换到 LiveKit 模式

如果你已经在独立模式下运行，只需停止后以 LiveKit 模式重新启动：

```bash
docker compose down
docker compose -f docker-compose.livekit.yml up -d
```

配置和数据不受影响。

### 从 LiveKit 模式切回独立模式

```bash
docker compose -f docker-compose.livekit.yml down
docker compose up -d
```

### 修改 LiveKit 设置后如何生效

当你在“系统设置 > 实时音频”里修改了 LiveKit 媒体网络模式或浏览器入口后，运行配置文件会立即更新，但 LiveKit 容器通常仍需要重启一次才能完全生效：

```bash
docker compose -f docker-compose.livekit.yml restart livekit
```

如果你同时还修改了 Compose、环境变量或证书，直接重新拉起整套服务更稳妥：

```bash
docker compose -f docker-compose.livekit.yml up -d
```

## Compose 配置说明

### 服务

| 服务 | 所在文件 | 作用 | 生命周期 |
|------|---------|------|---------|
| `tx5dr` | 两个文件均包含 | 主应用（nginx 反代 + tx5dr-server，supervisor 管理） | 持续运行 |
| `livekit-init` | `docker-compose.livekit.yml` | 生成 LiveKit 凭据和托管运行配置到 `./data/realtime/` | 一次性运行后退出 |
| `livekit` | `docker-compose.livekit.yml` | LiveKit 信令 + 媒体服务器 | 持续运行 |

### 持久化目录

Compose 现在推荐直接持久化整个应用数据根目录：

```yaml
volumes:
  - ./data:/app/data
```

这样镜像更新、容器重建或切换 Compose 文件时，以下内容都会统一保留：

| 宿主机目录 | 内容 |
|------|------|
| `./data/config` | 应用配置、管理员令牌、认证数据 |
| `./data/plugins` | 用户插件 |
| `./data/logs` | 应用日志与通联日志 |
| `./data/cache` | 缓存数据 |
| `./data/ssl` | SSL 证书 |
| `./data/realtime` | LiveKit 凭据与托管运行配置 |

::: warning 不建议只零散挂载某几个子目录
如果你只挂载部分子目录，镜像更新或容器重建后更容易出现日志、凭据或运行时文件丢失。优先保持整个 `./data` 根目录持久化。
:::

## HTTPS 与 SSL 证书

### 自签名证书（默认）

容器首次启动时，entrypoint 脚本会自动生成自签名 SSL 证书并保存到 `./data/ssl/`。HTTPS 服务在容器内监听 443 端口，通过 `docker-compose.yml` 映射为宿主机的 **8443** 端口。

访问方式：

| 协议 | 地址 | 说明 |
|------|------|------|
| HTTP | `http://<宿主机IP>:8076` | 无加密，局域网可用 |
| HTTPS | `https://<宿主机IP>:8443` | 自签名证书，浏览器会提示安全警告 |

::: info 为什么需要 HTTPS？
浏览器要求 HTTPS 才能授权麦克风访问。如果你需要使用语音功能（监听或发射），必须通过 HTTPS 或 `localhost` 访问。
:::

::: warning 自签名证书的局限性
自签名证书**不被**浏览器信任，每次打开页面时都会出现安全警告。这不影响功能使用——加密强度与正式证书完全相同，只是身份未经第三方验证。点击「高级」→「继续前往」即可正常使用。
:::

### 替换为自定义证书

如果你有域名和正式 SSL 证书，可以替换自签名证书：

```bash
# 1. 将你的证书文件放入 ssl 目录
cp your-cert.crt ./data/ssl/server.crt
cp your-cert.key ./data/ssl/server.key

# 2. 更新证书模式标记（可选，用于 status 显示）
sed -i 's/TX5DR_SSL_MODE=self-signed/TX5DR_SSL_MODE=custom/' ./data/ssl/cert-info.env

# 3. 重启容器（或仅 reload nginx）
docker compose restart tx5dr
# 或：docker exec tx5dr nginx -s reload
```

::: tip
证书文件名必须是 `server.crt` 和 `server.key`。替换后容器重启不会覆盖自定义证书。
:::

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

浏览器客户端通过当前站点的同源 `/livekit` 路径接入 signaling，因此通常**不需要**公网暴露 `7880/tcp`。

但要注意：`/livekit` 只是浏览器入口，不等于全部媒体流量。如果你没有同时打通上表中的媒体端口，LiveKit 常常无法稳定传音频。

::: warning FRP / 仅网页反代场景
如果你只是把网站或 `/livekit` 路径转发到公网，而没有同时开放 LiveKit 的 TCP/UDP 媒体端口，建议在“系统设置 > 实时音频”里直接使用 `ws-compat`。这是更稳定也更符合实际网络约束的选择。
:::

如果反向代理或域名配置导致 `/livekit` 路径不可达，需要在系统设置中配置自定义实时语音入口。完整判断方法请参阅 [LiveKit 与实时语音配置](./livekit)。

## 更新

```bash
# 独立模式
docker compose pull && docker compose up -d

# LiveKit 模式
docker compose -f docker-compose.livekit.yml pull && docker compose -f docker-compose.livekit.yml up -d
```

::: warning
更新前请确认宿主机上的 `./data` 目录保持不变。只要整个数据根目录持续挂载，配置、日志、SSL 证书、LiveKit 凭据和托管运行文件都会保留。
:::

## 后续阅读

- [LiveKit 与实时语音配置](./livekit)
- [部署建议与升级](./deployment)
