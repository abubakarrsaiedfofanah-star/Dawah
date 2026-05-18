const { test, expect } = require('@playwright/test');

const pages = [
  { path: '/index.html', title: /Dawa/i, marker: '#landingPage' },
  { path: '/officer.html', title: /Officer|Dawa/i, marker: 'body' },
  { path: '/admin.html', title: /Admin|Dawa/i, marker: '#adminLoginScreen' }
];

test.describe('visual smoke', () => {
  for (const pageInfo of pages) {
    test(`${pageInfo.path} renders without broken layout`, async ({ page }, testInfo) => {
      await page.goto(pageInfo.path, { waitUntil: 'networkidle' });
      await expect(page).toHaveTitle(pageInfo.title);
      await expect(page.locator(pageInfo.marker)).toBeVisible();

      const bodyBox = await page.locator('body').boundingBox();
      expect(bodyBox.width).toBeGreaterThan(300);
      expect(bodyBox.height).toBeGreaterThan(300);

      const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 4);
      expect(horizontalOverflow).toBeFalsy();

      const visibleText = await page.locator('body').innerText();
      expect(visibleText.trim().length).toBeGreaterThan(100);

      await page.screenshot({
        path: `test-results/screenshots/${testInfo.project.name}-${pageInfo.path.replace(/[^a-z0-9]/gi, '-')}.png`,
        fullPage: true
      });
    });
  }
});
