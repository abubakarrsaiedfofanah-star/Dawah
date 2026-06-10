// Runtime slice from admin.js: renderPrayerPreview.
function renderPrayerPreview(data) {
    document.getElementById('prayerPreview').innerHTML = `
        <div class="row">
            ${['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'jummah_time'].map(key => `
                <div class="col-md-4 mb-2"><strong>${key.replace('_time', '').toUpperCase()}:</strong> ${data[key] || 'Not set'}</div>
            `).join('')}
        </div>
    `;
}
