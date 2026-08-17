// Runtime slice from admin.js: formatAdminActivityDetails.
function formatAdminActivityDetails(details) {
    if (!details || typeof details !== 'object') return '-';
    const request = details.request || details;
    const nestedItem = request.item || request.previous_item || null;
    const interestingKeys = [
        'title',
        'requested_action',
        'approved_action',
        'rejected_action',
        'undone_action',
        'reason',
        'name',
        'position',
        'category',
        'resource_type',
        'role',
        'type',
        'location',
        'event_date',
        'date',
        'status',
        'priority',
        'username',
        'email',
        'admin_id',
        'event_id',
        'announcement_id',
        'leader_id',
        'gallery_id',
        'resource_id',
        'hadith_id',
        'request_id',
        'payment_id',
        'donation_id'
    ];
    const parts = interestingKeys
        .filter(key => request[key] !== undefined && request[key] !== null && request[key] !== '')
        .map(key => `${key.replaceAll('_', ' ')}: ${request[key]}`);
    if (nestedItem) {
        ['title', 'event', 'topic', 'date', 'schedule', 'speaker', 'time'].forEach(key => {
            if (nestedItem[key] !== undefined && nestedItem[key] !== null && nestedItem[key] !== '') {
                parts.push(`${key}: ${nestedItem[key]}`);
            }
        });
    }
    if (parts.length) {
        return parts.join(', ');
    }
    if (details.message) return details.message;
    return JSON.stringify(request).slice(0, 120);
}
