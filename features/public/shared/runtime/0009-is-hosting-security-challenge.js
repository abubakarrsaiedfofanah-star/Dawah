// Runtime slice from daawah.js: isHostingSecurityChallenge.
function isHostingSecurityChallenge(text) {
    return /src=["']\/aes\.js["']/i.test(text) && /document\.cookie=["']__test=/i.test(text);
}
