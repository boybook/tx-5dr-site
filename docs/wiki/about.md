# 开源与许可证

TX-5DR 由业余无线电台操作员 `BG5DRB` 发起，主项目以 GNU General Public License v3.0 发布。源代码、问题跟踪和变更记录位于 [boybook/tx-5dr](https://github.com/boybook/tx-5dr)。

## 仓库与边界

| 项目 | 内容 | 许可证 |
| --- | --- | --- |
| [`boybook/tx-5dr`](https://github.com/boybook/tx-5dr) | Server、Web、Electron、内置插件与发布脚本 | GPL-3.0 |
| [`boybook/tx5dr-android-bridge`](https://github.com/boybook/tx5dr-android-bridge) | Android 宿主、PRoot 管理、音频与 USB 串口桥 | GPL-3.0-or-later |

`@tx5dr/plugin-api`、`create-tx5dr-plugin` 和 `@tx5dr/rigctld-server` 位于主仓库工作区中，但各自的包元数据以 MIT 许可证发布，便于第三方插件和集成项目使用。重新分发时应同时检查主仓库 LICENSE、子包 `package.json` 和实际 npm tarball，不以单一顶层声明替代子包许可边界。

## 配套开源库

| 库 | 主要技术 | 许可证 |
| --- | --- | --- |
| [`node-hamlib`](https://github.com/boybook/node-hamlib) | Hamlib Node.js 原生绑定 | LGPL |
| [`icom-wlan-node`](https://github.com/boybook/icom-wlan-node) | TypeScript、UDP、CI-V、音频与频谱 | MIT |
| [`tci-client-node`](https://github.com/boybook/tci-client-node) | TypeScript TCI 控制、音频和 IQ | MIT |
| [`openwebrx-js`](https://github.com/boybook/openwebrx-js) | OpenWebRX+ WebSocket API | MIT |
| [`wsjtx-lib-nodejs`](https://github.com/boybook/wsjtx-lib-nodejs) | C++/Fortran WSJT-X 编解码绑定 | GPL-3.0 |
| [`rubato-fft-node`](https://github.com/boybook/rubato-fft-node) | Rust 重采样、FFT、IQ 与滤波 | MIT |
| [`rasterwave-node`](https://github.com/boybook/rasterwave-node) | Rust SSTV / Radiofax 流式处理 | MIT |

每个库的依赖、预编译二进制和上游代码仍保留各自的许可证与归属要求。例如 `wsjtx-lib` 的授权不会因为被 TX-5DR 调用而转换为 MIT。

## 第三方软件

TX-5DR 还使用 Fastify、React、Electron、XState、Hamlib、RtAudio/Audify、node-datachannel、SerialPort 和其他开源组件。完整列表应从当前 lockfile、发布物与自动化许可证数据生成，不使用手工复制的长期静态表作为法律依据。

Android APK 还包含 AndroidX、Jetpack Compose、Material 3、PRoot、zstd 和 Debian rootfs 等单独组件。APK 中的 `THIRD_PARTY_NOTICES` 与仓库中保留的原始 copyright header 是该发布物的归属来源。

## 贡献与归属

向主项目或配套库提交修改时，贡献会进入目标仓库已有的许可证边界。引入新协议实现、原生库或算法代码时，需要保留上游声明、确认重新分发条件，并确保打包和容器产物中也包含要求的 notice。
