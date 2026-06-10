// Runtime slice from admin.js: getStaticDashboardDetail.
function getStaticDashboardDetail(type) {
    const stores = {
        members: getMemberRecords(),
        students: getStudentRecords(),
        donations: readStore('donations'),
        payments: readStore('payments'),
        welfare: readStore('welfareRequests'),
        events: readStore('adminEvents'),
        announcements: readStore('adminAnnouncements'),
        resources: readStore('adminResources'),
        gallery: readStore('galleryItems'),
        leadership: readStore('publicLeaders'),
        hadiths: readStore('adminHadiths'),
        prayer: localStorage.getItem('adminPrayerTimes') ? [JSON.parse(localStorage.getItem('adminPrayerTimes'))] : []
    };
    const rows = (stores[type] || []).map(item => {
        if (type === 'payments') {
            return {
                id: item.id || item.dbPaymentId || item.payment_id || '',
                payment_type: item.type || item.payment_type || '',
                amount: item.amount || 0,
                status: item.status || 'Pending',
                payment_method: item.paymentMethod || item.payment_method || '',
                transaction_id: item.transactionRef || item.transaction_id || '',
                receipt_number: item.receiptNumber || item.receipt_number || '',
                approved_by: item.approvedBy || item.approved_by || '',
                approved_at: item.approvedAt || item.approved_at || '',
                updated_by: item.updatedBy || item.updated_by || '',
                updated_at: item.updatedAt || item.updated_at || '',
                reversal_reason: item.reversalReason || item.reversal_reason || '',
                audit_count: Array.isArray(item.auditTrail) ? item.auditTrail.length : 0,
                notes: item.notes || '',
                created_at: item.date || item.created_at || ''
            };
        }
        if (type === 'donations') {
            return {
                id: item.id || item.dbDonationId || item.donation_id || '',
                donor_name: item.donor || item.donor_name || '',
                donor_email: item.email || item.donor_email || '',
                amount: item.amount || 0,
                donation_type: item.type || item.donation_type || '',
                purpose: item.purpose || '',
                payment_method: item.paymentMethod || item.payment_method || '',
                transaction_id: item.transactionRef || item.transaction_id || '',
                receipt_number: item.receiptNumber || item.receipt_number || '',
                approved_by: item.approvedBy || item.approved_by || '',
                approved_at: item.approvedAt || item.approved_at || '',
                updated_by: item.updatedBy || item.updated_by || '',
                updated_at: item.updatedAt || item.updated_at || '',
                reversal_reason: item.reversalReason || item.reversal_reason || '',
                audit_count: Array.isArray(item.auditTrail) ? item.auditTrail.length : 0,
                notes: item.notes || '',
                status: item.status || 'Pending',
                created_at: item.date || item.created_at || ''
            };
        }
        return item;
    });
    return { success: true, data: { type: type, rows } };
}

// ============================================
// ANNOUNCEMENT FUNCTIONS
// ============================================
