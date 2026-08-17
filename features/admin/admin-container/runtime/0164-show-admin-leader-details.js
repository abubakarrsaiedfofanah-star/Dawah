// Runtime slice from admin.js: showAdminLeaderDetails.
function showAdminLeaderDetails(encodedLeader) {
    const leader = typeof encodedLeader === 'string' ? JSON.parse(decodeURIComponent(encodedLeader)) : encodedLeader;
    const photoUrl = leader.photo_url || leader.photoData || '';

    document.getElementById('adminLeaderModalTitle').textContent = `${leader.name || 'Leader'} - ${leader.position || 'Details'}`;
    document.getElementById('adminLeaderName').textContent = leader.name || 'N/A';
    document.getElementById('adminLeaderPosition').textContent = leader.position || 'N/A';
    document.getElementById('adminLeaderCourse').textContent = leader.course || 'N/A';
    document.getElementById('adminLeaderYearOfStudy').textContent = leader.year_of_study || leader.yearOfStudy || 'N/A';
    document.getElementById('adminLeaderBio').textContent = leader.bio || 'N/A';
    document.getElementById('adminLeaderDescription').textContent = leader.description || 'N/A';
    document.getElementById('adminLeaderEmail').textContent = leader.email || 'N/A';
    document.getElementById('adminLeaderPhone').textContent = leader.phone || 'N/A';
    document.getElementById('adminLeaderAddedAt').textContent = leader.created_at ? new Date(leader.created_at).toLocaleString() : 'N/A';

    const image = document.getElementById('adminLeaderPhotoImage');
    const icon = document.getElementById('adminLeaderPhotoIcon');
    if (photoUrl && image) {
        image.src = resolveAdminUrl(photoUrl);
        image.alt = leader.name ? `${leader.name} profile photo` : 'Leader profile photo';
        image.classList.remove('d-none');
        icon?.classList.add('d-none');
        image.onerror = function() {
            image.classList.add('d-none');
            icon?.classList.remove('d-none');
        };
    } else {
        image?.classList.add('d-none');
        icon?.classList.remove('d-none');
    }

    bootstrap.Modal.getOrCreateInstance(document.getElementById('adminLeaderDetailsModal')).show();
}
