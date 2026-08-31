import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitepress';
import { REPO_URL } from '../../src/config/site';

const base = process.env.VITE_BASE_PATH || '/';

const guideSidebar = [
  {
    text: '开始使用',
    items: [
      { text: '指南首页', link: '/guide/' },
      { text: '选择运行方式', link: '/guide/installation' },
      { text: '第一次 FT8 通联', link: '/guide/quick-start' },
      { text: '搭好第一套站台', link: '/guide/first-steps' },
      { text: '界面与日常操作', link: '/guide/interface' },
    ],
  },
  {
    text: '运行形态',
    items: [
      { text: '桌面版', link: '/guide/desktop' },
      { text: 'Linux 服务器', link: '/guide/linux-server' },
      { text: 'Docker', link: '/guide/docker' },
      { text: 'Android', link: '/guide/android' },
    ],
  },
  {
    text: '电台与信号',
    items: [
      { text: '电台兼容性', link: '/guide/radio-compatibility' },
      { text: '电台 Profile 与音频', link: '/guide/radio-profile' },
      { text: '数值表与电台控制', link: '/guide/radio-controls' },
      { text: '远程监听与语音链路', link: '/guide/realtime-audio' },
    ],
  },
  {
    text: '通联模式',
    items: [
      { text: 'FT8 正式 / FT4 实验', link: '/guide/ft8' },
      { text: '语音（正式）', link: '/guide/voice' },
      { text: 'CW（实验）', link: '/guide/cw' },
      { text: 'SSTV（实验）', link: '/guide/sstv' },
      { text: 'FAX（实验）', link: '/guide/fax' },
    ],
  },
  {
    text: '共享、数据与扩展',
    items: [
      { text: '操作员、用户与远程访问', link: '/guide/operators-remote' },
      { text: '通联日志', link: '/guide/logbook' },
      { text: '外部集成', link: '/guide/integrations' },
      { text: '插件与自动化', link: '/guide/plugins-automation' },
    ],
  },
  {
    text: '维护与参考',
    items: [
      { text: '长期运行、升级与备份', link: '/guide/deployment' },
      { text: '日常维护', link: '/guide/maintenance' },
      { text: '按现象排障', link: '/guide/troubleshooting' },
      { text: '设置索引', link: '/guide/settings-reference' },
    ],
  },
];

const wikiSidebar = [
  {
    text: '项目地图',
    items: [
      { text: 'Wiki 入口', link: '/wiki/' },
      { text: '关于', link: '/wiki/about' },
      { text: '为什么是 TX-5DR', link: '/wiki/why-tx5dr' },
      { text: '架构概览', link: '/wiki/architecture' },
      { text: '插件系统概览', link: '/wiki/plugin-system' },
    ],
  },
  {
    text: '稳定参考',
    items: [
      { text: '下载与分发策略', link: '/wiki/distribution' },
      { text: '命令参考', link: '/wiki/commands' },
      { text: '安装包说明', link: '/wiki/packages' },
    ],
  },
];

const pluginApiReferencePages = [
  { text: 'PluginDefinition', page: 'definition' },
  { text: 'Capabilities', page: 'capabilities' },
  { text: 'PluginContext', page: 'context' },
  { text: 'PluginHooks', page: 'hooks' },
  { text: 'StrategyRuntime', page: 'runtime' },
  { text: 'Helper Interfaces', page: 'helpers' },
  { text: 'Host Settings', page: 'settings' },
  { text: 'Logbook Sync', page: 'sync' },
  { text: 'Host Dependencies', page: 'host-dependencies' },
  { text: 'Contracts Re-exports', page: 'contracts' },
  { text: 'Re-exports', page: 're-exports' },
];

function pluginApiReferenceItems(prefix: string, overview: string) {
  return [
    { text: overview, link: `${prefix}/` },
    ...pluginApiReferencePages.map(({ text, page }) => ({
      text,
      link: `${prefix}/${page}`,
    })),
  ];
}

const pluginApiSidebar = [
  {
    text: '开始使用',
    items: [
      { text: '插件 API 入口', link: '/plugin-api/' },
      { text: '快速开始', link: '/plugin-api/getting-started' },
      { text: '插件如何运行', link: '/plugin-api/concepts' },
      { text: 'API v2 与兼容性', link: '/plugin-api/api-v2' },
    ],
  },
  {
    text: '基础',
    items: [
      { text: '编写 Utility 插件', link: '/plugin-api/tutorial-hello-utility' },
      { text: '权限与能力', link: '/plugin-api/permissions' },
      { text: '按钮、定时器与面板', link: '/plugin-api/tutorial-ui-actions-and-panels' },
    ],
  },
  {
    text: '开发指南',
    items: [
      { text: '过滤与评分', link: '/plugin-api/tutorial-filter-and-score' },
      { text: '自动起呼提议', link: '/plugin-api/tutorial-watcher-autocall' },
      { text: 'StrategyRuntime', link: '/plugin-api/tutorial-strategy-runtime' },
      { text: '自定义 UI', link: '/plugin-api/tutorial-custom-ui' },
      { text: 'UI 开发实战', link: '/plugin-api/tutorial-ui-dev-workflow' },
      { text: '日志同步 Provider', link: '/plugin-api/tutorial-logbook-sync' },
      { text: '电台控制', link: '/plugin-api/radio-capabilities-power' },
      { text: '宿主设置', link: '/plugin-api/host-settings' },
      { text: '测试插件', link: '/plugin-api/testing' },
    ],
  },
  {
    text: 'API Reference',
    items: pluginApiReferenceItems('/plugin-api/reference', '总览'),
  },
  {
    text: '更多',
    items: [
      { text: '按需求选择指南', link: '/plugin-api/learning-path' },
      { text: '示例与约定', link: '/plugin-api/examples' },
    ],
  },
];

