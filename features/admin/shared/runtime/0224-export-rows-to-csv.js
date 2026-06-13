// Runtime slice from admin.js: exportRowsToCsv.
function exportRowsToCsv(rows, filenameBase, preferredHeaders = null) {
    const allHeaders = Array.from(new Set(rows.flatMap(row => Object.keys(row || {}))));
    const headers = preferredHeaders || allHeaders;
    const csv = [headers.join(',')].concat(rows.map(row => headers.map(key => {
        const raw = row[key];
        const value = String(raw && typeof raw === 'object' ? JSON.stringify(raw) : (raw || '')).replaceAll('"', '""');
        return `"${value}"`;
    }).join(','))).join('\n');
    downloadBlob(`${filenameBase}-${new Date().toISOString().slice(0, 10)}.csv`, csv, 'text/csv;charset=utf-8');
}
