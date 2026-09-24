// Runtime slice from officer.js: loadOfficerSharedMembers.
async function loadOfficerSharedMembers(options = {}) {
    if (!window.SupabaseBackend?.enabled || !window.SupabaseBackend.hasAuthSession()) {
        if (options.required) throw new Error('Sign in through the secure officer login before continuing.');
        return null;
    }
    const member = await window.SupabaseBackend.loadMyMember().catch(error => {
        if (options.required) throw new Error('Could not verify your officer profile. Check your connection and try again.');
        console.warn('Officer profile could not be refreshed:', error);
        return null;
    });
    if (member) {
        writeLocalMembers(mergeMemberIntoList(readLocalMembers(), member));
    }
    if (!member && options.required) throw new Error('No approved officer profile is linked to this login. Contact the main admin.');
    return member || null;
}
