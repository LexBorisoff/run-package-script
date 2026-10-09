import { getPackageJson } from '../../utils/get-package-json.js';

/**
 * Returns a package manager object based on
 * `devEngines` or `packageManager` property in package.json,
 * otherwise returns `undefined`
 */
export function getProjectPm(): string | string[] | undefined {
  const { devEngines = {}, packageManager: topLevelPm } = getPackageJson();
  const { packageManager } = devEngines;

  if (packageManager != null) {
    return Array.isArray(packageManager)
      ? packageManager.map(({ name }) => name)
      : packageManager.name;
  }

  return topLevelPm?.split('@')[0];
}
