// Runtime slice from admin.js: getActivityTarget.
function getActivityTarget(actionName, details) {
    const response = details.response || {};
    const request = details.request || {};
    const mappings = {
        createAnnouncement: { store: 'adminAnnouncements', keys: ['announcement_id', 'id'] },
        createEvent: { store: 'adminEvents', keys: ['event_id', 'id'] },
        addLeader: { store: 'publicLeaders', keys: ['leader_id', 'id'] },
        addGalleryItem: { store: 'galleryItems', keys: ['gallery_id', 'id'] },
        addHadith: { store: 'adminHadiths', keys: ['hadith_id', 'id'] },
        addResource: { store: 'adminResources', keys: ['resource_id', 'id'] },
        saveReligiousActivity: { store: null, keys: ['id'] },
        setPrayerTimes: { store: null, keys: ['date'] }
    };
    const mapping = mappings[actionName];
    if (!mapping) return null;
    if (actionName === 'saveReligiousActivity') {
        const request = details.request || details;
        return request.item?.id ? { store: 'religious', id: request.item.id } : null;
    }
    if (actionName === 'setPrayerTimes') {
        const request = details.request || details;
        return request._previous_prayer_times?.date ? { store: 'prayerTimes', id: request._previous_prayer_times.date } : null;
    }

    const id = mapping.keys.map(key => response[key] || request[key] || details[key]).find(Boolean);
    return id ? { store: mapping.store, id } : null;
}
