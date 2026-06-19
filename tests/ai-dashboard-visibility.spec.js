const { test, expect } = require('@playwright/test');

const base = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:8000';

test.describe('Research AI dashboard visibility', () => {
  test('Research AI is hidden on public login pages', async ({ page }) => {
    for (const path of ['/', '/admin.html', '/officer.html']) {
      await page.goto(`${base}${path}`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('#aiChatWidget')).toBeHidden();
    }
  });

  test('Research AI appears inside the logged-in student dashboard', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('currentRole', 'student');
      localStorage.setItem('currentUser', JSON.stringify({
        email: 'student.visibility@localhost',
        username: 'student.visibility@localhost',
        studentId: 'VISIBILITY/STUDENT',
        fullName: 'Student Visibility Check',
        role: 'student',
        status: 'Active'
      }));
    });

    await page.goto(`${base}/index.html?dashboard=1`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('#dashboardPage')).toHaveClass(/active/, { timeout: 30000 });
    await expect(page.locator('#aiChatWidget')).toBeVisible();
  });
});
