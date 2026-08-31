# 用 Docker Compose 运行 TX-5DR

Docker 版适合已有 Linux 服务器、NAS 或 Compose 管理经验的用户。TX-5DR 在容器内完整运行，电台留在宿主机旁，操作员通过浏览器访问，不需要给服务器安装图形桌面或远程桌面软件。

官方镜像：[`boybook/tx-5dr:latest`](https://hub.docker.com/r/boybook/tx-5dr)

## 使用前提

- Docker Engine 24+ 和 Docker Compose V2 2.20+
- Linux 宿主机能够识别电台、USB 串口和音频设备
- 能够编辑 Compose 文件并管理宿主机设备权限
- 数据目录所在磁盘有可靠的备份

如果你不熟悉容器设备映射，Linux 服务器版通常更容易安装和排障。

## 1. 检查宿主机硬件

先不要启动容器。在宿主机确认实际设备名称：

```bash
lsusb
aplay -l
arecord -l
ls -l /dev/ttyUSB* /dev/ttyACM* 2>/dev/null
ls -l /dev/serial/by-id/ 2>/dev/null
```

记录电台使用的串口和声卡。WSJT-X、JTDX、rigctld 或其他程序不能同时独占同一个 CAT 串口。

通过网络 Hamlib、ICOM WLAN 或 TCI 连接电台时，通常不需要映射本地串口；需要确认容器网络能够访问电台 IP 和端口。

## 2. 准备 Compose 目录

```bash
mkdir tx5dr-docker
cd tx5dr-docker
curl -fLO https://raw.githubusercontent.com/boybook/tx-5dr/main/docker-compose.yml
mkdir -p data/{logs/nginx,logs/supervisor}
```

官方 [`docker-compose.yml`](https://github.com/boybook/tx-5dr/blob/main/docker-compose.yml) 是基线配置。启动前按自己的设备修改 `devices:`；不要直接照抄其他电台的 `/dev/ttyUSB0` 编号。

## 3. 映射串口和音频

`/dev/bus/usb` 不能代替具体的串口节点。使用 Hamlib CAT 时，必须把实际的 `/dev/ttyUSB*` 或 `/dev/ttyACM*` 传入容器：

```yaml
services:
  tx5dr:
    devices:
      - /dev/bus/usb:/dev/bus/usb:rwm
      - /dev/snd:/dev/snd:rwm
      - /dev/ttyACM0:/dev/ttyACM0:rwm
    group_add:
      - audio
      - dialout
```

常见情况：

| 宿主机设备 | 常见用途 |
| --- | --- |
| `/dev/ttyACM*` | ICOM 等 USB CDC 串口 |
| `/dev/ttyUSB*` | FTDI、CP210x、CH34x 等 USB 转串口 |
| `/dev/snd` | USB 声卡和系统音频设备 |

一部电台可能同时出现多个串口。应根据 `/dev/serial/by-id/`、电台手册和实际测试确认 CAT/PTT 使用哪一个。不要为了省事给容器增加 `privileged: true`；只开放 TX-5DR 实际需要的设备。

## 4. 启动并登录

```bash
docker compose pull
docker compose up -d
docker compose ps
docker exec tx5dr cat /app/data/config/.admin-token
```

浏览器打开：

- `http://<宿主机 IP>:8076`
- `https://<宿主机 IP>:8443`

首次使用自签名 HTTPS 证书时，浏览器会显示安全提示。确认地址属于自己的宿主机后再继续，并用上一步得到的管理员令牌登录。

如果页面没有出现，先查看：

```bash
docker compose logs --tail=200 tx5dr
```

## 5. 确认容器内设备

```bash
docker exec tx5dr ls -l /dev/ttyUSB* /dev/ttyACM* 2>/dev/null
docker exec tx5dr ls -l /dev/snd/
```

宿主机存在而容器内不存在，说明 Compose 设备映射不完整。容器内存在但 TX-5DR 连接时报 `Permission denied`，检查 `audio` / `dialout` 组和宿主机设备权限，然后重建容器：

```bash
docker compose up -d --force-recreate
```

## 数据持久化

基线 Compose 会把整个应用数据根目录映射到宿主机：

```yaml
volumes:
  - ./data:/app/data
```

请保持这条映射。`./data` 中包含配置、管理员令牌、日志本、插件、日志、证书和运行数据。删除容器不会删除该目录，但删除或换掉宿主机目录会让新容器看起来像一次全新安装。

不要只挑选几个子目录持久化；完整备份 `./data` 更容易可靠迁移和回滚。

## 浏览器端口和远程访问

官方 Compose 默认使用：

| 端口 | 用途 |
| --- | --- |
| `8076/tcp` | HTTP Web UI |
| `8443/tcp` | HTTPS Web UI |
| `50110/udp` | 低延迟实时音频 |
| `4532/tcp` | 可选的 rigctld 兼容桥接 |

只在确实需要 rigctld 兼容桥接时开放 `4532/tcp`，不要把它直接暴露到公网。实时音频的 UDP、FRP 和兼容传输见[远程监听与语音链路](./realtime-audio)。

跨网络访问时，优先使用 Tailscale、ZeroTier、WireGuard 等私有组网。使用域名、FRP 或反向代理时，在 TX-5DR 的“系统设置 > 访问范围”选择“正式开放部署”，并填写浏览器实际访问的完整 Origin；代理必须转发 WebSocket。

HTTP 可以工作，但不会加密令牌和控制数据，部分浏览器音频能力也会受到限制。正式远程使用应配置受信任的 HTTPS 证书，不建议把 `8076` 直接暴露到公网。

## 替换 HTTPS 证书

把 PEM 证书和私钥写入持久化目录后重载 nginx：

```bash
cp your-cert.crt ./data/ssl/server.crt
cp your-cert.key ./data/ssl/server.key
sed -i 's/TX5DR_SSL_MODE=self-signed/TX5DR_SSL_MODE=custom/' ./data/ssl/cert-info.env
docker exec tx5dr nginx -s reload
```

限制私钥文件权限，并在浏览器中确认实际证书已经更新。

## 更新、停止与日志

```bash
# 更新镜像并重建
docker compose pull
docker compose up -d

# 正常停止或启动
docker compose stop
docker compose start

# 跟踪日志
docker compose logs -f tx5dr
```

更新前结束发射并备份 `./data`。更新后重新确认串口、音频、频率读取和 PTT；镜像拉取成功并不代表设备映射仍然正确。

更完整的维护清单见[长期运行、远程访问与升级](./deployment)。
