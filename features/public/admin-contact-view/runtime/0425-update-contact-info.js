// Runtime slice from daawah.js: updateContactInfo.
function updateContactInfo(type) {
    let value = '';
    let fieldName = '';
    const fields = {
        location: ['contactLocation', 'Location'],
        phone: ['contactPhone', 'Phone Number'],
        email: ['contactEmail', 'Email Address'],
        hours: ['contactHours', 'Office Hours']
    };

    if (!fields[type]) return;
    value = document.getElementById(fields[type][0]).value.trim();
    fieldName = fields[type][1];

    if (!value) {
        showNotification('Please enter a value for ' + fieldName, 'warning');
        return;
    }

    saveContactAndSocialInfo(fieldName + ' updated successfully!');
}
