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

async function auditPage(url) {
  const run = await lighthouse(url, { port: chrome.port, onlyCategories: ["performance", "accessibility", "best-practices", "seo"], formFactor: "desktop", screenEmulation: { disabled: true } });
  return {
    scores: Object.fromEntries(Object.entries(run.lhr.categories).map(([key, value]) => [key, value.score])),
    lcp: run.lhr.audits["largest-contentful-paint"].numericValue,
    cls: run.lhr.audits["cumulative-layout-shift"].numericValue,
    inp: run.lhr.audits["interaction-to-next-paint"]?.numericValue ?? null,
    tbt: run.lhr.audits["total-blocking-time"].numericValue,
    diagnostics: {
      lcpElement: run.lhr.audits["largest-contentful-paint-element"]?.details?.items ?? [],
      resourceSummary: run.lhr.audits["resource-summary"]?.details?.items ?? [],
      renderBlocking: run.lhr.audits["render-blocking-resources"]?.details?.items ?? [],
      imageOptimization: run.lhr.audits["uses-optimized-images"]?.details?.items ?? [],
      responsiveImages: run.lhr.audits["uses-responsive-images"]?.details?.items ?? [],
      thirdParties: run.lhr.audits["third-party-summary"]?.details?.items ?? [],
    },
  };
}

function medianByLcp(samples) {
  const ordered = [...samples].sort((a, b) => a.lcp - b.lcp);
  const median = ordered[Math.floor(ordered.length / 2)];
  return { ...median, samples: samples.map(({ lcp, cls, scores }) => ({ lcp, cls, scores })) };
}
try {
  await wait(800);
  const profileDirectory = join(root, ".lighthouse-profile");
  mkdirSync(profileDirectory, { recursive: true });
  chrome = await launch({ chromePath: chromium.executablePath(), userDataDir: profileDirectory, chromeFlags: ["--headless", "--no-sandbox"] });
  const homeSamples = [];
  for (let run = 0; run < 3; run += 1) homeSamples.push(await auditPage("http://127.0.0.1:4173/osanpo/"));
  const results = {
    home: medianByLcp(homeSamples),
    business: await auditPage("http://127.0.0.1:4173/osanpo/business/"),
  };
  mkdirSync(join(root, "reports"), { recursive: true });
  writeFileSync(join(root, "reports", "lighthouse.json"), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  const scorePass = [results.home, results.business].every((result) => result.scores.accessibility >= 0.95 && result.scores["best-practices"] >= 0.9 && result.scores.seo >= 0.9 && result.cls <= 0.1);
  if (!scorePass || results.home.lcp > 8000) throw new Error("Lighthouse release thresholds were not met.");
} finally {
  if (chrome) {
    if (process.platform === "win32" && chrome.process && chrome.process.exitCode === null) {
      chrome.process.kill();
      await Promise.race([new Promise((resolve) => chrome.process.once("exit", resolve)), wait(3000)]);
    } else chrome.kill();
  }
  server.kill();
}
