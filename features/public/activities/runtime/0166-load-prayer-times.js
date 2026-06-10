// Runtime slice from daawah.js: loadPrayerTimes.
function loadPrayerTimes() {
    const container = document.getElementById('prayerTimesDetails');
    const managerPanel = document.getElementById('officerPrayerManagerPanel');
    managerPanel?.classList.toggle('d-none', !hasPermission('manage_prayer_times'));
    loadReligiousActivities();
    if (!container) return;

    const today = new Date().toISOString().slice(0, 10);
    const prayerRequest = window.DawaahCloud?.enabled && window.DawaahCloud.hasAuthSession()
        ? window.DawaahCloud.loadStore('adminPrayerTimes').then(data => ({ success: true, data }))
        : frontendOnly
        ? Promise.resolve(getStaticApiData('getPrayerTimes'))
        : fetch(`admin_firestore-disabled-endpoint?action=getPrayerTimes&date=${today}`).then(response => parseJsonResponse(response));

    prayerRequest
    .then(result => {
        const data = result.data || {};
        populateOfficerPrayerForm(data);
        const prayerTimes = [
            { name: 'Fajr', time: data.fajr },
            { name: 'Dhuhr', time: data.dhuhr },
            { name: 'Asr', time: data.asr },
            { name: 'Maghrib', time: data.maghrib },
            { name: 'Isha', time: data.isha },
            { name: 'Jumu\'ah', time: data.jummah_time }
        ];
        container.innerHTML = `<div class="prayer-schedule">${prayerTimes.map(prayer => `
            <div class="prayer-item">
                <span class="prayer-label">${prayer.name}</span>
                <span class="prayer-time">${prayer.time || 'Not set'}</span>
            </div>
        `).join('')}</div>`;
    })
    .catch(() => {
        container.innerHTML = '<p class="text-muted">Prayer timetable has not been added yet.</p>';
    });
}
