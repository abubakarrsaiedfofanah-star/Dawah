// Runtime slice from daawah.js: loadAllHadiths.
function loadAllHadiths() {
    const hadithRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getAllHadiths'))
        : fetch('firestore-hadith-store?action=getAll').then(response => parseJsonResponse(response));

    return hadithRequest
        .then(data => {
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                allHadiths = data.data;
                hadithsLoaded = true;
                return allHadiths;
            }
            throw new Error('Invalid hadith list returned');
        })
        .catch(() => {
            allHadiths = [];
            hadithsLoaded = true;
            return allHadiths;
        });
}

// Load today''s hadith
