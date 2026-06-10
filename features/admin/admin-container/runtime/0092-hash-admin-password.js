// Runtime slice from admin.js: hashAdminPassword.
async function hashAdminPassword(password, salt = createPasswordSalt()) {
    if (!window.crypto?.subtle) {
        return {
            passwordHash: await legacyHashAdminPassword(`${salt}:${password}`),
            passwordSalt: salt,
            passwordIterations: 1,
            passwordAlgorithm: 'SHA-256-FALLBACK'
        };
    }

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
    );
    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: hexToBytes(salt),
            iterations: ADMIN_HASH_ITERATIONS,
            hash: 'SHA-256'
        },
        keyMaterial,
        256
    );

    return {
        passwordHash: bytesToHex(new Uint8Array(derivedBits)),
        passwordSalt: salt,
        passwordIterations: ADMIN_HASH_ITERATIONS,
        passwordAlgorithm: ADMIN_HASH_ALGORITHM
    };
}
