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

function normalizeSupabaseUrl(url) {
  const value = String(url || '').trim();
  if (!value) return '';
  if (/^[a-z0-9-]{15,}$/i.test(value) && !value.includes('.')) {
    return `https://${value}.supabase.co`;
  }
  try {
    const parsed = new URL(value.includes('://') ? value : `https://${value}`);
    const dashboardRef = parsed.hostname === 'supabase.com'
      ? parsed.pathname.match(/\/project\/([a-z0-9-]+)/i)?.[1]
      : '';
    if (dashboardRef) return `https://${dashboardRef}.supabase.co`;
    if (parsed.hostname.endsWith('.supabase.co')) {
      return `https://${parsed.hostname}`;
    }
  } catch (error) {
    return value;
  }
  return value;
}

const config = {
  url: normalizeSupabaseUrl(process.env.DAWAH_SUPABASE_URL
    || process.env.SUPABASE_URL
    || process.env.VITE_SUPABASE_URL
    || process.env.NEXT_PUBLIC_SUPABASE_URL
    || ''),
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

const isHostedBuild = process.env.VERCEL || process.env.CI;
if (isHostedBuild && (!config.url || !config.anonKey)) {
  console.error('Supabase config is missing. Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel, then redeploy.');
  process.exit(1);
}

const output = `window.DAWAH_SUPABASE_CONFIG = ${JSON.stringify(config, null, 4)};\nwindow.DAWAAH_SUPABASE_CONFIG = window.DAWAH_SUPABASE_CONFIG;\n`;
fs.writeFileSync(path.join(root, 'supabase_config.js'), output);
console.log(`Generated supabase_config.js (${config.url && config.anonKey ? 'configured' : 'placeholders empty'}).`);
