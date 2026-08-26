import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const root = process.cwd();
const appChunks = join(root, ".next", "static", "chunks", "app");
const limits = {
  totalAppJavaScript: 400 * 1024,
  singleRouteChunk: 40 * 1024
};

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? filesBelow(path) : Promise.resolve([path]);
  }));
  return nested.flat();
}

let files;
try {
  files = (await filesBelow(appChunks)).filter((file) => file.endsWith(".js"));
} catch {
  console.error("Performance budget needs a production build. Run `npm run build` first.");
  process.exit(1);
}

const chunks = await Promise.all(files.map(async (file) => ({
  file: relative(root, file),
  bytes: (await stat(file)).size
})));
chunks.sort((a, b) => b.bytes - a.bytes);
const total = chunks.reduce((sum, chunk) => sum + chunk.bytes, 0);
const oversized = chunks.filter((chunk) => chunk.bytes > limits.singleRouteChunk);

console.log(`App route JavaScript: ${(total / 1024).toFixed(1)} KiB / ${(limits.totalAppJavaScript / 1024).toFixed(0)} KiB`);
console.table(chunks.slice(0, 10).map((chunk) => ({ chunk: chunk.file, KiB: (chunk.bytes / 1024).toFixed(1) })));

if (total > limits.totalAppJavaScript || oversized.length) {
  if (oversized.length) console.error(`Route chunks over 40 KiB: ${oversized.map((chunk) => chunk.file).join(", ")}`);
  process.exit(1);
}

console.log("Performance budget passed.");
