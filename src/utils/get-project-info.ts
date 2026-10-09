import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import { parseData } from './parse-data.js';

import type { PackageJson } from 'type-fest';

export function getProjectInfo(): PackageJson {
  const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
  const root = path.join(__dirname, '../../');
  const json = fs.readFileSync(path.resolve(`${root}/package.json`), 'utf-8');
  return parseData<PackageJson>(json) ?? {};
}
