// Runtime slice from daawah.js: loadPublicLeadershipList.
function loadPublicLeadershipList() {
    const container = document.getElementById('publicLeadershipList');
    const publicLeaders = readList('publicLeaders');

    if (publicLeaders.length === 0) {
        container.innerHTML = '<p class="text-muted">No public leaders added yet.</p>';
        return;
    }

    container.innerHTML = publicLeaders.map(leader => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="card-title">${escapeHtml(leader.name)}</h6>
                        <p class="card-subtitle mb-2 text-muted">${escapeHtml(leader.position)}</p>
                        ${leader.course ? `<p class="card-text small mb-1"><strong>Course:</strong> ${escapeHtml(leader.course)}</p>` : ''}
                        ${leader.year_of_study ? `<p class="card-text small mb-1"><strong>Year:</strong> ${escapeHtml(leader.year_of_study)}</p>` : ''}
                        <p class="card-text small">${escapeHtml(leader.bio)}</p>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="showLeaderDetails('${encodeLeaderDetails(leader)}')">
                            <i class="fas fa-eye"></i> Details
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="deletePublicLeader(${leader.id})">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}
