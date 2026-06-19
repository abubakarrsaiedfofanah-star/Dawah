// Runtime slice from daawah.js: ensureAppManifestLink.
function ensureAppManifestLink() {
    if (typeof window.__dawaahEnsureManifest === 'function') {
        window.__dawaahEnsureManifest();
    }
}
