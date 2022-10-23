import path from 'path';

import { buildSync } from 'esbuild';
import glob from 'glob';
import compact from 'lodash/compact';
import flatten from 'lodash/flatten';
import isArray from 'lodash/isArray';
import trim from 'lodash/trim';
import requires from 'require-from-string';

import { attempt } from '../utils';

export const PWD = process.cwd();
export const CWD = '__CWD';
export const TWD = path.resolve(__dirname);

export function resolve(src: string, internal = false): string | undefined {
  const cwd = internal ? TWD : PWD;

  return attempt([
    () => require.resolve(src),
    () => path.resolve(cwd, src)
  ]);
}

export function contents(src: string | string[], internal = false): string[] {
  const cwd = internal ? TWD : PWD;
  const srcs = (isArray(src) ? src : src.split(',').map(trim)).map(src => src.replace(/^\.\//, ''));

  return compact(flatten(srcs.map(src => glob.sync(src, { cwd }))).map(file => {
    return resolve(file, internal);
  }));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function imports(src: string | string[], internal = false): Record<string, any>[] {
  const files = contents(src, internal);

  return files.map(file => {
    const source = require(file);
    return source.default || source;
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function loads(src: string | string[], internal = false): Record<string, any>[] {
  const files = contents(src, internal);
  const outputs = buildSync({
    entryPoints: files,
    sourcemap: 'inline',
    write: false,
    outdir: 'tmp',
    platform: 'node',
    format: 'cjs',
    bundle: true,
    minify: process.env.NODE_ENV === 'production',
  }).outputFiles;

  return outputs.map(output => {
    const source = requires(output.text);
    return source.default || source;
  });
};