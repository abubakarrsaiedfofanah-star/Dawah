const { test, expect } = require('@playwright/test');

const pages = [
  { path: '/index.html', title: /Da'awah|Dawa/i, marker: '#landingPage' },
  { path: '/officer.html', title: /Officer|Da'awah|Dawa/i, marker: 'body' },
  { path: '/admin.html', title: /Admin|Da'awah|Dawa/i, marker: '#adminLoginScreen' },
  { path: '/verify-member.html', title: /Verify Member/i, marker: '#memberVerifyForm', minTextLength: 60 },
  { path: '/verify-receipt.html', title: /Verify Receipt/i, marker: '#receiptVerifyForm', minTextLength: 60 }
];

test.describe('visual smoke', () => {
  for (const pageInfo of pages) {
    test(`${pageInfo.path} renders without broken layout`, async ({ page }, testInfo) => {
      const pageErrors = [];
      page.on('pageerror', error => pageErrors.push(error.message));
      await page.goto(pageInfo.path, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveTitle(pageInfo.title);
      await expect(page.locator(pageInfo.marker)).toBeVisible();
      expect(pageErrors).toEqual([]);

      const bodyBox = await page.evaluate(() => {
        const rect = document.body.getBoundingClientRect();
        return { width: rect.width, height: rect.height };
      });
      expect(bodyBox.width).toBeGreaterThan(300);
      expect(bodyBox.height).toBeGreaterThan(300);

      const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 4);
      expect(horizontalOverflow).toBeFalsy();

      const visibleText = await page.locator('body').innerText();
      expect(visibleText.trim().length).toBeGreaterThan(pageInfo.minTextLength || 100);

      await page.screenshot({
        path: `test-results/screenshots/${testInfo.project.name}-${pageInfo.path.replace(/[^a-z0-9]/gi, '-')}.png`,
        fullPage: true
      });
    });
  }

  test('/index.html recovers from corrupted browser storage', async ({ page }) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.addInitScript(() => {
      for (const key of [
        'currentUser',
        'registeredEvents',
        'welfareRequests',
        'donations',
        'payments',
        'leadershipRoles',
        'allMembers',
        'allEvents',
        'siteSettings'
      ]) {
        localStorage.setItem(key, '{bad json');
      }
    });

    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/Da'awah|Dawa/i);
    await expect(page.locator('#landingPage')).toBeVisible();
    await expect(page.locator('body')).toContainText(/UMMA University/i);
    expect(pageErrors).toEqual([]);
  });

  test('/index.html contact phone and email are clickable', async ({ page }) => {
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('#publicContactPhone')).toHaveAttribute('href', 'tel:+23231422167');
    await expect(page.locator('#footerContactPhone')).toHaveAttribute('href', 'tel:+23231422167');
    await expect(page.locator('#publicContactEmail')).toHaveAttribute('href', 'mailto:info@dawaah.org');
    await expect(page.locator('#footerContactEmail')).toHaveAttribute('href', 'mailto:info@dawaah.org');
  });
});
