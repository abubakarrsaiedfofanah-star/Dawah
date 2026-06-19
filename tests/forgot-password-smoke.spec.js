const { test, expect } = require('@playwright/test');

const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:8000';
const adminEmail = process.env.DAWAAH_ADMIN_EMAIL || 'abubakarrsaiedfofanah@gmail.com';

test('admin forgot password sends Supabase reset email without changing password', async ({ page }) => {
  test.setTimeout(60000);
  await page.goto(`${base}/admin.html`, { waitUntil: 'domcontentloaded' });
  await page.click('#adminForgotTabBtn');
  await page.fill('#adminForgotEmail', adminEmail);
  await page.click('#adminForgotButton');
  await expect(page.locator('body')).toContainText(/Password reset email sent|reset code was sent/i, { timeout: 30000 });
});

test('student and officer forgot password controls are available', async ({ page }) => {
  await page.goto(`${base}/index.html`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.activateAuthTab && window.bootstrap && document.getElementById('loginPage'));
  await page.evaluate(() => window.activateAuthTab('login'));
  await page.waitForFunction(() =>
    document.getElementById('loginPage')?.classList.contains('active') &&
    document.getElementById('loginTab')?.classList.contains('active')
  );
  await page.evaluate(() => window.showForgotPassword());
  await expect(page.locator('#forgotPasswordModal')).toBeVisible();
  await expect(page.locator('#forgotEmail')).toBeVisible();

  await page.goto(`${base}/officer.html`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#officerForgotTabBtn')).toBeVisible();
  await page.click('#officerForgotTabBtn');
  await expect(page.locator('#officerForgotEmail')).toBeVisible();
  await expect(page.locator('#officerForgotButton')).toBeVisible();
});
