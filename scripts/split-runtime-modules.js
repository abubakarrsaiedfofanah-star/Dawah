const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const featuresRoot = path.join(root, 'features');
const manifestPath = path.join(featuresRoot, '_runtime-manifest.json');

const bundles = [
  { page: 'public', source: 'daawah.js', type: 'js', output: 'daawah.js' },
  { page: 'admin', source: 'admin.js', type: 'js', output: 'admin.js' },
  { page: 'officer', source: 'officer.js', type: 'js', output: 'officer.js' },
  { page: 'public', source: 'daawah.css', type: 'css', output: 'daawah.css' }
];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function stripGeneratedBanners(content) {
  return String(content)
    .split(/\r?\n/)
    .filter(line => !/^\s*(?:\/\/|\/\*)\s*(?:Runtime slice from|Assembled from feature runtime files)/.test(line))
    .join('\n');
}

function write(file, content) {
  const fullPath = path.join(root, file);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content);
}

function removeGeneratedRuntimeFiles() {
  for (const page of ['public', 'admin', 'officer']) {
    const pageDir = path.join(featuresRoot, page);
    if (!fs.existsSync(pageDir)) continue;
    for (const feature of fs.readdirSync(pageDir)) {
      const runtimeDir = path.join(pageDir, feature, 'runtime');
      if (fs.existsSync(runtimeDir)) fs.rmSync(runtimeDir, { recursive: true, force: true });
    }
  }
}

function slug(value) {
  return String(value || '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'shared';
}

function readFeatureNames(page) {
  const dir = path.join(featuresRoot, page);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(name => fs.statSync(path.join(dir, name)).isDirectory())
    .sort();
}

function scoreFeature(featureName, text) {
  const tokens = featureName.split('-').filter(token => token.length > 2 && token !== 'view' && token !== 'page');
  return tokens.reduce((score, token) => score + (text.includes(token) ? 1 : 0), 0);
}

function chooseFeature(page, label, content) {
  const normalizedLabel = slug(label);
  if (['bootstrap', 'base', 'shared', 'global-variables'].includes(normalizedLabel)) return 'shared';

  const features = readFeatureNames(page);
  const text = `${normalizedLabel} ${slug(content.slice(0, 1400))}`;
  let best = '';
  let bestScore = 0;

  for (const feature of features) {
    const score = scoreFeature(feature, text);
    if (score > bestScore) {
      best = feature;
      bestScore = score;
    }
  }

  return best || 'shared';
}

function splitJs(content) {
  const lines = content.split(/\r?\n/);
  const starts = [{ line: 0, label: 'bootstrap' }];

  lines.forEach((line, index) => {
    const match = /^(?:async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/.exec(line);
    if (match && index !== 0) starts.push({ line: index, label: match[1] });
  });

  return starts.map((start, index) => {
    const end = starts[index + 1]?.line ?? lines.length;
    return {
      label: start.label,
      content: lines.slice(start.line, end).join('\n').trimEnd()
    };
  }).filter(chunk => chunk.content.trim());
}

function splitCss(content) {
  const lines = content.split(/\r?\n/);
  const starts = [{ line: 0, label: 'base' }];

  lines.forEach((line, index) => {
    const match = /^\s*\/\*\s*([^*]+?)\s*\*\/\s*$/.exec(line);
    if (match && index !== 0) starts.push({ line: index, label: match[1] });
  });

  return starts.map((start, index) => {
    const end = starts[index + 1]?.line ?? lines.length;
    return {
      label: start.label,
      content: lines.slice(start.line, end).join('\n').trimEnd()
    };
  }).filter(chunk => chunk.content.trim());
}

function splitBundle(bundle) {
  const content = stripGeneratedBanners(read(bundle.source));
  const chunks = bundle.type === 'css' ? splitCss(content) : splitJs(content);
  const entries = [];

  chunks.forEach((chunk, index) => {
    const feature = chooseFeature(bundle.page, chunk.label, chunk.content);
    const extension = bundle.type;
    const file = `features/${bundle.page}/${feature}/runtime/${String(index + 1).padStart(4, '0')}-${slug(chunk.label)}.${extension}`;
    const banner = bundle.type === 'css'
      ? `/* Runtime slice from ${bundle.source}: ${chunk.label}. */\n`
      : `// Runtime slice from ${bundle.source}: ${chunk.label}.\n`;
    write(file, `${banner}${chunk.content}\n`);
    entries.push(file);
  });

  return {
    source: bundle.source,
    output: bundle.output,
    type: bundle.type,
    page: bundle.page,
    chunks: entries
  };
}

removeGeneratedRuntimeFiles();

const runtimeManifest = {
  generatedAt: new Date().toISOString(),
  note: 'Ordered runtime slices. Edit feature files, then run npm run runtime:assemble to rebuild the browser bundles.',
  bundles: bundles.map(splitBundle)
};

write(path.relative(root, manifestPath), `${JSON.stringify(runtimeManifest, null, 2)}\n`);
console.log(`Split ${runtimeManifest.bundles.length} runtime bundles into feature folders.`);
