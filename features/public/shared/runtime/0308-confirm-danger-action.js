// Runtime slice from daawah.js: confirmDangerAction.
function confirmDangerAction(message, requiredText = 'CONFIRM') {
    if (!confirm(message)) return false;
    const typed = prompt(`Type ${requiredText} to continue.`);
    return typed === requiredText;
}
