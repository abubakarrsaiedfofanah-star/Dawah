// Runtime slice from admin.js: getPriorityColor.
function getPriorityColor(priority) {
    const colors = {
        'high': 'danger',
        'normal': 'primary',
        'low': 'secondary'
    };
    return colors[priority] || 'primary';
}
