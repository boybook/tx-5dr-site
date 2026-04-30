# Linux 服务器安装

Linux 服务器版面向独立主机部署。当前安装形态会安装并编排 `tx5dr` 与 `nginx`：`tx5dr` 后端内置 `rtc-data-audio` WebRTC DataChannel 实时语音端点，`nginx` 提供统一浏览器入口与 HTTPS。

## 适用范围

- 电台所在主机长期运行
- 浏览器终端与电台主机分离
- 局域网或公网访问
- 多操作员或长期维护场景

## 系统要求

- **Debian 12+** 或 **Ubuntu 22.04+**
- 一台可连接电台与音频设备的 Linux 主机
- 浏览器访问入口
- 安装时自动生成自签名 HTTPS 证书（端口 8443），也可替换为自定义证书
- 低延迟实时语音默认需要 `50110/udp`；如不能开放 UDP，可使用 `ws-compat` 兼容路径

## 一键安装

```bash
curl -fsSL https://github.com/boybook/tx-5dr/releases/download/nightly-server/install-online.sh | sudo bash
```

该脚本会执行以下步骤：

- 检测主机架构
- 解析最新服务器包元数据
- 安装依赖
- 部署 `tx5dr` 和 `nginx`
- 配置 HTTP/HTTPS 入口与运行时目录

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
| `tx5dr status` | 查看服务、nginx、rtc-data-audio UDP、令牌和配置路径 |
| `tx5dr token` | 查看管理员令牌和登录 URL |
| `tx5dr update` | 更新到最新 nightly |
| `tx5dr doctor` | 执行环境诊断（含 SSL 证书和实时语音 UDP 检查） |
| `tx5dr doctor --fix` | 自动修复诊断发现的问题（含 SSL 证书生成） |
| `tx5dr ssl status` | 查看 SSL 证书状态 |
| `tx5dr ssl renew` | 续签自签名证书 |
| `tx5dr logs` | 查看日志 |

## 服务组成

Linux 服务器版的运行结构由以下组件构成：

- `tx5dr`：核心后端、Web API、插件运行时和内置 `rtc-data-audio` 实时语音端点
- `nginx`：统一入口与 HTTPS 反向代理

不再安装或管理 `livekit-server`。旧版本遗留的 LiveKit 服务或运行文件只可能在升级清理流程中被停止/清理，不再作为新部署的一部分。

## 实时语音配置

当前实时语音默认使用：

- `rtc-data-audio`：WebRTC DataChannel 低延迟路径，默认 `50110/udp`
- `ws-compat`：WebSocket/TCP 兼容路径，作为自动降级或强制兼容模式

打开“系统设置 > 实时音频”进行配置：

1. 默认保持 `Auto`，系统会优先尝试 `rtc-data-audio`，失败后回退到 `ws-compat`。
2. 如果公网或隧道环境无法开放 UDP，选择兼容模式 / `ws-compat`。
3. FRP 或静态 NAT 场景，把公网 UDP 映射到服务器 `50110/udp`，再填写 `WebRTC Data Audio external UDP address`。
4. 保存后新会话生效；已有语音会话不会热更新。

### 公网部署时需要额外注意什么

低延迟路径不需要 `/livekit`，也不需要 LiveKit 的媒体端口范围。你只需要确认：

- Web UI 的 HTTP/HTTPS 入口可达
- 浏览器使用 HTTPS 或 `localhost`，以便麦克风授权
- `50110/udp`（或你配置的 `RTC_DATA_AUDIO_UDP_PORT`）从浏览器所在网络可达
- FRP / NAT / 防火墙 / 云安全组确实转发 UDP，而不只是 TCP

::: warning FRP / 单端口公网入口
如果你的公网入口本质上只能提供网页访问，无法同时开放 UDP，建议直接使用 `ws-compat`。这通常比排查已经移除的 LiveKit 链路更稳定。
:::

更完整的判断方法请阅读 [实时语音与 WebRTC UDP](./realtime-audio)。

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

安装完成后，建议继续阅读 [首次进入与基本使用](./first-steps)。需要配置公网语音、FRP 或反向代理时，继续阅读 [实时语音与 WebRTC UDP](./realtime-audio)。需要维护、升级或备份时，再阅读 [部署建议与升级](./deployment)。
