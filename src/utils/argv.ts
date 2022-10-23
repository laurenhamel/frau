import minimist from 'minimist';

export function argv(): Record<string, string | number | boolean | string[]> {
  return minimist(process.argv.slice(2));
}