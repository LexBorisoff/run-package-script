# `@lexjs/run`

![Build](https://img.shields.io/github/actions/workflow/status/LexBorisoff/run-package-script/release.yml)
![NPM Version](https://img.shields.io/npm/v/@lexjs/run)

CLI to interactively select and run package scripts using any popular package manager.

- [Installation](#installation)
- [Usage](#usage)
  - [Arguments](#arguments)
  - [Bypassing the selection prompt](#bypassing-the-selection-prompt)
  - [Running the first matched script](#running-the-first-matched-script)
  - [Pass-through arguments](#pass-through-arguments)
- [Package Manager](#package-manager)
  - [Default package manager](#default-package-manager)
  - [Project's package manager](#projects-package-manager)
  - [One-time overrides](#one-time-overrides)

## Installation

**Step 1**. Run one of the following commands from any directory.

```bash
npx @lexjs/run
```

```bash
pnpm dlx @lexjs/run
```

```bash
yarn dlx @lexjs/run
```

```bash
bunx @lexjs/run
```

**Step 2**. Follow the prompts to set up the command name and select your default package manager.

**Step 3**. Once the installation process is complete, add the following lines to your shell configuration file.

- For POSIX-compatible shells like bash or zsh

```bash
# ~/.bashrc or ~/.zshrc

test -f ~/.lexjs/run/start.sh && . ~/.lexjs/run/start.sh
```

- For PowerShell

```powershell
# C:\Program Files\PowerShell\7\profile.ps1

if (Test-Path -Path "$env:HOMEPATH\.lexjs\run\bin") {
  $env:Path = "$env:HOMEPATH\.lexjs\run\bin;$env:Path"
}
```

> 💡 To get the path of your PowerShell configuration file, type `$PROFILE.` and tab through the available options to choose the necessary profile.

**Step 4**. Restart your shell. The command should now be available.

### How it works

The installation process creates a `~/.lexjs/run` directory where it installs the **_core library_** and creates a **_shell script_** that acts as the program's main entry point. The script's directory (`bin`) is added to your PATH, making the script accessible from anywhere in your shell. By giving the script a name that you prefer (or sticking to the default), you control how to invoke the program.

### Renaming the command

You can rename the command later by providing the `--rename` option with the new command name. If the name is not provided, you will be prompted to enter one.

```bash
run --rename <new-name>
```

> 📚 All following examples will assume the command name is `run`

## Usage

To interactively select and run a script in your current project, run the command you created during the installation. Calling without any arguments or options will display all scripts (except for lifecycle scripts). You can type in the selection menu to filter down your search.

For example:

```bash
run
```

```json
{
  "scripts": {
    "prepack": "npm run build",
    "prebuild": "npm run ci && rimraf ./dist",
    "build": "npm run compile",
    "ci": "npm run check:style && npm run check:build",
    "check:style": "npm run check:format && npm run check:lint",
    "check:build": "npm run compile -- --noEmit",
    "check:format": "prettier --check \"*.{js,cjs,mjs,ts,cts,mts}\" \"{src,test}/**/*.ts\"",
    "check:lint": "eslint \"{src,test}/**/*.{js,ts}\"",
    "style": "npm run format && npm run lint",
    "format": "prettier --write \"*.{js,cjs,mjs,ts,cts,mts}\" \"{src,test}/**/*.ts\"",
    "lint": "npm run check:lint -- --fix",
    "compile": "tsc -p tsconfig.json",
    "prepare": "husky"
  }
}
```

<img src="https://github.com/LexBorisoff/run-package-script/blob/main/media/usage.gif?raw=true" alt="usage example" width="1000" />

### Arguments

Supplying command arguments will filter the initial list of displayed scripts. However, you are not limited to the suggested list - you can still type in the prompt menu and select a different script.

For example:

```bash
run arg1 arg2 ...
```

### Bypassing the selection prompt

There are cases when the CLI will run a matched script without displaying the selection prompt.

- When a single argument is provided that matches a script **_exactly_** even if there are other scripts containing that argument in their names.
- When a single script is matched based on the provided arguments.

> 💡 The `--interactive` (`-i`) option can override this behavior and show the interactive selection menu.

For example:

```json
{
  "scripts": {
    "build": "npm run compile",
    "prebuild": "npm run ci && rimraf ./dist",
    "check-build": "npm run compile -- --noEmit"
  }
}
```

```bash
run build
```

> 👆 runs the `build` script (exact match)

```bash
run build check
```

> 👆 runs the `check-build` script

### Running the first matched script

If there are multiple matched scripts, the `--first` option can be used to run the first script without displaying the selection prompt.

For example:

```json
{
  "scripts": {
    "check-style": "npm run format:check && npm run lint",
    "check-build": "npm run compile -- --noEmit",
    "format:check": "prettier --check \"*.{js,cjs,mjs,ts,cts,mts}\" \"{src,test}/**/*.ts\""
  }
}
```

```bash
run check --first
```

> 👆 runs the `check-style` script

### Pass-through arguments

To pass arguments directly to the underlying script, provide them after the double-dash `--`. All arguments passed after `--` will be treated as pass-through arguments.

For example:

```json
{
  "scripts": {
    "hello": "echo hello"
  }
}
```

```bash
run hello -- world
```

<img src="https://github.com/LexBorisoff/run-package-script/blob/main/media/hello-world-1.gif?raw=true" alt="usage example" width="1000" />

Passing arguments to the script also works with the selection prompt:

<img src="https://github.com/LexBorisoff/run-package-script/blob/main/media/hello-world-2.gif?raw=true" alt="usage example" width="1000" />

## Package Manager

The CLI allows you to run scripts by using one of the following package managers:

- npm
- pnpm
- yarn
- bun

> 💡 Use the `--which` (`-w`) option to view which package manager is currently being used.

### Default package manager

To set the default package manager for all projects, provide the `--default` (`-d`) option with a package manager name. If no name is provided, you will be prompted to select one.

For example:

```bash
run --default pnpm
```

### Project's package manager

A project might specify an allow-list of package managers that it uses in a few ways in its `package.json`:

- a `packageManager` property inside the `devEngines` setting
- a top-level `packageManager` property

The CLI honors both of the above ways, giving priority to `devEngines`, and will run scripts using the project's package manager instead of your default one.

`devEngines.packageManager` can be either a single object or an array of objects describing a package manager. In the case where it defines an array with only 1 available package manager, the CLI acts as if `devEngines.packageManager` is defined as an object and will run scripts using that package manager. If there are 2 or more options, the CLI picks the one that matches your default package manager. And if there is no match, it prompts you to select one from the project's available options.

### One-time overrides

You can override your default package manager for the _**current script run**_ by supplying the package manager you want to use as a _**flag**_. This technique also works for the project's top-level `packageManager` setting. Doing this will not override your default package manager or the project's package manager completely.

> ⚠️ This might fail with `devEngines.packageManager` if the package manager you're supplying is not in the allow-list.

For example, if you set your default project manager as _**yarn**_, you can run a script using _**pnpm**_ as follows:

```bash
run --pnpm [SCRIPT]
```

Override flags:

- `-n` `--npm`
- `-p` `--pnpm`
- `-y` `--yarn`
- `-b` `--bun`
