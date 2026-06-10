// Runtime slice from daawah.js: saveOfficerPrayerTimes.
function saveOfficerPrayerTimes(event) {
    event?.preventDefault?.();
    if (!hasPermission('manage_prayer_times')) {
        showNotification('Only the Amir/Director of Da\'awah Team can update prayer times.', 'warning');
        return;
    }

    const data = {
        date: document.getElementById('officerPrayerDate')?.value || new Date().toISOString().slice(0, 10),
        fajr: document.getElementById('officerPrayerFajr')?.value || '',
        dhuhr: document.getElementById('officerPrayerDhuhr')?.value || '',
        asr: document.getElementById('officerPrayerAsr')?.value || '',
        maghrib: document.getElementById('officerPrayerMaghrib')?.value || '',
        isha: document.getElementById('officerPrayerIsha')?.value || '',
        jummah_time: document.getElementById('officerPrayerJummah')?.value || '',
        updatedBy: currentUser?.email || currentUser?.username || '',
        updatedAt: new Date().toISOString()
    };

    const button = document.getElementById('officerPrayerSaveButton');
    const originalHtml = button?.innerHTML;
    if (button) {
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    }

    const saveRequest = window.DawaahCloud?.enabled
        ? window.DawaahCloud.saveStore('adminPrayerTimes', data)
        : Promise.resolve(data);

    saveRequest
        .then(() => {
            localStorage.setItem('adminPrayerTimes', JSON.stringify(data));
            logLocalRoleActivity('setPrayerTimes', { date: data.date });
            loadPrayerTimes();
            loadDashboardPrayerTimes();
            showNotification('Prayer timetable saved.', 'success');
        })
        .catch(error => {
            console.error('Prayer timetable save failed:', error);
            showNotification(error.message || 'Could not save prayer times.', 'danger');
        })
        .finally(() => {
            if (button) {
                button.disabled = false;
                button.innerHTML = originalHtml || '<i class="fas fa-save"></i> Save Prayer Times';
            }
        });
}
