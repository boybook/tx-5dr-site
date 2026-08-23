# プラグイン API リファレンス

公開 TypeScript ソースから生成された、プラグイン API のシグネチャと共有型のリファレンスです。JSDoc 本文は英語で掲載します。

## ページ一覧

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

## リファレンスの更新

サイトリポジトリのルートで次のコマンドを実行します。

```bash
npm run docs:sync-plugin-api
```

デフォルトで参照するソースリポジトリのブランチは `main`。

TX-5DR リポジトリが `../tx-5dr` にない場合は、次の環境変数を設定してください: `TX5DR_SOURCE_DIR`。
