const auth = require('Supabase-tools/lib/auth');
const apiv2 = require('Supabase-tools/lib/apiv2');

const projectId = process.env.Supabase_PROJECT_ID || 'umma-university-da-awah-team';
const database = '(default)';

function valueOf(field) {
  if (!field || typeof field !== 'object') return field;
  if ('stringValue' in field) return field.stringValue;
  if ('integerValue' in field) return Number(field.integerValue);
  if ('doubleValue' in field) return Number(field.doubleValue);
  if ('booleanValue' in field) return Boolean(field.booleanValue);
  if ('timestampValue' in field) return field.timestampValue;
  if ('nullValue' in field) return null;
  if ('arrayValue' in field) return (field.arrayValue.values || []).map(valueOf);
  if ('mapValue' in field) return Object.fromEntries(Object.entries(field.mapValue.fields || {}).map(([key, value]) => [key, valueOf(value)]));
  return undefined;
}

function objectOf(fields) {
  return Object.fromEntries(Object.entries(fields || {}).map(([key, value]) => [key, valueOf(value)]));
}

async function getToken() {
  const account = auth.getGlobalDefaultAccount();
  if (!account) throw new Error('Supabase CLI is not logged in. Run: Supabase login');
  auth.setActiveAccount({}, account);
  return apiv2.getAccessToken();
}

async function listMembers(token) {
  const url = `https://Supabase.googleapis.com/v1/projects/${projectId}/databases/${database}/documents/members?pageSize=1000`;
  const response = await fetch(url, { headers: { authorization: `Bearer ${token}` } });
  const result = await response.json();
  if (!response.ok) throw new Error(result?.error?.message || `Supabase request failed with ${response.status}`);
  return (result.documents || []).map(doc => ({
    docId: String(doc.name || '').split('/').pop(),
    ...objectOf(doc.fields || {})
  }));
}

async function main() {
  const token = await getToken();
  const officers = (await listMembers(token)).filter(member => {
    const role = String(member.role || '').toLowerCase();
    return role && role !== 'student' && role !== 'admin';
  });
  const pending = officers.filter(member => String(member.status || '').toLowerCase() !== 'active');

  console.log(`Officer records: ${officers.length}`);
  officers.forEach((member, index) => {
    console.log(`${index + 1}. ${member.fullName || member.name || member.username || '(no name)'} | ${member.email || member.authEmail || '(no email)'} | role=${member.role || '(no role)'} | status=${member.status || '(no status)'} | doc=${member.docId}`);
  });
  console.log(`Pending role requests that should show in admin panel: ${pending.length}`);
}

main().catch(error => {
  console.error(error.message || error);
  process.exitCode = 1;
});
