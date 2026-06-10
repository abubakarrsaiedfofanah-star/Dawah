// Runtime slice from daawah.js: viewMemberDetails.
function viewMemberDetails(studentId) {
    const member = allMembers.find(item => item.studentId === studentId || item.username === studentId);
    if (!member) {
        showNotification('Member record not found.', 'warning');
        return;
    }
    const photo = getMemberPhoto(member);
    const body = document.getElementById('memberDetailsBody');
    if (!body) return;

    body.innerHTML = `
        <div class="row g-4 align-items-start">
            <div class="col-md-4 text-center">
                <div class="mb-3">
                    ${photo ? `<img class="profile-photo__image" src="${photo}" alt="${escapeHtml(member.fullName || member.username || 'Member photo')}">` : '<i class="fas fa-user-circle fa-5x text-muted"></i>'}
                </div>
                <h5>${escapeHtml(member.fullName || member.name || member.username || 'Member')}</h5>
                <p class="text-muted mb-0">${escapeHtml(member.studentId || member.username || 'No student ID')}</p>
            </div>
            <div class="col-md-8">
                <div class="row">
                    ${renderMemberDetailItem('Email', member.email)}
                    ${renderMemberDetailItem('Phone', member.phone)}
                    ${renderMemberDetailItem('Role', member.role || 'student')}
                    ${renderMemberDetailItem('Status', member.status || 'Active')}
                    ${renderMemberDetailItem('School', member.school)}
                    ${renderMemberDetailItem('Course', member.course)}
                    ${renderMemberDetailItem('Year of Study', member.yearOfStudy)}
                    ${renderMemberDetailItem('Semester', member.semester)}
                    ${renderMemberDetailItem('Gender', member.gender)}
                    ${renderMemberDetailItem('Nationality', member.nationality)}
                    ${renderMemberDetailItem('Emergency Contact', member.emergencyContact)}
                    ${renderMemberDetailItem('Local Guardian', member.localGuardian)}
                    ${renderMemberDetailItem('Home Address', member.homeAddress, 'col-md-12')}
                </div>
            </div>
        </div>
    `;
    new bootstrap.Modal(document.getElementById('memberDetailsModal')).show();
}
