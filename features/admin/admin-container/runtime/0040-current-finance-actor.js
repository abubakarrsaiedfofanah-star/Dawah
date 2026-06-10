// Runtime slice from admin.js: currentFinanceActor.
function currentFinanceActor() {
    return currentAdmin?.username || currentAdmin?.email || 'Admin';
}
