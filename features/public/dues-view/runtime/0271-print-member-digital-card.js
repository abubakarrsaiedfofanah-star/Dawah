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
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Member Card</title><style>
        @page{size:85.6mm 54mm;margin:0}*{box-sizing:border-box}html,body{margin:0;width:85.6mm;height:54mm;font-family:Arial,sans-serif;color:#12343d}.member-id-card{width:85.6mm;height:54mm;overflow:hidden;border:1px solid #b9d8d2;border-radius:3mm;background:#fff;display:grid;grid-template-rows:11mm 1fr 15mm}.member-id-card__header{display:flex;align-items:center;gap:2mm;padding:1.5mm 3mm;background:#003b4d;color:#fff}.member-id-card__header>img{width:8mm;height:8mm;object-fit:contain;background:#fff;border-radius:1mm}.member-id-card__brand{display:grid;gap:.5mm;flex:1}.member-id-card__brand strong{font-size:7pt}.member-id-card__brand span{font-size:5pt;letter-spacing:.4pt}.member-id-card__header .badge{font-size:5.5pt}.member-id-card__main{display:flex;justify-content:space-between;gap:2mm;padding:2mm 3mm}.member-id-card__details{min-width:0;flex:1}.member-id-card__label,.member-id-card__fields span,.member-id-card__meta span{display:block;color:#647b80;font-size:5.5pt}.member-id-card__details h2{margin:1mm 0;font-size:11pt;line-height:1.1;overflow-wrap:anywhere}.member-id-card__student-number{margin:0;color:#145b42;font-size:7pt;font-weight:bold}.member-id-card__fields{display:flex;gap:5mm;margin-top:2mm}.member-id-card__fields>div{min-width:0}.member-id-card__fields strong,.member-id-card__meta strong{display:block;font-size:6pt;overflow-wrap:anywhere}.member-id-card__photo-wrap{flex:0 0 17mm}.member-id-card__photo{width:17mm;height:21mm;object-fit:cover;border:1px solid #d5e3e3;border-radius:1mm}.member-id-card__photo--empty{display:grid;place-items:center;background:#eaf4f0;color:#0f5132;font-size:12pt;font-weight:bold}.member-id-card__footer{display:flex;justify-content:space-between;align-items:center;gap:2mm;padding:1mm 3mm;background:#f1f7f5;border-top:1px solid #dce8e6}.member-id-card__meta{display:grid;grid-template-columns:auto auto;column-gap:2mm;align-items:center}.member-id-card__meta span:last-child{grid-column:1/-1;margin-top:1mm}.member-id-card__verify{display:grid;justify-items:center;gap:.5mm}.member-id-card__verify img{width:12mm;height:12mm}.member-id-card__verify span{font-size:5pt}.actions{display:none}@media screen{body{width:auto;height:auto;display:grid;place-items:center;padding:16px;background:#eff5f3}.member-id-card{width:min(85.6mm,calc(100vw - 24px));height:auto;min-height:54mm;aspect-ratio:85.6/54;grid-template-rows:auto 1fr auto;box-shadow:0 12px 32px rgba(0,48,64,.18)}}
    </style></head><body>${card.outerHTML}<script>window.print()<\/script></body></html>`);
    win.document.close();
}

window.openMemberDigitalCard = openMemberDigitalCard;
window.printMemberDigitalCard = printMemberDigitalCard;
