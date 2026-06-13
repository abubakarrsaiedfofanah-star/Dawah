// Runtime slice from daawah.js: searchItems.
function searchItems(items, query, searchFields) {
    return items.filter(item =>
        searchFields.some(field =>
            String(item[field]).toLowerCase().includes(query.toLowerCase())
        )
    );
}
