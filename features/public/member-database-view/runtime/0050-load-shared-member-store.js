// Runtime slice from daawah.js: loadSharedMemberStore.
async function loadSharedMemberStore() {
    if (!window.DawaahCloud?.enabled || !window.DawaahCloud.hasAuthSession()) return;
    let member = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
        member = await window.DawaahCloud.loadMyMember().catch(error => {
            if (attempt === 3) {
                console.warn('Firestore member profile load failed:', error);
            }
            return null;
        });
        if (member) break;
        if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, attempt * 600));
        }
    }
    if (member) {
        allMembers = mergeMemberIntoList(allMembers, member);
        localStorage.setItem('allMembers', JSON.stringify(allMembers));
    }
}
