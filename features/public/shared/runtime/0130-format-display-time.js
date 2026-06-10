// Runtime slice from daawah.js: formatDisplayTime.
function formatDisplayTime(value) {
    const [hours = '', minutes = ''] = String(value).split(':');
    if (!hours || !minutes) return value;
    const parsedDate = new Date();
    parsedDate.setHours(Number(hours), Number(minutes), 0, 0);
    if (Number.isNaN(parsedDate.getTime())) return value;
    return parsedDate.toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit'
    });
}
