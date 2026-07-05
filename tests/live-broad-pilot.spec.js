const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const base = process.env.PLAYWRIGHT_BASE_URL || 'https://66ghz.com';
const adminEmail = process.env.DAWAAH_ADMIN_EMAIL;
const adminPassword = process.env.DAWAAH_ADMIN_PASSWORD;
const stamp = Date.now();
const pilotTag = `pilot-${stamp}`;

const student = {
  name: `Pilot Student ${stamp}`,
  id: `BSCS/2026/${String(stamp).slice(-6)}`,
  email: `pilot.student.${stamp}@example.com`,
  phone: `254700${String(stamp).slice(-6)}`,
  password: `PilotStudent${stamp}!`
};

const officer = {
  name: `Pilot Officer ${stamp}`,
  id: `BSCS/2026/${String(Number(String(stamp).slice(-6)) + 1).padStart(6, '0')}`,
  email: `pilot.officer.${stamp}@example.com`,
  phone: `254711${String(stamp).slice(-6)}`,
  password: `PilotOfficer${stamp}!`,
  role: ''
};

const report = {
  base,
  pilotTag,
  created: { student: student.email, officer: officer.email },
  checks: [],
  cleanup: [],
  errors: [],
  authUsersMayRemain: [student.email, officer.email]
};

function record(name, status, details = '') {
  report.checks.push({ name, status, details });
}

async function firstOption(page, selector, preferredValue = '') {
  await expect(page.locator(selector)).toBeVisible({ timeout: 20000 });
  await expect.poll(async () => page.locator(`${selector} option`).evaluateAll(options =>
    options.map(option => option.value).filter(Boolean).length
  ), { timeout: 20000 }).toBeGreaterThan(0);
  const values = await page.locator(`${selector} option`).evaluateAll(options =>
    options.map(option => option.value).filter(Boolean)
  );
  const value = preferredValue && values.includes(preferredValue) ? preferredValue : values[0];
  await page.selectOption(selector, value);
  return value;
}

async function waitForPublicApp(page) {
  await page.waitForFunction(() =>
    window.bootstrap && typeof window.activateAuthTab === 'function' && document.getElementById('loginPage'),
    null,
    { timeout: 30000 }
  );
}

async function openStudentRegister(page) {
  await page.goto(`${base}/index.html`, { waitUntil: 'domcontentloaded' });
  await waitForPublicApp(page);
  await page.evaluate(() => {
    window.activateAuthTab('register');
    document.getElementById('landingPage')?.classList.remove('active');
    document.getElementById('dashboardPage')?.classList.remove('active');
    document.getElementById('loginPage')?.classList.add('active');
    window.bootstrap.Tab.getOrCreateInstance(document.getElementById('registerTabBtn')).show();
  });
  await expect(page.locator('#fullName')).toBeVisible({ timeout: 20000 });
}

async function registerStudent(page) {
  page.on('dialog', dialog => dialog.accept());
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
  await page.fill('#homeAddress', `Pilot address ${pilotTag}`);
  await page.fill('#emergencyContact', 'Pilot Guardian');
  await page.fill('#localGuardian', 'Pilot Local Guardian');
  await page.fill('#regPassword', student.password);
  await page.fill('#confirmPassword', student.password);
  await expect.poll(async () => page.evaluate(() => document.getElementById('registrationForm').checkValidity())).toBe(true);
  await page.evaluate(() => document.getElementById('registrationForm').requestSubmit());
  await expect(page.locator('#loginTab')).toBeVisible({ timeout: 30000 });
  record('student registration submit', 'pass', student.email);
}

