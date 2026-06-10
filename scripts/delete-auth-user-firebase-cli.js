const auth = require('firebase-tools/lib/auth');
const apiv2 = require('firebase-tools/lib/apiv2');

const projectId = process.env.FIREBASE_PROJECT_ID || 'umma-university-da-awah-team';
const email = String(process.argv[2] || '').trim().toLowerCase();

if (!email) {
  console.error('Usage: node scripts/delete-auth-user-firebase-cli.js <email>');
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
  const queryUrl = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:query`;
  const result = await fetchJson(queryUrl, token, {
    method: 'POST',
    body: JSON.stringify({ returnUserInfo: true, limit: 1000 })
  });

  const users = result.userInfo || result.users || [];
  const user = users.find(item => String(item.email || '').trim().toLowerCase() === email);
  if (!user) {
    console.log(`No Firebase Auth user found for ${email}. Nothing deleted.`);
    return;
  }

  const uid = user.localId || user.uid;
  const deleteUrl = `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:delete`;
  await fetchJson(deleteUrl, token, {
    method: 'POST',
    body: JSON.stringify({ localId: uid })
  });

  console.log(`Deleted Firebase Auth user: ${email} | uid=${uid}`);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
