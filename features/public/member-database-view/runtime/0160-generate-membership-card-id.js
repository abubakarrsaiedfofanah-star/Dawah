// Runtime slice from daawah.js: generateMembershipCardId.
function generateMembershipCardId() {
    const year = new Date().getFullYear();
    const random = (globalThis.crypto?.getRandomValues
        ? Array.from(globalThis.crypto.getRandomValues(new Uint8Array(5))).map(value => value.toString(36).padStart(2, '0')).join('')
        : Math.random().toString(36).slice(2, 12)).replace(/[^a-z0-9]/gi, '').slice(0, 10).toUpperCase();
    return `UMMA-CARD-${year}-${random}`;
}
