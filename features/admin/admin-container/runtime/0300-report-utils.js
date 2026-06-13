// Runtime utility for CSV generation and date range reporting

/**
 * Converts an array of objects to CSV and triggers a download.
 */
function exportToCSV(data, filename = 'report.csv') {
    if (!data || !data.length) {
        alert('No records found to export.');
        return;
    }
    const headers = Object.keys(data[0]);
    const csvRows = [
        headers.join(','),
        ...data.map(row => headers.map(fieldName => {
            const value = row[fieldName] ?? '';
            return `"${String(value).replace(/"/g, '""')}"`;
        }).join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Filters an array of objects by a date range.
 */
function filterDataByRange(data, startStr, endStr, dateField = 'activity_date') {
    const start = startStr ? new Date(startStr) : null;
    const end = endStr ? new Date(endStr) : null;
    if (end) end.setHours(23, 59, 59, 999);

    return data.filter(item => {
        const d = new Date(item[dateField] || item.created_at);
        if (isNaN(d)) return false;
        if (start && d < start) return false;
        if (end && d > end) return false;
        return true;
    });
}

/**
 * Applies a date range preset (day/week/month) to input elements.
 */
function applyDatePreset(startId, endId, preset) {
    const startInput = document.getElementById(startId);
    const endInput = document.getElementById(endId);
    if (!startInput || !endInput) return;

    const now = new Date();
    const start = new Date();
    if (preset === 'day') start.setHours(0, 0, 0, 0);
    else if (preset === 'week') start.setDate(now.getDate() - 7);
    else if (preset === 'month') start.setMonth(now.getMonth() - 1);

    startInput.value = start.toISOString().split('T')[0];
    endInput.value = now.toISOString().split('T')[0];
}

/**
 * Renders the report UI including a date range picker (calendar) and presets.
 */
function renderReportUI(containerId, onExportFunctionName, reportTitle = 'Generate CSV Report') {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
        <div class="card mb-3 border-primary">
            <div class="card-body">
                <h6 class="card-title text-primary"><i class="fas fa-calendar-alt me-1"></i> ${reportTitle}</h6>
                <div class="row g-2 mb-3">
                    <div class="col-6">
                        <label class="form-label small">From</label>
                        <input type="date" id="exportStartDate" class="form-control form-control-sm">
                    </div>
                    <div class="col-6">
                        <label class="form-label small">To</label>
                        <input type="date" id="exportEndDate" class="form-control form-control-sm">
                    </div>
                </div>
                <div class="btn-group btn-group-sm w-100 mb-3">
                    <button type="button" class="btn btn-outline-secondary" onclick="applyDatePreset('exportStartDate', 'exportEndDate', 'day')">Today</button>
                    <button type="button" class="btn btn-outline-secondary" onclick="applyDatePreset('exportStartDate', 'exportEndDate', 'week')">Week</button>
                    <button type="button" class="btn btn-outline-secondary" onclick="applyDatePreset('exportStartDate', 'exportEndDate', 'month')">Month</button>
                </div>
                <button type="button" class="btn btn-primary btn-sm w-100" onclick="const s = document.getElementById('exportStartDate').value; const e = document.getElementById('exportEndDate').value; if(typeof window['${onExportFunctionName}'] === 'function') window['${onExportFunctionName}'](s, e); else if(typeof window['SupabaseBackend'] !== 'undefined' && typeof window['SupabaseBackend']['${onExportFunctionName}'] === 'function') window['SupabaseBackend']['${onExportFunctionName}'](s, e); else console.error('Export function ${onExportFunctionName} not found');">
                    Generate & Download CSV
                </button>
            </div>
        </div>
    `;
}