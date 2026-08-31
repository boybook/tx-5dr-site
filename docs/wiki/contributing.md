# 贡献者代码地图

一个变更应该进入真正拥有该行为的模块。界面不修复电台协议问题，连接适配器不保存操作员策略状态，WebSocket 广播层也不执行 radio bootstrap。

## 功能所有权

| 变更 | 主要位置 | 常见协作位置 |
| --- | --- | --- |
| Web 界面与交互 | `packages/web` | `contracts` 中的载荷，`server` 中的查询或命令 |
| REST 请求 | `packages/server/src/routes` | `contracts` schema、认证/授权和 Web 客户端 |
| WebSocket 事件 | `packages/contracts/src/schema/websocket.schema.ts` | `server/src/websocket`、`core/src/websocket`、Web 消费者 |
| 电台协议 | `packages/server/src/radio/connections` | 独立公共库、`PhysicalRadioManager`、能力定义 |
| 电台启停/重连 | `PhysicalRadioManager` 与 `EngineLifecycle` | `RadioBridge`、连接状态机 |
| 电台控件与 meter | `radio/capabilities` 与连接实现 | contracts 能力 schema、Web 动态控件 |
| FT8/FT4 时序 | `core/src/clock`、`server/src/subsystems/ClockCoordinator.ts` | 解码队列、SlotPack、操作员运行时 |
| 发射音频与 PTT | `server/src/subsystems/TransmissionPipeline.ts` | AudioMixer、电台 I/O、发射记录 |
| 实时语音 | `server/src/realtime`、`server/src/voice` | `web/src/services/realtime`、电台音频适配 |
| 日志本与 ADIF | `server/src/log` | contracts、REST、日志本 WebSocket、同步插件 |
| 插件公共能力 | `packages/plugin-api` | Host 投影、内置插件、文档生成器 |
| 插件加载与仲裁 | `server/src/plugin` | `builtin-plugins`、contracts、插件 API |
| 桌面宿主与打包 | `packages/electron-main` | preload、client-tools、发布 workflow |
| Android 宿主能力 | `tx5dr-android-bridge` 独立仓库 | Android manifest、Unix socket 后端、Android runtime 发布 |

## 跨边界契约

新增一个跨前后端字段时，变更单元通常包含：

1. `packages/contracts` 中的运行时 schema 和推导类型。
2. 服务端产生者或命令处理器。
3. WebSocket/REST 边界的序列化与权限过滤。
4. Web 客户端或插件 Host 消费者。
5. schema 失败、授权失败、正常传递和重连快照测试。

只修改 TypeScript interface 无法阻止运行时收到旧数据，因此跨网络和持久化边界必须有 schema 或显式解码器。

## 新增电台连接

一个新连接实现需要满足以下约束：

1. `connect()` 只建立会话并执行最小协议初始化。
2. meter、频率监测和其他后台任务在 bootstrap 后统一启动。
3. 所有控制类 I/O 经过当前连接的串行队列。
4. 频率与模式使用复合工作状态入口，避免外层命令穿插。
5. `disconnect()` 终止定时器、订阅、音频和未决请求，旧会话事件不得污染新会话。
6. 实例能力按探测结果暴露，不为了界面一致而伪造支持。

协议本身具有独立公共库时，数据包、端序、校验和重试应留在公共库；TX-5DR 主仓库只保留与统一连接契约、Profile 和引擎事件的适配。

## 新增电台能力

能力不应从一个 Web 按钮直接连到协议函数。完整变更需要：

- 统一能力 ID、值类型、范围、可读写性和显示元数据。
- 各连接实现的探测、读取和写入适配。
- 串行化、超时、不支持和底层拒绝语义。
- 权限检查与 WebSocket 值变化投影。
- 动态界面在布尔、枚举、数值和只读 meter 上的显示测试。

## 时序和并发

时隙、连接会话、发射帧和持久化修订号都是一等领域数据。异步回调不得用“当前”对象替换事件原本所属的时隙、会话或修订号。与时序相关的修复需要同时覆盖：

- 正常顺序。
- 旧回调晚于新会话返回。
- 连接在命令中途断开。
- 重连或重试后重复事件。
- 多操作员或多插件同时提交意图。

## 公共与内部边界

| 可对外依赖 | 只供主项目内部使用 |
| --- | --- |
| `@tx5dr/plugin-api` 公共导出 | `packages/server/src/plugin` 内部类 |
| 已发布公共库的文档 API | 未版本化 `/api/*` 路由与主 WebSocket 细节 |
| NET rigctl 已实现命令集 | 电台管理器和发射管线对象 |
| 文档化的持久化与导入导出格式 | 内存事件发射器与调试事件 |

## 变更证据

可合并的变更应该同时给出业务不变式、所有者位置、失败语义、针对性测试和必要的跨工作区验证。涉及物理电台或原生模块时，模拟测试不能替代真实协议、设备或打包产物的验证记录。
