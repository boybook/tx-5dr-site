# 公共 Node.js / Rust 库

TX-5DR 需要在 Node.js 中处理电台协议、原生 DSP、数字模式编解码和远程 SDR。其中多个组件以独立开源库和 npm 包发布，不需要引入 TX-5DR 主程序也可复用。

## 电台与协议

### `hamlib`

[npm](https://www.npmjs.com/package/hamlib) | [GitHub](https://github.com/boybook/node-hamlib) | LGPL

Hamlib 的 Node.js 原生绑定，包含电台与旋转器枚举、串口/网络连接、频率、模式、PTT、VFO、Split、数值表、电源和官方频谱流。TX-5DR 的广泛电台兼容性、动态控件和 meter 读取主要建立在这个包上。

```js
const { HamLib } = require('hamlib');

const rig = new HamLib(1035, '/dev/ttyUSB0');
await rig.open();
await rig.setFrequency(14_074_000);
await rig.setMode('USB');
await rig.setPtt(true);
```

### `icom-wlan-node`

[npm](https://www.npmjs.com/package/icom-wlan-node) | [GitHub](https://github.com/boybook/icom-wlan-node) | MIT

纯 Node.js / TypeScript 的 ICOM WLAN 实现，覆盖 UDP 探测、登录、Token 续期、CI-V 封装、12 kHz 双向音频、scope 分段组装和自动重连。高层 API 直接提供频率、模式、PTT、调谐器、Split、数值表与多种电台参数。

```ts
import { IcomControl } from 'icom-wlan-node';

const rig = new IcomControl({
  control: { ip: '192.168.1.50', port: 50001 },
  userName,
  password,
  model: 'auto',
});
await rig.connect();
await rig.setFrequency(14_074_000);
await rig.setMode('USB', { dataMode: true });
rig.events.on('audio', frame => consumeAudio(frame.pcm16));
```

### `tci-client-node`

[npm](https://www.npmjs.com/package/tci-client-node) | [GitHub](https://github.com/boybook/tci-client-node) | MIT

面向 SunSDR / ExpertSDR 的纯 TypeScript TCI 客户端。它在同一会话中处理文本控制、二进制音频、IQ 流、meter 流和不同 TCI dialect，并提供可用于集成测试的 Mock TCI Server。

```ts
import { TciClient } from 'tci-client-node';

const client = new TciClient({ url: 'ws://192.168.1.60:50001' });
await client.connect();
await client.setFrequency(14_074_000);
await client.setMode('digu');
await client.startAudio();
```

### `@openwebrx-js/api`

[npm](https://www.npmjs.com/package/@openwebrx-js/api) | [GitHub](https://github.com/boybook/openwebrx-js) | MIT

OpenWebRX+ WebSocket API 客户端，把服务器配置、SDR Profile、调谐、S 表、音频和频谱消息转成类型化事件。TX-5DR 用它提供辅助接收与远程 SDR 预览。

```ts
import { OpenWebRXClient } from '@openwebrx-js/api';

const client = new OpenWebRXClient({ url, outputRate: 12_000 });
await client.connect();
const profiles = await client.waitForProfiles(3000);
client.on('audio', pcm => consumeAudio(pcm));
client.startDsp();
```

## 数字模式与 DSP

### `wsjtx-lib`

[npm](https://www.npmjs.com/package/wsjtx-lib) | [GitHub](https://github.com/boybook/wsjtx-lib-nodejs) | GPL-3.0

将 WSJT-X / `wsjtx_lib` 的 C++/Fortran 核心暴露为异步 Node.js API，并为 Windows、macOS 和 Linux 提供预编译原生模块。库本身可解码多种 WSJT-X 模式；TX-5DR 正式使用 FT8，FT4 在产品中仍是实验功能。

```ts
import { WSJTXLib, WSJTXMode } from 'wsjtx-lib';

const codec = new WSJTXLib({ maxThreads: 4 });
const encoded = await codec.encode(WSJTXMode.FT8, 'CQ BH1ABC OM88', 1000);
await codec.decode(WSJTXMode.FT8, receivedAudio, 1000);
const messages = codec.pullMessages();
```

### `rubato-fft-node`

[npm](https://www.npmjs.com/package/rubato-fft-node) | [GitHub](https://github.com/boybook/rubato-fft-node) | MIT

由 Rust 实现的 Node.js 原生音频 DSP 库，提供流式重采样、实数 FFT、复数 IQ 频谱、窗函数、双二阶滤波器、电平测量和格式转换。TX-5DR 用它处理音频采样率边界、本地频谱和 TCI IQ 数据。

```ts
import { Resampler, ResamplerQuality, ComplexSpectrumAnalyzer } from 'rubato-fft-node';

const resampler = new Resampler(48_000, 12_000, 1, ResamplerQuality.High);
const audio12k = await resampler.process(audio48k);
const analyzer = new ComplexSpectrumAnalyzer({
  sampleRate: 96_000,
  fftSize: 4096,
  outputBins: 1024,
  windowFunction: 'hann',
  removeDc: true,
});
const spectrum = await analyzer.analyze(interleavedIq);
```

### `rasterwave-node`

[npm](https://www.npmjs.com/package/rasterwave-node) | [GitHub](https://github.com/boybook/rasterwave-node) | MIT

面向流式 SSTV 与 Radiofax 的 Rust 原生编解码库。它以增量事件返回模式检测、扫描线、进度和图像结果，避免必须把整段录音一次性载入内存。TX-5DR 中 SSTV 和 FAX 均为实验功能，FAX 当前只接收；这不限制该独立库自身的 API 能力。

```js
const { SstvDecoder } = require('rasterwave-node');

const decoder = new SstvDecoder(48_000, null, event => handleRasterEvent(event));
while (!decoder.pushF32(pcmChunk)) await decoder.drain();
await decoder.finish();
await decoder.dispose();
```

## TX-5DR 扩展生态

| 包 | 状态 | 作用 |
| --- | --- | --- |
| [`@tx5dr/plugin-api`](https://www.npmjs.com/package/@tx5dr/plugin-api) | npm 已发布，MIT | 插件定义、能力上下文、测试工具和 UI Bridge |
| [`create-tx5dr-plugin`](https://www.npmjs.com/package/create-tx5dr-plugin) | npm 已发布，MIT | 生成 Utility、Strategy、React/Vue UI 和竞赛插件工程 |
| `@tx5dr/rigctld-server` | 主仓库工作区包，MIT；尚未在 npm 公开 | 将自定义 `RadioController` 适配为 NET rigctl TCP 服务 |

```ts
import { definePlugin } from '@tx5dr/plugin-api';

export default definePlugin({
  apiVersion: 2,
  name: 'decode-observer',
  version: '1.0.0',
  type: 'utility',
  permissions: [],
  hooks: { onDecode(messages, ctx) { ctx.log.info('decode', { count: messages.length }); } },
});
```

`@tx5dr/contracts` 和 `@tx5dr/core` 也可在 npm 上取得，但它们首先是 TX-5DR 工作区和插件 API 的支撑包。除非某个导出被明确纳入公共兼容政策，第三方应优先从 `@tx5dr/plugin-api` 导入重导出类型，而不直接绑定内部契约。

## 原生包的接入约束

原生 `.node` 模块不只需要 TypeScript API 测试。发布前还需要验证目标 Node ABI、操作系统和 CPU 架构的预编译产物，检查 Electron 打包后的动态库搜索路径，并在 Linux 服务器、Docker 与 Android arm64 运行时中执行加载检查。
