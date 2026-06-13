const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const manifestPath = path.join(root, 'features', '_runtime-manifest.json');

if (!fs.existsSync(manifestPath)) {
  throw new Error('features/_runtime-manifest.json was not found. Run npm run runtime:split first.');
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

for (const bundle of manifest.bundles || []) {
  const chunks = bundle.chunks || [];
  const content = chunks.map(chunk => {
    const fullPath = path.join(root, chunk);
    if (!fs.existsSync(fullPath)) throw new Error(`Missing runtime chunk: ${chunk}`);
    return fs.readFileSync(fullPath, 'utf8').trimEnd();
  }).join('\n\n');

  const banner = bundle.type === 'css'
    ? `/* Assembled from feature runtime files. Edit features/**/runtime/*.css, then run npm run runtime:assemble. */\n`
    : `// Assembled from feature runtime files. Edit features/**/runtime/*.js, then run npm run runtime:assemble.\n`;

  fs.writeFileSync(path.join(root, bundle.output), `${banner}${content}\n`);
  console.log(`Assembled ${bundle.output} from ${chunks.length} chunks.`);
}
