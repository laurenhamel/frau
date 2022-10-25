import { castArray, isBoolean, reduce } from 'lodash';

import { resolve } from './path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PKG: Record<string, any> = JSON.parse('__PKG');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function attempt<T extends any>(callback: (() => T) | (() => T)[], fallback?: T): T | undefined {
  const callbacks = castArray(callback);
  
  let result: T;
  
  for (const callback of callbacks) {
    try {
      result = callback();

      if (result) break;
    } catch (_) {
      // noop
    }
  }
  
  if (!result) result = fallback;

  return result;
}

export function flags(args: Record<string, boolean | number | string>): string {
  return reduce(args, (result, value, key) => {
    const prefix = key.length === 1 ? '-' : '--';

    key = isBoolean(value) ? value === false ? '' : `${prefix}${key}` : `${prefix}${key}=`;
    value = isBoolean(value) ? '' : `${value}`;

    return `${result} ${key}${value}`;
  }, '').trim();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function pkg(internal = false): Record<string, any> {
  return internal ? PKG : require(resolve('package.json'));
}