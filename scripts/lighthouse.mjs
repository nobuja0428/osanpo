import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";
import { chromium } from "playwright";

const root = process.cwd();
const server = spawn(process.execPath, ["scripts/serve-static.mjs"], { cwd: root, stdio: "ignore" });
const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
let chrome;
try {
  await wait(800);
  const profileDirectory = join(root, ".lighthouse-profile");
  mkdirSync(profileDirectory, { recursive: true });
  chrome = await launch({ chromePath: chromium.executablePath(), userDataDir: profileDirectory, chromeFlags: ["--headless", "--no-sandbox"] });
  const results = {};
  for (const [name, path] of [["home", "/osanpo/"], ["course", "/osanpo/courses/koenji-first/"]]) {
    const run = await lighthouse(`http://127.0.0.1:4173${path}`, { port: chrome.port, onlyCategories: ["performance", "accessibility", "best-practices", "seo"], formFactor: "desktop", screenEmulation: { disabled: true } });
    results[name] = {
      scores: Object.fromEntries(Object.entries(run.lhr.categories).map(([key, value]) => [key, value.score])),
      lcp: run.lhr.audits["largest-contentful-paint"].numericValue,
      cls: run.lhr.audits["cumulative-layout-shift"].numericValue,
      inp: run.lhr.audits["interaction-to-next-paint"]?.numericValue ?? null,
      tbt: run.lhr.audits["total-blocking-time"].numericValue,
    };
  }
  mkdirSync(join(root, "reports"), { recursive: true });
  writeFileSync(join(root, "reports", "lighthouse.json"), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally {
  if (chrome) await chrome.kill();
  server.kill();
}
