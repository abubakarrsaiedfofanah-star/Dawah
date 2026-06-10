// Runtime slice from admin.js: fetchHealthJson.
async function fetchHealthJson(url) {
    const response = await realFetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
}
