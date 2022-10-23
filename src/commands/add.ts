import { map, reject } from 'lodash';

import { GlobalOptions } from '../globals';
import { Command } from '../types';
import { flags, getWorkspaces, run } from '../utils';

export type AddParameters = [string, string[] | undefined];

export interface AddOptions extends GlobalOptions {
  cached: boolean;
  caret: boolean;
  dev: boolean;
  exact: boolean;
  optional: boolean;
  peer: boolean;
  tilde: boolean;
}

const command: Command<AddParameters, AddOptions> = {
  name: 'add',
  alias: 'a',
  description: 'Add a dependency to one or more workspaces',
  parameters: [
    {
      name: 'dependency',
      description: 'The dependency to add',
      required: true
    },
    {
      name: 'workspaces',
      description: 'The workspaces to add the dependency to',
      required: false,
      rest: true,
    },
  ],
  options: [
    {
      name: 'cached',
      description: 'Reuse the highest version already used somewhere within the project',
    },
    {
      name: 'caret',
      alias: 'C',
      description: 'Use the ^ semver modifier on the resolved range',
    },
    {
      name: 'dev',
      alias: 'D',
      description: 'Add a package as a dev dependency'
    },
    {
      name: 'exact',
      alias: 'E',
      description: "Don't use any semver modifier on the resolved range",
    },
    {
      name: 'optional',
      alias: 'O',
      description: 'Add/upgrade a package to an optional regular/peer dependency',
    },
    {
      name: 'peer',
      alias: 'P',
      description: 'Add a package as a peer dependency'
    },
    {
      name: 'tilde',
      alias: 'T',
      description: 'Use the ~ semver modifier on the resolved range',
    },
  ],
  async action(dependency, workspaces, options) {
    workspaces = workspaces?.length ?
      workspaces :
      map(reject(await getWorkspaces(), { location: '.' }), 'name');

    await add(workspaces, dependency, options);
  },
};

const add = async (workspaces: string[], dependency: string, options: AddOptions): Promise<void> => {
  return new Promise(async (resolve) => {
    const tasks = workspaces.map(workspace => `yarn workspace ${workspace} add ${dependency} ${flags(options)}`.trim());

    options.dry ? console.log(tasks.join('\n')) : await run(tasks);

    resolve();
  });
};

export default command;