// Runtime slice from daawah.js: getReligiousActivities.
function getReligiousActivities() {
    return readStoredObject('adminReligiousActivities', {
        jummah: [],
        ramadan: [],
        lectures: []
    });
}
