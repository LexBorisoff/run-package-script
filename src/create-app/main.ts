#!/usr/bin/env node

import fs from 'node:fs';
import 'dotenv/config';

import { createTree, FileTree } from '@lexjs/filetree';
import { coreActions } from '@lexjs/filetree/actions';
import $_ from '@lexjs/prompts';
import chalk from 'chalk';

import { updateConfig } from '../config/update-config.js';
import {
  CONFIG_FILE,
  IS_DEV,
  IS_WINDOWS,
  PACKAGE_MANAGERS,
  PACKAGE_NAME,
} from '../constants.js';
import { useCoreActions } from '../filetree/core-actions.js';
import { npmCommands, npmActions } from '../filetree/npm-actions.js';
import {
  selectPackageManager,
  SelectPmEnum,
} from '../package-manager/select-package-manager.js';
import { getProjectInfo } from '../utils/get-project-info.js';
import { logger } from '../utils/logger.js';
import { parseData } from '../utils/parse-data.js';

import { createScriptFiles } from './create-script-files.js';
import { getCommandName } from './get-command-name.js';
import { paths } from './paths.js';
import { initialTree } from './tree.js';

import type { ConfigInterface } from '../types/config.types.js';

function isEmpty(str: string | undefined): str is undefined | '' {
  return str == null || str === '';
}

function linkDist(): void {
  const distPath = useCoreActions(
    ({ lib }) => lib.node_modules[PACKAGE_NAME].dist,
  ).getPath();

  if (fs.existsSync(paths.distLink)) {
    fs.rmSync(paths.distLink, { force: true, recursive: true });
  }
  fs.symlinkSync(distPath, paths.distLink, IS_WINDOWS ? 'junction' : 'dir');
}

function ensureNamespace(): void {
  const fileTree = new FileTree(paths.namespace, {});
  if (!fs.existsSync(paths.namespace)) {
    createTree(fileTree);
  }
}

async function initializeApp(): Promise<void> {
  const fileTree = new FileTree(paths.root, initialTree);
  ensureNamespace();
  createTree(fileTree);

  // create config file
  const useCore = fileTree.use(coreActions);
  const rootDir = useCore((root) => root);
  if (!rootDir.exists(CONFIG_FILE)) {
    rootDir.createFile(CONFIG_FILE, '');
  }

  // install package (link in development)
  const version = IS_DEV ? '' : getProjectInfo().version;
  const pkg =
    version != null && version !== ''
      ? `${PACKAGE_NAME}@${version}`
      : PACKAGE_NAME;

  const npmCommand = IS_DEV ? npmCommands.link : npmCommands.install;
  const useNpm = fileTree.use(npmActions);
  await useNpm(({ lib }) => lib)[npmCommand]([pkg]);
}

(async function createApp(): Promise<void> {
  let command: string | undefined;
  let packageManager: string | undefined;

  // get current config data if exists
  const rootDir = useCoreActions((root) => root);

  if (rootDir.exists(CONFIG_FILE)) {
    const configData = rootDir.readFile(CONFIG_FILE);

    if (configData != null) {
      const config = parseData<ConfigInterface>(configData);
      command = config?.command;
      packageManager = config?.packageManager;
    }
  }

  let renameCommand = false;
  if (!isEmpty(command)) {
    logger.warn(
      `${PACKAGE_NAME} command is set as ${chalk.underline(command)}\n`,
    );

    const { rename } = await $_.toggle({
      message: 'Do you want to rename it?',
      name: 'rename',
    });

    if (rename == null) return;
    renameCommand = rename;
  }

  if (isEmpty(command) || renameCommand) {
    const commandName = await getCommandName();
    if (commandName == null) return;
    command = commandName;
  }

  if (
    isEmpty(packageManager) ||
    typeof packageManager !== 'string' ||
    !PACKAGE_MANAGERS.includes(packageManager)
  ) {
    packageManager = await selectPackageManager(SelectPmEnum.DefaultPm);
    if (packageManager == null) return;
  }

  if (packageManager != null) {
    await initializeApp();
    await createScriptFiles(command);
    linkDist();
    updateConfig({ command, packageManager });
  }
})();
