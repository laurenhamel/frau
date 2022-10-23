import { IWorkspaceData } from '../types';

import { resolve } from './path';
import { run } from './spawn';

let workspaces: IWorkspaceData[];

export async function getWorkspaces(): Promise<IWorkspaceData[]> {
  if (!workspaces) {
    const output = await run('yarn workspaces list --json', { internal: true });

    workspaces = output
      .trim()
      .split('\n')
      .map(data => JSON.parse(data))
      .map(workspace => ({ ...workspace, path: resolve(workspace.name) }));
  }

  return workspaces;
}