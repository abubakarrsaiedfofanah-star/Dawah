// Runtime slice from daawah.js: savePublicLeader.
function savePublicLeader() {
    const name = document.getElementById('publicLeaderName').value.trim();
    const position = document.getElementById('publicLeaderPosition').value.trim();
    const bio = document.getElementById('publicLeaderBio').value.trim();
    const course = document.getElementById('publicLeaderCourse').value.trim();
    const yearOfStudy = document.getElementById('publicLeaderYearOfStudy').value.trim();
    const description = document.getElementById('publicLeaderDescription').value.trim();
    const email = document.getElementById('publicLeaderEmail').value.trim();
    const phone = document.getElementById('publicLeaderPhone').value.trim();
    const photoInput = document.getElementById('publicLeaderPhoto');

    if (!name || !position || !bio || !description || !email || !phone) {
        showNotification('Please fill in all required fields.', 'warning');
        return;
    }

    let publicLeaders = readList('publicLeaders');

    const newLeader = {
        id: Date.now(),
        name: name,
        position: position,
        course: course,
        year_of_study: yearOfStudy,
        bio: bio,
        description: description,
        email: email,
        phone: phone,
        photoData: null,
        createdAt: new Date().toISOString()
    };

    // Handle photo upload if provided
    if (photoInput && photoInput.files && photoInput.files.length > 0) {
        const file = photoInput.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            newLeader.photoData = e.target.result;
            publicLeaders.push(newLeader);
            localStorage.setItem('publicLeaders', JSON.stringify(publicLeaders));
            bootstrap.Modal.getInstance(document.getElementById('addPublicLeaderModal')).hide();
            loadPublicLeadershipList();
            loadLeadershipContent(); // Refresh landing page
            showNotification('Leader added successfully!', 'success');
        };
        reader.readAsDataURL(file);
    } else {
        publicLeaders.push(newLeader);
        localStorage.setItem('publicLeaders', JSON.stringify(publicLeaders));
        bootstrap.Modal.getInstance(document.getElementById('addPublicLeaderModal')).hide();
        loadPublicLeadershipList();
        loadLeadershipContent(); // Refresh landing page
        showNotification('Leader added successfully!', 'success');
    }
}
