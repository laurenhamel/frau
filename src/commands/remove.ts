import map from 'lodash/map';

import { GlobalOptions } from '../globals';
import { Command } from '../types';
import { getWorkspaces, run } from '../utils';

export type RemoveParameters = [string, string[] | undefined];

export interface RemoveOptions extends GlobalOptions {}

const command: Command<RemoveParameters, RemoveOptions> = {
  name: 'remove',
  alias: 'r',
  description: 'Remove a dependency from one or more workspaces',
  parameters: [
    {
      name: 'dependency',
      description: 'The dependency to remove',
      required: true
    },
    {
      name: 'workspaces',
      description: 'The workspaces to remove the dependency from',
      required: false,
      rest: true,
    },
  ],
  async action(dependency, workspaces, options) {
    workspaces = workspaces?.length ? workspaces : map(await getWorkspaces(), 'name');

    await remove(workspaces, dependency, options);
  },
};

const remove = async (workspaces: string[], dependency: string, options: RemoveOptions): Promise<void> => {
  return new Promise(async (resolve) => {
    const tasks = workspaces.map(workspace => `yarn workspace ${workspace} remove ${dependency}`);
    
    options.dry ? console.log(tasks.join('\n')) : await run(tasks);

    resolve();
  });
};

export default command;