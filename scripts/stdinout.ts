/*
 *  Write a message to stdout asynchronously
 *  ```
 *  const asyncMessage = new TextEncoder().encode("This is an async message.\n");
 *  await Deno.stdout.write(asyncMessage);
 *  ```
 *
 *  Check if stdout is a terminal
 *  ```
 *  if (Deno.stdout.isTerminal()) {
 *      console.log("stdout is a terminal");
 *  } else {
 *      console.log("stdout is not a terminal");
 *  }
 *  ```
 *
 *  Use the WritableStream interface of Deno.stdout
 *  ```
 *  const writer = Deno.stdout.writable.getWriter();
 *  await writer.write(new TextEncoder().encode("This is written using WritableStream.\n"));
 *  writer.releaseLock();
 *  ```
 *
 *  Close stdout (usually not recommended unless required)
 *  ```
 *  Deno.stdout.close();
 *  ```
 */

export function getHelpText() {
  return `
'stdinout' command is POC of the command processing the bash pipes.
It prints all provided arguments.
If not used with pipes, it exits.

Options:
  -a    If provided, it will print the "Argument '-a' is provided"

Examples:
  ls -la | stdinout | grep ODD
  stdinout -a -b --option=123
  ls -la | stdinout > output.log 2> error.log
  ls -la | stdinout 2>&1 | grep ODD
  `;
}

export function main() {
  if (Array.from(arguments).find((arg) => arg === "-a")) {
    console.log("Argument '-a' is provided.");
  }

  // Use a pipe (|) or input redirection (<) to make `Deno.stdin.isTerminal()` return false.
  if (Deno.stdin.isTerminal()) {
    console.log("No pipe detected. Exiting or handling interactively.");
  } else {
    const buf = new Uint8Array(2 ** 16); // 64 kB capacity
    const _numberOfBytesRead = Deno.stdin.readSync(buf);
    const text = new TextDecoder().decode(buf);

    const syncMessage = new TextEncoder().encode(
      text
        .split("\n")
        .map((line, lineI) =>
          lineI % 2 === 0 ? `EVEN: ${line}` : `ODD: ${line}`
        )
        .join("\n")
    );
    Deno.stdout.writeSync(syncMessage);
  }
}
