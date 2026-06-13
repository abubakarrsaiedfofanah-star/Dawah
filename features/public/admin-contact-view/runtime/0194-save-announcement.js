// Runtime slice from daawah.js: saveAnnouncement.
function saveAnnouncement(event) {
    event.preventDefault();
    if (!hasPermission('create_announcements')) {
        showNotification('Only the secretary and admins can publish announcements.', 'warning');
        return;
    }

    const announcement = {
        title: document.getElementById('announcementTitle').value.trim(),
        content: document.getElementById('announcementContent').value.trim(),
        priority: document.getElementById('announcementPriority').value || 'normal',
        author_id: currentUser?.dbUserId || currentUser?.user_id || currentUser?.id || 0
    };

    if (!announcement.title || !announcement.content) {
        showNotification('Please enter an announcement title and message.', 'warning');
        return;
    }

    const finishSave = () => {
        document.getElementById('announcementForm').reset();
        loadAnnouncements();
        showNotification('Announcement published.', 'success');
    };

    if (!frontendOnly) {
        fetch('supabase-required-endpoint?action=createAnnouncement', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(announcement)
        })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Could not publish announcement');
            }
            finishSave();
        })
        .catch(error => showNotification(error.message || 'Could not publish announcement', 'danger'));
        return;
    }

    const announcements = readList('adminAnnouncements');
    announcements.unshift({
        id: Date.now(),
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        created_at: new Date().toISOString()
    });
    localStorage.setItem('adminAnnouncements', JSON.stringify(announcements));
    logLocalRoleActivity('createAnnouncement', { title: announcement.title, priority: announcement.priority });
    finishSave();
}

// RESOURCES
