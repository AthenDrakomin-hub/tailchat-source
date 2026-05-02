const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/preset-classic').ThemeConfig} */
const themeConfig = {
  navbar: {
    title: '財訊',
    logo: {
      alt: '財訊 Logo',
      src: 'img/logo@192.png',
    },
    items: [
      {
        to: '/about',
        position: 'left',
        label: '關於我們',
      },
      { to: '/trust', label: '安全與合規', position: 'left' },
      { to: '/privacy', label: '隱私政策', position: 'left' },
      { to: '/terms', label: '用戶協議', position: 'left' },
      {
        type: 'localeDropdown',
        position: 'right',
      },
      {
        href: 'https://github.com/AthenDrakomin-hub/tailchat-source',
        label: 'GitHub',
        position: 'right',
      },
    ],
  },
  footer: {
    style: 'dark',
    // links: [
    //   {
    //     title: 'Docs',
    //     items: [
    //       {
    //         label: 'Tutorial',
    //         to: '/docs/intro',
    //       },
    //     ],
    //   },
    //   {
    //     title: 'Community',
    //     items: [
    //       {
    //         label: 'Stack Overflow',
    //         href: 'https://stackoverflow.com/questions/tagged/docusaurus',
    //       },
    //       {
    //         label: 'Discord',
    //         href: 'https://discordapp.com/invite/docusaurus',
    //       },
    //       {
    //         label: 'Twitter',
    //         href: 'https://twitter.com/docusaurus',
    //       },
    //     ],
    //   },
    //   {
    //     title: 'More',
    //     items: [
    //       {
    //         label: 'Blog',
    //         to: '/blog',
    //       },
    //       {
    //         label: 'GitHub',
    //         href: 'https://github.com/facebook/docusaurus',
    //       },
    //     ],
    //   },
    // ],
    copyright: `Copyright © ${new Date().getFullYear()} 日斗投資諮詢有限公司`,
  },
  prism: {
    theme: lightCodeTheme,
    darkTheme: darkCodeTheme,
  },
  zoom: {
    selector: '.markdown img',
    config: {
      // options you can specify via https://github.com/francoischalifour/medium-zoom#usage
      background: {
        light: 'rgb(255, 255, 255)',
        dark: 'rgb(50, 50, 50)',
      },
    },
  },
};

/** @type {import('@docusaurus/preset-classic').Options} */
const presetClassicOptions = {
  docs: {
    sidebarPath: require.resolve('./sidebars.js'),
    // Please change this to your repo.
    editUrl: 'https://github.com/msgbyte/tailchat/edit/master/website/',
  },
  blog: {
    postsPerPage: 5,
    blogSidebarCount: 'ALL',
  },
  // blog: false,
  theme: {
    customCss: require.resolve('./src/css/custom.css'),
  },
};

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: '財訊',
  tagline: '日斗投資財富論壇第十屆交流會官方內部平台',
  url: 'https://tailchat.msgbyte.com', // TODO: 待修改成文档主页
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/logo@192.png',
  organizationName: 'AthenDrakomin-hub',
  projectName: 'tailchat-source',
  themeConfig,
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-Hans'],
  },
  presets: [['@docusaurus/preset-classic', presetClassicOptions]],
  plugins: [
    require.resolve('docusaurus-plugin-image-zoom'),
    require.resolve('docusaurus-plugin-less'),
  ],
  scripts: [
    {
      src: 'https://tianji.moonrailgun.com/tracker.js',
      async: true,
      defer: true,
      'data-website-id': 'clo189w7r0003o65exm2pvdnp',
    },
  ],
};
