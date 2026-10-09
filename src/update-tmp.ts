import $_ from '@lexjs/prompts';

import { args } from './args.js';
import { getConfigData } from './config/get-config-data.js';
import { useCoreActions } from './filetree/core-actions.js';
import { getProjectPm } from './package-manager/utils/get-project-pm.js';
import { getArgs } from './utils/get-args.js';

const { passThroughArgs } = getArgs();
const { npm, pnpm, yarn, bun } = args;
const pmArgs = { npm, pnpm, yarn, bun };
const [currentPm] = Object.entries(pmArgs).find(([_, pm]) => pm) ?? [];

async function getPm(projectPms: string[]): Promise<string | undefined> {
  // match with default package manager
  const { packageManager } = getConfigData();
  const matched = projectPms.find((manager) => manager === packageManager);
  if (matched != null) return matched;

  // select explicitly
  const { pm } = await $_.select({
    choices: projectPms.map((value) => ({ title: value, value })),
    name: 'pm',
    message: 'Package managers allowed in this project (select one):',
  });

  return pm;
}

export async function updateTmp(script: string): Promise<void> {
  const [rootDir, scriptFile, argsFile, pmFile] = useCoreActions((root) => {
    const { tmp } = root;
    return [root, tmp.script, tmp.arguments, tmp['package-manager']];
  });

  // ensure tmp folder exists
  if (!rootDir.exists('tmp')) {
    rootDir.createDir('tmp');
  }

  const pmRaw = currentPm ?? getProjectPm() ?? getConfigData().packageManager;
  const pm = typeof pmRaw === 'string' ? pmRaw : await getPm(pmRaw);

  if (pm == null) {
    return;
  }

  scriptFile.write(script);
  argsFile.write(passThroughArgs.join(' '));
  pmFile.write(`${pm} run`);
}
