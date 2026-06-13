const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const liveBase = 'https://umma-university-da-awah-team.web.app';
const adminEmail = process.env.DAWAAH_ADMIN_EMAIL;
const adminPassword = process.env.DAWAAH_ADMIN_PASSWORD;
const stamp = Date.now();
const student = {
  name: `Validation Student ${stamp}`,
  id: `VAL${stamp}`,
  email: `validation.student.${stamp}@example.invalid`,
  phone: `254700${String(stamp).slice(-6)}`,
  password: `Validation${stamp}!`
};
const officer = {
  name: `Validation Officer ${stamp}`,
  id: `OFF${stamp}`,
  email: `validation.officer.${stamp}@example.invalid`,
  phone: `254711${String(stamp).slice(-6)}`,
  password: `Officer${stamp}!`
};
const liveCreatedUsers = [
  { role: 'student', name: student.name, id: student.id, email: student.email },
  { role: 'officer', name: officer.name, id: officer.id, email: officer.email }
];

async function fillSelect(page, selector, index = 1) {
  await expect(page.locator(selector)).toBeVisible();
  await expect.poll(async () => page.locator(`${selector} option`).evaluateAll(options =>
    options.map(option => option.value).filter(Boolean).length
  )).toBeGreaterThan(0);
  const values = await page.locator(`${selector} option`).evaluateAll(options =>
    options.map(option => option.value).filter(Boolean)
  );
  if (values.length) await page.selectOption(selector, values[Math.min(index - 1, values.length - 1)]);
}

async function waitForAppShell(page) {
  await page.waitForFunction(
    () => window.bootstrap && window.showLoginPage && window.activateAuthTab && document.getElementById('loginPage'),
    null,
    { timeout: 20000 }
  );
}

async function activateAuth(page, tab) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      await waitForAppShell(page);
      await page.evaluate(name => window.activateAuthTab(name), tab);
      return;
    } catch (error) {
      if (!/Execution context was destroyed|navigation/i.test(String(error))) throw error;
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(1000);
    }
  }
  await waitForAppShell(page);
  await page.evaluate(name => window.activateAuthTab(name), tab);
}

async function openAppModal(page, functionName, modalId, arg = null) {
  await page.evaluate(({ functionName, arg }) => {
    if (typeof window[functionName] !== 'function') {
      throw new Error(`${functionName} is not available`);
    }
    return arg === null ? window[functionName]() : window[functionName](arg);
  }, { functionName, arg });
  await page.waitForFunction(id => {
    const modal = document.getElementById(id);
    return modal && modal.classList.contains('show') && getComputedStyle(modal).display !== 'none';
  }, modalId, { timeout: 10000 });
}

async function closeModal(page, modalId) {
  await page.evaluate(id => {
    const modal = document.getElementById(id);
    if (!modal || !window.bootstrap) return;
    window.bootstrap.Modal.getOrCreateInstance(modal).hide();
  }, modalId);
  try {
    await page.waitForFunction(id => {
      const modal = document.getElementById(id);
      return !modal || !modal.classList.contains('show');
    }, modalId, { timeout: 10000 });
  } catch (error) {
    await page.evaluate(id => {
      const modal = document.getElementById(id);
      if (modal) {
        modal.classList.remove('show');
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
      }
      document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
      document.body.classList.remove('modal-open');
      document.body.style.removeProperty('overflow');
      document.body.style.removeProperty('padding-right');
    }, modalId);
  }
}

async function openAiChatPanel(page) {
  const toggle = page.locator('#aiChatToggle');
  await expect(toggle).toBeVisible();
  try {
    await toggle.click({ timeout: 5000 });
  } catch (error) {
    await toggle.click({ force: true });
  }
}

