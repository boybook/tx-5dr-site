# 按需求选择指南

插件文档不要求顺序通读。先完成 [快速开始](./getting-started)，再根据目标选择一条路径。

## 第一次写插件

1. [快速开始](./getting-started)：创建、构建、链接和加载第一个 v2 插件。
2. [插件如何运行](./concepts)：了解服务端、iframe、数据快照和 callback 生命周期。
3. [编写 Utility 插件](./tutorial-hello-utility)：添加第一个 Hook 和设置。
4. [测试插件](./testing)：用与公开 API 对齐的 mock 验证行为。

## 调整自动化行为

- 排除候选或改变候选顺序：[过滤与评分](./tutorial-filter-and-score)
- 发现目标后提出自动起呼：[自动起呼提议](./tutorial-watcher-autocall)
- 定时请求操作员自动化：[权限与能力](./permissions#命令型能力)
- 接管完整 QSO 状态机：[StrategyRuntime](./tutorial-strategy-runtime)

先用 utility 表达一个局部规则。只有需要维护 QSO 阶段和下一条发射文本时，才实现 strategy。

## 添加界面

1. 简单按钮、状态和表格：[按钮、定时器与面板](./tutorial-ui-actions-and-panels)
2. 表单或复杂交互：[自定义 UI](./tutorial-custom-ui)
3. React、Vue、Vite 和热重载：[UI 开发实战](./tutorial-ui-dev-workflow)

iframe 页面没有服务端 capability。敏感操作通过 `tx5dr.invoke()` 请求 page handler，再由 handler 校验 Host 提供的 `requestContext`。

## 接入外部系统

- HTTP、UDP 和插件间消息：[权限与能力](./permissions)
- WaveLog、LoTW、QRZ.com 一类日志服务：[日志同步 Provider](./tutorial-logbook-sync)
- 频率、调谐器和物理电源：[电台控制](./radio-capabilities-power)
- 调整 TX-5DR 白名单设置：[宿主设置](./host-settings)

## 查字段和签名

[API Reference](./reference/) 由脚本从当前公共源码生成。Reference 适合核对类型，不是第一次阅读的教程。

- 插件入口：[PluginDefinition](./reference/definition)
- callback context：[PluginContext](./reference/context)
- utility 事件：[PluginHooks](./reference/hooks)
- strategy：[StrategyRuntime](./reference/runtime)
- view、command port、UI 和存储：[Helper Interfaces](./reference/helpers)

## 维护旧插件

先看 [API v2 与兼容性](./api-v2)，然后让 TypeScript 根据 `permissions` 找出仍在使用的旧写接口。不要只以“插件能加载”为迁移完成标准；至少实际走一遍关键用户流程和 unload/reload。
