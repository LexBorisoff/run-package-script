import { CONFIG_FILE } from '../constants.js';
import { useCoreActions } from '../filetree/core-actions.js';
import { parseData } from '../utils/parse-data.js';

import { fallbackConfig } from './fallback-config.js';

import type { ConfigInterface } from '../types/config.types.js';

export function resetConfig(key: keyof ConfigInterface): void {
  const [rootDir, configFile] = useCoreActions((root) => [
    root,
    root[CONFIG_FILE],
  ]);

  if (!rootDir.exists(CONFIG_FILE)) {
    rootDir.createFile(CONFIG_FILE);
  }

  const configData = configFile.read();
  const config = parseData<ConfigInterface>(configData) ?? fallbackConfig;

  configFile.write(JSON.stringify({ ...config, [key]: fallbackConfig[key] }));
}
