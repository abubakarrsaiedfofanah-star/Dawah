// Feature: admin/dashboard-view
// Source: admin.html#dashboardView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["admin/dashboard-view"] = {
    source: "admin.html#dashboardView",
    ids: [
        "adminFinanceStatusChart",
        "adminGlobalSearchResults",
        "adminMemberStatusChart",
        "adminOperationsChart",
        "announcementCount",
        "backupStatusSummary",
        "dashboardDetailTable",
        "dashboardDetailTitle",
        "dashboardView",
        "donationCount",
        "donationTotal",
        "eventCount",
        "failedDonationCount",
        "failedPaymentCount",
        "galleryCount",
        "hadithCount",
        "leaderCount",
        "memberCount",
        "monthDonationTotal",
        "monthPaymentTotal",
        "needsAttentionPanel",
        "notificationCount",
        "paymentCount",
        "paymentTotal",
        "pendingDonationAmount",
        "pendingDonationCount",
        "pendingPaymentAmount",
        "pendingPaymentCount",
        "pendingWelfareCount",
        "prayerCount",
        "researchCount",
        "researchDeepCount",
        "researchIslamicCount",
        "researchTodayCount",
        "resourceCount",
        "studentCount",
        "systemHealthList",
        "systemHealthSummary",
        "welfareCount"
    ],
    handlers: [
        "downloadDatabaseBackup",
        "loadDashboardDetail",
        "loadDashboardStats",
        "renderNeedsAttentionPanel",
        "runSystemHealthCheck"
    ]
  };
}());
