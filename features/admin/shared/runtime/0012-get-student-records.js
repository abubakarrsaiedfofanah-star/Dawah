// Runtime slice from admin.js: getStudentRecords.
function getStudentRecords() {
    return readStore('allMembers').filter(isStudentRecord);
}
