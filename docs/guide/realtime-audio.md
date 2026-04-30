# 实时语音与 WebRTC UDP

TX-5DR 当前不再嵌入或编排 LiveKit。实时语音只保留两条公开传输路径：

- `rtc-data-audio`：默认低延迟路径，使用浏览器 WebRTC DataChannel，媒体走内置服务端的单个 UDP 端口。
- `ws-compat`：TCP/WebSocket 兼容路径，作为自动降级和强制兼容模式。

默认策略是先尝试 `rtc-data-audio`，如果浏览器、原生模块、UDP/ICE 或网络条件不可用，再自动回退到 `ws-compat`。部署上不需要额外的媒体服务器、房间、token 服务或 LiveKit YAML。

## 一句话判断

> 能让浏览器访问 HTTPS 页面，并能额外打通一个 UDP 端口，就使用默认自动模式；只能提供网页 TCP 入口时，切到 `ws-compat` 兼容模式。

## 当前链路如何工作

`rtc-data-audio` 的信令和媒体是分开的：

| 项目 | 默认值 | 说明 |
| --- | --- | --- |
| 信令入口 | `/api/realtime/rtc-data-audio` | 同源 WebSocket，随 Web UI 一起走 HTTPS/反向代理 |
| 媒体端口 | `50110/udp` | WebRTC ICE UDP mux，只需要一个 UDP 端口 |
| 兼容路径 | `ws-compat` | 仍走 WebSocket/TCP，用于 UDP 不通或强制兼容 |

浏览器端会复用同一套播放/采集 AudioWorklet。发生 `rtc-data-audio -> ws-compat` 降级时，系统不会重新创建麦克风流和音频上下文，因此失败恢复会更快。

## 系统设置怎么选

打开“系统设置 > 实时音频”：

1. 传输策略保持 `Auto`，让系统按 `rtc-data-audio -> ws-compat` 顺序尝试。
2. 如果当前网络无法开放 UDP，选择兼容模式 / `ws-compat`。
3. FRP、静态 NAT 或公网端口映射时，填写 `WebRTC Data Audio external UDP address` 对应的公网主机/IP 和 UDP 端口。
4. 保存后，新建或重连的实时语音会话会使用新设置；已有会话不会热更新。

如果你只在局域网、本机或 Docker 主机同网段访问，通常不需要填写公网 UDP 地址。保持为空即可让浏览器使用本地 ICE candidate。

## 端口要求

### Linux 服务器 / Docker

| 端口 | 协议 | 用途 |
| --- | --- | --- |
| `8076` | TCP | HTTP Web UI |
| `8443` | TCP | HTTPS Web UI，语音功能推荐使用 |
| `50110` | UDP | `rtc-data-audio` WebRTC DataChannel 媒体 |

`50110` 是默认值。Linux 服务可通过 `/etc/tx5dr/config.env` 设置 `RTC_DATA_AUDIO_UDP_PORT` 修改；Docker 可在 compose 环境变量和端口映射中同步修改。

### 桌面版

桌面版内置后端也使用同一套实时语音链路。只在应用窗口或本机浏览器使用时通常不需要额外配置；如果要让局域网或公网浏览器访问这台桌面机，需要确认系统防火墙允许对应 UDP 端口。

## FRP / 静态 NAT

FRP 或静态 NAT 场景建议只映射一个 UDP 端口：

```text
公网/VPS UDP 端口  ->  TX-5DR 主机 UDP 50110
```

然后在“系统设置 > 实时音频”填写公网主机/IP 与公网 UDP 端口。服务端会把这个公网候选追加到 WebRTC ICE candidate 中，同时保留局域网候选，因此局域网直连和公网访问可以共存。

::: warning 只反代网页不等于 UDP 可用
如果你的 FRP、Nginx、Caddy 或云隧道只转发 HTTP/HTTPS，`rtc-data-audio` 的 UDP 媒体仍然无法连通。这时应使用 `ws-compat`，不要继续排查已经移除的 LiveKit 端口或 `/livekit` 路径。
:::

## Opus 与 PCM

实时语音会按会话协商编码：

- 浏览器支持 WebCodecs Opus 且服务端可加载 `@discordjs/opus` 时，优先使用 Opus。
- 任一侧不支持 Opus 时，在同一传输上回落到 PCM s16le。
- 编码选择不会新增端口，也不会改变 FRP / UDP 部署方式。

## 常见问题

### 页面能打开，但语音连接失败

优先检查：

1. 是否通过 HTTPS 或 `localhost` 访问，以便浏览器授权麦克风。
2. `50110/udp` 是否从浏览器所在网络可达 TX-5DR 主机。
3. 如果配置了公网 UDP 地址，主机/IP 和端口是否指向实际映射。
4. 防火墙、安全组、路由器 NAT 或 FRP 是否真的转发 UDP，而不只是 TCP。
5. 临时切到 `ws-compat` 是否可以恢复语音。

### 是否还需要 LiveKit、`/livekit` 或 `livekit.resolved.yaml`

不需要。当前版本的实时语音不再使用 LiveKit，也不再依赖 `livekit-server`、`/livekit` signaling 路径、`7881/tcp` 或 `50000-50100/udp` 媒体端口范围。旧安装中的 LiveKit 服务和文件仅可能由升级清理逻辑处理，不再作为新部署的一部分。

### UDP 端口冲突怎么办

把服务端环境变量 `RTC_DATA_AUDIO_UDP_PORT` 改成另一个端口，并同步更新 Docker 端口映射、防火墙或 FRP 映射。每个 TX-5DR 实例应使用一个独立 UDP 端口。

## 维护边界

- 日常首选 `Auto`，让系统自动选择 `rtc-data-audio` 或 `ws-compat`。
- 公网访问只需要为低延迟路径额外准备一个 UDP 端口。
- 不能开放 UDP 时，`ws-compat` 是受支持的兼容方案。
- 不再维护 LiveKit 专用配置文件、凭据、容器或 systemd 单元。
