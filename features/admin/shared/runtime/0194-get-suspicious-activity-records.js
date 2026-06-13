// Runtime slice from admin.js: getSuspiciousActivityRecords.
function getSuspiciousActivityRecords() {
    const records = readStore('suspiciousActivityLog');
    return Array.isArray(records) ? records : [];
}
