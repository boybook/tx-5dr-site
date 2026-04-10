# 示例与约定

本页说明插件编写时的常见分类和约束。示例来源包括 `packages/server/src/plugin/builtins/` 中的内置插件。

## utility 插件的常见场景

以下场景通常适合使用 `utility` 插件：

- 过滤候选目标
- 调整候选打分
- 监听广播事件
- 推送面板数据
- 调用外部服务并回写结果

对应的内置参考包括：

- `snr-filter`
- `worked-station-bias`
- `qso-session-inspector`
- `heartbeat-demo`
- `watched-callsign-autocall`
- `watched-novelty-autocall`

### 守候型自动起呼插件

如果插件的目标是“发现目标后自动起呼”，当前推荐使用 `onAutoCallCandidate(...)`：

- 返回 proposal，而不是在广播 Hook 中直接 `ctx.operator.call(...)`
- `priority` 用于表达插件意图强弱
- `lastMessage` 建议始终带上，方便 Host 在同优先级下按命中消息顺序稳定仲裁，并据此推导正确的回复时隙
- 插件内部仍应自己判断 trigger mode、是否纯待机、是否被其他操作员占用、是否满足自己的黑白名单规则

当前内置参考：

- `watched-callsign-autocall`：显式 watch list，默认优先级更高
- `watched-novelty-autocall`：守候新 DXCC / 新网格 / 新呼号，适合和其他守候插件一起启用

### 偏好排序型插件

如果插件的目标是“影响候选排序”，推荐实现 `onScoreCandidates(...)`，而不是直接控制发射：

- 输入是 `ScoredCandidate[]`
- 插件通过给每个候选增加或减少 `score` 表达偏好
- 多个评分插件会自然叠加
- 最终是否选中某个目标，仍由 Host 和当前活跃策略共同决定

当前内置 `worked-station-bias` 就是标准示例：它查询目标是否已通联，再给新台加分、已通联台减分，而不是直接起呼。

## strategy 插件的常见场景

以下场景通常需要 `strategy` 插件：

- 替换默认自动化流程
- 维护独立的 QSO 状态推进逻辑
- 生成自定义 TX 文本
- 根据特定竞赛或活动规则组织流程

对应的内置参考是 `standard-qso`。

## 编写顺序

1. 先确定插件属于 `utility` 还是 `strategy`
2. 再确定需要的 `hooks`、`settings`、`panels` 和存储范围
3. 最后补充日志、README 和本地化文件

## 实现约定

### 逻辑拆分

建议把 Hook 中的业务逻辑拆分到独立函数，避免把过滤、状态更新和 UI 推送全部写在单个回调中。

### 配置命名

`settings` 中的键名会直接影响配置结构与界面显示，建议保持与实际用途一致，并配套提供本地化字段。

### 日志内容

插件日志建议至少包含以下信息：

- 当前 Hook 名称
- 触发条件
- 关键判断参数
- 最终动作

这些字段便于在 `pluginLog` 或主日志中定位问题。

### 自动起呼优先级建议

如果你的插件暴露 `autocallPriority` 之类的设置，建议把它理解为“跨插件仲裁优先级”，而不是插件内部列表排序：

- `100+`：强指令型守候，例如显式 watch list、sked、朋友台
- `60~99`：高价值机会型守候，例如新 DXCC / 新网格 / 新呼号
- `1~59`：弱偏好型补充
- `0`：未显式设置优先级时的默认层级

通常建议把这类优先级做成 `operator` scope 设置，让不同操作员可以独立调整。

### 评分插件与过滤插件的边界

这两个类型建议明确分工：

- `onFilterCandidates`：用于“绝不考虑”的硬过滤
- `onScoreCandidates`：用于“更倾向于考虑”的软偏置

例如：

- “只允许某些前缀”适合 `onFilterCandidates`
- “已通联过的台降低优先级”适合 `onScoreCandidates`

### 分发文件

可分发的插件目录通常至少包含以下文件：

- 入口文件，如 `plugin.js` 或 `index.js`
- `locales/` 目录
- `README.md`

该结构与主项目 `docs/plugin-system.md` 中的目录约定一致。
