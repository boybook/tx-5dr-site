# StrategyRuntime

strategy 插件负责一个操作员的 QSO 状态机：接收解码、维护阶段、返回下一条发射文本，并提供可恢复的状态快照。过滤、评分、守候、同步和面板通常都应该使用 utility，而不是 strategy。

## 最小 v2 runtime

```ts
import {
  definePlugin,
  type ParsedFT8Message,
  type StrategyDecisionMetaV2,
  type StrategyDecisionResult,
  type StrategyPluginContext,
  type StrategyRuntime,
  type StrategyRuntimeCheckpoint,
  type StrategyRuntimeContext,
  type StrategyRuntimeSlot,
  type StrategyRuntimeSlotContentUpdate,
} from '@tx5dr/plugin-api';

class SimpleRuntime implements StrategyRuntime {
  private state: StrategyRuntimeSlot = 'TX6';
  private slots: Partial<Record<StrategyRuntimeSlot, string>> = {};
  private context: StrategyRuntimeContext = {};

  constructor(private readonly ctx: StrategyPluginContext) {}

  checkpoint(): StrategyRuntimeCheckpoint {
    return structuredClone({
      state: this.state,
      slots: this.slots,
      context: this.context,
    });
  }

  restore(checkpoint: StrategyRuntimeCheckpoint): void {
    const saved = checkpoint as {
      state: StrategyRuntimeSlot;
      slots: Partial<Record<StrategyRuntimeSlot, string>>;
      context: StrategyRuntimeContext;
    };
    this.state = saved.state;
    this.slots = { ...saved.slots };
    this.context = { ...saved.context };
  }

  decide(
    _messages: ParsedFT8Message[],
    meta: StrategyDecisionMetaV2,
  ): StrategyDecisionResult {
    if (meta.signal.aborted) {
      throw meta.signal.reason ?? new Error('Decision aborted');
    }

    return {
      transmission: this.getTransmitText(),
      snapshot: this.getSnapshot(),
    };
  }

  getTransmitText(): string | null {
    return this.slots[this.state] ?? null;
  }

  requestCall(callsign: string): void {
    this.context.targetCallsign = callsign;
    this.state = 'TX1';
    this.ctx.log.info('Call requested', { callsign });
  }

  getSnapshot() {
    return {
      currentState: this.state,
      slots: { ...this.slots },
      context: { ...this.context },
    };
  }

  patchContext(patch: Partial<StrategyRuntimeContext>): void {
    Object.assign(this.context, patch);
  }

  setState(state: StrategyRuntimeSlot): void {
    this.state = state;
  }

  setSlotContent(update: StrategyRuntimeSlotContentUpdate): void {
    this.slots[update.slot] = update.content;
  }

  reset(): void {
    this.state = 'TX6';
    this.slots = {};
    this.context = {};
  }
}

export default definePlugin({
  apiVersion: 2,
  name: 'simple-strategy',
  version: '1.0.0',
  type: 'strategy',

  createStrategyRuntime(ctx) {
    return new SimpleRuntime(ctx);
  },
});
```

strategy 不申请 `operator:transmit-control`。用户选择某个 strategy，已经是允许它返回声明式 RF 决策的明确动作。

## 为什么需要 checkpoint

`decide()` 是 speculative phase。新命令、晚到解码、reload 或 shutdown 都可能让当前决策失效，Host 会使用 `checkpoint()` 和 `restore()` 回退 runtime。

- checkpoint 必须是 structured-clone 兼容数据。
- 不要放入函数、Promise、socket、文件句柄或 Host context。
- 异步工作必须传递并响应 `meta.signal`。
- `decide()` 内不要直接写日志本、提交 operator command 或产生不可撤销的外部副作用。

## Decision result

每次调用都返回当前准备发射的文本和对应快照：

```ts
return {
  transmission: 'CQ W1AW FN31', // 没有待发内容时为 null
  snapshot: this.getSnapshot(),
  stop: false,
};
```

`stop: true` 表示停止这个操作员后续的自动化和新帧，不会中断已经提交或正在播出的 RF 帧。

完成 QSO 时，使用可选 `qsoCompletion` effect，让 Host durable 写入日志本：

```ts
return {
  transmission: null,
  snapshot: this.getSnapshot(),
  qsoCompletion: {
    record,
    lifecycleEpoch,
  },
};
```

需要在 commit 后更新 runtime 时，实现 `settleQSOCompletion()`。不要在 speculative decision 中直接调用日志本写入。

## Strategy context

`StrategyPluginContext` 只包含：

- `config`
- `log`
- 只读 `operator`

它没有 radio、network、timer、UI、日志本写入或 command port。需要这些能力的附加功能应放在独立 utility 插件中。

## 测试重点

- `structuredClone(runtime.checkpoint())` 成功。
- `restore()` 后的 snapshot 与 checkpoint 一致。
- abort 后不继续改变 runtime 或产生外部副作用。
- `transmission` 与 `snapshot` 来自同一次状态推进。
- QSO effect settle 后不会泄漏到下一场通联。

完整实现可以参考内置 `standard-qso`；接口签名见 [StrategyRuntime Reference](./reference/runtime)。
