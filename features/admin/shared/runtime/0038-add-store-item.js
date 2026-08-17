// Runtime slice from admin.js: addStoreItem.
function addStoreItem(key, item) {
    const items = readStore(key);
    const savedItem = {
        id: Date.now(),
        created_at: new Date().toISOString(),
        ...item
    };
    items.push(savedItem);
    writeStore(key, items);
    return savedItem;
}
