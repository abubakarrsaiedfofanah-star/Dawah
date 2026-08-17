// Runtime slice from daawah.js: deletePublicLeader.
function deletePublicLeader(id) {
    if (!confirm('Are you sure you want to delete this leader?')) return;

    let publicLeaders = readList('publicLeaders');
    publicLeaders = publicLeaders.filter(leader => leader.id !== id);
    localStorage.setItem('publicLeaders', JSON.stringify(publicLeaders));
    loadPublicLeadershipList();
    loadLeadershipContent(); // Refresh landing page
    showNotification('Leader deleted successfully!', 'success');
}
