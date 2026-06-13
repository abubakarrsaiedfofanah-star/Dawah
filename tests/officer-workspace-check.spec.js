const { test, expect } = require('@playwright/test');

const base = 'https://umma-university-da-awah-team.web.app';
const email = process.env.OFFICER_TEST_EMAIL;
const password = process.env.OFFICER_TEST_PASSWORD;

test('active treasurer officer only sees finance workspace tools', async ({ page }) => {
  test.setTimeout(60000);
  test.skip(!email || !password, 'Set OFFICER_TEST_EMAIL and OFFICER_TEST_PASSWORD.');

  await page.goto(`${base}/officer.html`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#aiChatWidget')).toBeHidden();
  await page.fill('#officerLoginUsername', email);
  await page.fill('#officerLoginPassword', password);
  await page.click('#officerLoginButton');
  await page.waitForURL(/index\.html/, { timeout: 30000 });
  await expect(page.locator('#dashboardPage')).toHaveClass(/active/, { timeout: 30000 });
  await expect(page.locator('#aiChatWidget')).toBeVisible();

  await expect(page.locator('#dashboardRoleBadge')).toContainText(/Treasurer/i);
  await expect(page.locator('#roleQuickActions')).toContainText(/Dues/i);
  await expect(page.locator('#roleQuickActions')).toContainText(/Donations/i);
  await expect(page.locator('#roleQuickActions')).toContainText(/Reports/i);
  await expect(page.locator('.dashboard-report-btn:has-text("Dues")')).toBeVisible();
  await expect(page.locator('.dashboard-report-btn:has-text("Donations")')).toBeVisible();
  await expect(page.locator('.dashboard-report-btn:has-text("Students")')).toBeHidden();
  await expect(page.locator('.dashboard-report-btn:has-text("Officers")')).toBeHidden();

  await expect(page.locator('.role-tool-link[data-permission="manage_members"]')).toBeHidden();
  await expect(page.locator('.role-tool-link[data-permission="manage_events"]')).toBeHidden();
  await expect(page.locator('.role-tool-link[data-permission="manage_gallery"]')).toBeHidden();
  await expect(page.locator('.role-tool-link[data-permission="manage_contact"]')).toBeHidden();
  await expect(page.locator('.role-tool-link[data-permission="manage_hadiths"]')).toBeHidden();
});
