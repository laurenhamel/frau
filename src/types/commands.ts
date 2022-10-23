import * as Commander from 'commander';

export type Action<P extends ActionParameters, O extends ActionOptions> = (...params: ActionArguments<P, O>) => void;

export type ActionParameters = (string | boolean | string[])[] | never;

export type ActionOptions = Record<string, any>;

export type ActionArguments<P extends ActionParameters, O extends ActionOptions> = P extends never ? [O] : [...P, O, Commander.Command];

export interface Command<P extends ActionParameters, O extends ActionOptions> {
  name: string;
  alias?: string;
  description: string;
  parameters?: Parameters;
  options?: Options;
  action: Action<P, O>;
}

export type Parameters = Parameter[];

export interface Parameter {
  name: string;
  description: string;
  required?: boolean;
  rest?: boolean;
}

export type Options = Option[];

export interface Option {
  name: string;
  alias?: string;
  description: string;
  required?: boolean;
  parameters?: Parameters;
  initial?: string | boolean | string[];
}