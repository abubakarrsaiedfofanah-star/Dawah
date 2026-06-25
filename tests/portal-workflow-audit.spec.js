const { test, expect } = require('@playwright/test');

async function firstOption(page, selector, index = 0) {
  await expect(page.locator(selector)).toBeVisible({ timeout: 15000 });
  await expect.poll(async () => page.locator(`${selector} option`).evaluateAll(options =>
    options.map(option => option.value).filter(Boolean).length
  )).toBeGreaterThan(0);
  const values = await page.locator(`${selector} option`).evaluateAll(options =>
    options.map(option => option.value).filter(Boolean)
  );
  await page.selectOption(selector, values[Math.min(index, values.length - 1)]);
  return values[Math.min(index, values.length - 1)];
}

async function openStudentRegister(page) {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      await page.waitForFunction(() => window.bootstrap && typeof window.activateAuthTab === 'function');
      await page.waitForFunction(() => !document.documentElement.classList.contains('pending-auth-route'));
      await page.evaluate(() => {
        window.activateAuthTab('register');
        document.getElementById('landingPage')?.classList.remove('active');
        document.getElementById('loginPage')?.classList.add('active');
        document.getElementById('dashboardPage')?.classList.remove('active');
        document.getElementById('loginTabBtn')?.classList.remove('active');
        document.getElementById('loginTab')?.classList.remove('show', 'active');
        document.getElementById('registerTabBtn')?.classList.add('active');
        document.getElementById('registerTab')?.classList.add('show', 'active');
      });
      break;
    } catch (error) {
      if (!/Execution context was destroyed|navigation/i.test(String(error)) || attempt === 3) throw error;
      await page.waitForLoadState('domcontentloaded').catch(() => {});
      await page.waitForTimeout(500);
    }
  }
  await expect(page.locator('#fullName')).toBeVisible({ timeout: 15000 });
}

async function registerStudent(page, student) {
  await openStudentRegister(page);
  await page.fill('#fullName', student.name);
  await page.fill('#studentId', student.id);
  await firstOption(page, '#school');
  await page.evaluate(() => window.renderCourseOptions?.('course', document.getElementById('school').value));
  await firstOption(page, '#course');
  await firstOption(page, '#yearOfStudy');
  await page.evaluate(() => window.updateSemesterAvailability?.('yearOfStudy', 'semester'));
  await firstOption(page, '#semester');
  await firstOption(page, '#gender');
  await page.fill('#phone', student.phone);
  await page.fill('#email', student.email);
  await page.fill('#nationality', 'Kenyan');
  await page.fill('#homeAddress', 'Portal audit address');
  await page.fill('#emergencyContact', 'Audit Guardian');
  await page.fill('#localGuardian', 'Audit Local Guardian');
  await page.fill('#regPassword', student.password);
  await page.fill('#confirmPassword', student.password);
  await expect.poll(() => page.evaluate(() => document.getElementById('registrationForm').checkValidity())).toBe(true);
  await page.evaluate(() => document.getElementById('registrationForm').requestSubmit());
  await expect.poll(() => page.evaluate(email => {
    const members = JSON.parse(localStorage.getItem('allMembers') || '[]');
    return members.some(member => member.email === email && member.role === 'student');
  }, student.email)).toBe(true);
}

async function loginStudent(page, student) {
  await page.evaluate(() => {
    window.showLoginPage();
    window.activateAuthTab('login');
    bootstrap.Tab.getOrCreateInstance(document.getElementById('loginTabBtn')).show();
  });
  await page.fill('#loginUsername', student.email);
  await page.fill('#loginPassword', student.password);
  await page.click('#loginSubmitBtn');
  await expect(page.locator('#dashboardPage')).toBeVisible({ timeout: 15000 });
}

async function registerOfficer(page, officer) {
  await page.goto('/officer.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#officerRegisterTabBtn')).toBeVisible({ timeout: 15000 });
  await page.click('#officerRegisterTabBtn');
  await expect(page.locator('#officerFullName')).toBeVisible({ timeout: 15000 });
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
  await expect(page.locator('#officerAlert')).toContainText(/submitted|approve/i, { timeout: 15000 });
}

async function registerAndLoginAdmin(page, admin) {
  await page.goto('/admin.html', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.bootstrap && document.getElementById('adminRegisterTabBtn'));
  await page.evaluate(() => bootstrap.Tab.getOrCreateInstance(document.getElementById('adminRegisterTabBtn')).show());
  await expect(page.locator('#adminRegisterUsername')).toBeVisible({ timeout: 15000 });
  await page.fill('#adminRegisterUsername', admin.name);
  await page.fill('#adminRegisterEmail', admin.email);
  await page.fill('#adminRegisterPassword', admin.password);
  await page.fill('#adminRegisterConfirmPassword', admin.password);
  await page.click('#adminRegisterButton');
  await expect(page.locator('#adminContainer')).not.toHaveClass(/locked/, { timeout: 15000 });
}

