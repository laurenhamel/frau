import path from 'path';

import fs from 'fs-extra';
import { isArray, isBoolean, map, reduce, some, startsWith } from 'lodash';
import YAML from 'yaml';

import { GlobalOptions } from '../globals';
import { Command } from '../types';

export type ConfigureParameters = [string];

export interface ConfigureOptions extends GlobalOptions {}

const command: Command<ConfigureParameters, ConfigureOptions> = {
  name: 'configure',
  alias: 'c',
  description: 'Convert an arbitrary configuration file to command-line arguments',
  parameters: [
    {
      name: 'config',
      description: 'A configuration file',
      required: true
    }
  ],
  options: [],
  action(file, options) {
    const ext = path.extname(file);

    const configure = {
      '.js': useJs,
      '.json': useJson,
      '.yaml': useYaml,
    }[ext] || useJson;

    configure(file, options);
  },
};

const useJs = (file: string, options: ConfigureOptions): void => {
  let data;

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    data = require(file);
  } catch {
    data = {};
  }

  generateArgs(data, options);
};

const useJson = (file: string, options: ConfigureOptions): void => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const data = fs.existsSync(file) ? fs.readJsonSync(file) : {};

  generateArgs(data, options);
};

const useYaml = (file: string, options: ConfigureOptions): void => {
  const yaml = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  const data = yaml ? YAML.parse(yaml) : {};

  generateArgs(data, options);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateArgs = (data: Record<string, any>, options: ConfigureOptions): void => {
  const KEYLESS = ['_', '$', '@'];

  const isKeyless = (value: string): boolean => {
    return some(map(KEYLESS, keyless => startsWith(value, keyless)));
  };

  const args = reduce(data, (result, value, key) => {
    const prefix = isKeyless(key) ? '' : key.length > 1 ? '--' : '-';

    let normalized = '';
    
    if (isKeyless(key) && !isArray(value)) {
      normalized = `${value.toString()}`;
    } else if (isKeyless(key) && isArray(value)) {
      normalized = value.join(' ');
    } else if (isBoolean(value)) {
      normalized = value ? `${prefix}${key}` : '';
    } else if (isArray(value)) {
      normalized = `${prefix}${key}="${value.join(',')}"`;
    } else {
      normalized = `${prefix}${key}=${value.toString()}`;
    }
    
    return [...result, normalized];
  }, []);

  // eslint-disable-next-line no-console
  console.log(args.join(' '));
};

export default command;