async function registerOfficer(page) {
  await page.goto(`${base}/officer.html`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#officerRegisterTabBtn')).toBeVisible({ timeout: 30000 });
  await page.click('#officerRegisterTabBtn');
  await expect(page.locator('#officerFullName')).toBeVisible({ timeout: 20000 });
  await page.fill('#officerFullName', officer.name);
  await page.fill('#officerId', officer.id);
  await page.fill('#officerEmail', officer.email);
  await page.fill('#officerPhone', officer.phone);
  officer.role = await firstOption(page, '#officerRole');
  await firstOption(page, '#officerGender');
  await firstOption(page, '#officerSchool');
  await page.waitForTimeout(300);
  await firstOption(page, '#officerCourse');
  await firstOption(page, '#officerYear');
  await page.waitForTimeout(300);
  await firstOption(page, '#officerSemester');
  await page.fill('#officerPassword', officer.password);
  await page.fill('#officerConfirmPassword', officer.password);
  await page.click('#officerRegisterButton');
  await expect(page.locator('#officerAlert')).toContainText(/submitted|approve|already/i, { timeout: 30000 });
  record('officer registration pending submit', 'pass', `${officer.email} role=${officer.role}`);
}

async function loginAdmin(page) {
  await page.goto(`${base}/admin.html`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#adminLoginScreen')).toBeVisible({ timeout: 30000 });
  await page.evaluate(() => window.bootstrap.Tab.getOrCreateInstance(document.getElementById('adminLoginTabBtn')).show());
  await page.fill('#adminLoginUsername', adminEmail);
  await page.fill('#adminLoginPassword', adminPassword);
  await page.click('#adminLoginButton');
  await expect(page.locator('#adminContainer')).not.toHaveClass(/locked/, { timeout: 40000 });
  await page.waitForTimeout(3000);
  record('admin login', 'pass', adminEmail);
}

async function refreshAdminCloud(page) {
  await page.evaluate(async () => {
    await window.loadCloudAdminStores?.();
    await window.refreshCloudAdminStores?.(true);
    window.loadAllData?.();
  });
  await page.waitForTimeout(1500);
}

async function adminFindMembers(page) {
  await refreshAdminCloud(page);
  return page.evaluate(({ studentEmail, officerEmail }) => {
    const members = JSON.parse(localStorage.getItem('allMembers') || '[]');
    const find = email => members.find(member => String(member.email || '').toLowerCase() === email);
    return {
      total: members.length,
      student: find(studentEmail),
      officer: find(officerEmail),
      pendingRoleCount: members.filter(member => {
        const role = String(member.role || 'student').toLowerCase();
        const status = String(member.status || member.accountStatus || '').toLowerCase();
        return role && role !== 'student' && !['active', 'approved', 'rejected', 'suspended'].includes(status);
      }).length
    };
  }, { studentEmail: student.email, officerEmail: officer.email });
}

async function approveOfficerAndAssignStudent(page) {
  const before = await adminFindMembers(page);
  expect(before.student, 'pilot student should reflect in admin members').toBeTruthy();
  expect(before.officer, 'pilot officer should reflect in admin pending members').toBeTruthy();
  expect(String(before.officer.status || before.officer.accountStatus || '')).toMatch(/pending/i);
  record('admin sees registered student', 'pass', before.student.email);
  record('admin sees pending officer request', 'pass', `pending role count=${before.pendingRoleCount}`);

  const result = await page.evaluate(async ({ studentEmail, officerEmail }) => {
    const members = JSON.parse(localStorage.getItem('allMembers') || '[]');
    const officerRecord = members.find(member => String(member.email || '').toLowerCase() === officerEmail);
    const studentRecord = members.find(member => String(member.email || '').toLowerCase() === studentEmail);
    const idFor = member => member?.uid || member?.authUid || member?.supabaseId || member?.dbUserId || member?.user_id || member?.id || member?.studentId || member?.username;
    const approve = await window.handleStaticAdminApi('approveRoleRequest', 'POST', { user_id: idFor(officerRecord) });
    const assign = await window.handleStaticAdminApi('assignMemberRole', 'POST', {
      user_id: idFor(studentRecord),
      role: 'secretary',
      status: 'active'
    });
    await window.loadCloudAdminStores?.();
    return { approve, assign, members: JSON.parse(localStorage.getItem('allMembers') || '[]') };
  }, { studentEmail: student.email, officerEmail: officer.email });

  expect(result.approve.success).toBeTruthy();
  expect(result.assign.success).toBeTruthy();
  record('approve pending officer', 'pass', result.approve.message || '');
  record('assign student to officer role', 'pass', result.assign.message || '');
}

async function loginOfficerPortal(page, email, password, expectedRole) {
  await page.goto(`${base}/officer.html`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('#officerLoginUsername')).toBeVisible({ timeout: 30000 });
  await page.fill('#officerLoginUsername', email);
  await page.fill('#officerLoginPassword', password);
  await page.click('#officerLoginButton');
  await page.waitForURL(/index\.html.*dashboard=1/, { timeout: 40000 });
  await expect(page.locator('#dashboardPage')).toHaveClass(/active/, { timeout: 30000 });
  const role = await page.evaluate(() => JSON.parse(localStorage.getItem('currentUser') || '{}').role || '');
  expect(String(role).toLowerCase()).toBe(String(expectedRole).toLowerCase());
  record(`officer login workspace (${expectedRole})`, 'pass', email);
}

async function checkOfficerWorkspaceFeatures(page) {
  const roleCases = [
    ['treasurer', ['view_reports'], ['manage_members', 'manage_events', 'manage_welfare', 'manage_gallery', 'manage_contact', 'manage_hadiths']],
    ['media', ['manage_gallery', 'manage_contact'], ['manage_members', 'manage_events', 'manage_welfare', 'view_reports', 'manage_hadiths']],
    ['organizer', ['manage_events'], ['manage_members', 'manage_welfare', 'view_reports', 'manage_gallery', 'manage_contact', 'manage_hadiths']],
    ['amir_director', ['manage_hadiths'], ['manage_members', 'manage_events', 'manage_welfare', 'view_reports', 'manage_gallery', 'manage_contact']],
    ['secretary', ['manage_members', 'view_reports'], ['manage_events', 'manage_welfare', 'manage_gallery', 'manage_contact', 'manage_hadiths']],
    ['chairlady', ['manage_welfare', 'view_reports'], ['manage_members', 'manage_events', 'manage_gallery', 'manage_contact', 'manage_hadiths']],
    ['vice_treasurer', ['view_reports'], ['manage_members', 'manage_events', 'manage_welfare', 'manage_gallery', 'manage_contact', 'manage_hadiths']],
    ['executive', ['manage_members', 'manage_events', 'manage_welfare', 'manage_gallery', 'manage_contact', 'manage_hadiths'], []]
  ];

  for (const [role, visible, hidden] of roleCases) {
    await page.goto(`${base}/index.html?dashboard=1`, { waitUntil: 'domcontentloaded' });
    await page.evaluate(memberRole => {
      const user = {
        email: `${memberRole}.${Date.now()}@pilot.local`,
        username: memberRole,
        studentId: `BSCS/2026/${String(Date.now()).slice(-6)}`,
        fullName: `${memberRole} Pilot`,
        role: memberRole,
        status: 'Active'
      };
      localStorage.setItem('currentUser', JSON.stringify(user));
      localStorage.setItem('currentRole', memberRole);
      window.showDashboard?.();
      window.refreshActiveRoleView?.();
    }, role);
    await expect(page.locator('#dashboardPage')).toHaveClass(/active/, { timeout: 20000 });
    for (const permission of visible) {
      await expect(page.locator(`.role-tool-link[data-permission="${permission}"]`).first()).toBeVisible({ timeout: 10000 });
    }
    for (const permission of hidden) {
      await expect(page.locator(`.role-tool-link[data-permission="${permission}"]`).first()).toBeHidden({ timeout: 10000 });
    }
    record(`role workspace permissions ${role}`, 'pass', `visible=${visible.join(',')}`);
  }
}

async function testAiDirectWorkspaceAnswer(request) {
  const context = [
    'admin workspace',
    '',
    'Current app data snapshot from this browser/workspace:',
    'Current user role: main admin.',
    'Members: 10. Active/approved members: 8.',
    'Registered students: 10. Pending student statuses: 0.',
    'Pending officer role requests: 0.',
    'Recent registrations: none available.',
    'Use these counts and recent records directly.'
  ].join('\n');

  const response = await request.post('https://umma-dawah-groq-ai.abubakarrsaiedfofanah.workers.dev/chat', {
    headers: { Origin: 'https://66ghz.com' },
    data: { question: 'do i have pending officer', mode: 'quick', context }
  });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.data?.answer).toBe('No, you have 0 pending officer role requests in this workspace.');
  expect(body.data?.model).toBe('workspace-snapshot');
  record('research AI direct workspace status answer', 'pass', body.data.answer);
}

async function cleanupPilotRecords(page) {
  await page.goto(`${base}/admin.html`, { waitUntil: 'domcontentloaded' });
  if (await page.locator('#adminLoginScreen:not(.d-none)').count()) {
    await loginAdmin(page);
  }
  const cleanupResult = await page.evaluate(async ({ emails }) => {
    const lower = emails.map(email => String(email).toLowerCase());
    const result = { membersDeleted: 0, storesCleaned: [], recordCollectionsCleaned: [] };

    const records = await window.SupabaseBackend?.listMembers?.().catch(() => []);
    for (const member of records || []) {
      if (lower.includes(String(member.email || member.authEmail || '').toLowerCase()) && member.supabaseId) {
        await window.SupabaseBackend.deleteRecord('members', member.supabaseId).catch(() => false);
        result.membersDeleted += 1;
      }
    }

    for (const key of ['allMembers', 'payments', 'donations', 'welfareRequests', 'registeredEvents', 'volunteerRecords']) {
      const value = await window.SupabaseBackend?.loadStore?.(key).catch(() => null);
      if (Array.isArray(value)) {
        const next = value.filter(item => !lower.includes(String(item.email || item.authEmail || item.memberEmail || '').toLowerCase()));
        if (next.length !== value.length) {
          await window.SupabaseBackend.saveStore(key, next);
          result.storesCleaned.push(key);
        }
      }
    }

    for (const collection of ['payments', 'donations', 'welfareRequests', 'eventRegistrations', 'volunteerRegistrations', 'auditLogs']) {
      const rows = await window.SupabaseBackend?.listRecords?.(collection).catch(() => []);
      for (const row of rows || []) {
        const rowText = JSON.stringify(row).toLowerCase();
        if (lower.some(email => rowText.includes(email)) && row.supabaseId) {
          await window.SupabaseBackend.deleteRecord(collection, row.supabaseId).catch(() => false);
          result.recordCollectionsCleaned.push(collection);
        }
      }
    }

    localStorage.removeItem('currentUser');
    localStorage.removeItem('currentRole');
    return result;
  }, { emails: [student.email, officer.email] });
  report.cleanup.push(cleanupResult);
}

test.describe('live broad pilot', () => {
  test.setTimeout(240000);

  test.afterAll(() => {
    const outputDir = path.join(process.cwd(), 'test-results');
    fs.mkdirSync(outputDir, { recursive: true });
    fs.writeFileSync(path.join(outputDir, `live-broad-pilot-${stamp}.json`), JSON.stringify(report, null, 2));
  });

  test('register, approve, assign, verify workspaces, AI, and cleanup', async ({ browser, request }) => {
    test.skip(!adminEmail || !adminPassword, 'Set DAWAAH_ADMIN_EMAIL and DAWAAH_ADMIN_PASSWORD.');
    const context = await browser.newContext({ ignoreHTTPSErrors: true });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(`pageerror: ${error.message}`));
    page.on('console', message => {
      if (message.type() === 'error') report.errors.push(`console: ${message.text().slice(0, 240)}`);
    });

    try {
      await registerStudent(page);
      await registerOfficer(page);
      await loginAdmin(page);
      await approveOfficerAndAssignStudent(page);
      await loginOfficerPortal(page, officer.email, officer.password, officer.role);
      await loginOfficerPortal(page, student.email, student.password, 'secretary');
      await checkOfficerWorkspaceFeatures(page);
      await testAiDirectWorkspaceAnswer(request);
    } finally {
      await cleanupPilotRecords(page).catch(error => {
        report.cleanup.push({ error: error.message });
      });
      await context.close();
    }
  });
});
