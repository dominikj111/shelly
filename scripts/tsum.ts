import { parseArgumentsToObject } from "../utils/common.ts";

export function getHelpText() {
  return `
'sum' command adds two numbers.

Usage:
  sum -a=<number> -b=<number|default:1> [--strict]

Options:
  -a=<number>           First number (required if --strict)
  -b=<number|default:1> Second number
  --strict, -s          Fail if 'a' is not provided
  -h, --help            Show this help

Examples:
  sum -a=2 -b=3
  sum -a=5
  sum -a=2 -b=3 --strict
  `;
}

export function main(...args: string[]) {
  const { a, b, strict = false, s = false } = parseArgumentsToObject(args);

  if ((strict || s) && (a === undefined || b === undefined)) {
    console.error("'a' or 'b' option is undefined");
    Deno.exit(1);
  }

  console.log(`${a} + ${b ?? 1} = ${Number(a) + Number(b ?? 1)}`);
}
