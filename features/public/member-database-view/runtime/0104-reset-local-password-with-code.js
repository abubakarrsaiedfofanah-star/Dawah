// Runtime slice from daawah.js: resetLocalPasswordWithCode.
function resetLocalPasswordWithCode(email, code, password) {
    const lookup = String(email || '').trim().toLowerCase();
    const codes = readLocalResetCodes();
    const request = codes[lookup];
    if (!request || request.code !== code) {
        throw new Error('Invalid reset code. Request a new 6-digit code and try again.');
    }
    if (Date.now() > Number(request.expiresAt || 0)) {
        delete codes[lookup];
        writeLocalResetCodes(codes);
        throw new Error('Reset code expired. Request a new 6-digit code.');
    }
    allMembers = allMembers.map(member =>
        String(member.email || '').trim().toLowerCase() === lookup
            ? { ...member, password, updated_at: new Date().toISOString() }
            : member
    );
    localStorage.setItem('allMembers', JSON.stringify(allMembers));
    delete codes[lookup];
    writeLocalResetCodes(codes);
    return { success: true };
}
