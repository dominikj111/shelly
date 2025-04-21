import { areArgumentsSupported, areValidArguments } from "./utils/common.ts";

const [scriptName, ...scriptArguments] = Deno.args;

const doHelpAndExit = Deno.args.find((arg) => ["-h", "--help"].includes(arg));
const invalidArgumentsProvided = !areValidArguments(scriptArguments);

const scriptFound =
  Array.from(Deno.readDirSync("./scripts")).find(
    (de) => de.name === `${scriptName}.ts`
  ) !== undefined;

// const currentBashPath = Deno.cwd();
// const currentModulePath = Deno.mainModule;
// console.log(Deno.realPathSync("../shelly-bunny"))

// Learn more at https://docs.deno.com/runtime/manual/examples/module_metadata#concepts
if (import.meta.main) {
  if (!scriptFound) {
    throw `Script ${scriptName} not found!`;
  }

  const module = await import(`./scripts/${scriptName}.ts`);

  if (doHelpAndExit) {
    console.log(module.getHelpText());
    Deno.exit(0);
  }

  if (invalidArgumentsProvided) {
    console.log(module.getHelpText());
    throw "Invalid arguments where provided!";
  }

  if (!areArgumentsSupported(scriptArguments, module.getHelpText())) {
    console.log(module.getHelpText());
    throw "Unsupported arguments where provided!";
  }

  module.main(...scriptArguments);
}
