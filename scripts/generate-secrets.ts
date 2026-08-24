import { randomBytes } from "node:crypto";
import { chmod, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), ".env");
const names = ["AUTH_SECRET"] as const;

function generatedSecret() {
  return randomBytes(48).toString("base64url");
}

async function main() {
  let contents = await readFile(envPath, "utf8");
  const configured: string[] = [];

  for (const name of names) {
    const line = new RegExp(`^${name}=(.*)$`, "m");
    const match = contents.match(line);
    if (match?.[1]?.trim()) continue;

    const replacement = `${name}=${generatedSecret()}`;
    contents = match ? contents.replace(line, replacement) : `${contents.trimEnd()}\n${replacement}\n`;
    configured.push(name);
  }

  if (configured.length) {
    await writeFile(envPath, contents, { encoding: "utf8", mode: 0o600 });
    await chmod(envPath, 0o600);
    console.log(`Configured ${configured.join(" and ")} in .env (values hidden).`);
  } else {
    console.log("Authentication secrets are already configured; no changes made.");
  }
}

main().catch((error) => {
  console.error(`Secret generation failed: ${error instanceof Error ? error.message : "unknown error"}`);
  process.exitCode = 1;
});
