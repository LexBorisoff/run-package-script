#!/usr/bin/env node

import { args } from './args.js';
import { renameCommand } from './create-app/rename-command.js';
import { currentPackageManager } from './package-manager/current-package-manager.js';
import { defaultPackageManager } from './package-manager/default-package-manager.js';
import { selectScript } from './select-script.js';
import { updateTmp } from './update-tmp.js';
import { logger } from './utils/logger.js';

(async function main() {
  try {
    if (args.which) {
      currentPackageManager();
      return;
    }

    if (args.default != null) {
      await defaultPackageManager(args.default);
      return;
    }

    if (args.rename != null) {
      await renameCommand(args.rename);
      return;
    }

    const script = await selectScript();

    if (script != null) {
      await updateTmp(script);
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error(error.message);
    }
  }
})();