const enPluginApiReferenceSidebar = [{
  text: 'API Reference',
  items: pluginApiReferenceItems('/en/plugin-api/reference', 'Overview'),
}];

const jaPluginApiReferenceSidebar = [{
  text: 'API リファレンス',
  items: pluginApiReferenceItems('/ja/plugin-api/reference', '概要'),
}];

const enThemeConfig = {
  nav: [
    { text: 'Home', link: '/en/' },
    { text: 'Guide', link: '/guide/' },
    { text: 'Wiki', link: '/wiki/' },
    { text: 'Plugin API Reference', link: '/en/plugin-api/reference/' },
    { text: 'GitHub', link: REPO_URL },
  ],
  sidebar: {
    '/en/plugin-api/reference/': enPluginApiReferenceSidebar,
  },
  outlineTitle: 'On this page',
  lastUpdatedText: 'Last updated',
  docFooter: {
    prev: 'Previous page',
    next: 'Next page',
  },
  sidebarMenuLabel: 'Menu',
  returnToTopLabel: 'Back to top',
  darkModeSwitchTitle: 'Switch to dark mode',
  lightModeSwitchTitle: 'Switch to light mode',
  langMenuLabel: 'Change language',
  footer: {
    message: 'English Plugin API Reference. Development guides are currently Chinese-first.',
    copyright: 'TX-5DR © 2026',
  },
};

const jaThemeConfig = {
  nav: [
    { text: 'ホーム', link: '/ja/' },
    { text: 'ガイド', link: '/guide/' },
    { text: 'Wiki', link: '/wiki/' },
    { text: 'プラグイン API リファレンス', link: '/ja/plugin-api/reference/' },
    { text: 'GitHub', link: REPO_URL },
  ],
  sidebar: {
    '/ja/plugin-api/reference/': jaPluginApiReferenceSidebar,
  },
  outlineTitle: 'このページ',
  lastUpdatedText: '最終更新',
  docFooter: {
    prev: '前のページ',
    next: '次のページ',
  },
  sidebarMenuLabel: 'メニュー',
  returnToTopLabel: 'トップへ戻る',
  darkModeSwitchTitle: 'ダークモードに切り替え',
  lightModeSwitchTitle: 'ライトモードに切り替え',
  langMenuLabel: '言語を切り替え',
  footer: {
    message: '日本語版プラグイン API リファレンスです。開発ガイド本文は現在中国語中心です。',
    copyright: 'TX-5DR © 2026',
  },
};

export default defineConfig({
  title: 'TX-5DR',
  description: 'TX-5DR 官网与文档中心',
  lang: 'zh-CN',
  base,
  outDir: '../dist',
  srcDir: '.',
  cacheDir: './.vitepress/cache',
  appearance: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }],
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  locales: {
    root: {
      lang: 'zh-CN',
      label: '简体中文',
      title: 'TX-5DR',
      description: 'TX-5DR 官网与文档中心',
    },
    en: {
      lang: 'en-US',
      label: 'English',
      title: 'TX-5DR',
      description: 'TX-5DR website and docs hub',
      themeConfig: enThemeConfig,
    },
    ja: {
      lang: 'ja-JP',
      label: '日本語',
      title: 'TX-5DR',
      description: 'TX-5DR 公式サイトとドキュメントハブ',
      themeConfig: jaThemeConfig,
    },
  },
  themeConfig: {
    logo: '/favicon.svg',
    nav: [
      { text: '首页', link: '/' },
      { text: '指南', link: '/guide/' },
      { text: 'Wiki', link: '/wiki/' },
      { text: '插件 API', link: '/plugin-api/' },
      { text: 'GitHub', link: REPO_URL },
    ],
    sidebar: {
      '/guide/': guideSidebar,
      '/wiki/': wikiSidebar,
      '/plugin-api/': pluginApiSidebar,
    },
    outlineTitle: '本页导航',
    lastUpdatedText: '最后更新',
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',
    darkModeSwitchTitle: '切换到深色模式',
    lightModeSwitchTitle: '切换到浅色模式',
    langMenuLabel: '切换语言',
    footer: {
      message: 'TX-5DR 官网、文档与下载入口',
      copyright: 'TX-5DR © 2026',
    },
    search: {
      provider: 'local',
    },
    socialLinks: [{ icon: 'github', link: REPO_URL }],
  },
});
