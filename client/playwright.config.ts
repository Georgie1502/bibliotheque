import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL: "http://localhost:4173",
    headless: true,
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: {
    command: "npm run dev -- --host --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 30_000
  }
});
