// Runtime slice from daawah.js: renderJummahReminders.
function renderJummahReminders(items) {
    const container = document.getElementById('jummahDetails');
    if (!container) return;

    if (!items.length) {
        container.innerHTML = '<p class="text-center text-muted mb-3">No Jumu\'ah reminders have been added yet.</p>';
        return;
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Khutbah Topic</th>
                        <th>Speaker</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>${item.date || '-'}</td>
                            <td>${item.time || '-'}</td>
                            <td>${item.topic || '-'}</td>
                            <td>${item.speaker || '-'}</td>
                        </tr>
                        ${item.note ? `<tr><td colspan="4" class="text-muted">${item.note}</td></tr>` : ''}
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}
