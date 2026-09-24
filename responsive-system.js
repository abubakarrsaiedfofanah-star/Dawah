(() => {
    const labelTables = (root = document) => {
        root.querySelectorAll?.('.table-responsive table').forEach(table => {
            const headers = Array.from(table.querySelectorAll('thead th')).map(cell => cell.textContent.trim());
            if (!headers.length) return;
            table.querySelectorAll('tbody tr').forEach(row => {
                Array.from(row.cells).forEach((cell, index) => {
                    if (cell.hasAttribute('colspan')) return;
                    const label = headers[index] || `Detail ${index + 1}`;
                    if (cell.dataset.label !== label) cell.dataset.label = label;
                });
            });
        });
    };
    const start = () => {
        labelTables();
        new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) labelTables(node);
        }))).observe(document.body, { childList: true, subtree: true });
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
    else start();
})();
