export type SupportedLocale = 'zh-CN' | 'en';

interface TranslationNode {
  [key: string]: string | TranslationNode;
}

type Translations = Record<SupportedLocale, TranslationNode>;

const translations: Translations = {
  en: {
    nav: {
      channelNightly: 'Nightly',
      themeLight: 'Light',
      themeDark: 'Dark',
    },
    hero: {
      title: 'TX-5DR',
      subtitle: 'A browser-first digital radio station for FT8, FT4, and remote voice — polished for desktop, flexible enough for the field.',
      primaryCta: 'Download {{platform}}',
      previewAlt: 'TX-5DR interface preview',
      otherArchitectures: 'Other architectures',
      allPlatforms: 'All platform downloads',
      unavailable: 'No matching desktop package available yet',
      version: 'Version',
      commit: 'Commit',
      builtAt: 'Built at',
      loading: 'Loading latest metadata…',
      error: 'Unable to load release metadata right now. You can still open GitHub Releases directly.',
      fallback: 'Open source project',
    },
    source: {
      auto: 'Auto',
      oss: 'OSS mirror',
      github: 'GitHub',
    },
    system: {
      windows: 'Windows',
      macos: 'macOS',
      linux: 'Linux',
      unknown: 'Unknown system',
      x64: 'x64',
      arm64: 'ARM64',
      unknownArch: 'Unknown arch',
    },
    packageType: {
      msi: 'Installer (MSI)',
      dmg: 'Installer (DMG)',
      zip: 'Archive (ZIP)',
      '7z': 'Archive (7z)',
      deb: 'Package (DEB)',
      rpm: 'Package (RPM)',
      appimage: 'AppImage',
      sh: 'Install Script',
      unknown: 'Download',
    },
    labels: {
      recommended: 'Recommended',
      desktop: 'Desktop App',
      server: 'Linux Server',
      allDownloads: 'All downloads',
      command: 'Command',
      highlights: 'Why operators pick TX-5DR',
      deployments: 'Choose your deployment style',
      releaseNotes: 'Release notes',
      noNotes: 'No release notes available.',
      sha256: 'SHA256',
      size: 'Size',
      architecture: 'Architecture',
    },
    highlights: {
      item1Title: 'Operate anywhere in a browser',
      item1Body: 'The same station works on laptop, tablet, phone, LAN, or the public internet. No client install required for operators.',
      item2Title: 'Remote voice and digital modes together',
      item2Body: 'FT8, FT4, and remote voice live in one product, with modern realtime audio paths and a clean operating surface.',
      item3Title: 'Multiple operators, one radio',
      item3Body: 'Share one station with role-based access, independent operator settings, and parallel digital-mode workflows.',
      item4Title: 'OpenWebRX full-duplex workflows',
      item4Body: 'Use a remote SDR as an auxiliary receive chain for dual-cycle decode and better RX performance.',
      item5Title: 'Modern station tooling',
      item5Body: 'Built-in logbook sync, PSKReporter reporting, realtime spectrum waterfall, and Linux service tooling round out daily operation.',
      item6Title: 'Desktop and server, same ecosystem',
      item6Body: 'Electron desktop builds, Linux packages, and the one-click server installer all follow the same release metadata logic.',
    },
    deployments: {
      desktopTitle: 'Desktop App',
      desktopBody: 'Windows, macOS, and Linux desktop packages with a local embedded server and the same web UI experience.',
      desktopMeta: 'Best for local stations with a GUI.',
      serverTitle: 'Linux Server',
      serverBody: 'Install the headless server on a low-cost box or remote host, then operate everything from a browser.',
      serverMeta: 'Best for always-on remote stations.',
      dockerTitle: 'Docker',
      dockerBody: 'Compose-based deployment when you want container workflows, repeatable environments, or lab-style testing.',
      dockerMeta: 'Best for infra-heavy users and experiments.',
    },
    server: {
      title: 'Linux server one-line install',
      description: 'This mode runs as a pure frontend-backend Linux service without Electron, making it a better fit for low-power embedded hosts, small remote boxes, and always-on station servers. After installation, you can use the tx5dr command set for daily management, service control, and one-command upgrades.',
      copy: 'Copy command',
      copied: 'Copied',
    },
    footer: {
      github: 'GitHub repository',
      releases: 'Releases',
      readme: 'README',
      issues: 'Issues',
      icp: 'Zhe ICP Bei 2022033471 Hao-2',
    },
  },
  'zh-CN': {
    nav: {
      channelNightly: 'Nightly',
      themeLight: '亮色',
      themeDark: '暗色',
    },
    hero: {
      title: 'TX-5DR',
      subtitle: '现代化的浏览器优先数字电台，支持 FT8、FT4 与远程语音，既适合桌面操作，也适合远程值守。',
      primaryCta: '下载 {{platform}}',
      previewAlt: 'TX-5DR 界面预览',
      otherArchitectures: '其他架构',
      allPlatforms: '所有平台下载方式',
      unavailable: '当前还没有匹配你系统的桌面安装包',
      version: '版本号',
      commit: 'Commit',
      builtAt: '构建时间',
      loading: '正在加载最新版本元数据…',
      error: '暂时无法加载版本元数据。你仍然可以直接打开 GitHub Releases。',
      fallback: '开源项目',
    },
    source: {
      auto: '自动',
      oss: 'OSS 镜像',
      github: 'GitHub',
    },
    system: {
      windows: 'Windows',
      macos: 'macOS',
      linux: 'Linux',
      unknown: '未知系统',
      x64: 'x64',
      arm64: 'ARM64',
      unknownArch: '未知架构',
    },
    packageType: {
      msi: '安装包（MSI）',
      dmg: '安装包（DMG）',
      zip: '压缩包（ZIP）',
      '7z': '压缩包（7z）',
      deb: '安装包（DEB）',
      rpm: '安装包（RPM）',
      appimage: 'AppImage',
      sh: '安装脚本',
      unknown: '下载文件',
    },
    labels: {
      recommended: '推荐',
      desktop: '桌面版',
      server: 'Linux 服务器',
      allDownloads: '全部下载方式',
      command: '命令',
      highlights: '为什么会选择 TX-5DR',
      deployments: '部署方式',
      releaseNotes: '更新说明',
      noNotes: '暂无更新说明。',
      sha256: 'SHA256',
      size: '大小',
      architecture: '架构',
    },
    highlights: {
      item1Title: '任何浏览器都能操作',
      item1Body: '同一套电台可以在笔记本、平板、手机、局域网和公网环境下使用，操作员侧无需安装客户端。',
      item2Title: '数字模式与语音一体化',
      item2Body: 'FT8、FT4 和远程语音整合在一个产品中，实时音频链路和操作体验都围绕电台场景设计。',
      item3Title: '一部电台，多人协作',
      item3Body: '支持细粒度权限、独立操作员配置以及多操作员并行数字模式工作流。',
      item4Title: 'OpenWebRX 双全工能力',
      item4Body: '把远端 SDR 作为辅助接收链路，提升接收能力并支持双周期解码发射。',
      item5Title: '现代化电台工具链',
      item5Body: '内置日志同步、PSKReporter、实时频谱瀑布以及 Linux 服务端工具，覆盖日常使用。',
      item6Title: '桌面版与服务器版同一生态',
      item6Body: 'Electron 桌面版、Linux 安装包与一键安装脚本都围绕同一套版本元数据与分发逻辑工作。',
    },
    deployments: {
      desktopTitle: '桌面版',
      desktopBody: '覆盖 Windows、macOS、Linux 的桌面安装包，内置本地服务端，并保留完整 Web UI 体验。',
      desktopMeta: '适合本地桌面操作与图形界面。',
      serverTitle: 'Linux 服务器',
      serverBody: '把无头服务器部署在低成本设备或远端主机上，再通过浏览器随时操作整套电台。',
      serverMeta: '适合长期在线的远程电台。',
      dockerTitle: 'Docker',
      dockerBody: '适合已有容器化工作流、需要可重复环境，或者只是想快速搭个实验环境。',
      dockerMeta: '适合偏基础设施和实验用途。',
    },
    server: {
      title: 'Linux 服务器一行安装',
      description: '这种模式以纯前后端 Linux 服务的形式运行，不依赖 Electron，更适合低功耗嵌入式设备、小型远程主机和长期值守场景。安装完成后，可以通过 tx5dr 命令完成日常管理、服务控制和一键升级。',
      copy: '复制命令',
      copied: '已复制',
    },
    footer: {
      github: 'GitHub 仓库',
      releases: '发布页',
      readme: 'README',
      issues: '问题反馈',
      icp: '浙ICP备2022033471号-2',
    },
  },
};

function getTranslation(locale: SupportedLocale, key: string): string | null {
  const keys = key.split('.');
  let value: string | TranslationNode | undefined = translations[locale];

  for (const nextKey of keys) {
    if (typeof value !== 'object' || value === null || !(nextKey in value)) {
      return null;
    }
    value = value[nextKey];
  }

  return typeof value === 'string' ? value : null;
}

export function translateMessage(locale: SupportedLocale, key: string, vars?: Record<string, string>): string {
  const template = getTranslation(locale, key) ?? getTranslation('en', key) ?? key;
  if (!vars) {
    return template;
  }

  return Object.entries(vars).reduce(
    (result, [name, value]) => result.replaceAll(`{{${name}}}`, value),
    template,
  );
}
