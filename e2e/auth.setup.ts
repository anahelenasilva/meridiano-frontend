import { expect, test as setup } from "@playwright/test";
import { config as loadEnv } from "dotenv";

loadEnv({ path: ".env.test" });

setup("authenticate", async ({ page }) => {
  const username = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  if (!username || !password) {
    throw new Error("Missing E2E_USERNAME or E2E_PASSWORD in env or .env.test");
  }

  await page.goto("/login");
  await page.getByRole("textbox", { name: "Username" }).fill(username);
  await page.getByRole("textbox", { name: "Password" }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page.getByText("Invalid email or password")).toHaveCount(0);
  // await expect(page.locator("nav")).toBeVisible();

  await page.goto("/youtube-transcriptions");
  await expect(page).toHaveURL(/\/youtube-transcriptions/);
  await page.context().storageState({ path: "e2e/.auth/user.json" });
});
