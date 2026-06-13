// Runtime slice from admin.js: upsertReligiousActivity.
function upsertReligiousActivity(items, item, editId) {
    if (!editId) return [...items, item];
    return items.map(existing => Number(existing.id) === Number(editId) ? item : existing);
}
