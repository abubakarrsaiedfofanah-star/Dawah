// Runtime slice from admin.js: handleStaticAdminApi.
function handleStaticAdminApi(action, method, payload, params) {
    if (
        !isCurrentLocalMainAdmin() &&
        shouldQueueLocalApproval(action, method)
    ) {
        logLocalAdminActivity('pendingAdminApproval', {
            requested_action: action,
            method,
            request: payload
        });
        return { success: true, message: 'Sent to main admin for approval', data: { pending_approval: true } };
    }

    switch (action) {
        case 'checkAdminSession': {
            const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
            if (!sessionAdmin) {
                return { success: false, message: 'Admin login required' };
            }
            const storedAdmin = findLocalAdminAccount(sessionAdmin);
            return { success: true, data: storedAdmin ? publicAdminAccount(storedAdmin) : sessionAdmin };
        }
        case 'getAdminSetupStatus': {
            const adminCount = getLocalAdminAccounts().length;
            return {
                success: true,
                data: {
                    admin_count: adminCount,
                    admin_limit: ADMIN_ACCOUNT_LIMIT,
                    can_register_first_admin: adminCount === 0
                }
            };
        }
        case 'registerAdmin':
            return registerLocalAdmin(payload);
        case 'loginAdmin':
            return loginLocalAdmin(payload);
        case 'requestAdminPasswordReset':
        case 'resetAdminPasswordWithCode':
            return { success: false, message: 'Secure admin email reset requires the PHP backend and configured email delivery.' };
        case 'logoutAdmin':
            sessionStorage.removeItem('currentAdminUser');
            return { success: true };
        case 'listAdminAccounts':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can manage admin accounts.' };
            return listLocalAdminAccounts();
        case 'createAdminAccount':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can manage admin accounts.' };
            return createLocalAdminByAdmin(payload);
        case 'deleteAdminAccount':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can manage admin accounts.' };
            return deleteLocalAdminAccount(payload.admin_id);
        case 'getPendingRoleRequests':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can view role requests.' };
            return { success: true, data: getLocalPendingRoleRequests() };
        case 'getRoleAssignableMembers':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can view members.' };
            return { success: true, data: getLocalRoleAssignableMembers() };
        case 'assignMemberRole':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can assign roles.' };
            return assignLocalMemberRole(payload);
        case 'resetMemberPassword':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can reset member passwords.' };
            return resetLocalMemberPassword(payload);
        case 'approveRoleRequest':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can approve role requests.' };
            return approveLocalRoleRequest(payload.user_id);
        case 'rejectRoleRequest':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can reject role requests.' };
            return rejectLocalRoleRequest(payload.user_id);
        case 'changeAdminPassword':
            return changeLocalAdminPassword(payload);
        case 'resetAdminPassword':
            return { success: false, message: 'Admin password reset must be completed through the registered admin email.' };
        case 'getAdminActivityLogs':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can view admin activity.' };
            return {
                success: true,
                data: [...readStore('adminActivityLogs'), ...readStore('roleActivityLogs')]
                    .sort((a, b) => new Date(b.created_at || b.id || 0) - new Date(a.created_at || a.id || 0))
                    .slice(0, 100)
            };
        case 'getMyAdminActivityLogs': {
            const sessionAdmin = JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null');
            const logs = readStore('adminActivityLogs')
                .filter(log => Number(log.admin_id) === Number(sessionAdmin?.id))
                .slice(-50)
                .reverse();
            return { success: true, data: logs };
        }
        case 'opposeAdminActivity':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can oppose admin activity.' };
            logLocalAdminActivity('opposeAdminActivity', {
                log_id: payload.log_id,
                reason: payload.reason || ''
            });
            return { success: true, message: 'Activity opposed and recorded' };
        case 'deleteAdminActivityItem':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can delete admin activity items.' };
            return deleteLocalAdminActivityItem(payload.log_id);
        case 'deleteAdminActivityLog':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can delete admin activity logs.' };
            return deleteLocalAdminActivityLog(payload.log_id, false);
        case 'deleteMyAdminActivityLog':
            return deleteLocalAdminActivityLog(payload.log_id, true);
        case 'clearAdminActivityLogs':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can clear admin activity logs.' };
            return clearLocalAdminActivityLogs(false);
        case 'clearMyAdminActivityLogs':
            return clearLocalAdminActivityLogs(true);
        case 'createDatabaseBackup':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can download database backups.' };
            return createLocalDatabaseBackupResult();
        case 'approvePendingAdminActivity':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can approve pending actions.' };
            return approveLocalPendingAdminActivity(payload.log_id);
        case 'rejectPendingAdminActivity':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can reject pending actions.' };
            logLocalAdminActivity('rejectPendingAdminActivity', {
                log_id: payload.log_id,
                reason: payload.reason || ''
            });
            return { success: true, message: 'Pending action rejected and recorded' };
        case 'undoMyAdminActivityItem':
            return undoLocalAdminActivityItem(payload.log_id);

        case 'getAnnouncements':
            return { success: true, data: readStore('adminAnnouncements') };
        case 'createAnnouncement': {
            const item = addStoreItem('adminAnnouncements', payload);
            return { success: true, message: 'Saved locally', data: { announcement_id: item.id, id: item.id } };
        }
        case 'deleteAnnouncement':
            deleteStoreItem('adminAnnouncements', payload.announcement_id);
            return { success: true };

        case 'getEvents':
            return { success: true, data: readStore('adminEvents') };
        case 'getEventRegistrations':
            return { success: true, data: readStore('registeredEvents') };
        case 'createEvent': {
            const item = addStoreItem('adminEvents', payload);
            return { success: true, message: 'Saved locally', data: { event_id: item.id, id: item.id } };
        }
        case 'deleteEvent':
            deleteStoreItem('adminEvents', payload.event_id);
            return { success: true };

        case 'getLeaders':
            return { success: true, data: readStore('publicLeaders') };
        case 'addLeader': {
            const item = addStoreItem('publicLeaders', payload);
            return { success: true, message: 'Saved locally', data: { leader_id: item.id, id: item.id } };
        }
        case 'deleteLeader':
            deleteStoreItem('publicLeaders', payload.leader_id);
            return { success: true };

        case 'getGallery':
            return { success: true, data: readStore('galleryItems') };
        case 'addGalleryItem': {
            const item = addStoreItem('galleryItems', {
                ...payload,
                imageData: payload.image_url,
                imageUrl: payload.image_url,
                media_type: payload.media_type || getGalleryMediaType(payload.image_url)
            });
            return { success: true, message: 'Saved locally', data: { gallery_id: item.id, id: item.id } };
        }
        case 'deleteGalleryItem':
            deleteStoreItem('galleryItems', payload.gallery_id);
            return { success: true };
        case 'getSiteSettings':
            return { success: true, data: getLocalSiteSettings() };
        case 'updateSiteSettings':
            localStorage.setItem('siteSettings', JSON.stringify({ ...getLocalSiteSettings(), ...payload }));
            return { success: true, message: 'Saved locally', data: getLocalSiteSettings() };

        case 'getHadiths':
            return { success: true, data: readStore('adminHadiths') };
        case 'addHadith': {
            const item = addStoreItem('adminHadiths', payload);
            return { success: true, message: 'Saved locally', data: { hadith_id: item.id, id: item.id } };
        }
        case 'deleteHadith':
            deleteStoreItem('adminHadiths', payload.hadith_id);
            return { success: true };
        case 'getDashboardStats':
            return {
                success: true,
                data: {
                    members: getMemberRecords().length,
                    students: getStudentRecords().length,
                    active_students: getStudentRecords().filter(member => member.status === 'Active' || member.status === 'active').length,
                    announcements: readStore('adminAnnouncements').length,
                    events: readStore('adminEvents').length,
                    upcoming_events: readStore('adminEvents').length,
                    welfare_requests: readStore('welfareRequests').length,
                    pending_welfare: readStore('welfareRequests').filter(item => item.status === 'Pending Review' || item.status === 'pending').length,
                    payments: readStore('payments').length,
                    completed_payments: readStore('payments').filter(item => item.status === 'Completed' || item.status === 'completed').length,
                    pending_payments: readStore('payments').filter(item => ['Pending', 'pending', 'Pending Approval'].includes(item.status)).length,
                    failed_payments: readStore('payments').filter(item => ['Failed', 'failed', 'Rejected', 'rejected'].includes(item.status)).length,
                    payment_total: readStore('payments').filter(item => item.status === 'Completed' || item.status === 'completed').reduce((sum, item) => sum + Number(item.amount || 0), 0),
                    month_payment_total: readStore('payments').filter(item => item.status === 'Completed' || item.status === 'completed').reduce((sum, item) => sum + Number(item.amount || 0), 0),
                    pending_payment_amount: readStore('payments').filter(item => ['Pending', 'pending', 'Pending Approval'].includes(item.status)).reduce((sum, item) => sum + Number(item.amount || 0), 0),
                    failed_payment_amount: readStore('payments').filter(item => ['Failed', 'failed', 'Rejected', 'rejected'].includes(item.status)).reduce((sum, item) => sum + Number(item.amount || 0), 0),
                    donations: readStore('donations').length,
                    completed_donations: readStore('donations').filter(item => item.status === 'Completed' || item.status === 'completed').length,
                    pending_donations: readStore('donations').filter(item => ['Pending', 'pending', 'Pending Approval'].includes(item.status)).length,
                    failed_donations: readStore('donations').filter(item => ['Failed', 'failed', 'Rejected', 'rejected'].includes(item.status)).length,
                    donation_total: readStore('donations').filter(item => item.status === 'Completed' || item.status === 'completed').reduce((sum, item) => sum + Number(item.amount || 0), 0),
                    month_donation_total: readStore('donations').filter(item => item.status === 'Completed' || item.status === 'completed').reduce((sum, item) => sum + Number(item.amount || 0), 0),
                    pending_donation_amount: readStore('donations').filter(item => ['Pending', 'pending', 'Pending Approval'].includes(item.status)).reduce((sum, item) => sum + Number(item.amount || 0), 0),
                    failed_donation_amount: readStore('donations').filter(item => ['Failed', 'failed', 'Rejected', 'rejected'].includes(item.status)).reduce((sum, item) => sum + Number(item.amount || 0), 0),
                    resources: readStore('adminResources').length,
                    gallery: readStore('galleryItems').length,
                    leaders: readStore('publicLeaders').length,
                    hadiths: readStore('adminHadiths').length,
                    prayer_days: localStorage.getItem('adminPrayerTimes') ? 1 : 0
                }
            };
        case 'getDashboardDetail':
            return getStaticDashboardDetail(params.get('type'));
        case 'approvePayment':
            {
                const error = validateFinanceApproval('payments', payload.payment_id);
                if (error) return { success: false, message: error };
            }
            updateLocalTransaction('payments', payload.payment_id, approveFinancePatch('payments', payload.payment_id));
            return { success: true, message: 'Approved locally' };
        case 'approveDonation':
            {
                const error = validateFinanceApproval('donations', payload.donation_id);
                if (error) return { success: false, message: error };
            }
            updateLocalTransaction('donations', payload.donation_id, approveFinancePatch('donations', payload.donation_id));
            return { success: true, message: 'Approved locally' };
        case 'rejectPayment':
            updateLocalTransaction('payments', payload.payment_id, rejectFinancePatch('payments', payload.payment_id, payload.notes || 'Rejected by admin/treasurer'));
            return { success: true, message: 'Rejected locally' };
        case 'rejectDonation':
            updateLocalTransaction('donations', payload.donation_id, rejectFinancePatch('donations', payload.donation_id, payload.notes || 'Rejected by admin/treasurer'));
            return { success: true, message: 'Rejected locally' };
        case 'reversePayment':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can reverse payments.' };
            updateLocalTransaction('payments', payload.payment_id, reverseFinancePatch('payments', payload.payment_id, payload.reason || 'Reversed by main admin'));
            return { success: true, message: 'Payment reversed locally' };
        case 'reverseDonation':
            if (!isCurrentLocalMainAdmin()) return { success: false, message: 'Only the main admin can reverse donations.' };
            updateLocalTransaction('donations', payload.donation_id, reverseFinancePatch('donations', payload.donation_id, payload.reason || 'Reversed by main admin'));
            return { success: true, message: 'Donation reversed locally' };
        case 'getWelfareRequests':
            return { success: true, data: readStore('welfareRequests') };
        case 'updateWelfareStatus': {
            const requests = readStore('welfareRequests').map(item =>
                Number(item.id) === Number(payload.request_id) ? { ...item, status: payload.status, notes: payload.notes || '' } : item
            );
            writeStore('welfareRequests', requests);
            return { success: true };
        }
        case 'getPrayerTimes':
            return { success: true, data: JSON.parse(localStorage.getItem('adminPrayerTimes')) || null };
        case 'setPrayerTimes':
            localStorage.setItem('adminPrayerTimes', JSON.stringify(payload));
            return { success: true };
        case 'getResources':
            return { success: true, data: readStore('adminResources') };
        case 'addResource': {
            const item = addStoreItem('adminResources', payload);
            return { success: true, message: 'Saved locally', data: { resource_id: item.id, id: item.id } };
        }
        case 'deleteResource':
            deleteStoreItem('adminResources', payload.resource_id);
            return { success: true };
        default:
            return { success: false, message: 'Unsupported static action' };
    }
}
