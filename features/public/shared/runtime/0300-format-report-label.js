// Runtime slice from daawah.js: formatReportLabel.
function formatReportLabel(value) {
    return String(value || 'Other')
        .replace(/[_-]+/g, ' ')
        .replace(/\b\w/g, character => character.toUpperCase());
}
