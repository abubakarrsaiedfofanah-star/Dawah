// Runtime slice from admin.js: renderResearchUsageDashboard.
function renderResearchUsageDashboard(rows, container) {
    const total = rows.length;
    const today = new Date().toISOString().slice(0, 10);
    const todayCount = rows.filter(row => String(row.created_at || row.createdAt || '').slice(0, 10) === today).length;
    const userCount = new Set(rows.map(row => row.user_id || row.username || 'unknown')).size;
    const modelCount = new Set(rows.map(row => row.model || 'unknown')).size;
    container.innerHTML = `
        <div class="alert alert-info py-2">AI research logs help admins monitor usage and academic safety. Verify Islamic rulings with qualified scholars.</div>
        <div class="row g-2 mb-3">
            <div class="col-md-3"><div class="border rounded p-2"><strong>${total}</strong><br><small>Total AI requests</small></div></div>
            <div class="col-md-3"><div class="border rounded p-2"><strong>${todayCount}</strong><br><small>Today</small></div></div>
            <div class="col-md-3"><div class="border rounded p-2"><strong>${userCount}</strong><br><small>Users</small></div></div>
            <div class="col-md-3"><div class="border rounded p-2"><strong>${modelCount}</strong><br><small>Models</small></div></div>
        </div>
        <div class="d-flex flex-wrap gap-2 mb-3">
            <input type="search" class="form-control form-control-sm" style="max-width: 320px;" id="researchLogSearch" placeholder="Search questions, answers, users..." oninput="filterResearchUsageTable()">
            <select class="form-select form-select-sm" style="max-width: 180px;" id="researchLogMode" onchange="filterResearchUsageTable()">
                <option value="">All modes</option>
                <option value="groq_chat">Chat</option>
                <option value="quick">Quick</option>
                <option value="deep">Deep</option>
                <option value="islamic">Islamic</option>
            </select>
            <button class="btn btn-sm btn-outline-secondary" type="button" onclick="exportResearchUsageCsv()"><i class="fas fa-file-export"></i> Export CSV</button>
        </div>
        <div id="researchUsageTable"></div>
    `;
    filterResearchUsageTable();
}
