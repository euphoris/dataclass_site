import {themes as prismThemes} from 'prism-react-renderer';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
const path = require('path');

const config = {
  title: '데이터 과학 강의',
  tagline: '',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://dataclass.pages.dev/',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  // organizationName: 'facebook', // Usually your GitHub org/user name.
  // projectName: 'docusaurus', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }
    ],
  ],
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.13.24/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-odtC+0UGzzFL/6PNoE8rX/SPcQDXBJ+uRepguP4QkPCm2LBxH3FA3y+fKSiJ+AmM',
      crossorigin: 'anonymous',
    },
  ],
  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: '데이터 분석 강의',
      logo: {
        alt: 'My Site Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'sqlSidebar', // 사이드바 ID
          position: 'left',
          label: 'SQL', // 상단 메뉴
        },
        {
          type: 'docSidebar',
          sidebarId: 'pythonSidebar', // 사이드바 ID
          position: 'left',
          label: 'Python', // 상단 메뉴
        },
        // {to: '/blog', label: 'Blog', position: 'left'},
        // {
        //   href: 'https://github.com/facebook/docusaurus',
        //   label: 'GitHub',
        //   position: 'right',
        // },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [ // 하단 메뉴
            {
              label: 'Python 활용 데이터 시각화',
              to: '/docs/data-analysis',
            },
            {
              label: 'Python',
              to: '/docs/python',
            },
            {
              label: 'SQL',
              to: '/docs/sql',
            },
            {
              label: '통계',
              to: '/docs/stat/lab',
            },
            {
              label: '실험계획법',
              to: '/docs/doe/lab',
            },
            // {
            //   label: '강화 학습',
            //   to: '/docs/reinforcement-learning/lab',
            // },
            {
              label: '머신 러닝',
              to: '/docs/machine-learning',
            },
            {
              label: '컴퓨터 비전',
              to: '/docs/computer-vision',
            },
            // {
            //   label: '시계열 데이터 분석',
            //   to: '/docs/time-series/intro',
            // }
          ],
        }
      ],
      copyright: `Copyright © ${new Date().getFullYear()} QuantLab, Inc. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
  plugins: [
    function (context, options) {
      return {
        name: 'docusaurus-tailwindcss',
        configureWebpack(config, isServer, utils) {
          return {
            mergeStrategy: {
              'resolve.alias': 'PREPEND', // 별칭 설정을 병합하도록 전략 설정
            },
            resolve: {
              alias: {
                '@': path.resolve(__dirname, 'src/'),
              },
            },
          };
        },
        // 2. TailwindCSS를 위한 PostCSS 설정 (스타일 적용을 위해 필요)
        configurePostCss(postcssOptions) {
          postcssOptions.plugins.push(require('@tailwindcss/postcss'));
          postcssOptions.plugins.push(require('autoprefixer'));
          return postcssOptions;
        },
      };
    },

  ],
};

export default config;
