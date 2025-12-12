import fs from "node:fs";
import path from "node:path";

const outDir = process.argv[2];

if (!outDir) {
  console.error("Usage: node tools/write-cjs-packagejson.mjs <outDir>");
  process.exit(1);
}

const packageJsonPath = path.join(outDir, "package.json");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(packageJsonPath, JSON.stringify({ type: "commonjs" }, null, 2));
