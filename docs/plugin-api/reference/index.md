# 插件 API Reference

这一组页面由脚本自动从 `packages/plugin-api/src` 与 `packages/contracts/src` 生成，用于查阅插件公开接口及其转出的共享类型。

## 页面目录

- [PluginDefinition](./definition)
- [PluginContext](./context)
- [PluginHooks](./hooks)
- [StrategyRuntime](./runtime)
- [Helper Interfaces](./helpers)
- [Host Settings](./settings)
- [Re-exports](./re-exports)
- [Contracts Re-exports](./contracts)

## 更新方式

在站点仓库根目录执行：

```bash
npm run docs:sync-plugin-api
```

当前默认读取的主仓库分支是 `main`。

如果 TX-5DR 主仓库不在默认的 `../tx-5dr`，请先设置环境变量 `TX5DR_SOURCE_DIR`。
