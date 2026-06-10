const apiKey = 'AIzaSyCNWhDeeoL9NH0d_x0xYw8rK_2Het2expY';
const email = `debug.rest.${Date.now()}@example.com`;
const password = `DebugRest${Date.now()}!`;

async function main() {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  const json = await response.json();
  console.log(JSON.stringify({
    ok: response.ok,
    status: response.status,
    email,
    uid: json.localId || '',
    error: json.error?.message || ''
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
