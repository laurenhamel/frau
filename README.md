# Frau

> A pluggable build system for monorepos using Yarn workspaces

## Overview

A lighter alternative to full-fledged build systems, such as [Lerna](https://lerna.js.org/), [Nx](https://nx.dev), and [Bit](https://bit.dev/), and monorepo management tools like [oao](https://github.com/guigrpa/oao), [Frau]() aims to be a simple drop-in solution for extending the functionality of [`yarn workspaces`](https://yarnpkg.com/features/workspaces).

## Installation

```sh
# yarn
yarn add -D frau

# npm
npm installl --save-dev frau
```

## Usage

To see all CLI options, run `frau --help`:

```sh
Usage: frau [options] [command]

A pluggable build system for monorepos using Yarn workspaces

Options:
  -V, --version                                      output the version number
  -P, --plugins <directory>                          A directory of workspace-specific plugins
  -h, --help                                         display help for command

Commands:
  add|+ [options] <dependencies> [workspaces...]     Add one or more dependencies to one or more workspaces
  configure|c [options] <config>                     Convert an arbitrary configuration file to command-line arguments
  remove|- [options] <dependencies> [workspaces...]  Remove one or more dependencies from one or more workspaces
  run|r [options] <script> [workspaces...]           Run a script in one or more workspaces
  help [command]                                     display help for command
```
