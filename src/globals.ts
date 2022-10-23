import { Options } from "./types";

export interface GlobalOptions {
  [key: string]: boolean | string | number;
  verbose: boolean;
  dry: boolean;
}

const globals: Options = [
  {
    name: 'verbose',
    alias: 'v',
    description: 'Output extra information'
  },
  {
    name: 'dry',
    alias: 'd',
    description: 'Perform a dry run without making changes',
  },
]

export default globals;