// Runtime slice from daawah.js: loadLeadershipContent.
function loadLeadershipContent() {
    const leadershipContainer = document.getElementById('leadershipContainer');
    if (!leadershipContainer) return;

    const leadershipRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getLeaders'))
        : fetch('admin_firestore-disabled-endpoint?action=getLeaders').then(response => parseJsonResponse(response));

    leadershipRequest
    .then(result => {
        let leaders = result.data || [];

        // Fallback to localStorage if no database results
        if (leaders.length === 0) {
            leaders = readList('publicLeaders');
        }

        if (leaders.length === 0) {
            leadershipContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">Leadership information will be updated soon.</p>
                </div>
            `;
            return;
        }

        leadershipContainer.innerHTML = leaders.map(leader => `
            <div class="col-md-6 col-lg-3 mb-4">
                <button type="button" class="leadership-card leadership-card-button" onclick="showLeaderDetails('${encodeLeaderDetails(leader)}')" aria-label="View ${escapeHtml(leader.name)} details">
                    <div class="leader-photo">
                        ${leader.photo_url ? `<img src="${resolveAppUrl(leader.photo_url)}" alt="${escapeHtml(leader.name)}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">` : ''}
                        <i class="fas fa-user-circle fa-5x" ${leader.photo_url ? 'style="display: none;"' : ''}></i>
                    </div>
                    <h6>${escapeHtml(leader.name)}</h6>
                    <p class="position">${escapeHtml(leader.position)}</p>
                    ${leader.course ? `<p class="bio"><strong>Course:</strong> ${escapeHtml(leader.course)}</p>` : ''}
                    ${leader.year_of_study ? `<p class="bio"><strong>Year:</strong> ${escapeHtml(leader.year_of_study)}</p>` : ''}
                    <p class="bio">${escapeHtml(leader.bio || '')}</p>
                </button>
            </div>
        `).join('');
    })
    .catch(() => {
        // Fallback to localStorage
        const publicLeaders = readList('publicLeaders');

        if (publicLeaders.length === 0) {
            leadershipContainer.innerHTML = `
                <div class="col-12 text-center">
                    <p class="text-muted">Leadership information will be updated soon.</p>
                </div>
            `;
            return;
        }

        leadershipContainer.innerHTML = publicLeaders.map(leader => `
            <div class="col-md-6 col-lg-3 mb-4">
                <button type="button" class="leadership-card leadership-card-button" onclick="showLeaderDetails('${encodeLeaderDetails(leader)}')" aria-label="View ${escapeHtml(leader.name)} details">
                    <div class="leader-photo">
                        ${leader.photoData ? `<img src="${leader.photoData}" alt="${escapeHtml(leader.name)}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 50%;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">` : ''}
                        <i class="fas fa-user-circle fa-5x" ${leader.photoData ? 'style="display: none;"' : ''}></i>
                    </div>
                    <h6>${escapeHtml(leader.name)}</h6>
                    <p class="position">${escapeHtml(leader.position)}</p>
                    ${leader.course ? `<p class="bio"><strong>Course:</strong> ${escapeHtml(leader.course)}</p>` : ''}
                    ${leader.year_of_study ? `<p class="bio"><strong>Year:</strong> ${escapeHtml(leader.year_of_study)}</p>` : ''}
                    <p class="bio">${escapeHtml(leader.bio)}</p>
                </button>
            </div>
        `).join('');
    });
}
