// Runtime slice from admin.js: deleteStoreItem.
function deleteStoreItem(key, id) {
    const items = readStore(key).filter(item => Number(item.id) !== Number(id));
    writeStore(key, items);
}
