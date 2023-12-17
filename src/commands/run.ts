import { map, reject } from "lodash";

import { GlobalOptions } from "../globals";
import { Command } from "../types";
import { flags, getWorkspaces, resolveWorkspaces, dry, run } from "../utils";

export type RunParameters = [string, string[] | undefined];

export interface RunOptions extends GlobalOptions {}

const command: Command<RunParameters, RunOptions> = {
  name: "run",
  alias: "r",
  description: "Run a script in one or more workspaces",
  parameters: [
    {
      name: "script",
      description: "The script to run",
      required: true,
    },
    {
      name: "workspaces",
      description: "The workspaces where the script should run",
      required: false,
      rest: true,
    },
  ],
  async action(script, workspaces, options) {
    const resolved = await (workspaces?.length ? resolveWorkspaces(...workspaces) : getWorkspaces());
    const names = map(reject(resolved, { location: "." }), "name");
    await task(names, script, options);
  },
};

const task = async (workspaces: string[], script: string, options: RunOptions): Promise<void> => {
  return new Promise(async (resolve) => {
    const tasks = map(workspaces, (workspace) => `yarn workspace ${workspace} run ${script} ${flags(options)}`.trim());
    await (options.dry ? dry : run)(tasks, { options }, workspaces);
    resolve();
  });
};

export default command;
