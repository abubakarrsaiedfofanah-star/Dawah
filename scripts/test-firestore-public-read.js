const apiKey = 'AIzaSyCNWhDeeoL9NH0d_x0xYw8rK_2Het2expY';
const url = `https://firestore.googleapis.com/v1/projects/umma-university-da-awah-team/databases/(default)/documents/appStores/siteSettings?key=${apiKey}`;

async function main() {
  const response = await fetch(url, {
    headers: {
      referer: 'https://umma-university-da-awah-team.web.app/'
    }
  });
  const text = await response.text();
  console.log(JSON.stringify({
    ok: response.ok,
    status: response.status,
    body: text.slice(0, 500)
  }, null, 2));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
