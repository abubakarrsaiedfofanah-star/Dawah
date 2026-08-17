// Runtime slice from daawah.js: showPublicLeadershipModal.
function showPublicLeadershipModal() {
    loadPublicLeadershipList();
    const modal = new bootstrap.Modal(document.getElementById('publicLeadershipModal'));
    modal.show();
}
