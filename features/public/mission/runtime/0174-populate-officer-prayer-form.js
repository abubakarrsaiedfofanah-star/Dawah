// Runtime slice from daawah.js: populateOfficerPrayerForm.
function populateOfficerPrayerForm(data = {}) {
    if (!hasPermission('manage_prayer_times')) return;
    const today = new Date().toISOString().slice(0, 10);
    const fieldMap = {
        officerPrayerDate: data.date || today,
        officerPrayerFajr: (data.fajr || '').slice(0, 5),
        officerPrayerDhuhr: (data.dhuhr || '').slice(0, 5),
        officerPrayerAsr: (data.asr || '').slice(0, 5),
        officerPrayerMaghrib: (data.maghrib || '').slice(0, 5),
        officerPrayerIsha: (data.isha || '').slice(0, 5),
        officerPrayerJummah: (data.jummah_time || '').slice(0, 5)
    };
    Object.entries(fieldMap).forEach(([id, value]) => {
        const input = document.getElementById(id);
        if (input && !input.value) input.value = value;
    });
}
