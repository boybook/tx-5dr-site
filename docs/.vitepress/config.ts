import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitepress';
import { REPO_URL } from '../../src/config/site';

const base = process.env.VITE_BASE_PATH || '/';

const guideSidebar = [
  {
    text: '开始使用',
    items: [
      { text: '文档入口', link: '/guide/' },
      { text: '选型与安装', link: '/guide/installation' },
      { text: '首次进入与基本使用', link: '/guide/first-steps' },
    ],
  },
  {
    text: '实时语音',
    items: [
      { text: '实时语音与 WebRTC UDP', link: '/guide/realtime-audio' },
    ],
  },
  {
    text: '部署方式',
    items: [
      { text: '桌面版安装', link: '/guide/desktop' },
      { text: 'Linux 服务器安装', link: '/guide/linux-server' },
      { text: 'Docker 部署', link: '/guide/docker' },
      { text: '部署建议与升级', link: '/guide/deployment' },
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

const pluginApiSidebar = [
  {
    text: '总览',
    items: [
      { text: '插件 API 入口', link: '/plugin-api/' },
      { text: '学习路径', link: '/plugin-api/learning-path' },
      { text: '快速开始', link: '/plugin-api/getting-started' },
    ],
  },
  {
    text: '教程',
    items: [
      { text: '第 1 章：Hello Utility', link: '/plugin-api/tutorial-hello-utility' },
      { text: '第 2 章：过滤与评分', link: '/plugin-api/tutorial-filter-and-score' },
      { text: '第 3 章：守候与自动起呼', link: '/plugin-api/tutorial-watcher-autocall' },
      { text: '第 4 章：面板、按钮与定时器', link: '/plugin-api/tutorial-ui-actions-and-panels' },
      { text: '第 5 章：StrategyRuntime', link: '/plugin-api/tutorial-strategy-runtime' },
      { text: '第 6 章：自定义 UI 与 iframe', link: '/plugin-api/tutorial-custom-ui' },
      { text: '第 7 章：日志同步 Provider', link: '/plugin-api/tutorial-logbook-sync' },
    ],
  },
  {
    text: '补充资料',
    items: [
      { text: 'UI 开发实战', link: '/plugin-api/tutorial-ui-dev-workflow' },
      { text: '心智模型', link: '/plugin-api/concepts' },
      { text: '插件权限模型', link: '/plugin-api/permissions' },
      { text: '示例与约定', link: '/plugin-api/examples' },
      { text: '电台能力与电源', link: '/plugin-api/radio-capabilities-power' },
      { text: '宿主设置能力', link: '/plugin-api/host-settings' },
    ],
  },
  {
    text: 'Reference',
    items: [
      { text: '总览', link: '/plugin-api/reference/' },
      { text: 'PluginDefinition', link: '/plugin-api/reference/definition' },
      { text: 'PluginContext', link: '/plugin-api/reference/context' },
      { text: 'PluginHooks', link: '/plugin-api/reference/hooks' },
      { text: 'StrategyRuntime', link: '/plugin-api/reference/runtime' },
      { text: 'Helper Interfaces', link: '/plugin-api/reference/helpers' },
      { text: 'Host Settings', link: '/plugin-api/reference/settings' },
      { text: 'Contracts Re-exports', link: '/plugin-api/reference/contracts' },
      { text: 'Re-exports', link: '/plugin-api/reference/re-exports' },
    ],
  },
];

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
    locales: {
      en: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'Guide', link: '/guide/' },
          { text: 'Wiki', link: '/wiki/' },
          { text: 'Plugin API', link: '/plugin-api/' },
          { text: 'GitHub', link: REPO_URL },
        ],
        sidebar: {},
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
          message: 'The homepage is available in English. Full docs are currently Chinese-first.',
          copyright: 'TX-5DR © 2026',
        },
      },
    },
  },
});
