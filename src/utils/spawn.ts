import { spawn } from 'child_process';

import { castArray, merge } from 'lodash';

import { GlobalOptions } from '../globals';

export interface SpawnOptions {
  internal: boolean;
  options?: GlobalOptions;
}

export async function run<T extends string | string[]>(command: T, options?: SpawnOptions): Promise<T> {
  const settings = merge({ internal: false }, options);
  const commands = castArray(command);
  
  const promises = commands.map<Promise<string>>(command => {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      const task = spawn(cmd, [...args], {
        shell: true,
        ...(!settings.internal ? { stdio: 'inherit' } : {}),
      });

      let result: string, error: string;

      task.stdout?.on('data', data => {
        result = (result || '') + data.toString();
      });

      task.stderr?.on('data', data => {
        error = (error || '') + data.toString();
      });

      task.on('close', code => {
        code === 0 ? resolve(result) : reject(error);
      });
    });
  });

  const results = await Promise.all(promises);

  return (commands.length > 1 ? results : results[0]) as T;
}