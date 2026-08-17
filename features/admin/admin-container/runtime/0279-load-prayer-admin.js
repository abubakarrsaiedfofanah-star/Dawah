// Runtime slice from admin.js: loadPrayerAdmin.
function loadPrayerAdmin() {
    const today = new Date().toISOString().slice(0, 10);
    document.getElementById('prayerDate').value = today;
    renderReligiousActivitiesAdmin();
    fetch(`${API_URL}?action=getPrayerTimes&date=${today}`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        const data = result.data || {};
        document.getElementById('prayerFajr').value = (data.fajr || '').slice(0, 5);
        document.getElementById('prayerDhuhr').value = (data.dhuhr || '').slice(0, 5);
        document.getElementById('prayerAsr').value = (data.asr || '').slice(0, 5);
        document.getElementById('prayerMaghrib').value = (data.maghrib || '').slice(0, 5);
        document.getElementById('prayerIsha').value = (data.isha || '').slice(0, 5);
        document.getElementById('prayerJummah').value = (data.jummah_time || '').slice(0, 5);
        renderPrayerPreview(data);
    });
}
