// Runtime slice from admin.js: fetchHealthText.
async function fetchHealthText(url) {
    const response = await realFetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.text();
}
