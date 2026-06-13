// Runtime slice from daawah.js: renderVolunteerStatusActions.
function renderVolunteerStatusActions(record) {
    return `
        <div class="btn-group btn-group-sm mt-2" role="group" aria-label="Volunteer status">
            <button class="btn btn-outline-primary" onclick="updateVolunteerStatus(${record.dbRegistrationId}, 'registered')">Registered</button>
            <button class="btn btn-outline-primary" onclick="updateVolunteerStatus(${record.dbRegistrationId}, 'in-progress')">Progress</button>
            <button class="btn btn-outline-success" onclick="updateVolunteerStatus(${record.dbRegistrationId}, 'completed')">Done</button>
        </div>
    `;
}
