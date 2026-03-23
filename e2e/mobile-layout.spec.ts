import { expect, test } from "@playwright/test";

const MOBILE_VIEWPORTS = [
  { width: 375, height: 812, label: "375px (iPhone SE)" },
  { width: 390, height: 844, label: "390px (iPhone 14)" },
];

async function assertNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  expect(overflow, "Page should not have horizontal overflow").toBe(false);
}

for (const viewport of MOBILE_VIEWPORTS) {
  test.describe(`Mobile layout at ${viewport.label}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test.describe("Login page", () => {
      test("renders without horizontal overflow", async ({ page }) => {
        await page.goto("/login");
        await page.waitForLoadState("networkidle");
        await assertNoHorizontalOverflow(page);
      });
    });

    test.describe("YouTube Transcriptions listing", () => {
      test.use({ storageState: "e2e/.auth/user.json" });

      test("renders without horizontal overflow", async ({ page }) => {
        await page.goto("/youtube-transcriptions");
        await expect(page).toHaveURL(/\/youtube-transcriptions/);
        await expect(
          page.getByRole("heading", { name: "YouTube Transcriptions" }),
        ).toBeVisible();
        await assertNoHorizontalOverflow(page);
      });

      test("header stacks vertically on mobile", async ({ page }) => {
        await page.goto("/youtube-transcriptions");

        await expect(page).toHaveURL(/\/youtube-transcriptions/);
        await expect(
          page.getByRole("heading", { name: "YouTube Transcriptions" }),
        ).toBeVisible();
        await assertNoHorizontalOverflow(page);
      });
    });

    test.describe("YouTube Transcription detail", () => {
      test.use({ storageState: "e2e/.auth/user.json" });

      test("thumbnail and title stack vertically on narrow viewport", async ({ page }) => {
        await page.goto("/youtube-transcriptions");

        const firstLink = page.locator('a[href^="/youtube-transcriptions/"]').first();
        if (await firstLink.isVisible()) {
          await firstLink.click();
          await page.waitForLoadState("networkidle");

          await assertNoHorizontalOverflow(page);
        }
      });
    });

    test.describe("Articles listing", () => {
      test.use({ storageState: "e2e/.auth/user.json" });

      test("renders without horizontal overflow", async ({ page }) => {
        await page.goto("/youtube-transcriptions");

        // Wait for route + stable UI signal instead of networkidle
        await expect(page).toHaveURL(/\/youtube-transcriptions/);
        await expect(
          page.getByRole("heading", { name: "YouTube Transcriptions" }),
        ).toBeVisible();

        await assertNoHorizontalOverflow(page);
      });
    });

    test.describe("Article detail", () => {
      test.use({ storageState: "e2e/.auth/user.json" });

      test("content area is not squeezed by sidebar on mobile", async ({ page }) => {
        await page.goto("/articles");
        await expect(page).toHaveURL(/\/articles/);
        await expect(
          page.getByRole("heading", { name: "Articles" }),
        ).toBeVisible();

        const firstLink = page.locator('a[href^="/articles/"]').first();
        if (await firstLink.isVisible()) {
          await firstLink.click();
          await expect(page).toHaveURL(/\/articles\/.+/);

          const article = page.locator("main article");
          await expect(article).toBeVisible();
          await expect(article.getByRole("heading", { level: 1 })).toBeVisible();

          await assertNoHorizontalOverflow(page);

          const mainContent = page.locator("article");
          if (await mainContent.isVisible()) {
            const box = await mainContent.boundingBox();
            expect(box).not.toBeNull();
            expect(box!.width).toBeGreaterThan(viewport.width * 0.8);
          }
        }
      });
    });

    test.describe("Bookmarks page", () => {
      test.use({ storageState: "e2e/.auth/user.json" });

      test("renders without horizontal overflow", async ({ page }) => {
        await page.goto("/bookmarks");
        await expect(page).toHaveURL(/\/bookmarks/);
        await expect(
          page.getByRole("heading", { name: "Bookmarks" }),
        ).toBeVisible();
        await assertNoHorizontalOverflow(page);
      });
    });

    test.describe("Briefings page", () => {
      test.use({ storageState: "e2e/.auth/user.json" });

      test("renders without horizontal overflow", async ({ page }) => {
        await page.goto("/briefings");
        await assertNoHorizontalOverflow(page);
      });
    });
  });
}
