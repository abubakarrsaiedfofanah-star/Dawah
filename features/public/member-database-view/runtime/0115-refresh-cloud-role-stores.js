// Runtime slice from daawah.js: refreshCloudRoleStores.
async function refreshCloudRoleStores() {
    const tasks = [];
    tasks.push(window.DawaahCloud.loadStores(LIVE_PUBLIC_STORE_KEYS)
        .then(stores => {
            Object.entries(stores || {}).forEach(([key, value]) => {
                localStorage.setItem(key, JSON.stringify(value));
            });
        })
        .catch(error => console.warn('Public content live refresh skipped:', error)));
    if (hasPermission('manage_members')) {
        tasks.push(window.DawaahCloud.listMembers()
            .then(members => {
                if (Array.isArray(members)) {
                    allMembers = members;
                    localStorage.setItem('allMembers', JSON.stringify(allMembers));
                }
            })
            .catch(error => console.warn('Member live refresh skipped:', error)));
    } else {
        tasks.push(window.DawaahCloud.loadMyMember?.()
            .then(member => {
                if (member) {
                    allMembers = mergeMemberIntoList(allMembers, member);
                    currentUser = { ...currentUser, ...member };
                    localStorage.setItem('allMembers', JSON.stringify(allMembers));
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }
            })
            .catch(error => console.warn('Profile live refresh skipped:', error)));
    }
    if (hasPermission('manage_payments')) {
        tasks.push(window.DawaahCloud.listRecords('payments')
            .then(records => {
                if (Array.isArray(records)) {
                    payments = records;
                    localStorage.setItem('payments', JSON.stringify(payments));
                }
            })
            .catch(error => console.warn('Payment live refresh skipped:', error)));
        tasks.push(window.DawaahCloud.listRecords('donations')
            .then(records => {
                if (Array.isArray(records)) {
                    donations = records;
                    localStorage.setItem('donations', JSON.stringify(donations));
                }
            })
            .catch(error => console.warn('Donation live refresh skipped:', error)));
    } else {
        tasks.push(refreshOwnedCloudRecords('payments', payments)
            .then(records => {
                if (records) {
                    payments = records;
                    localStorage.setItem('payments', JSON.stringify(payments));
                }
            }));
        tasks.push(refreshOwnedCloudRecords('donations', donations)
            .then(records => {
                if (records) {
                    donations = records;
                    localStorage.setItem('donations', JSON.stringify(donations));
                }
            }));
    }
    if (hasPermission('manage_welfare')) {
        tasks.push(window.DawaahCloud.listRecords('welfareRequests')
            .then(records => {
                if (Array.isArray(records)) {
                    welfareRequests = records;
                    localStorage.setItem('welfareRequests', JSON.stringify(welfareRequests));
                }
            })
            .catch(error => console.warn('Welfare live refresh skipped:', error)));
    }
    if (hasPermission('manage_events')) {
        tasks.push(window.DawaahCloud.listRecords('eventRegistrations')
            .then(records => {
                if (Array.isArray(records)) {
                    registeredEvents = records;
                    localStorage.setItem('registeredEvents', JSON.stringify(registeredEvents));
                }
            })
            .catch(error => console.warn('Event registration live refresh skipped:', error)));
    }
    await Promise.all(tasks);
}
