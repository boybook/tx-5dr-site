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

### 分发文件

可分发的插件目录通常至少包含以下文件：

- 入口文件，如 `plugin.js` 或 `index.js`
- `locales/` 目录
- `README.md`

该结构与主项目 `docs/plugin-system.md` 中的目录约定一致。
