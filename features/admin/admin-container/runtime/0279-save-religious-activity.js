// Runtime slice from admin.js: saveReligiousActivity.
function saveReligiousActivity(type) {
    const data = getReligiousActivities();
    let item = null;
    const editId = editingReligiousActivity?.type === type ? editingReligiousActivity.id : null;
    const key = type === 'lecture' ? 'lectures' : type;
    const previousItem = editId ? (data[key] || []).find(existing => Number(existing.id) === Number(editId)) : null;

    if (type === 'jummah') {
        const date = document.getElementById('jummahDate').value;
        const time = document.getElementById('jummahTime').value;
        const topic = document.getElementById('jummahTopic').value.trim();
        const speaker = document.getElementById('jummahSpeaker').value.trim();
        const note = document.getElementById('jummahNote').value.trim();
        if (!date || !time || !topic) {
            showNotification('Date, time, and khutbah topic are required.', 'warning');
            return;
        }
        item = { id: editId || Date.now(), date, time, topic, speaker, note };
        if (!isCurrentLocalMainAdmin() && useStaticAdminApi) {
            queueLocalReligiousApproval(type, item, previousItem, editId);
            ['jummahDate', 'jummahTime', 'jummahTopic', 'jummahSpeaker', 'jummahNote'].forEach(id => document.getElementById(id).value = '');
            return;
        }
        data.jummah = upsertReligiousActivity(data.jummah, item, editId);
        ['jummahDate', 'jummahTime', 'jummahTopic', 'jummahSpeaker', 'jummahNote'].forEach(id => document.getElementById(id).value = '');
    }

    if (type === 'ramadan') {
        const eventName = document.getElementById('ramadanEvent').value.trim();
        const date = document.getElementById('ramadanDate').value.trim();
        const time = document.getElementById('ramadanTime').value.trim();
        const note = document.getElementById('ramadanNote').value.trim();
        if (!eventName || !date) {
            showNotification('Ramadan event and date are required.', 'warning');
            return;
        }
        item = { id: editId || Date.now(), event: eventName, date, time, note };
        if (!isCurrentLocalMainAdmin() && useStaticAdminApi) {
            queueLocalReligiousApproval(type, item, previousItem, editId);
            ['ramadanEvent', 'ramadanDate', 'ramadanTime', 'ramadanNote'].forEach(id => document.getElementById(id).value = '');
            return;
        }
        data.ramadan = upsertReligiousActivity(data.ramadan, item, editId);
        ['ramadanEvent', 'ramadanDate', 'ramadanTime', 'ramadanNote'].forEach(id => document.getElementById(id).value = '');
    }

    if (type === 'lecture') {
        const title = document.getElementById('lectureTitle').value.trim();
        const schedule = document.getElementById('lectureSchedule').value.trim();
        const speaker = document.getElementById('lectureSpeaker').value.trim();
        const description = document.getElementById('lectureDescription').value.trim();
        if (!title || !schedule) {
            showNotification('Lecture title and schedule are required.', 'warning');
            return;
        }
        item = { id: editId || Date.now(), title, schedule, speaker, description };
        if (!isCurrentLocalMainAdmin() && useStaticAdminApi) {
            queueLocalReligiousApproval(type, item, previousItem, editId);
            ['lectureTitle', 'lectureSchedule', 'lectureSpeaker', 'lectureDescription'].forEach(id => document.getElementById(id).value = '');
            return;
        }
        data.lectures = upsertReligiousActivity(data.lectures, item, editId);
        ['lectureTitle', 'lectureSchedule', 'lectureSpeaker', 'lectureDescription'].forEach(id => document.getElementById(id).value = '');
    }

    saveReligiousActivities(data);
    logLocalAdminActivity('saveReligiousActivity', {
        type,
        item,
        previous_item: previousItem || null,
        mode: editId ? 'update' : 'create'
    });
    editingReligiousActivity = null;
    resetReligiousActivityButtons();
    renderReligiousActivitiesAdmin();
    showNotification(editId ? 'Religious activity updated for users.' : 'Religious activity saved for users.', 'success');
}
