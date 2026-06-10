// Runtime slice from daawah.js: startRoleRealtimeListeners.
function startRoleRealtimeListeners() {
    if (!window.DawaahCloud?.enabled || !window.DawaahCloud.hasAuthSession?.() || roleRealtimeUnsubscribers.length) return;
    window.DawaahCloud.watchStores?.(LIVE_PUBLIC_STORE_KEYS, (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
        refreshActiveRoleView();
    }).then(unsubscribe => {
        roleRealtimeUnsubscribers.push(unsubscribe);
    }).catch(error => console.warn('Public realtime listener unavailable; using live refresh fallback:', error));

    if (hasPermission('manage_members')) {
        window.DawaahCloud.watchCollection?.('members', records => {
            allMembers = records;
            localStorage.setItem('allMembers', JSON.stringify(allMembers));
            refreshActiveRoleView();
        }).then(unsubscribe => {
            roleRealtimeUnsubscribers.push(unsubscribe);
        }).catch(error => console.warn('Member realtime listener unavailable; using live refresh fallback:', error));
    }

    if (hasPermission('manage_payments')) {
        ['payments', 'donations'].forEach(collection => {
            window.DawaahCloud.watchCollection?.(collection, records => {
                if (collection === 'payments') {
                    payments = records;
                } else {
                    donations = records;
                }
                localStorage.setItem(collection, JSON.stringify(records));
                refreshActiveRoleView();
            }).then(unsubscribe => {
                roleRealtimeUnsubscribers.push(unsubscribe);
            }).catch(error => console.warn(`${collection} realtime listener unavailable; using live refresh fallback:`, error));
        });
    } else {
        startOwnedFinanceRealtimeListeners('payments');
        startOwnedFinanceRealtimeListeners('donations');
    }

    if (hasPermission('manage_welfare')) {
        window.DawaahCloud.watchCollection?.('welfareRequests', records => {
            welfareRequests = records;
            localStorage.setItem('welfareRequests', JSON.stringify(welfareRequests));
            refreshActiveRoleView();
        }).then(unsubscribe => {
            roleRealtimeUnsubscribers.push(unsubscribe);
        }).catch(error => console.warn('Welfare realtime listener unavailable; using live refresh fallback:', error));
    }

    if (hasPermission('manage_events')) {
        window.DawaahCloud.watchCollection?.('eventRegistrations', records => {
            registeredEvents = records;
            localStorage.setItem('registeredEvents', JSON.stringify(registeredEvents));
            refreshActiveRoleView();
        }).then(unsubscribe => {
            roleRealtimeUnsubscribers.push(unsubscribe);
        }).catch(error => console.warn('Event realtime listener unavailable; using live refresh fallback:', error));
    }
}
