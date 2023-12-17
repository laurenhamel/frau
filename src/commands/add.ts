import { map, reject } from "lodash";

import { GlobalOptions } from "../globals";
import { Command } from "../types";
import { flags, getWorkspaces, resolveWorkspaces, run, dry } from "../utils";

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
  name: "add",
  alias: "+",
  description: "Add one or more dependencies to one or more workspaces",
  parameters: [
    {
      name: "dependencies",
      description: "The dependencies to add",
      required: true,
    },
    {
      name: "workspaces",
      description: "The workspaces to add the dependency to",
      required: false,
      rest: true,
    },
  ],
  options: [
    {
      name: "cached",
      description: "Reuse the highest version already used somewhere within the project",
    },
    {
      name: "caret",
      alias: "C",
      description: "Use the ^ semver modifier on the resolved range",
    },
    {
      name: "dev",
      alias: "D",
      description: "Add a package as a dev dependency",
    },
    {
      name: "exact",
      alias: "E",
      description: "Don't use any semver modifier on the resolved range",
    },
    {
      name: "optional",
      alias: "O",
      description: "Add/upgrade a package to an optional regular/peer dependency",
    },
    {
      name: "peer",
      alias: "P",
      description: "Add a package as a peer dependency",
    },
    {
      name: "tilde",
      alias: "T",
      description: "Use the ~ semver modifier on the resolved range",
    },
  ],
  async action(dependencies, workspaces, options) {
    workspaces = map(
      reject(await (workspaces?.length ? resolveWorkspaces(...workspaces) : getWorkspaces()), { location: "." }),
      "name",
    );

    const adds = dependencies.split(/[,;:| ]/g).map((dependency) => dependency.trim());

    await add(workspaces, adds, options);
  },
};

const add = async (workspaces: string[], dependencies: string[], options: AddOptions): Promise<void> => {
  return new Promise(async (resolve) => {
    const tasks = workspaces.map((workspace) =>
      `yarn workspace ${workspace} add ${dependencies.join(" ")} ${flags(options)}`.trim(),
    );

    options.dry ? dry(tasks, { options }, workspaces) : await run(tasks, { options }, workspaces);

    resolve();
  });
};

export default command;
