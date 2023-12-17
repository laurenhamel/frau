import toColor from "string-to-color";
import color from "color";
import chalk, { type Chalk } from "chalk";
import fixed from "fixed-width-string";
import { castArray, map, pad } from "lodash";

const LUMINOSITY = 0.075;
const PADDING = 0.005;
const ADJUST = 0.001;

export function getLabelName(label: string): string {
  return label.trim();
}

export function getLabelColor(label: string): string {
  const initial = toColor(getLabelName(label).split("/").slice(-1)[0]);
  const limit = [LUMINOSITY - PADDING, LUMINOSITY + PADDING];

  let current = color(initial);
  let lumens = current.luminosity();

  while (lumens < limit[0] || lumens > limit[1]) {
    const light = current.lightness();
    current = current.lightness(lumens < limit[0] ? light + ADJUST : light - ADJUST);
    lumens = current.luminosity();
  }

  return current.hex();
}

export function getLabelWidth(...labels: string[]): number {
  return Math.max(...map(labels, (label) => getLabelName(label).length));
}

export function getLabelPadded(label: string, width?: number): string {
  return width ? fixed(pad(getLabelName(label), width, " "), width) : getLabelName(label);
}

export function getLabel(label: string, width?: number): string {
  return chalk.bgHex(getLabelColor(label))(` ${getLabelPadded(label, width)} `);
}

export function withPrefix(message: string, prefixes: string | string[], style: Chalk): string {
  let result = message;

  castArray(prefixes).forEach((prefix) => {
    result = result.startsWith(prefix) ? style(prefix) + result.replace(new RegExp("^" + prefix), "") : result;
  });

  return result;
}
