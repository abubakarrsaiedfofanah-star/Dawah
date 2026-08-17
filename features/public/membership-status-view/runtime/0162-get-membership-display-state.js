// Runtime slice from daawah.js: getMembershipDisplayState.
function getMembershipDisplayState() {
    const isMember = hasActiveMembership();
    return {
        isMember,
        status: isMember ? 'Active Member' : 'Not member',
        tier: isMember ? 'Full Member' : 'Registered Student',
        badgeClass: isMember ? 'bg-success' : 'bg-secondary',
        sinceLabel: isMember ? 'Member Since' : 'Registered Since'
    };
}
