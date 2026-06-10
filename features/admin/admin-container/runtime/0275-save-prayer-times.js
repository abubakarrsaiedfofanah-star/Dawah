// Runtime slice from admin.js: savePrayerTimes.
function savePrayerTimes() {
    const previousPrayerTimes = JSON.parse(localStorage.getItem('adminPrayerTimes') || 'null');
    const data = {
        date: document.getElementById('prayerDate').value || new Date().toISOString().slice(0, 10),
        fajr: document.getElementById('prayerFajr').value,
        dhuhr: document.getElementById('prayerDhuhr').value,
        asr: document.getElementById('prayerAsr').value,
        maghrib: document.getElementById('prayerMaghrib').value,
        isha: document.getElementById('prayerIsha').value,
        jummah_time: document.getElementById('prayerJummah').value,
        _previous_prayer_times: previousPrayerTimes
    };
    fetch(`${API_URL}?action=setPrayerTimes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (!result.success) throw new Error(result.message || 'Could not save prayer times');
        showNotification('Prayer timetable saved.', 'success');
        renderPrayerPreview(data);
    })
    .catch(error => showNotification(error.message, 'danger'));
}
