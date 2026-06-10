const { chromium } = require('@playwright/test');
const path = require('node:path');

const liveBase = 'https://umma-university-da-awah-team.web.app';
const stamp = Date.now();
const student = {
  name: `Debug Student ${stamp}`,
  id: `DBG${stamp}`,
  email: `debug.student.${stamp}@example.com`,
  phone: `254700${String(stamp).slice(-6)}`,
  password: `Debug${stamp}!`
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);
  const events = [];
  const dialogs = [];

  page.on('console', message => {
    const text = message.text();
    if (/error|warn|Firebase|App Check|registration/i.test(text)) {
      events.push(`console:${message.type()}: ${text}`);
    }
  });
  page.on('pageerror', error => events.push(`pageerror: ${error.message}`));
  page.on('dialog', async dialog => {
    dialogs.push(`${dialog.type()}: ${dialog.message()}`);
    await dialog.accept();
  });
  page.on('response', async response => {
    const url = response.url();
    if (!/identitytoolkit|firestore|firebaseappcheck/.test(url)) return;
    const status = response.status();
    if (status < 400) return;
    let body = '';
    try {
      body = (await response.text()).slice(0, 500);
    } catch {}
    events.push(`response:${status}: ${url}\n${body}`);
  });

  try {
    await page.goto(`${liveBase}/index.html`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    events.push('page-loaded');
    await page.waitForFunction(() => window.activateAuthTab && document.getElementById('registrationForm'), null, { timeout: 25000 });
    events.push('app-ready');
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      if (typeof window.showLoginPage === 'function') {
        window.showLoginPage();
      } else {
        document.getElementById('landingPage')?.classList.add('hidden');
        document.getElementById('loginPage')?.classList.remove('hidden');
      }
    });
    await page.evaluate(() => {
      document.getElementById('loginTab')?.classList.remove('show', 'active');
      document.getElementById('registerTab')?.classList.add('show', 'active');
      document.getElementById('loginTabBtn')?.classList.remove('active');
      document.getElementById('registerTabBtn')?.classList.add('active');
    });
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
    setValue('homeAddress', 'Debug test address');
    setValue('regPassword', data.password);
    setValue('confirmPassword', data.password);
    setValue('emergencyContact', 'Debug Guardian');
    setValue('localGuardian', 'Debug Local Guardian');
    }, student);

    await page.setInputFiles('#passportPhoto', {
      name: 'debug-photo.png',
      mimeType: 'image/png',
      buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=', 'base64')
    });

    const validity = await page.evaluate(() => document.getElementById('registrationForm').checkValidity());
    events.push(`form-valid: ${validity}`);
    const invalidFields = await page.evaluate(() => Array.from(document.querySelectorAll('#registrationForm input, #registrationForm select, #registrationForm textarea'))
      .filter(element => !element.checkValidity())
      .map(element => ({
        id: element.id,
        value: element.type === 'file' ? `${element.files?.length || 0} file(s)` : element.value,
        message: element.validationMessage
      })));
    events.push(`invalid-fields: ${JSON.stringify(invalidFields)}`);
    await page.evaluate(() => document.getElementById('registrationForm').requestSubmit());
    await page.waitForTimeout(12000);

    const onLoginTab = await page.locator('#loginTab.active').count();
    events.push(`login-tab-active: ${onLoginTab > 0}`);
  } catch (error) {
    events.push(`script-error: ${error.message}`);
  } finally {
    events.push(`test-email: ${student.email}`);
    events.push(`test-id: ${student.id}`);
    dialogs.forEach(dialog => events.push(`dialog: ${dialog}`));

    await browser.close().catch(() => {});
    console.log(events.join('\n\n'));
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
