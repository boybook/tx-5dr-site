# Docker 部署

镜像：[`boybook/tx-5dr:latest`](https://hub.docker.com/r/boybook/tx-5dr)

Docker 部署适合已有 `docker compose` 基础设施的环境。

## 实时语音链路

TX-5DR Docker 现在只有一个默认运行模式：`tx5dr` 单容器内置低延迟实时语音。

| 项目 | 当前默认 |
| --- | --- |
| 容器数量 | 1 个 (`tx5dr`) |
| 默认低延迟链路 | `rtc-data-audio` WebRTC DataChannel |
| 媒体端口 | `50110/udp`，单 UDP 端口 |
| 兼容链路 | `ws-compat` WebSocket/TCP 自动降级 |
| 语音监听 / 发射 | 完全可用 |

不再需要 `docker-compose.livekit.yml`、`livekit` 或 `livekit-init`。如果 UDP 不可用，可以在“系统设置 > 实时音频”切到兼容模式；如果 UDP 可用，保持 `Auto` 即可优先使用 `rtc-data-audio`。

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

## 配置低延迟 WebRTC UDP

默认 `docker-compose.yml` 已暴露实时语音所需端口：

```yaml
ports:
  - "8076:80"
  - "8443:443"
  - "50110:50110/udp"
environment:
  - RTC_DATA_AUDIO_UDP_PORT=50110
  - RTC_DATA_AUDIO_ICE_UDP_MUX=1
```

### 局域网或本机访问

通常无需额外配置。浏览器通过同源 `/api/realtime/rtc-data-audio` 建立信令连接，再用 `50110/udp` 建立 WebRTC DataChannel 媒体链路。失败时会自动回退到 `ws-compat`。

### FRP / 静态 NAT

如果浏览器从公网访问 Docker 主机，请把一个公网 UDP 端口映射到容器宿主机的 `50110/udp`，然后在“系统设置 > 实时音频”中填写 `WebRTC Data Audio external UDP address` 的公网主机/IP 和 UDP 端口。

::: warning 只转发网页端口不够
`8076/tcp` 或 `8443/tcp` 只能让页面和信令可达。低延迟媒体还需要 UDP；如果部署条件无法转发 UDP，请直接使用 `ws-compat` 兼容模式。
:::

### 修改 UDP 端口

如需修改端口，compose 的端口映射和环境变量必须同步：

```yaml
ports:
  - "50222:50222/udp"
environment:
  - RTC_DATA_AUDIO_UDP_PORT=50222
```

重新启动容器后，新会话会使用新的 UDP 端口。

## Compose 配置说明

### 服务

| 服务 | 所在文件 | 作用 | 生命周期 |
|------|---------|------|---------|
| `tx5dr` | `docker-compose.yml` | 主应用（nginx 反代 + tx5dr-server，supervisor 管理），内置 `rtc-data-audio` | 持续运行 |

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
| `./data/realtime` | 实时语音运行时设置与诊断数据 |

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

## WebRTC UDP 网络

低延迟语音使用内置 `rtc-data-audio`，不再使用 LiveKit。Docker 默认只需要额外暴露一个 UDP 端口：

| 端口 | 协议 | 用途 |
|------|------|------|
| 50110 | UDP | `rtc-data-audio` WebRTC DataChannel 媒体 |

信令入口是当前站点同源的 `/api/realtime/rtc-data-audio`，通常跟 Web UI 一起走 HTTPS 反向代理，不需要单独暴露其他媒体服务端口。

::: warning FRP / 仅网页反代场景
如果你只是把网站转发到公网，而没有同时开放 UDP，浏览器可以打开页面但低延迟语音可能无法建立。此时可以继续使用 `ws-compat` 兼容模式。
:::

完整判断方法请参阅 [实时语音与 WebRTC UDP](./realtime-audio)。

## 更新

```bash
docker compose pull && docker compose up -d
```

::: warning
更新前请确认宿主机上的 `./data` 目录保持不变。只要整个数据根目录持续挂载，配置、日志、SSL 证书和实时语音运行时数据都会保留。
:::

## 后续阅读

- [实时语音与 WebRTC UDP](./realtime-audio)
- [部署建议与升级](./deployment)
