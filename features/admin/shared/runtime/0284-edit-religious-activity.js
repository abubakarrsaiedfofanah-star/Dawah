// Runtime slice from admin.js: editReligiousActivity.
function editReligiousActivity(type, id) {
    const data = getReligiousActivities();
    const key = type === 'lecture' ? 'lectures' : type;
    const item = (data[key] || []).find(entry => Number(entry.id) === Number(id));
    if (!item) return;

    editingReligiousActivity = { type, id };

    if (type === 'jummah') {
        document.getElementById('jummahDate').value = item.date || '';
        document.getElementById('jummahTime').value = item.time || '';
        document.getElementById('jummahTopic').value = item.topic || '';
        document.getElementById('jummahSpeaker').value = item.speaker || '';
        document.getElementById('jummahNote').value = item.note || '';
        document.getElementById('jummahSaveBtn').innerHTML = '<i class="fas fa-save"></i> Update Jumu\'ah Reminder';
    }

    if (type === 'ramadan') {
        document.getElementById('ramadanEvent').value = item.event || '';
        document.getElementById('ramadanDate').value = item.date || '';
        document.getElementById('ramadanTime').value = item.time || '';
        document.getElementById('ramadanNote').value = item.note || '';
        document.getElementById('ramadanSaveBtn').innerHTML = '<i class="fas fa-save"></i> Update Ramadan Item';
    }

    if (type === 'lecture') {
        document.getElementById('lectureTitle').value = item.title || '';
        document.getElementById('lectureSchedule').value = item.schedule || '';
        document.getElementById('lectureSpeaker').value = item.speaker || '';
        document.getElementById('lectureDescription').value = item.description || '';
        document.getElementById('lectureSaveBtn').innerHTML = '<i class="fas fa-save"></i> Update Lecture';
    }
}
