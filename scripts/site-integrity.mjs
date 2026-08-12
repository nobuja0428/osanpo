import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative, resolve, sep } from "node:path";

const outputRoot = resolve("out");
const basePath = "/osanpo";
const publicOrigin = "https://nobuja0428.github.io/osanpo/";
const failures = [];
const checkedReferences = new Set();

function walk(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function fail(message) {
  failures.push(message);
}

function localTargetExists(rawReference) {
  const clean = rawReference.split("#")[0].split("?")[0];
  if (!clean.startsWith(basePath)) return false;
  const withoutBase = clean.slice(basePath.length).replace(/^\/+/, "");
  const target = resolve(outputRoot, withoutBase);
  if (!target.startsWith(`${outputRoot}${sep}`) && target !== outputRoot) return false;
  if (existsSync(target) && statSync(target).isFile()) return true;
  if (existsSync(join(target, "index.html"))) return true;
  if (!extname(target) && existsSync(`${target}.html`)) return true;
  return false;
}

if (!existsSync(outputRoot)) {
  throw new Error("out/ がありません。先に npm run build を実行してください。");
}

const files = walk(outputRoot);
const htmlFiles = files.filter((file) => file.endsWith(".html"));

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const displayPath = relative(outputRoot, file).replaceAll("\\", "/");
  if (!["404.html", "404/index.html", "_not-found/index.html"].includes(displayPath)) {
    const canonicalMatches = [...html.matchAll(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/gi)];
    if (canonicalMatches.length !== 1) fail(`${displayPath}: canonical が1件ではありません (${canonicalMatches.length})`);
    else if (!canonicalMatches[0][1].startsWith(publicOrigin)) fail(`${displayPath}: canonical が正式URLではありません`);
  }

  const references = [...html.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)].map((match) => match[1]);
  for (const reference of references) {
    if (!reference.startsWith(basePath) || checkedReferences.has(reference)) continue;
    checkedReferences.add(reference);
    if (!localTargetExists(reference)) fail(`${displayPath}: 参照先がありません ${reference}`);
  }
}

for (const required of ["sitemap.xml", "robots.txt", "404.html"]) {
  if (!existsSync(join(outputRoot, required))) fail(`${required} がありません`);
}

for (const required of ["sitemap.xml", "robots.txt"]) {
  const path = join(outputRoot, required);
  if (existsSync(path) && !readFileSync(path, "utf8").includes(publicOrigin)) fail(`${required}: 正式URLがありません`);
}

const searchableFiles = files.filter((file) => [".html", ".js", ".css", ".xml", ".txt"].includes(extname(file)));
const forbiddenPatterns = [
  [/localhost(?::\d+)?/i, "localhost 固定URL", false],
  [/C:\\Users\\/i, "Windows 絶対パス", true],
  [/\/shinosanpo\//i, "旧 basePath", true],
  [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/, "秘密鍵", true],
];
for (const file of searchableFiles) {
  const content = readFileSync(file, "utf8");
  for (const [pattern, label, inspectGeneratedJavaScript] of forbiddenPatterns) {
    if (extname(file) === ".js" && !inspectGeneratedJavaScript) continue;
    if (pattern.test(content)) fail(`${relative(outputRoot, file)}: ${label} を検出しました`);
  }
}

if (failures.length) {
  console.error(`Site integrity check failed (${failures.length})`);
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Site integrity check passed: ${htmlFiles.length} HTML / ${checkedReferences.size} internal references / canonical, sitemap, robots, 404 verified.`);