async function loginAdmin(page) {
  await page.goto(`${liveBase}/admin.html`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#adminLoginScreen')).toBeVisible();
  await page.evaluate(() => bootstrap.Tab.getOrCreateInstance(document.getElementById('adminLoginTabBtn')).show());
  await expect(page.locator('#adminLoginUsername')).toBeVisible();
  await page.fill('#adminLoginUsername', adminEmail);
  await page.fill('#adminLoginPassword', adminPassword);
  await page.click('#adminLoginButton');
  await expect(page.locator('#adminContainer')).not.toHaveClass(/locked/, { timeout: 20000 });
}

test.describe('live Supabase feature audit', () => {
  test.setTimeout(90000);

  test.afterAll(() => {
    const outputDir = path.join(process.cwd(), 'test-results');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(
      path.join(outputDir, 'live-created-users.json'),
      JSON.stringify({
        createdAt: new Date().toISOString(),
        baseUrl: liveBase,
        cleanupHint: 'Remove any validation accounts created during test runs, if applicable.',
        users: liveCreatedUsers
      }, null, 2)
    );
  });

  test('admin login, navigation, buttons, and AI widget shell', async ({ page }) => {
    test.skip(!adminEmail || !adminPassword, 'Admin credentials env vars are required.');
    await loginAdmin(page);

    const views = [
      'dashboard',
      'announcements',
      'events',
      'leadership',
      'gallery',
      'contactVoices',
      'welfare',
      'prayer',
      'resources',
      'hadiths',
      'account'
    ];
    for (const view of views) {
      await page.evaluate(name => window.switchAdminView(name), view);
      await expect(page.locator(`#${view}View`)).toBeVisible();
    }

    const enabledButtons = await page.locator('button:visible:not([disabled])').count();
    expect(enabledButtons).toBeGreaterThan(15);

    await openAiChatPanel(page);
    await expect(page.locator('#aiChatPanel')).toBeVisible();
    await expect(page.locator('#aiChatInput')).toBeVisible();
    await page.click('#aiChatClose');
  });

  test('student registration, login, finance modals, and chat widget shell', async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
    await page.addInitScript(() => localStorage.setItem('ummaAppVersion', '2026.05.23.27'));
    await page.goto(`${liveBase}/index.html`, { waitUntil: 'domcontentloaded' });
    await waitForAppShell(page);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2500);
    await activateAuth(page, 'register');
    await expect(page.locator('#fullName')).toBeVisible();
    await page.evaluate(data => {
      const setValue = (id, value) => {
        const element = document.getElementById(id);
        if (!element) return;
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
      };
      const firstValue = id => Array.from(document.getElementById(id)?.options || [])
        .map(option => option.value)
        .find(Boolean) || '';
      window.activateAuthTab('register');
      setValue('fullName', data.name);
      setValue('studentId', data.id);
      setValue('registrationRole', 'student');
      setValue('school', firstValue('school'));
      window.renderCourseOptions?.('course', document.getElementById('school').value);
      setValue('course', firstValue('course'));
      setValue('yearOfStudy', firstValue('yearOfStudy'));
      window.updateSemesterAvailability?.('yearOfStudy', 'semester');
      setValue('semester', firstValue('semester'));
      setValue('gender', firstValue('gender'));
      setValue('phone', data.phone);
      setValue('email', data.email);
      setValue('nationality', 'Kenyan');
      setValue('homeAddress', 'Validation address');
      setValue('regPassword', data.password);
      setValue('confirmPassword', data.password);
      setValue('emergencyContact', 'Pilot Guardian');
      setValue('localGuardian', 'Pilot Local Guardian');
    }, student);
    await page.setInputFiles('#passportPhoto', {
      name: 'validation-photo.png',
      mimeType: 'image/png',
      buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',
        'base64'
      )
    });
    await expect.poll(async () => page.evaluate(() => document.getElementById('registrationForm').checkValidity())).toBe(true);
    await page.evaluate(() => document.getElementById('registrationForm').requestSubmit());
    await page.waitForTimeout(3000);
    await activateAuth(page, 'login');
    await expect(page.locator('#loginUsername')).toBeVisible({ timeout: 20000 });
    await page.fill('#loginUsername', student.email);
    await page.fill('#loginPassword', student.password);
    await page.click('#loginSubmitBtn');
    await expect(page.locator('#dashboardPage')).toBeVisible({ timeout: 20000 });

    await openAppModal(page, 'showPaymentModal', 'paymentModal');
    await page.fill('#paymentAmount', '10');
    await fillSelect(page, '#paymentType');
    await fillSelect(page, '#paymentMethod', 2);
    await expect(page.locator('#paymentInstructions')).toContainText(/Transfer|Cash|Bank|M-Pesa/i);
    await closeModal(page, 'paymentModal');

    await openAppModal(page, 'showDonationModal', 'donationModal', 'General');
    await page.fill('#donationAmount', '5');
    await fillSelect(page, '#donationPaymentMethod', 2);
    await expect(page.locator('#donationPaymentInstructions')).toContainText(/Transfer|Cash|Bank|M-Pesa/i);
    await closeModal(page, 'donationModal');

    await openAiChatPanel(page);
    await expect(page.locator('#aiChatPanel')).toBeVisible();
    await expect(page.locator('#aiChatInput')).toBeVisible();
  });

  test('officer registration form submits pending role request', async ({ page }) => {
    await page.goto(`${liveBase}/officer.html`, { waitUntil: 'domcontentloaded' });
    await page.click('#officerRegisterTabBtn');
    await page.fill('#officerFullName', officer.name);
    await page.fill('#officerId', officer.id);
    await page.fill('#officerEmail', officer.email);
    await page.fill('#officerPhone', officer.phone);
    await fillSelect(page, '#officerRole');
    await fillSelect(page, '#officerGender');
    await fillSelect(page, '#officerSchool');
    await page.waitForTimeout(300);
    await fillSelect(page, '#officerCourse');
    await fillSelect(page, '#officerYear');
    await page.waitForTimeout(300);
    await fillSelect(page, '#officerSemester');
    await page.fill('#officerPassword', officer.password);
    await page.fill('#officerConfirmPassword', officer.password);
    await page.click('#officerRegisterButton');
    await expect(page.locator('#officerAlert')).toContainText(/submitted|approve|already/i, { timeout: 20000 });
  });
});
