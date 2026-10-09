import { colors, logger } from '../utils/logger.js';

import { createScriptFiles } from './create-script-files.js';
import { getCommandName } from './get-command-name.js';

export async function renameCommand(arg: string): Promise<void> {
  const command = arg !== '' ? arg : await getCommandName();
  if (command == null) return;

  await createScriptFiles(command);
  logger.log(`Renamed to ${colors.yellow(command)}`);
}
