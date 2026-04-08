import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitepress';
import { REPO_URL } from '../../src/config/site';

const base = process.env.VITE_BASE_PATH || '/';

const guideSidebar = [
  { text: '概览', items: [{ text: '文档入口', link: '/guide/' }] },
  {
    text: '快速开始',
    items: [
      { text: '安装与下载', link: '/guide/installation' },
      { text: '部署建议', link: '/guide/deployment' },
    ],
  },
];

const wikiSidebar = [
  { text: '概览', items: [{ text: 'Wiki 入口', link: '/wiki/' }] },
  {
    text: '项目背景',
    items: [
      { text: '架构概览', link: '/wiki/architecture' },
      { text: '下载分发策略', link: '/wiki/distribution' },
    ],
  },
];

const referenceSidebar = [
  { text: '概览', items: [{ text: 'Reference 入口', link: '/reference/' }] },
  {
    text: '参考信息',
    items: [
      { text: '命令参考', link: '/reference/commands' },
      { text: '安装包说明', link: '/reference/packages' },
    ],
  },
];

const apiSidebar = [
  { text: 'API', items: [{ text: 'API 入口', link: '/api/' }] },
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
    search: {
      provider: 'local',
    },
    socialLinks: [{ icon: 'github', link: REPO_URL }],
    locales: {
      root: {
        nav: [
          { text: '首页', link: '/' },
          { text: '指南', link: '/guide/' },
          { text: 'Wiki', link: '/wiki/' },
          { text: 'Reference', link: '/reference/' },
          { text: 'API', link: '/api/' },
          { text: 'GitHub', link: REPO_URL },
        ],
        sidebar: {
          '/guide/': guideSidebar,
          '/wiki/': wikiSidebar,
          '/reference/': referenceSidebar,
          '/api/': apiSidebar,
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
      },
      en: {
        nav: [
          { text: 'Home', link: '/en/' },
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
          message: 'Homepage is available in English, docs will follow later.',
          copyright: 'TX-5DR © 2026',
        },
      },
    },
  },
});
