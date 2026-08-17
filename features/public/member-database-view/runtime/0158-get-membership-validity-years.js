// Runtime slice from daawah.js: getMembershipValidityYears.
function getMembershipValidityYears(member = currentUser) {
    const course = String(member?.course || '').toLowerCase();
    return course.includes('nursing') ? 4 : 3;
}
