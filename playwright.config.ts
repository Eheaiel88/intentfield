import { defineConfig } from "@playwright/test";
import { loadEnvFile } from "node:process";
loadEnvFile(".env.local");
process.env.CLERK_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 90000,
  expect: { timeout: 20000 },
  use: {
    baseURL: process.env.TEST_BASE_URL || "http://localhost:3000",
    headless: true,
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  reporter: "list",
});
