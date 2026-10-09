import { args } from '../args.js';

const toString = (value: string | number): string => `${value}`;
const _ = args._.map(toString);
const passThrough = args['--']?.map(toString);

export function getArgs(): {
  commandArgs: string[];
  passThroughArgs: string[];
} {
  return {
    commandArgs: _,
    passThroughArgs: passThrough ?? [],
  };
}
