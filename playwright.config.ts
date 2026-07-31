import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  forbidOnly: Boolean(process.env.CI),
  use: {
    baseURL: "http://127.0.0.1:4173/osanpo/",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", testIgnore: /.*\.a11y\.spec\.ts/ },
    { name: "a11y", testMatch: /.*\.a11y\.spec\.ts/ },
  ],
  webServer: {
    command: "node scripts/serve-static.mjs",
    url: "http://127.0.0.1:4173/osanpo/",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
