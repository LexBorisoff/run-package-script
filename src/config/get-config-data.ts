import { CONFIG_FILE, PACKAGE_MANAGERS } from '../constants.js';
import { useCoreActions } from '../filetree/core-actions.js';
import { parseData } from '../utils/parse-data.js';

import { fallbackConfig } from './fallback-config.js';
import { resetConfig } from './reset-config.js';

import type { ConfigInterface } from '../types/config.types.js';

export function getConfigData(): ConfigInterface {
  const configFile = useCoreActions((root) => root[CONFIG_FILE]);
  const raw = configFile.read();
  const parsed = parseData<ConfigInterface>(raw) ?? fallbackConfig;
  const { command, packageManager } = parsed;

  // reset command to fallback
  if (typeof command !== 'string' || command === '') {
    parsed.command = fallbackConfig.command;
    resetConfig('command');
  }

  // reset packageManager to fallback
  if (
    typeof packageManager !== 'string' ||
    packageManager === '' ||
    !PACKAGE_MANAGERS.includes(packageManager)
  ) {
    parsed.packageManager = fallbackConfig.packageManager;
    resetConfig('packageManager');
  }

  return { ...fallbackConfig, ...parsed };
}
