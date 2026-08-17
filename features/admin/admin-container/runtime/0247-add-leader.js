// Runtime slice from admin.js: addLeader.
function addLeader() {
    if (!isCurrentLocalMainAdmin() && useStaticAdminApi) {
        showNotification('Only the main admin can manage leadership.', 'warning');
        return;
    }

    const name = document.getElementById('leaderName').value.trim();
    const position = document.getElementById('leaderPosition').value.trim();
    const course = document.getElementById('leaderCourse').value.trim();
    const yearOfStudy = document.getElementById('leaderYearOfStudy').value.trim();
    const bio = document.getElementById('leaderBio').value.trim();
    const description = document.getElementById('leaderDescription').value.trim();
    const email = document.getElementById('leaderEmail').value.trim();
    const phone = document.getElementById('leaderPhone').value.trim();
    const photoFile = document.getElementById('leaderPassportPhoto')?.files?.[0] || null;
    
    if (!name || !position) {
        showNotification('Name and position are required', 'warning');
        return;
    }
    
    const data = new FormData();
    Object.entries({
        name: name,
        position: position,
        course: course,
        year_of_study: yearOfStudy,
        bio: bio,
        description: description,
        email: email,
        phone: phone,
        user_id: currentAdmin.id || 0
    }).forEach(([key, value]) => data.append(key, value || ''));
    if (photoFile) {
        data.append('leader_passport_photo', photoFile);
    }
    
    fetch(`${API_URL}?action=addLeader`, {
        method: 'POST',
        body: data
    })
    .then(response => parseJsonResponse(response))
    .then(result => {
        if (result.success) {
            showNotification('Leadership member added successfully!', 'success');
            document.getElementById('leaderName').value = '';
            document.getElementById('leaderPosition').value = '';
            document.getElementById('leaderCourse').value = '';
            document.getElementById('leaderYearOfStudy').value = '';
            document.getElementById('leaderBio').value = '';
            document.getElementById('leaderDescription').value = '';
            document.getElementById('leaderEmail').value = '';
            document.getElementById('leaderPhone').value = '';
            document.getElementById('leaderPassportPhoto').value = '';
            loadLeadership();
            loadLeadershipCount();
        } else {
            showNotification('Error adding leader: ' + result.message, 'danger');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Error adding leader', 'danger');
    });
}
