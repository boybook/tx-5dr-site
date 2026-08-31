# 测试插件

`@tx5dr/plugin-api/testing` 提供与公开 API 对齐的轻量 mock。脚手架生成的 TypeScript 项目已经包含 Vitest 和一个基础测试文件。

## 测试一个 Hook

```ts
import { describe, expect, it } from 'vitest';
import {
  createMockContext,
  createMockParsedMessage,
} from '@tx5dr/plugin-api/testing';
import { plugin } from '../index.js';

describe('decode-observer', () => {
  it('logs decoded messages', async () => {
    const ctx = createMockContext();
    const messages = [createMockParsedMessage()];

    await plugin.hooks?.onDecode?.(messages, ctx);

    expect(ctx.log._calls).toContainEqual(expect.objectContaining({
      level: 'info',
      message: 'Decoded messages',
    }));
  });
});
```

常用工厂包括：

- `createMockContext()`
- `createMockParsedMessage()`
- `createMockSlotInfo()`
- `createMockEventBus()`
- `createMockNetworkControl()`
- `createMockFileStore()`

## 按权限创建 context

mock 和生产环境使用相同的 capability 选择规则：

```ts
const ctx = createMockContext({
  permissions: ['logbook:read', 'plugin:event-bus'] as const,
});

await ctx.logbook.hasWorked('W1AW');
ctx.eventBus.publish('my-plugin.ready', { ready: true });
```

测试时传入与插件定义相同的权限。mock 会据此创建对应的运行时 capability，帮助发现多数权限遗漏；生产代码的精确 callback 类型仍由 `definePlugin()` 推导。

## 验证按值语义

mock 的配置、KV、EventBus 和设置结果也使用独立数据：

```ts
const ctx = createMockContext({ config: { nested: { value: 1 } } });
const first = ctx.config as { nested: { value: number } };

first.nested.value = 2;

expect(ctx.config).toEqual({ nested: { value: 1 } });
```

测试应通过公开写入 API 改变状态，而不是依赖对象引用共享。

## strategy 测试

strategy 至少覆盖：

- `checkpoint()` 可以被 `structuredClone()`
- `restore()` 能恢复完整状态
- `decide()` 返回 `transmission` 和 `snapshot`
- `meta.signal` abort 后不再产生外部副作用
- QSO completion effect 在 settle 后不会泄漏到下一场通联

## 比赛规则测试

`@tx5dr/plugin-api/contest` 提供 `createFT8ContestTestKit()`。它直接测试纯规则模块，不需要启动 Host：

```ts
const kit = createFT8ContestTestKit(contest);

kit.exchange({ grid: 'FN31' }, { grid: 'FN31' });
kit.invalidExchange({ grid: 'ZZ99' }, 'invalid_grid');
kit.completion({
  sentExchange: { grid: 'PL04' },
  receivedExchange: { grid: 'FN31' },
  receivedFinalAck: true,
}, true);
```

每个比赛至少固定一组官方计分向量、一个重复通联向量和一份提交文件 golden。runtime 另外测试 checkpoint/restore 和 RF fail-closed；不要用 runtime 测试代替纯规则测试。

## 发布前检查

```bash
npm run build
npm test
```

单元测试之外，还应把构建产物链接到 TX-5DR，确认插件能加载、所需权限可见、reload/unload 能关闭 socket 和订阅，并实际走一次最关键的用户流程。

轻量 mock 不模拟 invocation timeout、reload、`PLUGIN_INVOCATION_EXPIRED`、Host capability Proxy 或完整 Loader 校验。涉及这些边界时，需要再做一次 PluginManager/真实 Host smoke test。
