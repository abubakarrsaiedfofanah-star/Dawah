// Runtime slice from admin.js: loadEventRegistrations.
function loadEventRegistrations() {
    fetch(`${API_URL}?action=getEventRegistrations`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        const container = document.getElementById('eventRegistrationsList');
        if (!container) return;

        const registrations = result.data || [];
        if (!registrations.length) {
            container.innerHTML = '<p class="text-muted">No students have registered for events yet.</p>';
            return;
        }

        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>Event</th>
                            <th>Student</th>
                            <th>Student ID</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Registered At</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${registrations.map(reg => {
                            const studentName = reg.first_name
                                ? `${reg.first_name} ${reg.last_name || ''}`.trim()
                                : (reg.submittedBy || reg.studentName || 'Student');
                            return `
                                <tr>
                                    <td>${reg.event_title || reg.eventName || 'Event'}</td>
                                    <td>${studentName}</td>
                                    <td>${reg.student_number || reg.student_id || '-'}</td>
                                    <td>${reg.email || '-'}</td>
                                    <td><span class="badge bg-success">${reg.status || 'registered'}</span></td>
                                    <td>${reg.registered_at ? new Date(reg.registered_at).toLocaleString() : (reg.registrationDate || '-')}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    })
    .catch(error => {
        console.error('Event registration loading error:', error);
        const container = document.getElementById('eventRegistrationsList');
        if (container) {
            container.innerHTML = '<p class="text-danger">Error loading event registrations.</p>';
        }
    });
}
