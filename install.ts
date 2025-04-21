// Deno install script for managing CLI symlinks/executables
// This script scans the scripts/ folder and ensures each script has a corresponding executable in the CLI folder.
// It removes all shelly executables and recreates valid ones.

const SCRIPTS_DIR = new URL("./scripts/", import.meta.url).pathname;
const CLI_DIR = `${Deno.env.get("HOME")}/cli`;
const TEMPLATE_PATH = new URL("./assets/install/template.sh", import.meta.url)
  .pathname;

async function ensureCliDir() {
  try {
    await Deno.mkdir(CLI_DIR, { recursive: true });
  } catch (_) {
    // empty block
  }
}

async function getScriptNames(): Promise<string[]> {
  const scripts: string[] = [];
  for await (const entry of Deno.readDir(SCRIPTS_DIR)) {
    if (entry.isFile && entry.name.endsWith(".ts")) {
      scripts.push(entry.name.replace(/\.ts$/, ""));
    }
  }
  return scripts;
}

async function getCliShellyExecutables(): Promise<string[]> {
  const executables: string[] = [];
  try {
    for await (const entry of Deno.readDir(CLI_DIR)) {
      if (entry.isFile) {
        const cliShellyScript = new TextDecoder().decode(
          await Deno.readFile(`${CLI_DIR}/${entry.name}`)
        );
        if (
          cliShellyScript.startsWith("#!/bin/bash") &&
          cliShellyScript.includes("# (shelly script)")
        ) {
          executables.push(entry.name);
        }
      }
    }
  } catch (_) {
    // empty block
  }
  return executables;
}

async function createExecutable(scriptName: string) {
  const targetPath = `${CLI_DIR}/${scriptName}`;
  // Copy template.sh
  const template = await Deno.readTextFile(TEMPLATE_PATH);
  const content = template.replace(/PROJECT_PATH/g, Deno.cwd());
  await Deno.writeTextFile(targetPath, content, { create: true });
  await Deno.chmod(targetPath, 0o755);
}

async function removeExecutable(scriptName: string) {
  const targetPath = `${CLI_DIR}/${scriptName}`;

  try {
    await Deno.remove(targetPath);
  } catch (_) {
    // empty block
  }
}

async function syncCliReferences() {
  await ensureCliDir();
  const scripts = await getScriptNames();
  const cliShellyExecutables = await getCliShellyExecutables();

  // Remove all shelly executables
  for (const executable of cliShellyExecutables) {
    await removeExecutable(executable);
  }

  // Recreate shelly executables
  for (const scriptName of scripts) {
    await createExecutable(scriptName);
  }

  console.log(`Shelly scripts: '${scripts.join("', '")}'`);
  console.log(`Executables synchronized in '${CLI_DIR}'`);
}

if (import.meta.main) {
  await syncCliReferences();
}
