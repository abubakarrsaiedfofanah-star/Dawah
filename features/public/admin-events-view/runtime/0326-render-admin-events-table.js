// Runtime slice from daawah.js: renderAdminEventsTable.
function renderAdminEventsTable() {
    const tbody = document.getElementById('adminEventsList');
    if (!tbody) return;

    if (allEvents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No events have been added yet</td></tr>';
        return;
    }

    tbody.innerHTML = allEvents.map(event => {
        const title = event.title || event.name || 'Untitled event';
        const date = event.event_date || event.date || 'Not set';
        const location = event.location || 'Not set';
        const status = event.status || 'Upcoming';
        return `
            <tr>
                <td>${title}</td>
                <td>${date}</td>
                <td>${location}</td>
                <td>${registeredEvents.filter(reg => reg.eventId === String(event.id || event.eventId || title)).length}</td>
                <td><span class="badge bg-info">${status}</span></td>
                <td>
                    <button class="btn btn-sm btn-info" onclick="viewEventDetails('${title}')">View</button>
                    <button class="btn btn-sm btn-warning" onclick="editEvent('${title}')">Edit</button>
                </td>
            </tr>
        `;
    }).join('');
}
