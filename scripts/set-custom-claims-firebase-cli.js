const auth = require('firebase-tools/lib/auth');
const apiv2 = require('firebase-tools/lib/apiv2');

const projectId = process.env.FIREBASE_PROJECT_ID || 'umma-university-da-awah-team';

function argValue(name) {
  const prefix = `--${name}=`;
  const inline = process.argv.find(arg => arg.startsWith(prefix));
  if (inline) return inline.slice(prefix.length);
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : '';
}

const email = String(argValue('email') || '').trim().toLowerCase();
const role = String(argValue('role') || '').trim().toLowerCase();

if (!email || !role) {
  console.error('Usage: node scripts/set-custom-claims-firebase-cli.js --email user@example.com --role role_name');
  process.exit(1);
}

async function getToken() {
  const account = auth.getGlobalDefaultAccount();
  if (!account) throw new Error('Firebase CLI is not logged in. Run: firebase login');
  auth.setActiveAccount({}, account);
  return apiv2.getAccessToken();
}

async function fetchJson(url, token, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  const json = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(json?.error?.message || text.slice(0, 180) || `Request failed with ${response.status}`);
  }
  return json;
}

async function main() {
  const token = await getToken();
  const query = await fetchJson(`https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:query`, token, {
    method: 'POST',
    body: JSON.stringify({ returnUserInfo: true, limit: 1000 })
  });
  const users = query.userInfo || query.users || [];
  const user = users.find(item => String(item.email || '').trim().toLowerCase() === email);
  if (!user) throw new Error(`No Firebase Auth user found for ${email}`);

  const uid = user.localId || user.uid;
  const existingClaims = user.customAttributes ? JSON.parse(user.customAttributes) : {};
  const claims = {
    ...existingClaims,
    role,
    [role]: true
  };

  await fetchJson(`https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:update`, token, {
    method: 'POST',
    body: JSON.stringify({
      localId: uid,
      customAttributes: JSON.stringify(claims)
    })
  });

  console.log(`Set custom claims for ${email} | uid=${uid} | role=${role}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
