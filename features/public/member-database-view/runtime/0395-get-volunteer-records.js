// Runtime slice from daawah.js: getVolunteerRecords.
function getVolunteerRecords() {
    const localRecords = readList('volunteerRecords');
    return [...databaseVolunteerRecords, ...localRecords];
}
