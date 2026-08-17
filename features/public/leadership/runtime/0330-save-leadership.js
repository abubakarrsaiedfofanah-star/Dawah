// Runtime slice from daawah.js: saveLeadership.
function saveLeadership() {
    const position = document.getElementById('leadershipPosition').value;
    const name = document.getElementById('leadershipName').value;
    const startDate = document.getElementById('leadershipStart').value;
    const endDate = document.getElementById('leadershipEnd').value;

    if (!position || !name || !startDate || !endDate) {
        alert('Please fill in all fields');
        return;
    }

    leadershipRoles.push({
        position: position,
        name: name,
        startDate: startDate,
        endDate: endDate,
        createdDate: new Date().toLocaleDateString()
    });

    localStorage.setItem('leadershipRoles', JSON.stringify(leadershipRoles));
    alert('Leadership role saved successfully!');
    bootstrap.Modal.getInstance(document.getElementById('leadershipModal')).hide();
    loadLeadership();
}
