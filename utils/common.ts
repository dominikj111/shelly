/**
 * Check if all provided arguments are valid according to the help text.
 */
export function areArgumentsSupported(
  providedArguments: string[],
  helpText: string
): boolean {
  const helpTextBrokenToLines = helpText
    .split("\n")
    .filter((tl) => Boolean(tl.trim()));

  const optionsStartIndex = helpTextBrokenToLines.findIndex((line) =>
    line.includes("Options:")
  );

  const optionsEndIndex = helpTextBrokenToLines.findIndex((line) =>
    line.includes("Examples:")
  );

  const helpOptionsTextBrokenToLines = helpTextBrokenToLines.slice(
    optionsStartIndex + 1,
    optionsEndIndex
  );

  return (
    providedArguments.filter((arg) => {
      const singleCharacterArgumentWithoutAssignment = /^-\w$/.exec(arg);
      const singleCharacterArgumentWithAssignment = /^-\w=/.exec(arg);
      const multiCharacterArgumentWithoutAssignment = /^--\w\w+$/.exec(arg);
      const multiCharacterArgumentWithAssignment = /^--\w\w+=/.exec(arg);

      const linesSupportingTheArgument = helpOptionsTextBrokenToLines.filter(
        (line) =>
          (singleCharacterArgumentWithoutAssignment &&
            line.includes(` ${singleCharacterArgumentWithoutAssignment[0]}`)) ||
          (singleCharacterArgumentWithAssignment &&
            line.includes(` ${singleCharacterArgumentWithAssignment[0]}`)) ||
          (multiCharacterArgumentWithoutAssignment &&
            line.includes(` ${multiCharacterArgumentWithoutAssignment[0]}`) &&
            !line.includes(
              ` ${multiCharacterArgumentWithoutAssignment[0]}=`
            )) ||
          (multiCharacterArgumentWithAssignment &&
            line.includes(` ${multiCharacterArgumentWithAssignment[0]}`))
      );

      if (linesSupportingTheArgument.length > 1) {
        console.warn(
          "The argument description is found on more than single line in the Options section."
        );
      }

      return linesSupportingTheArgument.length !== 0;
    }).length === providedArguments.length
  );
}

/**
 * Check if the provided arguments in valid format.
 * A valid argument is either a short flag (-a), a short assignment (-a=3), a long flag (--help), or a long assignment (--foo=bar).
 */
export function areValidArguments(providedArguments: string[]): boolean {
  return (
    providedArguments.filter(
      (arg) =>
        /^-\w$/.test(arg) ||
        /^-\w=(\/|[a-zA-Z]+|\d)+$/.test(arg) ||
        /^--\w\w+$/.test(arg) ||
        /^--\w\w+=("|')(\/|[a-zA-Z]+|\d|\s)+("|')$/.test(arg) ||
        /^--\w\w+=(\/|[a-zA-Z]+|\d|\s)+$/.test(arg)
    ).length === providedArguments.length
  );
}

/**
 * Parse CLI arguments to an object.
 * - Short flags: -a → { a: true }
 * - Long flags: --help → { help: true }
 * - Assignments: -a=3, --foo=bar → { a: 3, foo: "bar" }
 */
export function parseArgumentsToObject(
  args: string[]
): Record<string, boolean | number | string> {
  const result: Record<string, boolean | number | string> = {};
  for (const arg of args) {
    // --key=value or -k=value
    let match =
      arg.match(/^--([a-zA-Z][\w-]*)=(.+)$/) || arg.match(/^-([a-zA-Z])=(.+)$/);
    if (match) {
      let [, key, value] = match;
      // Remove quotes if present
      if (
        (value.startsWith("'") && value.endsWith("'")) ||
        (value.startsWith('"') && value.endsWith('"'))
      ) {
        value = value.slice(1, -1);
      }
      // Try to parse as number
      const num = Number(value);
      result[key] = isNaN(num) || value.trim() === "" ? value : num;
      continue;
    }
    // --key or -k (flag)
    match = arg.match(/^--([a-zA-Z][\w-]*)$/) || arg.match(/^-([a-zA-Z])$/);
    if (match) {
      const key = match[1];
      result[key] = true;
      continue;
    }
  }
  return result;
}
