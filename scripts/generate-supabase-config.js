const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

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
  enabledHosts: (process.env.DAWAH_SUPABASE_ENABLED_HOSTS || 'localhost,127.0.0.1,vercel.app')
    .split(',')
    .map(host => host.trim())
    .filter(Boolean),
  realtime: process.env.DAWAH_SUPABASE_REALTIME !== 'false'
};

const output = `window.DAWAH_SUPABASE_CONFIG = ${JSON.stringify(config, null, 4)};\nwindow.DAWAAH_SUPABASE_CONFIG = window.DAWAH_SUPABASE_CONFIG;\n`;
fs.writeFileSync(path.join(root, 'supabase_config.js'), output);
console.log(`Generated supabase_config.js (${config.url && config.anonKey ? 'configured' : 'placeholders empty'}).`);
