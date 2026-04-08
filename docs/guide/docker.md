# Docker 部署

Docker 部署用于容器环境。当前主仓库文档提供 `docker compose` 示例，并将配置、日志、缓存和实时音频相关目录映射到宿主机。

## 适用范围

- 已存在 Compose 或容器编排环境
- 需要通过卷管理配置和日志
- 需要复制或迁移部署配置
- 已能处理音频设备、USB 设备和端口映射

## Compose 示例

```yaml
version: '3.8'
services:
  tx5dr:
    image: boybook/tx-5dr:latest
    container_name: tx5dr
    restart: unless-stopped
    depends_on:
      - livekit
    ports:
      - "8076:80"
    volumes:
      - ./data/config:/app/data/config
      - ./data/logs:/app/data/logs
      - ./data/cache:/app/data/cache
      - /dev/snd:/dev/snd:rw
    devices:
      - /dev/bus/usb:/dev/bus/usb:rwm
    group_add:
      - audio
    environment:
      - LIVEKIT_URL=ws://livekit:7880
      - LIVEKIT_CREDENTIALS_FILE=/app/data/realtime/livekit-credentials.env
      - LIVEKIT_CONFIG_PATH=/app/data/realtime/livekit.yaml

  livekit:
    image: livekit/livekit-server:latest
    container_name: tx5dr-livekit
    restart: unless-stopped
    command: --config /var/lib/tx5dr-runtime/livekit.yaml
    ports:
      - "7881:7881/tcp"
      - "50000-50100:50000-50100/udp"
    volumes:
      - ./data/realtime:/var/lib/tx5dr-runtime
```

启动命令：

```bash
docker compose up -d
```

## 初始入口

```bash
# 浏览器入口
# http://localhost:8076

# 管理员令牌
docker exec tx5dr cat /app/data/config/.admin-token
```

该流程对应容器首次启动后的两个检查点：浏览器入口是否可访问，以及配置目录中的 `.admin-token` 是否已生成。

## 需要显式配置的部分

### 音频设备

容器需要访问宿主机音频设备时，应映射 `/dev/snd`，并确保容器拥有 `audio` 组权限。

### USB / 串口设备

电台控制依赖 USB 或串口桥接时，应额外配置 `devices` 或宿主机的设备访问权限。

### 持久化目录

以下目录通常需要持久化：

- `./data/config`
- `./data/logs`
- `./data/cache`
- `./data/realtime`

这些目录分别对应配置、日志、缓存和 LiveKit 运行时文件。

## 与其他形态的区别

Docker 形态把运行环境、配置目录和设备映射显式交给容器编排处理。若部署环境不以容器为主，通常更适合使用 [桌面版安装](./desktop) 或 [Linux 服务器安装](./linux-server)。
