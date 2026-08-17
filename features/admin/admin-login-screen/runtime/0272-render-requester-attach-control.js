// Runtime slice from admin.js: renderRequesterAttachControl.
function renderRequesterAttachControl(req) {
    if (!isMissingRequesterInfo(req)) return '';
    if (!adminStudentRequesters.length) {
        return '<div class="alert alert-warning py-2"><i class="fas fa-triangle-exclamation"></i> This old request has no saved requester details. Register/login records are needed before it can be linked.</div>';
    }

    const options = adminStudentRequesters.map((student, index) => {
        const label = `${student.fullName || student.name || student.username || 'Student'}${student.studentId ? ' - ' + student.studentId : ''}`;
        return `<option value="${index}">${label}</option>`;
    }).join('');

    return `
        <div class="alert alert-warning py-2">
            <label class="form-label mb-1"><i class="fas fa-link"></i> Link this old request to a requester before deciding</label>
            <div class="d-flex gap-2 flex-wrap">
                <select class="form-control form-control-sm" id="requesterLink${req.id}" style="max-width: 320px;">
                    <option value="">Select registered student</option>
                    ${options}
                </select>
                <button class="btn btn-sm btn-primary" onclick="attachRequesterToWelfare(${req.id})"><i class="fas fa-user-check"></i> Attach requester</button>
            </div>
        </div>
    `;
}
