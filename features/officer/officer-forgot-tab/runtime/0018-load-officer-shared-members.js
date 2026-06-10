// Runtime slice from officer.js: loadOfficerSharedMembers.
async function loadOfficerSharedMembers() {
    if (!window.DawaahCloud?.enabled || !window.DawaahCloud.hasAuthSession()) return;
    const member = await window.DawaahCloud.loadMyMember().catch(() => null);
    if (member) {
        writeLocalMembers(mergeMemberIntoList(readLocalMembers(), member));
    }
}