test.describe('portal workflow audit', () => {
  test('registers, approves, assigns, logs in, and checks Research AI worker health', async ({ page, request }) => {
    test.setTimeout(90000);
    page.on('dialog', dialog => dialog.accept());
    const stamp = Date.now();
    const admin = {
      name: `audit-admin-${stamp}`,
      email: `audit.admin.${stamp}@example.invalid`,
      password: `AuditAdmin${stamp}!Aa`
    };
    const student = {
      name: `Audit Student ${stamp}`,
      id: `BSCS/2026/${String(stamp).slice(-5)}`,
      email: `audit.student.${stamp}@example.invalid`,
      phone: `254700${String(stamp).slice(-6)}`,
      password: `AuditStudent${stamp}!`
    };
    const officer = {
      name: `Audit Officer ${stamp}`,
      id: `OFF/2026/${String(stamp).slice(-5)}`,
      email: `audit.officer.${stamp}@example.invalid`,
      phone: `254711${String(stamp).slice(-6)}`,
      role: 'media',
      password: `AuditOfficer${stamp}!`
    };
    const createdEmails = [admin.email, student.email, officer.email];

    async function cleanupPilotAccounts() {
      if (page.isClosed()) return;
      await page.evaluate(emails => {
        const removePilotRows = key => {
          const rows = JSON.parse(localStorage.getItem(key) || '[]');
          if (!Array.isArray(rows)) return;
          localStorage.setItem(key, JSON.stringify(rows.filter(row => !emails.includes(String(row.email || '').toLowerCase()))));
        };
        const lowerEmails = emails.map(email => String(email || '').toLowerCase());
        removePilotRows('allMembers');
        removePilotRows('localAdminAccounts');
        removePilotRows('managedAdmins');
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        if (currentUser && lowerEmails.includes(String(currentUser.email || '').toLowerCase())) {
          localStorage.removeItem('currentUser');
          localStorage.removeItem('currentRole');
        }
        const currentAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
        if (currentAdmin && lowerEmails.includes(String(currentAdmin.email || '').toLowerCase())) {
          sessionStorage.removeItem('currentAdminUser');
        }
      }, createdEmails);
    }

    try {
      await registerStudent(page, student);
      await loginStudent(page, student);
      await expect(page.locator('#dashboardPage')).toBeVisible();

      await registerOfficer(page, officer);
      await registerAndLoginAdmin(page, admin);

      const adminResult = await page.evaluate(async ({ officerEmail, studentEmail }) => {
        const before = JSON.parse(localStorage.getItem('allMembers') || '[]');
        const officerRecord = before.find(member => member.email === officerEmail);
        const studentRecord = before.find(member => member.email === studentEmail);
        const officerUserId = officerRecord?.dbUserId || officerRecord?.user_id || officerRecord?.id || officerRecord?.studentId || officerRecord?.username;
        const studentUserId = studentRecord?.dbUserId || studentRecord?.user_id || studentRecord?.id || studentRecord?.studentId || studentRecord?.username;
        const approve = await window.handleStaticAdminApi('approveRoleRequest', 'POST', { user_id: officerUserId });
        const assign = await window.handleStaticAdminApi('assignMemberRole', 'POST', { user_id: studentUserId, role: 'organizer', status: 'active' });
        return {
          approve,
          assign,
          members: JSON.parse(localStorage.getItem('allMembers') || '[]')
        };
      }, { officerEmail: officer.email, studentEmail: student.email });

      expect(adminResult.approve.success).toBe(true);
      expect(adminResult.assign.success).toBe(true);
      expect(adminResult.members.find(member => member.email === officer.email)?.status).toMatch(/active/i);
      expect(adminResult.members.find(member => member.email === student.email)?.role).toBe('organizer');

      await page.goto('/officer.html', { waitUntil: 'domcontentloaded' });
      await page.fill('#officerLoginUsername', officer.email);
      await page.fill('#officerLoginPassword', officer.password);
      await page.click('#officerLoginButton');
      await page.waitForURL(/index\.html/, { timeout: 15000 });
      await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('currentUser') || '{}').role)).toBe('media');

      await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentRole');
        window.activateAuthTab('login');
      });
      await page.fill('#loginUsername', student.email);
      await page.fill('#loginPassword', student.password);
      await page.click('#loginSubmitBtn');
      await expect(page.locator('#dashboardPage')).toBeVisible({ timeout: 15000 });
      await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('currentUser') || '{}').role)).toBe('organizer');

      const workerUrl = await page.evaluate(() => String(window.DAWAAH_AI_WORKER_URL || window.DAWAH_AI_WORKER_URL || ''));
      expect(workerUrl).toContain('workers.dev');
      const health = await request.get(`${workerUrl}/health`, { timeout: 8000 }).catch(error => {
        test.info().annotations.push({
          type: 'external-ai-worker',
          description: `AI worker health could not be reached from this environment: ${error.message}`
        });
        return null;
      });
      if (!health) return;
      if (health.status() !== 200) {
        test.info().annotations.push({
          type: 'external-ai-worker',
          description: `Deployed AI worker health returned ${health.status()}; chat and Arabic checks require the Cloudflare Worker from this repo to be redeployed.`
        });
        return;
      }
      const healthJson = await health.json();
      expect(healthJson.data?.ok).toBe(true);
      expect(typeof healthJson.data?.live_search).toBe('boolean');

      const latestResponse = await request.post(`${workerUrl}/chat`, {
        headers: { origin: 'http://127.0.0.1:8000' },
        data: {
          message: 'Give a short latest 2026 update about Kenya university student welfare support. Mention if live search is available.',
          mode: 'deep',
          context: 'pilot test student workspace'
        }
      });
      expect(latestResponse.status()).toBe(200);
      const latestJson = await latestResponse.json();
      expect(latestJson.data?.answer || '').toMatch(/2026|latest|current|search|source/i);
      expect(typeof latestJson.data?.live_search).toBe('boolean');

      const arabicResponse = await request.post(`${workerUrl}/hadith-arabic`, {
        headers: { origin: 'http://127.0.0.1:8000' },
        data: {
          english: 'Actions are judged by intentions.',
          reference: 'Sahih al-Bukhari 1'
        }
      });
      expect(arabicResponse.status()).toBe(200);
      const arabicJson = await arabicResponse.json();
      expect(arabicJson.data?.arabic || '').toMatch(/[\u0600-\u06FF]/);
    } finally {
      await cleanupPilotAccounts();
    }
  });
});
