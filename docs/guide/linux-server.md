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
- 安装时自动生成自签名 HTTPS 证书（端口 8443），也可替换为自定义证书

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

- `tx5dr start`：启动服务并输出 Web UI 访问地址（含 HTTP 和 HTTPS）
- `tx5dr token`：输出管理员令牌和登录 URL

安装完成后，HTTP 和 HTTPS 两个入口均可使用：

- `http://localhost:8076` — 无加密
- `https://localhost:8443` — 自签名证书（浏览器会提示安全警告，点击「高级」→「继续前往」即可）

::: info 为什么需要 HTTPS？
浏览器要求 HTTPS 才能授权麦克风访问。如果你需要使用语音功能，必须通过 HTTPS 或 `localhost` 访问。安装时已自动配置自签名证书，开箱即用。
:::

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `tx5dr start` | 启动服务 |
| `tx5dr stop` | 停止服务 |
| `tx5dr restart` | 重启服务 |
| `tx5dr status` | 查看服务、反向代理和端口状态 |
| `tx5dr token` | 查看管理员令牌和登录 URL |
| `tx5dr update` | 更新到最新 nightly |
| `tx5dr doctor` | 执行环境诊断（含 SSL 证书检查） |
| `tx5dr doctor --fix` | 自动修复诊断发现的问题（含 SSL 证书生成） |
| `tx5dr ssl status` | 查看 SSL 证书状态 |
| `tx5dr ssl renew` | 续签自签名证书 |
| `tx5dr logs` | 查看日志 |
| `tx5dr enable-livekit` | 安装并启用 LiveKit |
| `tx5dr disable-livekit` | 禁用 LiveKit，切换到 `ws-compat` |

## 服务组成

Linux 服务器版的运行结构由以下组件构成：

- `tx5dr`：核心后端与 Web API
- `livekit-server`：实时音频和 signaling 服务
- `nginx`：统一入口与 HTTPS 反向代理

该结构决定了服务器版适合长期运行、反向代理和远程访问场景。

## 统一的 LiveKit 配置方式

从当前版本开始，Linux 服务器版不再推荐通过手工修改 YAML 来配置 LiveKit。统一做法是：

1. 打开“系统设置 > 实时音频”
2. 选择 `Auto`、`LiveKit` 或 `ws-compat`
3. 如果使用 LiveKit，再选择媒体网络模式
4. 保存后执行一次重启

安装包会维护托管运行文件：

- `/var/lib/tx5dr/realtime/livekit.resolved.yaml`

这个文件会随着设置保存、安装流程或修复脚本更新，因此不建议手工编辑。

### 什么时候用 LiveKit，什么时候用 ws-compat

| 实际场景 | 推荐 |
| --- | --- |
| 局域网、本机、简单部署 | `ws-compat` 或 LiveKit + `局域网 / 本机` |
| 云服务器直出公网 | LiveKit + `公网自动发现` |
| 家宽 NAT、多网卡、自动识别错误 | LiveKit + `公网手动指定` |
| FRP 只转网页、只反代 `/livekit`、无法开放 UDP | 直接使用 `ws-compat` |

### 修改设置后如何生效

```bash
sudo tx5dr restart
```

如果你要单独查看或重启 LiveKit 相关单元，也可以使用：

```bash
sudo systemctl status tx5dr-livekit
sudo systemctl restart tx5dr-livekit
sudo systemctl restart tx5dr
```

### 公网部署时需要额外注意什么

启用 LiveKit 后，浏览器通常通过当前站点的同源 `/livekit` 路径接入 signaling，因此 `7880/tcp` 通常不需要单独暴露到公网。

但这不代表 LiveKit 只需要 `/livekit` 路径。真正的媒体链路仍需要：

- `7881/tcp`
- `50000-50100/udp`

::: warning FRP / 单端口公网入口
如果你的公网入口本质上只能提供网页访问，或者只是把 `/livekit` 这一条路径转发出去，而没有同时开放媒体端口，建议直接使用 `ws-compat`。这通常比强行使用 LiveKit 更稳定。
:::

更完整的判断方法请阅读 [LiveKit 与实时语音配置](./livekit)。

## HTTPS 与 SSL 证书

### 自签名证书（默认）

安装时自动生成自签名 SSL 证书（RSA-2048，有效期 365 天），并在 nginx 中配置 HTTPS 服务块（端口 8443）。证书包含 `localhost`、主机名和所有 LAN IP 作为 SAN。

::: warning 自签名证书的局限性
自签名证书不被浏览器信任，每次打开页面时会出现安全警告。这不影响加密功能——点击「高级」→「继续前往」即可正常使用。
:::

### 管理 SSL 证书

```bash
# 查看当前证书状态（模式、有效期、指纹等）
tx5dr ssl status

# 续签自签名证书（仅自签名模式有效）
sudo tx5dr ssl renew
```

如果证书即将过期或丢失，`tx5dr doctor --fix` 也会自动修复。

### 替换为自定义证书

```bash
# 1. 替换证书文件
sudo cp your-cert.crt /etc/tx5dr/ssl/server.crt
sudo cp your-cert.key /etc/tx5dr/ssl/server.key

# 2. 更新模式标记
sudo sed -i 's/TX5DR_SSL_MODE=self-signed/TX5DR_SSL_MODE=custom/' /etc/tx5dr/ssl/cert-info.env

# 3. 重载 nginx
sudo systemctl reload nginx
```

替换后 `tx5dr ssl renew` 和 `tx5dr doctor --fix` 不会覆盖自定义证书。

### 老用户升级

从旧版本升级的用户，如果安装时未自动生成证书，可手动触发：

```bash
sudo tx5dr doctor --fix
```

该命令会检测缺失的 SSL 证书并自动生成，同时在 nginx 配置中添加 HTTPS 服务块。

## 后续步骤

安装完成后，建议继续阅读 [首次进入与基本使用](./first-steps)。需要配置公网语音、LiveKit 或反向代理时，继续阅读 [LiveKit 与实时语音配置](./livekit)。需要维护、升级或备份时，再阅读 [部署建议与升级](./deployment)。
