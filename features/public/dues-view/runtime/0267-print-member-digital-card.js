// Runtime slice from daawah.js: printMemberDigitalCard.
function printMemberDigitalCard() {
    if (!getCompletedMembershipDuesPayment() || !getActiveMembershipCard()) {
        showNotification('Complete membership dues payment before printing the membership card.', 'warning');
        return;
    }
    const card = document.getElementById('memberDigitalCard');
    if (!card) return;
    const win = window.open('', '_blank');
    if (!win) {
        showNotification('Allow popups to print the member card.', 'warning');
        return;
    }
    win.document.open();
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Member Card</title><link href="vendor/bootstrap/css/bootstrap.min.css" rel="stylesheet"></head><body class="p-4">${card.outerHTML}<script>window.print()<\/script></body></html>`);
    win.document.close();
}

window.openMemberDigitalCard = openMemberDigitalCard;
window.printMemberDigitalCard = printMemberDigitalCard;
