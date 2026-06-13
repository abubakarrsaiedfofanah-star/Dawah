# Feature Modules

This folder breaks the large legacy pages into feature-owned folders.

Each feature folder contains:

- `*.html` - the feature markup extracted from the current page.
- `*.css` - the feature stylesheet file to receive styles as the feature is edited.
- `*.js` - a fault-map of DOM IDs and global click handlers owned by that feature.
- `runtime/` - ordered JavaScript or CSS slices assembled into the browser bundles.

The existing `index.html`, `admin.html`, `officer.html`, `daawah.js`, `admin.js`, `officer.js`, and `daawah.css` are still the browser compatibility layer. Edit feature runtime files, then run:

```powershell
npm.cmd run runtime:assemble
```


Regenerate after large HTML changes:

```powershell
node scripts/generate-feature-modules.js
```
