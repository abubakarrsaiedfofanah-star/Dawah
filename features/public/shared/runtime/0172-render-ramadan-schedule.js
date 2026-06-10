// Runtime slice from daawah.js: renderRamadanSchedule.
function renderRamadanSchedule(items) {
    const container = document.getElementById('ramadanDetails');
    if (!container) return;

    if (!items.length) {
        container.innerHTML = '<p class="text-center text-muted mb-0">No Ramadan schedule has been added yet.</p>';
        return;
    }

    container.innerHTML = `
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Event</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Note</th>
                    </tr>
                </thead>
                <tbody>
                    ${items.map(item => `
                        <tr>
                            <td>${item.event || '-'}</td>
                            <td>${item.date || '-'}</td>
                            <td>${item.time || '-'}</td>
                            <td>${item.note || '-'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}
