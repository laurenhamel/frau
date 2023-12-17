import { spawn } from "child_process";
import chalk from "chalk";
import { castArray, compact, isString, map, merge } from "lodash";
import { getLogger } from "./logger";
import { getLabelWidth, withPrefix } from "./color";

import { GlobalOptions } from "../globals";

export interface RunOptions {
  internal?: boolean;
  options?: GlobalOptions;
}

export async function run<T extends string | string[]>(
  command: T,
  options?: RunOptions,
  id?: string | string[],
): Promise<T> {
  const settings = merge({ internal: false }, options);
  const commands = castArray(command);
  const ids = compact(castArray(id));
  const width = getLabelWidth(...ids);

  const promises = commands.map<Promise<{ data: string; error?: Error }>>((command, i) => {
    return new Promise((resolve, reject) => {
      const id = ids[i];
      const [cmd, ...args] = command.split(" ");
      const logger = getLogger(id, width);

      !settings.internal && logger.log(chalk.dim(command));

      const child = spawn(cmd, [...args], {
        shell: true,
        env: { ...process.env, FORCE_COLOR: "true" },
      });

      let stdout = "";
      let stderr: string | undefined = undefined;
      let error: Error | undefined = undefined;

      child.stdout.on("data", (chunk) => {
        const data = chunk.toString();
        !settings.internal && output(command, id, data, false, width);
        stdout += data;
      });

      child.stderr.on("data", (chunk) => {
        const data = chunk.toString();
        !settings.internal && output(command, id, data, true, width);
        stderr += data;
      });

      child.on("error", (e) => {
        !settings.internal && output(command, id, e, true, width);
        error = e;
      });

      child.on("close", (code) => {
        code === 0 ? resolve({ data: stdout }) : reject({ data: stderr, error });
      });
    });
  });

  try {
    const results = await Promise.all(promises);
    return (commands.length > 1 ? map(results, "data") : results[0].data) as T;
  } catch (error) {
    process.env.NODE_ENV === "development" && console.log(error);
    return (commands.length > 1 ? [] : "") as T;
  }
}

export interface DryOptions {
  options?: GlobalOptions;
}

export async function dry<T extends string | string[]>(
  command: T,
  options?: DryOptions,
  id?: string | string[],
): Promise<T> {
  const settings = merge({}, options);
  const commands = castArray(command);
  const ids = compact(castArray(id));
  const width = getLabelWidth(...ids);

  const promises = commands.map<Promise<{ data: string; error?: Error }>>((command, i) => {
    return new Promise((resolve) => {
      const id = ids[i];
      const message = chalk.dim("This was a dry run. No changes were made.");
      const [cmd, ...args] = command.split(" ");
      output(command, id, message, false, width);
      resolve({ data: message });
    });
  });

  try {
    const results = await Promise.all(promises);
    return (commands.length > 1 ? map(results, "data") : results[0].data) as T;
  } catch (error) {
    process.env.NODE_ENV === "development" && console.log(error);
    return (commands.length > 1 ? [] : "") as T;
  }
}

export function output(
  commands: string | string[],
  ids: string | string[],
  results: string | string[] | Error | Error[],
  error?: boolean,
  width?: number,
): void {
  castArray(commands).forEach((command, i) => {
    const id = castArray(ids)[i];
    const result = castArray(results)[i];
    const message = isString(result) ? result : result.toString();
    const logger = getLogger(id, width);

    compact(
      message
        .trim()
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => !/^\w+$/.test(line)),
    ).forEach((line) => {
      let out = line;

      out = withPrefix(out, ["ERR!", "Error:"], chalk.red);
      out = withPrefix(out, "WARN", chalk.yellow);

      error ? logger.error(out) : logger.log(out);
    });
  });
}
