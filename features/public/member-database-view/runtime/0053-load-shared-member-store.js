// Runtime slice from daawah.js: loadSharedMemberStore.
async function loadSharedMemberStore() {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession()) return;
    const member = await window.SupabaseBackend.loadMyMember().catch(error => {
        console.warn('Supabase member profile load failed:', error);
        return null;
    });
    if (member) {
        allMembers = mergeMemberIntoList(allMembers, member);
        localStorage.setItem('allMembers', JSON.stringify(allMembers));
    }
}
