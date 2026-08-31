# 示例与约定

内置插件位于主仓库 `packages/builtin-plugins/src/`。阅读真实插件时，优先选择与目标最接近、规模最小的实现。

## 按目标找示例

| 目标 | 内置参考 |
| --- | --- |
| 按信噪比或呼号过滤 | `snr-filter`、`callsign-filter` |
| 调整候选偏好 | `worked-station-bias` |
| 守候呼号、网格或新实体 | `watched-callsign-autocall`、`watched-grid-autocall`、`watched-novelty-autocall` |
| 为已接受的自动起呼选空闲频率 | `autocall-idle-frequency` |
| 定时启动自动化 | `scheduled-cq-autocall` |
| 全站切换波段和调谐 | `scheduled-band-switcher` |
| 接入 WSJT-X UDP | `qso-udp-broadcast` |
| 记忆无回复目标并提供自定义 UI | `no-reply-memory-filter` |
| 同步外部日志 | `qrz-sync`、`wavelog-sync`、`clublog-sync`、`lotw-sync` |
| 实现完整 strategy | `standard-qso`、`assisted-qso-queue` |
| FT8 比赛、独立比赛日志与计分 | `ww-digi`；新项目优先从 `ft8-contest` 脚手架开始 |

## 保持插件职责单一

- “绝不考虑”使用 `onFilterCandidates()`。
- “可以考虑但更偏好”使用 `onScoreCandidates()`。
- “发现后建议起呼”使用 `onAutoCallCandidate()`。
- “接管整个 QSO 流程”才使用 strategy。

不要在解码广播 Hook 中直接提交起呼命令，也不要用极端分数伪装硬过滤。

## 返回新数据

普通 Hook 参数是插件拥有的快照，但推荐显式返回新数组和新对象，便于测试和组合：

```ts
onScoreCandidates(candidates) {
  return candidates.map((candidate) => ({
    ...candidate,
    score: candidate.score + 10,
  }));
}
```

修改输入不会写回 Host 的原始对象；持久化变化仍需调用 `store.set()`、`updateConfig()` 或对应 command port。

## 自动起呼优先级

priority 表达不同 proposal 的相对意图强度：

- `100+`：明确 watch list 或 sked
- `60-99`：新 DXCC、新网格等高价值机会
- `1-59`：弱偏好补充
- `0`：默认层级

只有持有真实 `FrameMessage` 和 `SlotInfo` 时才填写 `lastMessage`；拿不到时省略，不要从解析结果伪造 frame。

## 配置和实例

- operator 行为使用 operator-scope setting。
- 全站服务使用 `instanceScope: 'global'` 和 global setting/store。
- global utility 不声明 operator setting、quickSettings 或 operator panel。
- settings key 发布后应保持稳定，并提供本地化 label/description。

## 日志和错误

日志至少包含 action、关键输入和结果，不要记录密码、API key、Token、证书或完整授权响应。对外同步失败使用稳定 code 和结构化 `failures`，让 UI 能区分远端、网络和本地日志本问题。

## 分发目录

构建后的插件目录通常包含：

```text
my-plugin/
├── index.js
├── locales/
├── ui/       # 可选
└── README.md
```

插件只依赖 `@tx5dr/plugin-api` 的公开导出，不要从 server、core 或 contracts 内部路径导入实现。
