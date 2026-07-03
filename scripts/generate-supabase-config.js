const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

function normalizeEnabledHost(host) {
  const value = String(host || '').trim();
  if (!value) return '';
  try {
    return new URL(value.includes('://') ? value : `https://${value}`).hostname.toLowerCase();
  } catch (error) {
    return value.replace(/^https?:\/\//i, '').split('/')[0].split(':')[0].toLowerCase();
  }
}

const config = {
  url: process.env.DAWAH_SUPABASE_URL
    || process.env.SUPABASE_URL
    || process.env.VITE_SUPABASE_URL
    || process.env.NEXT_PUBLIC_SUPABASE_URL
    || '',
  anonKey: process.env.DAWAH_SUPABASE_ANON_KEY
    || process.env.SUPABASE_ANON_KEY
    || process.env.VITE_SUPABASE_ANON_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    || '',
  enabledHosts: (process.env.DAWAH_SUPABASE_ENABLED_HOSTS || 'localhost,127.0.0.1,vercel.app,dawah-six.vercel.app,www.dawah-six.vercel.app,66ghz.com,www.66ghz.com')
    .split(',')
    .map(normalizeEnabledHost)
    .filter(Boolean),
  realtime: process.env.DAWAH_SUPABASE_REALTIME !== 'false'
};

const output = `window.DAWAH_SUPABASE_CONFIG = ${JSON.stringify(config, null, 4)};\nwindow.DAWAAH_SUPABASE_CONFIG = window.DAWAH_SUPABASE_CONFIG;\n`;
fs.writeFileSync(path.join(root, 'supabase_config.js'), output);
console.log(`Generated supabase_config.js (${config.url && config.anonKey ? 'configured' : 'placeholders empty'}).`);
