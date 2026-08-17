// Runtime slice from daawah.js: loadDashboardPrayerTimes.
function loadDashboardPrayerTimes() {
    const container = document.getElementById('prayerTimesList');
    if (!container) return;
    const today = new Date().toISOString().slice(0, 10);
    const prayerRequest = window.SupabaseBackend?.enabled && window.SupabaseBackend.hasAuthSession()
        ? window.SupabaseBackend.loadStore('adminPrayerTimes').then(data => ({ success: true, data }))
        : frontendOnly
        ? Promise.resolve(getStaticApiData('getPrayerTimes'))
        : fetch(`admin_supabase-required-endpoint?action=getPrayerTimes&date=${today}`).then(response => parseJsonResponse(response));
    prayerRequest.then(result => {
        const data = result.data || {};
        const prayers = [
            ['Fajr', data.fajr],
            ['Dhuhr', data.dhuhr],
            ['Asr', data.asr],
            ['Maghrib', data.maghrib],
            ['Isha', data.isha]
        ];
        container.innerHTML = prayers.map(([name, time]) => `
            <div class="prayer-time">
                <span class="prayer-name">${name}</span>
                <span class="prayer-time-value">${time || 'Not set'}</span>
            </div>
        `).join('');
    }).catch(() => {
        container.innerHTML = '<p class="text-muted mb-0">Prayer times have not been added yet.</p>';
    });
}

// TOGGLE/COLLAPSE FUNCTIONS FOR HIDING/SHOWING FEATURES
