// Runtime slice from admin.js: loadLeadership.
function loadLeadership() {
    fetch(`${API_URL}?action=getLeaders`)
    .then(response => parseJsonResponse(response))
    .then(result => {
        const container = document.getElementById('leadershipList');
        if (!result.data || result.data.length === 0) {
            container.innerHTML = '<p class="text-muted">No leadership members added yet.</p>';
            return;
        }
        
        container.innerHTML = result.data.map(leader => `
            <div class="item-card">
                <div class="item-info flex-grow-1" role="button" tabindex="0" onclick="showAdminLeaderDetails('${encodeAdminLeaderDetails(leader)}')" onkeydown="if(event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showAdminLeaderDetails('${encodeAdminLeaderDetails(leader)}'); }">
                    <h5>${escapeAdminText(leader.name)}</h5>
                    <p><strong>Position:</strong> ${escapeAdminText(leader.position)}</p>
                    <p><strong>Course:</strong> ${escapeAdminText(leader.course || 'N/A')}</p>
                    <p><strong>Year of Study:</strong> ${escapeAdminText(leader.year_of_study || 'N/A')}</p>
                    <p><strong>Email:</strong> ${escapeAdminText(leader.email || 'N/A')}</p>
                    <p><strong>Phone:</strong> ${escapeAdminText(leader.phone || 'N/A')}</p>
                    <p>${escapeAdminText(leader.bio || '')}</p>
                    <button class="btn btn-sm btn-outline-primary" type="button" onclick="event.stopPropagation(); showAdminLeaderDetails('${encodeAdminLeaderDetails(leader)}')">
                        <i class="fas fa-eye"></i> Details
                    </button>
                </div>
                <div class="item-actions">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteLeaderItem(${leader.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('leadershipList').innerHTML = '<p class="text-danger">Error loading leaders</p>';
    });
}
