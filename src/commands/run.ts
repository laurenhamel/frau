import { map, reject } from 'lodash';

import { GlobalOptions } from '../globals';
import { Command } from '../types';
import { flags, getWorkspaces, run } from '../utils';

export type RunParameters = [string, string[] | undefined];

export interface RunOptions extends GlobalOptions { }

const command: Command<RunParameters, RunOptions> = {
  name: 'run',
  alias: 'r',
  description: 'Run a script in one or more workspaces',
  parameters: [
    {
      name: 'script',
      description: 'The script to run',
      required: true
    },
    {
      name: 'workspaces',
      description: 'The workspaces where the script should run',
      required: false,
      rest: true,
    },
  ],
  async action(script, workspaces, options) {
    workspaces = workspaces?.length ?
      workspaces :
      map(reject(await getWorkspaces(), { location: '.' }), 'name');

    await task(workspaces, script, options);
  },
};

const task = async (workspaces: string[], script: string, options: RunOptions): Promise<void> => {
  return new Promise(async (resolve) => {
    const tasks = workspaces.map(workspace => `yarn workspace ${workspace} run ${script} ${flags(options)}`.trim());

    options.dry ? console.log(tasks.join('\n')) : await run(tasks);

    resolve();
  });
};

export default command;