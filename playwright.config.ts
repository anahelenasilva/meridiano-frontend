import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:8080",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"], storageState: "e2e/.auth/user.json" },
      dependencies: ["setup"],
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"], storageState: "e2e/.auth/user.json" },
      dependencies: ["setup"],
    },
  ],
  webServer: [
    {
      command: "pnpm dev",
      port: 8080,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: "cd ../meridiano-nestjs && pnpm start:dev",
      port: 3005,
      timeout: 120 * 1000,
      reuseExistingServer: false
    },
  ],
});
