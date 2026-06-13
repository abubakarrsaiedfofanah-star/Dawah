// Runtime slice from admin.js: renderWelfareRequests.
function renderWelfareRequests(requests) {
    const container = document.getElementById('welfareRequestsList');
    if (!container) return;

    if (!requests.length) {
        container.innerHTML = '<p class="text-muted">No welfare requests submitted yet.</p>';
        return;
    }

    container.innerHTML = requests.map(enrichWelfareRequestFromMembers).map(req => `
        <div class="item-card">
            <div class="item-info flex-grow-1">
                <h5>${req.type || req.category || 'Welfare Request'}</h5>
                <p>${req.description || ''}</p>
                <p><strong>Amount:</strong> ${formatRequestMoney(req.amount || req.amount_needed)}</p>
                <div class="alert alert-light border mb-2">
                    <h6 class="mb-2"><i class="fas fa-user-circle"></i> Requester Information</h6>
                    <p class="mb-1"><strong>Name:</strong> ${getWelfareRequesterName(req)}</p>
                    <p class="mb-1"><strong>Student ID:</strong> ${req.submittedByStudentId || req.student_number || 'N/A'}</p>
                    <p class="mb-1"><strong>Email:</strong> ${req.submittedByEmail || req.email || 'N/A'}</p>
                    <p class="mb-1"><strong>Phone:</strong> ${req.submittedByPhone || req.phone || 'N/A'}</p>
                    <p class="mb-0"><strong>Course/Year:</strong> ${[req.submittedByCourse || req.course, req.submittedByYear || req.year_of_study].filter(Boolean).join(' / ') || 'N/A'}</p>
                </div>
                ${renderRequesterAttachControl(req)}
                <span class="badge bg-${getWelfareColor(req.status)}"><i class="fas ${getWelfareStatusIcon(req.status)} me-1"></i>${formatWelfareStatus(req.status)}</span>
            </div>
            <div class="item-actions">
                <button class="btn btn-sm btn-success" onclick="updateWelfareStatus(${req.id}, 'Approved')"><i class="fas fa-circle-check"></i> Approve</button>
                <button class="btn btn-sm btn-outline-danger" onclick="updateWelfareStatus(${req.id}, 'Rejected')"><i class="fas fa-circle-xmark"></i> Reject</button>
            </div>
        </div>
    `).join('');
}
