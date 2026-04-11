# 命令参考

本页汇总主项目当前文档中最常用的运行维护命令。命令来源主要是 `README.zh-CN.md` 和相关部署说明。

## Linux 服务器命令

| 命令 | 说明 |
| --- | --- |
| `tx5dr start` | 启动服务 |
| `tx5dr stop` | 停止服务 |
| `tx5dr restart` | 重启服务 |
| `tx5dr status` | 查看服务、nginx、端口和 SSL 状态 |
| `tx5dr token` | 查看管理员令牌和登录 URL |
| `tx5dr update` | 更新到最新 nightly |
| `tx5dr doctor` | 执行环境诊断 |
| `tx5dr logs` | 查看日志 |
| `tx5dr livekit-creds status` | 查看 LiveKit 托管凭据状态 |
| `tx5dr livekit-creds rotate` | 轮换 LiveKit 托管凭据 |

## Docker 命令

### 启动

```bash
mkdir -p data/{config,plugins,logs,cache,realtime,ssl}
docker compose pull

# 独立模式
docker compose up -d

# LiveKit 模式（使用单独的 compose 文件）
docker compose -f docker-compose.livekit.yml up -d
```

### 日常操作

| 命令 | 说明 |
| --- | --- |
| `docker compose logs -f tx5dr` | 查看主应用日志 |
| `docker compose logs -f livekit` | 查看 LiveKit 日志 |
| `docker exec tx5dr cat /app/data/config/.admin-token` | 获取管理员令牌 |
| `docker compose restart tx5dr` | 重启主应用 |

### 更新

```bash
docker compose pull
docker compose up -d
```

### 容器内设备检查

```bash
# 串口设备
docker exec tx5dr ls -l /dev/ttyUSB* /dev/ttyACM* 2>/dev/null
# 音频设备
docker exec tx5dr ls -l /dev/snd/
```

详细配置见 [Docker 部署](../guide/docker)。

## 开发命令

```bash
yarn dev
yarn dev:electron
yarn build
yarn lint
yarn test
```

如需分别启动服务：

```bash
yarn workspace @tx5dr/server dev
yarn workspace @tx5dr/web dev
yarn workspace @tx5dr/electron-main dev
```
