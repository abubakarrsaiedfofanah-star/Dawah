// Runtime slice from officer.js: loadOfficerSharedMembers.
async function loadOfficerSharedMembers() {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession()) return;
    const member = await window.SupabaseBackend.loadMyMember().catch(() => null);
    if (member) {
        writeLocalMembers(mergeMemberIntoList(readLocalMembers(), member));
    }
}
