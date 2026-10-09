import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { getConfigData } from './config/get-config-data.js';
import { PACKAGE_VERSION } from './constants.js';

const desc = {
  runWith(packageManager: string): string {
    return `Run a script using ${packageManager}`;
  },
};

const group = {
  script: 'Script Options:',
  packageManager: 'Package Manager Options:',
  config: 'Config Options:',
};

enum Option {
  Npm = 'npm',
  Pnpm = 'pnpm',
  Yarn = 'yarn',
  Bun = 'bun',
  Interactive = 'interactive',
  First = 'first',
  Default = 'default',
  Which = 'which',
  Rename = 'rename',
}

const alias: Partial<Record<Option, string | readonly string[]>> = {
  [Option.Npm]: 'n',
  [Option.Pnpm]: 'p',
  [Option.Yarn]: 'y',
  [Option.Bun]: 'b',
  [Option.Interactive]: 'i',
  [Option.First]: 'f',
  [Option.Default]: 'd',
  [Option.Which]: 'w',
};

function noConflictWith(itself: Option, ...other: Option[]): Option[] {
  return Object.values(Option).filter(
    (option) => option !== itself && !other.includes(option),
  );
}

const parsed = yargs(hideBin(process.argv))
  .scriptName(getConfigData().command)
  .usage(`Usage: $0 [ARG...] [OPTION...]`)
  .usage(
    `Interactively select and run package scripts using any package manager`,
  )
  .option(Option.Npm, {
    type: 'boolean',
    description: desc.runWith('npm'),
    alias: alias[Option.Npm],
    group: group.script,
    conflicts: noConflictWith(Option.Npm, Option.Interactive),
  })
  .option(Option.Pnpm, {
    type: 'boolean',
    description: desc.runWith('pnpm'),
    alias: alias[Option.Pnpm],
    group: group.script,
    conflicts: noConflictWith(Option.Pnpm, Option.Interactive),
  })
  .option(Option.Yarn, {
    type: 'boolean',
    description: desc.runWith('yarn'),
    group: group.script,
    alias: alias[Option.Yarn],
    conflicts: noConflictWith(Option.Yarn, Option.Interactive),
  })
  .option(Option.Bun, {
    type: 'boolean',
    description: desc.runWith('bun'),
    group: group.script,
    alias: alias[Option.Bun],
    conflicts: noConflictWith(Option.Bun, Option.Interactive),
  })
  .option(Option.Interactive, {
    type: 'boolean',
    description: 'Interactive script selection',
    alias: alias[Option.Interactive],
    group: group.script,
    conflicts: [Option.First, Option.Default, Option.Which],
  })
  .option(Option.First, {
    type: 'boolean',
    description: 'Run the first matched script',
    alias: alias[Option.First],
    group: group.script,
    conflicts: [Option.Interactive, Option.Default, Option.Which],
  })
  .option(Option.Default, {
    type: 'string',
    description: 'Set the default package manager',
    alias: alias[Option.Default],
    group: group.packageManager,
    conflicts: noConflictWith(Option.Default),
  })
  .option(Option.Which, {
    type: 'boolean',
    description: 'Show which package which is currently used',
    alias: alias[Option.Which],
    group: group.packageManager,
    conflicts: noConflictWith(Option.Which),
  })
  .option(Option.Rename, {
    type: 'string',
    description: 'Rename the command',
    group: group.config,
    conflicts: noConflictWith(Option.Rename),
  })
  .help()
  .version(PACKAGE_VERSION)
  .hide('help')
  .hide('version')
  .parserConfiguration({
    'populate--': true,
  })
  .parseSync();

export const args = parsed as typeof parsed & { '--'?: (string | number)[] };
