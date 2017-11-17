#!/usr/bin/env node

import noderaider from "./";

interface CliDefinition extends CommandDefinition {
  update: CommandDefinition;
  start: CommandDefinition;
  build: CommandDefinition;
  test: CommandDefinition;
  release: CommandDefinition;
}
interface CommandDefinition extends Descriptor {
  flags?: FlagDefinition[];
}
interface FlagDefinition extends Flag, Descriptor {}
interface Flag {
  name: string;
  alias?: string;
}
interface Descriptor {
  desc: string;
}

const definition: CliDefinition = {
  desc: "automates development and release of noderaider packages",
  flags: [ { name: "help", alias: "h", desc: "display this help text" } ],
  update: {
    desc: "update and reinstall latest dependencies"
  },
  start: {
    desc: "start noderaider repos in development mode (watch / HMR)"
  },
  build: {
    desc: "build noderaider repos for production"
  },
  test: {
    desc: "test all the packages"
  },
  release: {
    desc: "publish a new version of everything",
    flags: [ { name: "next", desc: "target the next version" } ]
  }
};

const commandNames = Object.keys(definition).filter(x => x !== "flags" && x !== "desc");
const flagDefinitions = commandNames.reduce((_, commandName) => {
  const commandFlags: FlagDefinition[] = definition[commandName].flags;
  return commandFlags ? [ ..._, ...commandFlags ] : _;
}, definition.flags || []);

let dashdash = false;
let command = null;
let error = null;
let flags: FlagDefinition[] = [];

const args = process.argv.slice(2).filter(arg => {
  if (dashdash || error) {
    return !!arg;
  } else if (arg === "--") {
    dashdash = true;
    return false;
  } else if (arg.startsWith("-")) {
    let flagDefinition: FlagDefinition = null;
    if (!arg.startsWith("--")) {
      const alias = arg.replace("-", "");
      flagDefinition = flagDefinitions.filter(x => x.alias === alias)[0];
    } else {
      const flagName = arg.replace("--", "");
      flagDefinition = flagDefinitions.filter(x => x.name === flagName)[0];
    }
    if (flagDefinition) {
      flags.push(flagDefinition);
    } else {
      error = `Unknown flag or alias: ${arg}`;
    }
    return false;
  } else {
    return !!arg;
  }
});

const help = flags.some(x => x.name === "help");

if (args.length !== 1) {
  error = `expected one of the following commands: ${JSON.stringify(commandNames)}, received: ${JSON.stringify(args)}`;
}

const log = help ? console.log : console.error;

function logCommand(command: CommandDefinition, space: string) {
  log(`${space}${command.desc}`);
  for (const flag of command.flags) {
    log(`${space}  ${formatFlag(flag)}`);
  }
}

function formatFlag(flag: FlagDefinition) {
  const delimited = [];
  if (flag.alias) {
    delimited.push(`-${flag.alias}`);
  }
  delimited.push(`--${flag.name}`);
  return `${delimited.join(", ")}    ${flag.desc}`;
}

if (help || args.length > 1 || flags.length > 1 || error) {
  // If they didn't ask for help, then this is not a "success"
  log(`Usage: ${process.argv[0]} <command> [<path>]`);
  log("");
  log(`  ${definition.desc}`);
  log("");
  if (error) {
    log("  " + error);
    log("");
  }
  log("Commands:");
  log("");
  for (const commandName of commandNames) {
    log(`  ${commandName}`);
    logCommand(definition[commandName], "    ");
  }
  log("Flags:");
  log("");
  if (definition.flags) {
    for (const flag of definition.flags) {
      log(`  ${formatFlag(flag)}`);
    }
  }
  process.exit(help ? 0 : 1);
} else
  go(args[0] || ".");

function go (dir) {
  const command = args[0];
  let exec = noderaider[command];
  let results = exec(dir);
  for (let i = 0; i < results.length; i++) {
      console.log(results[i]);
  }
}