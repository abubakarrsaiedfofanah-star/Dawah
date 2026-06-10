// Runtime slice from daawah.js: showLeaderDetails.
function showLeaderDetails(leaderData) {
    const leader = typeof leaderData === 'string' ? JSON.parse(decodeURIComponent(leaderData)) : leaderData;
    const course = leader.course || '';
    const yearOfStudy = leader.year_of_study || leader.yearOfStudy || '';
    const photoUrl = leader.photo_url || leader.photoData || leader.photo || '';
    const addedAt = leader.created_at || leader.createdAt || '';

    document.getElementById('leaderModalTitle').textContent = `${leader.name} - ${leader.position}`;
    document.getElementById('leaderName').textContent = leader.name || '';
    document.getElementById('leaderPosition').textContent = leader.position || '';
    document.getElementById('leaderBio').textContent = leader.bio || 'No bio added yet.';
    document.getElementById('leaderDescription').textContent = leader.description || 'No description added yet.';
    document.getElementById('leaderEmail').textContent = leader.email || 'N/A';
    document.getElementById('leaderPhone').textContent = leader.phone || 'N/A';
    document.getElementById('leaderCourse').textContent = course || 'N/A';
    document.getElementById('leaderYearOfStudy').textContent = yearOfStudy || 'N/A';
    document.getElementById('leaderCourseRow').classList.toggle('d-none', !course);
    document.getElementById('leaderYearRow').classList.toggle('d-none', !yearOfStudy);
    document.getElementById('leaderAddedAt').textContent = addedAt ? new Date(addedAt).toLocaleString() : 'N/A';
    document.getElementById('leaderAddedRow').classList.toggle('d-none', !addedAt);

    const leaderPhotoImage = document.getElementById('leaderPhotoImage');
    const leaderPhotoIcon = document.getElementById('leaderPhotoIcon');
    if (photoUrl && leaderPhotoImage) {
        leaderPhotoImage.src = resolveAppUrl(photoUrl);
        leaderPhotoImage.alt = leader.name ? `${leader.name} profile photo` : 'Leader profile photo';
        leaderPhotoImage.classList.remove('d-none');
        leaderPhotoIcon?.classList.add('d-none');
        leaderPhotoImage.onerror = function() {
            leaderPhotoImage.classList.add('d-none');
            leaderPhotoIcon?.classList.remove('d-none');
        };
    } else {
        leaderPhotoImage?.classList.add('d-none');
        leaderPhotoIcon?.classList.remove('d-none');
    }

    const modal = new bootstrap.Modal(document.getElementById('leaderDetailsModal'));
    modal.show();
}
