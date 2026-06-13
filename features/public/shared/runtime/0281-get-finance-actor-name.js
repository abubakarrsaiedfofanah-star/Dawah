// Runtime slice from daawah.js: getFinanceActorName.
function getFinanceActorName() {
    return currentUser?.fullName || currentUser?.name || currentUser?.username || currentRole || 'Treasurer';
}
