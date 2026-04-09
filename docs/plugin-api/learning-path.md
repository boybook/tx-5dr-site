# 学习路径

如果你希望系统地学会 TX-5DR 插件开发，推荐按下面顺序阅读。整套路径是从“最小可运行插件”一路走到“完整策略运行时”。

## 建议顺序

1. [快速开始](./getting-started)
2. [第 1 章：Hello Utility](./tutorial-hello-utility)
3. [第 2 章：过滤与评分](./tutorial-filter-and-score)
4. [第 3 章：守候与自动起呼](./tutorial-watcher-autocall)
5. [第 4 章：面板、按钮与定时器](./tutorial-ui-actions-and-panels)
6. [第 5 章：StrategyRuntime](./tutorial-strategy-runtime)
7. [心智模型](./concepts)
8. [Reference](./reference/)

## 每一章解决什么问题

### 第 1 章：Hello Utility

解决“插件最少需要写什么”的问题。你会学到：

- `PluginDefinition` 的最小结构
- `utility` 插件的基本形态
- `onDecode(...)` 这类最容易上手的 Hook
- 如何组织 `plugin.js`、`locales/`、`README.md`

### 第 2 章：过滤与评分

解决“插件如何影响目标选择，但不直接控制发射”的问题。你会学到：

- `onFilterCandidates(...)` 用于硬过滤
- `onScoreCandidates(...)` 用于软偏置
- 为什么 `worked-station-bias` 应该走评分 hook，而不是直接起呼
- 多个 utility 插件如何叠加

### 第 3 章：守候与自动起呼

解决“命中目标后如何自动起呼，并且能和别的插件组合”的问题。你会学到：

- `onAutoCallCandidate(...)` 的 proposal 模式
- `priority` 和 `lastMessage` 的含义
- 为什么新的守候型插件不建议直接 `ctx.operator.call(...)`
- `watched-callsign-autocall` 与 `watched-novelty-autocall` 的设计思路

### 第 4 章：面板、按钮与定时器

解决“插件如何和 UI / 用户交互”的问题。你会学到：

- `quickActions`
- `onUserAction(...)`
- `onTimer(...)`
- `ctx.ui.send(...)` 与面板数据推送

### 第 5 章：StrategyRuntime

解决“如何接管自动化流程本身”的问题。你会学到：

- `type: 'strategy'`
- `createStrategyRuntime(ctx)`
- `decide(...)`、`getTransmitText()`、`requestCall(...)`
- 什么时候应该写 strategy，而不是 utility

## 两条最重要的分界线

先记住这两条，后面大多数设计判断都会变简单：

- 如果你只是“影响候选排序或补充能力”，优先写 `utility`
- 如果你要“接管整个 QSO 流程”，才写 `strategy`

以及：

- “硬过滤”优先用 `onFilterCandidates(...)`
- “软偏置”优先用 `onScoreCandidates(...)`
- “守候后自动起呼”优先用 `onAutoCallCandidate(...)`

## 和主仓库文档的关系

站点中的教程更偏“教学式阅读”；主仓库里的 [`docs/plugin-system.md`](https://github.com/boybook/tx-5dr/blob/main/docs/plugin-system.md) 更偏“完整技术说明”。推荐做法是：

- 先按本节教程顺序建立心智模型
- 再回到主仓库文档和 Reference 核对细节字段
