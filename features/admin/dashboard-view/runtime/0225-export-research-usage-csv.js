// Runtime slice from admin.js: exportResearchUsageCsv.
function exportResearchUsageCsv() {
    exportRowsToCsv(lastDashboardDetailRows || [], 'research-usage', ['created_at', 'user_id', 'username', 'role', 'mode', 'question', 'answer', 'model']);
}
