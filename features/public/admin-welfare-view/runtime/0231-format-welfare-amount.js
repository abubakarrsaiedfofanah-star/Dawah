// Runtime slice from daawah.js: formatWelfareAmount.
function formatWelfareAmount(amount) {
    if (amount === undefined || amount === null || amount === '' || amount === 'Not specified') {
        return 'Not specified';
    }
    return 'KSh ' + Number(amount).toLocaleString();
}
