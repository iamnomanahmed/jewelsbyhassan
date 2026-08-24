import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const command = process.argv[2];
const allowed = new Set(["generate", "migrate", "push"]);
if (!command || !allowed.has(command)) {
  console.error("Usage: node scripts/run-drizzle.mjs <generate|migrate|push>");
  process.exit(1);
}

const projectRoot = process.cwd();
const toolingRoot = resolve(projectRoot, "tools/drizzle");
const executable = resolve(toolingRoot, "node_modules/.bin/drizzle-kit");

if (!existsSync(executable)) {
  console.log("Installing pinned Drizzle migration tooling outside the application dependency graph…");
  const install = spawnSync("npm", ["install", "--prefix", toolingRoot, "--no-audit", "--no-fund"], { cwd: projectRoot, stdio: "inherit" });
  if (install.status !== 0) process.exit(install.status ?? 1);
}

const result = spawnSync(executable, [command, "--config", resolve(projectRoot, "drizzle.config.ts")], { cwd: projectRoot, stdio: "inherit", env: process.env });
process.exit(result.status ?? 1);
