const { test, expect } = require('@playwright/test');

const roles = [
  'chairlady',
  'vice_chairlady_1',
  'vice_chairlady_2',
  'secretary',
  'vice_secretary',
  'treasurer',
  'vice_treasurer',
  'media',
  'organizer',
  'amir_director'
];

async function firstOption(page, selector) {
  await expect.poll(() => page.locator(`${selector} option`).evaluateAll(options =>
    options.map(option => option.value).filter(Boolean).length
  )).toBeGreaterThan(0);
  const value = await page.locator(`${selector} option`).evaluateAll(options =>
    options.map(option => option.value).find(Boolean)
  );
  await page.selectOption(selector, value);
}

test('all officer roles register, require approval, and open their workspace', async ({ page }) => {
  test.setTimeout(180000);
  const stamp = Date.now();
  const password = `OfficerAudit${stamp}!`;
  const officers = roles.map((role, index) => ({
    role,
    name: `Audit ${role.replaceAll('_', ' ')}`,
    id: `OFF/2026/${String(stamp).slice(-5)}${index}`,
    email: `audit.${role}.${stamp}@example.invalid`,
    phone: `2547${String(stamp).slice(-7)}${index}`,
    password
  }));

  for (const officer of officers) {
    await page.goto('/officer.html', { waitUntil: 'domcontentloaded' });
    await page.click('#officerRegisterTabBtn');
    await page.fill('#officerFullName', officer.name);
    await page.fill('#officerId', officer.id);
    await page.fill('#officerEmail', officer.email);
    await page.fill('#officerPhone', officer.phone);
    await page.selectOption('#officerRole', officer.role);
    await firstOption(page, '#officerGender');
    await firstOption(page, '#officerSchool');
    await firstOption(page, '#officerCourse');
    await firstOption(page, '#officerYear');
    await firstOption(page, '#officerSemester');
    await page.fill('#officerPassword', officer.password);
    await page.fill('#officerConfirmPassword', officer.password);
    await page.click('#officerRegisterButton');
    await expect(page.locator('#officerAlert')).toContainText(/submitted|approve/i);

    await page.fill('#officerLoginUsername', officer.email);
    await page.fill('#officerLoginPassword', officer.password);
    await page.click('#officerLoginButton');
    await expect(page.locator('#officerAlert')).toContainText(/waiting.*approval/i);
  }

  await page.goto('/admin.html', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => bootstrap.Tab.getOrCreateInstance(document.getElementById('adminRegisterTabBtn')).show());
  await page.fill('#adminRegisterUsername', `role-audit-admin-${stamp}`);
  await page.fill('#adminRegisterEmail', `role.audit.admin.${stamp}@example.invalid`);
  await page.fill('#adminRegisterPassword', `RoleAuditAdmin${stamp}!Aa`);
  await page.fill('#adminRegisterConfirmPassword', `RoleAuditAdmin${stamp}!Aa`);
  await page.click('#adminRegisterButton');
  await expect(page.locator('#adminContainer')).not.toHaveClass(/locked/);

  const approvalResults = await page.evaluate(async emails => {
    const members = JSON.parse(localStorage.getItem('allMembers') || '[]');
    const identity = member => member.uid || member.authUid || member.supabaseId
      || member.dbUserId || member.user_id || member.id || member.studentId || member.username;
    const results = [];
    for (const email of emails) {
      const member = members.find(row => row.email === email);
      results.push(await window.handleStaticAdminApi('approveRoleRequest', 'POST', {
        user_id: identity(member)
      }));
    }
    return results;
  }, officers.map(officer => officer.email));
  expect(approvalResults.every(result => result.success)).toBe(true);

  for (const officer of officers) {
    await page.goto('/officer.html', { waitUntil: 'domcontentloaded' });
    await page.fill('#officerLoginUsername', officer.email);
    await page.fill('#officerLoginPassword', officer.password);
    await page.click('#officerLoginButton');
    await page.waitForURL(/index\.html/);
    await expect(page.locator('#dashboardPage')).toHaveClass(/active/);
    await expect.poll(() => page.evaluate(() =>
      JSON.parse(localStorage.getItem('currentUser') || '{}').role
    )).toBe(officer.role);
    await expect(page.locator('#dashboardRoleBadge')).toContainText(new RegExp(officer.role.split('_')[0], 'i'));
    await page.evaluate(() => {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentRole');
    });
  }
});
