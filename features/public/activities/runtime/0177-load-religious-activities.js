// Runtime slice from daawah.js: loadReligiousActivities.
function loadReligiousActivities() {
    const data = getReligiousActivities();
    renderJummahReminders(data.jummah || []);
    renderRamadanSchedule(data.ramadan || []);
    renderIslamicLectures(data.lectures || []);
}
