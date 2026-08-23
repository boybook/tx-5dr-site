# Plugin API Reference

These pages are generated from the public TypeScript sources and document Plugin API signatures and shared types.

## Pages

- [PluginDefinition](./definition)
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

## Updating the reference

Run this command from the site repository root:

```bash
npm run docs:sync-plugin-api
```

The source repository branch used by default is `main`.

If the TX-5DR repository is not available at `../tx-5dr`, set `TX5DR_SOURCE_DIR`.
