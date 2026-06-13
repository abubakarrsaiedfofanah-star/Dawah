// Runtime slice from daawah.js: createLocalResetCode.
function createLocalResetCode(email) {
    const lookup = String(email || '').trim().toLowerCase();
    const member = allMembers.find(item => String(item.email || '').trim().toLowerCase() === lookup);
    if (!member) {
        throw new Error('No local account was found for this email.');
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codes = readLocalResetCodes();
    codes[lookup] = {
        code,
        expiresAt: Date.now() + LOCAL_RESET_CODE_TTL_MS
    };
    writeLocalResetCodes(codes);
    return { success: true, data: { mail_sent: false, dev_code: code } };
}
