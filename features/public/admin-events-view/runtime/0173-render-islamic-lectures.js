// Runtime slice from daawah.js: renderIslamicLectures.
function renderIslamicLectures(items) {
    const container = document.getElementById('lecturesDetails');
    if (!container) return;

    if (!items.length) {
        container.innerHTML = '<div class="col-12"><p class="text-center text-muted mb-0">No Islamic lectures have been added yet.</p></div>';
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="col-md-6 mb-3">
            <div class="card h-100">
                <div class="card-header">
                    <h6 class="mb-0">${item.title || 'Islamic Lecture'}</h6>
                </div>
                <div class="card-body">
                    <small class="d-block text-muted">${item.schedule || '-'}</small>
                    ${item.speaker ? `<p class="mb-2"><strong>Speaker:</strong> ${item.speaker}</p>` : ''}
                    <p class="mb-0">${item.description || 'Details will be shared soon.'}</p>
                </div>
            </div>
        </div>
    `).join('');
}

// EVENTS
