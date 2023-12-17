import { map, reject } from "lodash";

import { GlobalOptions } from "../globals";
import { Command } from "../types";
import { getWorkspaces, resolveWorkspaces, run, dry } from "../utils";

export type RemoveParameters = [string, string[] | undefined];

export interface RemoveOptions extends GlobalOptions {}

const command: Command<RemoveParameters, RemoveOptions> = {
  name: "remove",
  alias: "-",
  description: "Remove one or more dependencies from one or more workspaces",
  parameters: [
    {
      name: "dependencies",
      description: "The dependencies to remove",
      required: true,
    },
    {
      name: "workspaces",
      description: "The workspaces to remove the dependency from",
      required: false,
      rest: true,
    },
  ],
  async action(dependencies, workspaces, options) {
    workspaces = map(
      reject(await (workspaces?.length ? resolveWorkspaces(...workspaces) : getWorkspaces()), { location: "." }),
      "name",
    );

    const removes = dependencies.split(/[,;:| ]/g).map((dependency) => dependency.trim());

    await remove(workspaces, removes, options);
  },
};

const remove = async (workspaces: string[], dependencies: string[], options: RemoveOptions): Promise<void> => {
  return new Promise(async (resolve) => {
    const tasks = workspaces.map((workspace) => `yarn workspace ${workspace} remove ${dependencies.join(" ")}`);

    options.dry ? dry(tasks, { options }, workspaces) : await run(tasks, { options }, workspaces);

    resolve();
  });
};

export default command;
