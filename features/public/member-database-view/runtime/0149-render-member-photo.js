// Runtime slice from daawah.js: renderMemberPhoto.
function renderMemberPhoto(member) {
    const photo = getMemberPhoto(member);
    if (!photo) {
        return '<i class="fas fa-user-circle fa-2x text-muted"></i>';
    }
    return `<img class="member-photo-thumb" src="${photo}" alt="${member.fullName || member.name || member.username || 'Member photo'}">`;
}
