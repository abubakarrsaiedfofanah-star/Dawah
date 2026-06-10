// Runtime slice from admin.js: renderReligiousActivitiesAdmin.
function renderReligiousActivitiesAdmin() {
    const container = document.getElementById('religiousActivitiesList');
    if (!container) return;

    const data = getReligiousActivities();
    const jummahRows = data.jummah.map(item => `
        <tr>
            <td>Jumu'ah</td>
            <td>${item.date}</td>
            <td>${item.time || '-'}</td>
            <td>${item.topic}</td>
            <td>${item.speaker || '-'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editReligiousActivity('jummah', ${item.id})">Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteReligiousActivity('jummah', ${item.id})">Delete</button>
            </td>
        </tr>
    `).join('');
    const ramadanRows = data.ramadan.map(item => `
        <tr>
            <td>Ramadan</td>
            <td>${item.date}</td>
            <td>${item.time || '-'}</td>
            <td>${item.event}</td>
            <td>${item.note || '-'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editReligiousActivity('ramadan', ${item.id})">Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteReligiousActivity('ramadan', ${item.id})">Delete</button>
            </td>
        </tr>
    `).join('');
    const lectureRows = data.lectures.map(item => `
        <tr>
            <td>Lecture</td>
            <td>${item.schedule}</td>
            <td>-</td>
            <td>${item.title}</td>
            <td>${item.speaker || '-'}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editReligiousActivity('lecture', ${item.id})">Edit</button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteReligiousActivity('lecture', ${item.id})">Delete</button>
            </td>
        </tr>
    `).join('');
    const rows = jummahRows + ramadanRows + lectureRows;

    container.innerHTML = rows ? `
        <div class="table-responsive">
            <table class="table table-sm table-hover">
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Date/Schedule</th>
                        <th>Time</th>
                        <th>Title/Event</th>
                        <th>Speaker/Note</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>
        </div>
    ` : '<p class="text-muted">No religious activities have been added yet.</p>';
}
