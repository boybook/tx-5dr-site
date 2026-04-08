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

```bash
docker compose up -d
docker compose logs -f
docker exec tx5dr cat /app/data/config/.admin-token
```

这些命令分别对应容器启动、日志查看和管理员令牌读取。

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
