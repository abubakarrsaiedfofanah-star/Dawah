// Runtime slice from admin.js: encodeAdminLeaderDetails.
function encodeAdminLeaderDetails(leader) {
    return encodeURIComponent(JSON.stringify({
        id: leader.id || '',
        name: leader.name || '',
        position: leader.position || '',
        course: leader.course || '',
        year_of_study: leader.year_of_study || leader.yearOfStudy || '',
        bio: leader.bio || '',
        description: leader.description || '',
        email: leader.email || '',
        phone: leader.phone || '',
        photo_url: leader.photo_url || leader.photoData || '',
        created_at: leader.created_at || leader.createdAt || ''
    })).replace(/'/g, '%27');
}
