# TX-5DR 使用指南

TX-5DR 可以在电台旁的电脑、Linux 主机、Docker 主机或 Android 设备上运行。操作员只需要打开浏览器，就能查看瀑布图、完成 FT8 或语音通联、控制电台并管理日志。

这意味着远程电台不必再依赖远程桌面：电台旁保留 TX-5DR 和硬件连接，操作界面则可以从笔记本、平板或手机直接访问。

## 第一次使用

::: tip 第一次使用
使用[桌面版 + 单操作员 + FT8](./quick-start)，完成安装、接收解码和第一次安全发射。
:::

## 选择运行方式

| 使用场景 | 安装说明 |
| --- | --- |
| 在当前 Windows、macOS 或 Linux 电脑使用 | [桌面版安装](./desktop) |
| 把主机长期放在电台旁，从其他设备用浏览器操作 | [Linux 服务器安装](./linux-server) |
| 使用现有容器环境管理 TX-5DR | [Docker 部署](./docker) |
| 用 Android 手机、平板或 Android TV 连接 USB 电台设备 | [Android 版](./android) |
| 比较四种运行形态 | [选型与安装](./installation) |

## 功能状态

| 功能 | 状态 | 说明 |
| --- | --- | --- |
| FT8 | 正式功能 | 包含解码、标准通联、队列、自动化和日志 |
| 语音 | 正式功能 | 支持浏览器监听、麦克风 PTT、语音键控和日志 |
| FT4 | 实验功能 | 与 FT8 共用主要工作区，时序和部分行为仍可能调整 |
| CW | 实验功能 | 可使用 CAT 或串口键控，并提供实验性解码器 |
| SSTV | 实验功能 | 支持收图、图片编辑和发图 |
| FAX | 实验功能 | 当前只支持接收和连续纸带 |

实验功能可能调整界面、数据格式或运行要求。重要操作前请先确认当前版本，并保留必要的数据备份。

## 功能说明

### 配好电台

- [首次站台配置](./first-steps)：完成连接、PTT、音频、校时和低功率发射检查
- [电台兼容性](./radio-compatibility)：选择 Hamlib、Rigctld、ICOM WLAN 或 TCI
- [电台 Profile](./radio-profile)：理解并管理电台与音频配置组合
- [电台控制与数值表](./radio-controls)：使用天调、增益、滤波、SWR、ALC 等能力

### 开始通联

- [界面与日常操作](./interface)
- [FT8（正式）与 FT4（实验）](./ft8)
- [语音](./voice)
- [CW（实验）](./cw)
- [SSTV（实验）](./sstv)
- [FAX（实验）](./fax)

### 管理远程电台

- [操作员、用户与远程访问](./operators-remote)
- [远程监听与语音链路](./realtime-audio)
- [日志本](./logbook)
- [外部集成](./integrations)
- [插件与自动化](./plugins-automation)

### 维护和排障

- [部署、升级与备份](./deployment)
- [日常维护](./maintenance)
- [按现象排障](./troubleshooting)

## 术语

CAT、PTT、Grid、SWR、ALC、ADIF 等沿用 HAM 通行叫法。TX-5DR 另外使用 `Profile`、操作员、登录用户和通联机制等概念。

自定义插件开发见[插件 API 文档](../plugin-api/)。
