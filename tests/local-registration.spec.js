const { test, expect } = require('@playwright/test');

async function fillFirstSelectValue(page, selector) {
  await expect(page.locator(selector)).toBeVisible({ timeout: 15000 });
  const values = await page.locator(`${selector} option`).evaluateAll(options =>
    options.map(option => option.value).filter(Boolean)
  );
  expect(values.length).toBeGreaterThan(0);
  await page.selectOption(selector, values[0]);
}

async function activateStudentRegisterTab(page) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForFunction(() => typeof window.activateAuthTab === 'function' && window.bootstrap);
      await page.evaluate(() => window.activateAuthTab('register'));
      await page.waitForFunction(() =>
        document.getElementById('loginPage')?.classList.contains('active') &&
        document.getElementById('registerTab')?.classList.contains('active')
      );
      await expect(page.locator('#fullName')).toBeVisible({ timeout: 15000 });
      return;
    } catch (error) {
      if (!/Execution context was destroyed|navigation/i.test(String(error))) throw error;
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(500);
    }
  }
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForFunction(() => typeof window.activateAuthTab === 'function' && window.bootstrap);
  await page.evaluate(() => window.activateAuthTab('register'));
  await page.waitForFunction(() =>
    document.getElementById('loginPage')?.classList.contains('active') &&
    document.getElementById('registerTab')?.classList.contains('active')
  );
}

test.describe('local registration flows', () => {
  test('student registration saves a local student account', async ({ page }) => {
    const stamp = Date.now();
    const student = {
      name: `Validation Student ${stamp}`,
      id: `BSCS/2026/${String(stamp).slice(-5)}`,
      email: `validation.student.${stamp}@example.invalid`,
      phone: `254700${String(stamp).slice(-6)}`,
      password: `Student${stamp}!`
    };

    page.on('dialog', dialog => dialog.accept());
    await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
    await activateStudentRegisterTab(page);

    await page.fill('#fullName', student.name);
    await page.fill('#studentId', student.id);
    await fillFirstSelectValue(page, '#school');
    await page.evaluate(() => window.renderCourseOptions?.('course', document.getElementById('school').value));
    await fillFirstSelectValue(page, '#course');
    await fillFirstSelectValue(page, '#yearOfStudy');
    await page.evaluate(() => window.updateSemesterAvailability?.('yearOfStudy', 'semester'));
    await fillFirstSelectValue(page, '#semester');
    await fillFirstSelectValue(page, '#gender');
    await page.fill('#phone', student.phone);
    await page.fill('#email', student.email);
    await page.fill('#nationality', 'Kenyan');
    await page.fill('#homeAddress', 'Local test address');
    await page.fill('#emergencyContact', 'Guardian');
    await page.fill('#localGuardian', 'Local Guardian');
    await page.fill('#regPassword', student.password);
    await page.fill('#confirmPassword', student.password);

    await expect.poll(() => page.evaluate(() => document.getElementById('registrationForm').checkValidity())).toBe(true);
    await page.evaluate(() => document.getElementById('registrationForm').requestSubmit());
    await expect.poll(() => page.evaluate(email => {
      const members = JSON.parse(localStorage.getItem('allMembers') || '[]');
      return members.some(member => member.email === email && member.role === 'student');
    }, student.email)).toBe(true);
  });

  test('officer registration saves a pending local officer account', async ({ page }) => {
    const stamp = Date.now();
    const officer = {
      name: `Validation Officer ${stamp}`,
      id: `OFF/2026/${String(stamp).slice(-5)}`,
      email: `validation.officer.${stamp}@example.invalid`,
      phone: `254711${String(stamp).slice(-6)}`,
      password: `Officer${stamp}!`
    };

    await page.goto('/officer.html', { waitUntil: 'domcontentloaded' });
    await page.click('#officerRegisterTabBtn');
    await page.fill('#officerFullName', officer.name);
    await page.fill('#officerId', officer.id);
    await page.fill('#officerEmail', officer.email);
    await page.fill('#officerPhone', officer.phone);
    await fillFirstSelectValue(page, '#officerRole');
    await fillFirstSelectValue(page, '#officerGender');
    await fillFirstSelectValue(page, '#officerSchool');
    await fillFirstSelectValue(page, '#officerCourse');
    await fillFirstSelectValue(page, '#officerYear');
    await fillFirstSelectValue(page, '#officerSemester');
    await page.fill('#officerPassword', officer.password);
    await page.fill('#officerConfirmPassword', officer.password);

    await page.click('#officerRegisterButton');
    await expect(page.locator('#officerAlert')).toContainText(/submitted|approve/i);
    await expect.poll(() => page.evaluate(email => {
      const members = JSON.parse(localStorage.getItem('allMembers') || '[]');
      return members.some(member => member.email === email && member.status === 'Pending');
    }, officer.email)).toBe(true);
  });
});
