// Runtime slice from daawah.js: addYearsIso.
function addYearsIso(dateValue, years) {
    const date = dateValue ? new Date(dateValue) : new Date();
    if (Number.isNaN(date.getTime())) date.setTime(Date.now());
    date.setFullYear(date.getFullYear() + Number(years || 3));
    return date.toISOString();
}
