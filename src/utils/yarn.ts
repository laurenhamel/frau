import find from "lodash/find";

import { IWorkspaceData } from "../types";

import { resolve } from "./path";
import { run } from "./spawn";

let workspaces: IWorkspaceData[];

export function getWorkspaceId(workspace: string): string {
  return workspace.split("/").slice(-1)[0];
}

export async function getWorkspaces(): Promise<IWorkspaceData[]> {
  if (!workspaces) {
    const output = await run("yarn workspaces list --json", { internal: true });

    workspaces = output
      .trim()
      .split("\n")
      .map((data) => JSON.parse(data))
      .map((workspace) => ({ ...workspace, id: getWorkspaceId(workspace.name), path: resolve(workspace.name) }));
  }

  return workspaces;
}

export async function resolveWorkspace(workspace: string): Promise<IWorkspaceData> {
  const workspaces = await getWorkspaces();
  return (
    find(workspaces, { name: workspace }) ||
    find(workspaces, { id: workspace }) || { name: workspace, id: getWorkspaceId(workspace), location: "" }
  );
}

export async function resolveWorkspaces(...workspaces: string[]): Promise<IWorkspaceData[]> {
  return Promise.all(workspaces.map((workspace) => resolveWorkspace(workspace)));
}
