# 把 TX-5DR 安装在 Linux 电台主机上

Linux 服务器版适合把一台低功耗主机长期放在电台旁。CAT、PTT 和音频都由这台主机处理，操作员从任意现代浏览器进入 TX-5DR，不需要安装图形桌面，也不再依赖远程桌面软件。

## 使用前提

- Debian 12+（推荐）或 Ubuntu 24.04+
- amd64 或 arm64 处理器
- 主机能够连接电台和收发音频，或能够访问网络电台
- 安装时可使用 `sudo`，并能连接下载安装源
- 局域网内至少有一台设备可以打开浏览器

安装脚本会准备 Node.js、nginx、系统服务、运行目录和自签名 HTTPS 证书。电台使用 USB 时，脚本也会把服务账户加入常见的音频和串口权限组。

## 1. 一键安装

在 Linux 主机执行：

```bash
curl -fsSL https://github.com/boybook/tx-5dr/releases/download/nightly-server/install-online.sh | sudo bash
```

脚本会自动识别架构并下载服务器包。在中国大陆网络下会优先尝试 OSS 分发源，失败时回退到 GitHub。

需要离线安装时，从[服务器版发布页](https://github.com/boybook/tx-5dr/releases/tag/nightly-server)下载与系统、架构对应的 `.deb` 或 `.rpm`，再执行包管理器安装。Debian / Ubuntu 示例：

```bash
sudo dpkg -i --force-depends ./TX-5DR-nightly-server-linux-amd64.deb
sudo bash /usr/share/tx5dr/install.sh
```

## 2. 启动并取得登录令牌

```bash
tx5dr start
tx5dr status
tx5dr token
```

`tx5dr status` 应显示 TX-5DR 服务和 nginx 正在运行，并列出 Web UI 地址。默认入口为：

- `http://<主机局域网 IP>:8076`
- `https://<主机局域网 IP>:8443`

首次打开自签名 HTTPS 地址时，浏览器会提示证书不受信任。确认地址确实属于自己的 TX-5DR 主机后，可以继续访问。需要浏览器麦克风或跨网络登录时，HTTPS 更合适；正式对外使用应换成受信任证书。

用 `tx5dr token` 显示的管理员令牌登录。不要把令牌附在公开截图、日志或论坛帖子中。

## 3. 确认电台和音频设备

USB 电台或声卡接入后，可以先在主机检查：

```bash
lsusb
aplay -l
arecord -l
ls -l /dev/serial/by-id/ 2>/dev/null
```

然后执行：

```bash
tx5dr doctor
```

在 TX-5DR 中创建 Profile 时，优先选用 `/dev/serial/by-id/` 下的稳定串口名，避免重启或重新插拔后 `/dev/ttyUSB0`、`/dev/ttyACM0` 编号变化。电台通过 Hamlib 网络连接、ICOM WLAN 或 TCI 时，不需要映射本地串口，但 Linux 主机必须能够访问电台的 IP 和端口。

如果设备在 Linux 中可见、在 TX-5DR 中却不可见，可运行 `sudo tx5dr doctor --fix` 修复常见依赖和用户组配置，再重启服务。

## 4. 从其他设备操作

服务器版默认提供局域网入口。让操作终端与 Linux 主机位于同一网络，在浏览器打开 `tx5dr status` 显示的地址即可。电台主机不需要显示器、键盘或保持桌面会话登录。

准备跨网络访问时，推荐顺序是：

1. Tailscale、ZeroTier、WireGuard 等私有组网。
2. 带 HTTPS 和身份验证的反向代理或隧道。
3. 仅在充分理解风险时直接开放公网端口。

在“系统设置 > 访问范围”中选择“正式开放部署”，并把浏览器实际使用的完整地址加入允许列表。反向代理必须支持 WebSocket。地址只包含协议、主机和端口，例如 `https://radio.example.com`，不要加入页面路径或末尾斜杠。

更完整的公网安全和 Origin 恢复步骤见[长期运行、远程访问与升级](./deployment)。远程监听和语音的网络要求单独见[远程监听与语音链路](./realtime-audio)。

## 日常命令

| 命令 | 用途 |
| --- | --- |
| `tx5dr start` | 启动服务并显示 Web UI 地址 |
| `tx5dr stop` | 停止服务 |
| `tx5dr restart` | 正常重启服务 |
| `tx5dr status` | 查看服务、Web 入口、版本、端口和数据目录 |
| `tx5dr token` | 查看管理员令牌 |
| `tx5dr token --reset` | 重新生成管理员令牌并重启服务 |
| `tx5dr update` | 更新到最新 nightly |
| `tx5dr doctor` | 诊断依赖、设备权限、nginx、证书和网络 |
| `sudo tx5dr doctor --fix` | 修复可自动处理的问题 |
| `tx5dr logs` | 跟踪 TX-5DR 日志 |
| `tx5dr logs --all` | 同时跟踪 TX-5DR 与 nginx 日志 |
| `tx5dr enable` | 设置开机自动启动 |
| `tx5dr disable` | 关闭开机自动启动 |

## HTTPS 证书

服务器版会生成自签名证书，适合首次配置和自用局域网。使用正式域名时，可替换为自己的 PEM 证书和私钥：

```bash
sudo cp your-cert.crt /etc/tx5dr/ssl/server.crt
sudo cp your-cert.key /etc/tx5dr/ssl/server.key
sudo sed -i 's/TX5DR_SSL_MODE=self-signed/TX5DR_SSL_MODE=custom/' /etc/tx5dr/ssl/cert-info.env
sudo systemctl reload nginx
```

证书文件必须只允许受信任的系统账户读取。替换后执行 `tx5dr status` 并在浏览器检查实际证书。

自签名证书丢失或过期时：

```bash
sudo tx5dr ssl renew
```

## 安装后检查清单

- `tx5dr status` 中服务与 Web 入口正常
- 浏览器可登录，其他人无法仅凭网址取得控制权限
- Profile 能读取电台频率和模式
- 接收音频电平正常，FT8 可以稳定解码
- 低功率 PTT 测试完成，停止发射按钮有效
- 开机自启、主机休眠策略和电源恢复行为符合值守需要
- 已备份 `/var/lib/tx5dr`

升级、备份、迁移和公网访问见[长期运行、远程访问与升级](./deployment)。
