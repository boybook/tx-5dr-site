# 插件 API Reference

这些页面由公开 TypeScript 源码生成，用于查阅插件 API 签名和共享类型。

## 页面目录

- [PluginDefinition](./definition)
- [Plugin API Compatibility](./compatibility)
- [Capabilities](./capabilities)
- [PluginContext](./context)
- [PluginHooks](./hooks)
- [StrategyRuntime](./runtime)
- [Helper Interfaces](./helpers)
- [Host Settings](./settings)
- [Logbook Sync](./sync)
- [Host Dependencies](./host-dependencies)
- [Re-exports](./re-exports)
- [Contracts Re-exports](./contracts)

## 更新方式

在站点仓库根目录执行：

```bash
npm run docs:sync-plugin-api
```

当前默认读取的主仓库分支是 `main`。

如果 TX-5DR 主仓库不在默认的 `../tx-5dr`，请设置环境变量 `TX5DR_SOURCE_DIR`。
