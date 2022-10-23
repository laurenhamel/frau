const glob = require('glob');
const { build } = require('esbuild');
const { replace } = require('esbuild-plugin-replace');

const PKG = require('./package.json');
const CWD = __dirname;

const commands = glob.sync('src/commands/**/*.ts');

(() => {
  build({
    entryPoints: [
      'src/index.ts',
      ...commands,
    ],
    outdir: 'lib/dist',
    platform: 'node',
    format: 'cjs',
    bundle: true,
    minify: process.env.NODE_ENV === 'production',
    external: ['esbuild'],
    plugins: [
      replace({
        '__CWD': CWD,
        '__PKG': JSON.stringify(PKG),
      }),
    ]
  });
})();