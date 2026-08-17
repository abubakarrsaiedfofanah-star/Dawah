// Runtime slice from daawah.js: downloadReport.
function downloadReport(reportName) {
    const data = getReportData(reportName);
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName}.csv`;
    a.click();
}
