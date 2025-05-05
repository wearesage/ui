import Vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { fileURLToPath, URL } from 'url';
import SVG from 'vite-svg-loader';
import VueRouter from 'unplugin-vue-router/vite';
import { VueRouterAutoImports } from 'unplugin-vue-router';

const plugins = [
  VueRouter({
    routeBlockLang: 'json',
  }),
  Vue(),
  SVG(),
  AutoImport({
    imports: [`vue`, `vue/macros`, 'pinia', '@vueuse/core', '@vueuse/head', VueRouterAutoImports],
    dirs: [`./src/util`, './src/stores', './src/constants', './src/classes', './src/composables', './src/composables', './src/api'],
    dts: `auto-imports.d.ts`,
  }),
  Components({
    dts: true,
    dirs: [`./src/components`, fileURLToPath(new URL(`./src/components`, import.meta.url))],
  }),
];

const resolve = {
  alias: {
    '@assets/*': fileURLToPath(new URL(`./src/assets/*`, import.meta.url)),
    '@icons/*': fileURLToPath(new URL(`./src/assets/icons/*`, import.meta.url)),
    '@classes/*': fileURLToPath(new URL(`./src/classes/*`, import.meta.url)),
    '@components/*': fileURLToPath(new URL(`./src/components/*`, import.meta.url)),
    '@composables/*': fileURLToPath(new URL(`./src/composables/*`, import.meta.url)),
    '@constants/*': fileURLToPath(new URL(`./src/constants/*`, import.meta.url)),
    '@styles/*': fileURLToPath(new URL(`./src/styles/*`, import.meta.url)),
    '@util': fileURLToPath(new URL(`./src/util/index.ts`, import.meta.url)),
  },
};

const css = {
  preprocessorOptions: {
    scss: {
      silenceDeprecations: [`mixed-decls`, `legacy-js-api`, `color-functions`, `global-builtin`, `import`],
      quietDeps: true,
      additionalData: `
        @use "sass:math";
        @use "${fileURLToPath(new URL(`./src/styles/mixins/_index.scss`, import.meta.url))}" as *;
        @import "${fileURLToPath(new URL(`./src/styles/_colors.scss`, import.meta.url))}";
      `,
    },
  },
};

export default {
  plugins: plugins,
  resolve,
  css,
};
