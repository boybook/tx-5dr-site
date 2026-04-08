# Linux 服务器安装

Linux 服务器版面向独立主机部署。当前主仓库文档说明，该形态会安装 `tx5dr`、`livekit-server` 和 `nginx`，并通过浏览器提供统一入口。

## 适用范围

- 电台所在主机长期运行
- 浏览器终端与电台主机分离
- 局域网或公网访问
- 多操作员或长期维护场景

## 系统要求

根据当前主仓库的 `README.zh-CN.md`：

- **Debian 12+** 或 **Ubuntu 22.04+**
- 一台可连接电台与音频设备的 Linux 主机
- 浏览器访问入口
- 需要语音链路或公网部署时，建议配置 HTTPS

## 一键安装

```bash
curl -fsSL https://github.com/boybook/tx-5dr/releases/download/nightly-server/install-online.sh | sudo bash
```

该脚本会执行以下步骤：

- 检测主机架构
- 解析最新服务器包元数据
- 安装依赖
- 部署 `tx5dr`、`livekit-server` 和 `nginx`

当前安装脚本会在中国大陆网络下优先尝试 OSS 分发源，失败后回退到 GitHub。分发逻辑见 [下载与分发策略](../wiki/distribution)。

## 启动与入口

安装完成后，可先执行以下命令：

```bash
tx5dr start
tx5dr token
```

- `tx5dr start`：启动服务并输出 Web UI 访问地址
- `tx5dr token`：输出管理员令牌和登录 URL

这两个命令对应首次进入浏览器界面的最小流程。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `tx5dr start` | 启动服务 |
| `tx5dr stop` | 停止服务 |
| `tx5dr restart` | 重启服务 |
| `tx5dr status` | 查看服务、反向代理和端口状态 |
| `tx5dr token` | 查看管理员令牌和登录 URL |
| `tx5dr update` | 更新到最新 nightly |
| `tx5dr doctor` | 执行环境诊断 |
| `tx5dr logs` | 查看日志 |

## 服务组成

Linux 服务器版的运行结构由以下组件构成：

- `tx5dr`：核心后端与 Web API
- `livekit-server`：实时音频和 signaling 服务
- `nginx`：统一入口与 HTTPS 反向代理

该结构决定了服务器版适合长期运行、反向代理和远程访问场景。

## 后续步骤

安装完成后，建议继续阅读 [首次进入与基本使用](./first-steps)。需要维护、升级或备份时，再阅读 [部署建议与升级](./deployment)。
