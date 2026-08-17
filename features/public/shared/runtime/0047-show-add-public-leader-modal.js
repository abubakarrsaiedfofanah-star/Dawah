// Runtime slice from daawah.js: showAddPublicLeaderModal.
function showAddPublicLeaderModal() {
    // Clear form
    document.getElementById('addPublicLeaderForm').reset();
    const modal = new bootstrap.Modal(document.getElementById('addPublicLeaderModal'));
    modal.show();
}
