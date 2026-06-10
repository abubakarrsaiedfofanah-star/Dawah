const { test, expect } = require('@playwright/test');

const base = 'https://umma-university-da-awah-team.web.app';

const roleCases = [
  {
    role: 'treasurer',
    visibleLinks: ['view_reports'],
    hiddenLinks: ['manage_members', 'manage_events', 'manage_welfare', 'manage_leadership', 'manage_gallery', 'manage_contact', 'manage_hadiths'],
    visibleReportButtons: ['manage_payments']
  },
  {
    role: 'media',
    visibleLinks: ['manage_gallery', 'manage_contact'],
    hiddenLinks: ['manage_members', 'manage_events', 'manage_welfare', 'manage_leadership', 'view_reports', 'manage_hadiths'],
    visibleReportButtons: []
  },
  {
    role: 'organizer',
    visibleLinks: ['manage_events'],
    hiddenLinks: ['manage_members', 'manage_welfare', 'manage_leadership', 'view_reports', 'manage_gallery', 'manage_contact', 'manage_hadiths'],
    visibleReportButtons: []
  },
  {
    role: 'amir_director',
    visibleLinks: ['manage_hadiths'],
    hiddenLinks: ['manage_members', 'manage_events', 'manage_welfare', 'manage_leadership', 'view_reports', 'manage_gallery', 'manage_contact'],
    visibleReportButtons: []
  },
  {
    role: 'secretary',
    visibleLinks: ['manage_members', 'view_reports'],
    hiddenLinks: ['manage_events', 'manage_welfare', 'manage_leadership', 'manage_gallery', 'manage_contact', 'manage_hadiths'],
    visibleReportButtons: []
  },
  {
    role: 'chairlady',
    visibleLinks: ['manage_welfare', 'view_reports'],
    hiddenLinks: ['manage_members', 'manage_events', 'manage_leadership', 'manage_gallery', 'manage_contact', 'manage_hadiths'],
    visibleReportButtons: []
  },
  {
    role: 'vice_chairlady_1',
    visibleLinks: ['manage_welfare', 'view_reports'],
    hiddenLinks: ['manage_members', 'manage_events', 'manage_leadership', 'manage_gallery', 'manage_contact', 'manage_hadiths'],
    visibleReportButtons: []
  },
  {
    role: 'vice_chairlady_2',
    visibleLinks: ['manage_welfare', 'view_reports'],
    hiddenLinks: ['manage_members', 'manage_events', 'manage_leadership', 'manage_gallery', 'manage_contact', 'manage_hadiths'],
    visibleReportButtons: []
  },
  {
    role: 'vice_secretary',
    visibleLinks: ['manage_members', 'view_reports'],
    hiddenLinks: ['manage_events', 'manage_welfare', 'manage_leadership', 'manage_gallery', 'manage_contact', 'manage_hadiths'],
    visibleReportButtons: []
  },
  {
    role: 'vice_treasurer',
    visibleLinks: ['view_reports'],
    hiddenLinks: ['manage_members', 'manage_events', 'manage_welfare', 'manage_leadership', 'manage_gallery', 'manage_contact', 'manage_hadiths'],
    visibleReportButtons: ['manage_payments']
  },
  {
    role: 'executive',
    visibleLinks: ['manage_members', 'manage_events', 'manage_welfare', 'manage_gallery', 'manage_contact', 'manage_hadiths'],
    hiddenLinks: [],
    visibleReportButtons: []
  }
];

test.describe('role menu permissions', () => {
  for (const { role, visibleLinks, hiddenLinks, visibleReportButtons } of roleCases) {
    test(`${role} sees only assigned officer menu items`, async ({ page }) => {
      test.setTimeout(60000);
      await page.addInitScript(memberRole => {
        localStorage.setItem('currentRole', memberRole);
        localStorage.setItem('currentUser', JSON.stringify({
          email: `${memberRole}@example.com`,
          username: memberRole,
          studentId: `ROLE/${memberRole}`,
          fullName: `${memberRole} Officer`,
          role: memberRole,
          status: 'Active'
        }));
      }, role);
      await page.goto(`${base}/index.html?dashboard=1`, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('#dashboardPage')).toHaveClass(/active/, { timeout: 30000 });
      for (const permission of visibleLinks) {
        await expect(page.locator(`.role-tool-link[data-permission="${permission}"]`).first()).toBeVisible();
      }
      for (const permission of hiddenLinks) {
        await expect(page.locator(`.role-tool-link[data-permission="${permission}"]`).first()).toBeHidden();
      }
      for (const permission of visibleReportButtons) {
        await expect(page.locator(`.dashboard-report-btn[data-permission="${permission}"]`).first()).toBeVisible();
      }
    });
  }
});
