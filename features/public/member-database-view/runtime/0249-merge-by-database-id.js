// Runtime slice from daawah.js: mergeByDatabaseId.
function mergeByDatabaseId(localRecords, remoteRecords, idKey) {
    const merged = [...localRecords];
    remoteRecords.forEach(record => {
        const index = merged.findIndex(item => Number(item[idKey]) === Number(record[idKey]));
        if (index >= 0) {
            merged[index] = { ...merged[index], ...record };
        } else {
            merged.push(record);
        }
    });
    return merged;
}
