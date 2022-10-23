import * as Commander from 'commander';
import castArray from 'lodash/castArray';

import program from '../program';
import globals from '../globals';
import { Command, Options, Parameters } from '../types';

import { argv } from './argv';
import { imports, loads, PWD } from './path';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createCommand(command: Command<any, any>): void {
  const instance = program
      .command(command.name)
      .description(command.description)
      .action(command.action);

    if (command.alias) {
      instance.alias(command.alias);
    }

    addParameters(instance, command.parameters);
    addOptions(instance, [ ...globals, ...command.options || []]);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function addCommands(commands: Command<any, any>[]): void {
  commands.forEach(command => createCommand(command));
}

export function addParameters(command: Commander.Command, parameters?: Parameters): void {
  buildParameters(parameters).forEach(([parameter, description]) => {
    command.argument(parameter, description);
  });
}

function buildParameters(parameters?: Parameters): [string, string][] {
  return (parameters || []).map(({ name, description, required, rest = false }) => {
    return [required ? `<${name}${rest ? '...' : ''}>` : `[${name}${rest ? '...' : ''}]`, description];
  });
}

export function addOptions(command: Commander.Command, options?: Options): void {
  buildOptions(options).forEach(([type, option, description, initial]) => {
    command[type](option, description, initial);
  });
}

function buildOptions(options?: Options): [string, string, string, string | boolean | string[] | undefined][] {
  return (options || []).map(({ name, alias, description, required, initial, parameters }) => {
    const type = required ? 'requiredOption' : 'option';
    const flag = alias ? `-${alias}, --${name}` : `--${name}`;
    const params = buildParameters(parameters).map(p => p[0]);
    const option = params.length ? `${flag} ${params.join(' ')}` : flag; 
    return [type, option, description, initial];
  });
}

export function registerCommands(src: string, internal = false): void {
  const pattern = `${src}/**/*`;
  const commands = imports(pattern, internal);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addCommands(commands as Command<any,any>[]);
}

export function registerPlugins(flags: string | string[]): void {
  const args = argv();
  const flag = castArray(flags).find(flag => args[flag]);
  const directory = args[flag] as string;

  if (directory) {
    const commands = loads(`${directory}/**/*.[tj]s`);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    addCommands(commands as Command<any, any>[]);
  }
}