// Runtime slice from officer.js: createLocalResetCode.
function createLocalResetCode(email) {
    const member = findLocalMember(email);
    if (!member) {
        throw new Error('No local account was found for this email.');
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const codes = readLocalResetCodes();
    codes[String(email).trim().toLowerCase()] = {
        code,
        expiresAt: Date.now() + OFFICER_RESET_CODE_TTL_MS
    };
    writeLocalResetCodes(codes);
    return { success: true, data: { mail_sent: false, dev_code: code } };
}
