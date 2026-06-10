// Runtime slice from daawah.js: loadDailyHadith.
function loadDailyHadith() {
    const dailyRequest = frontendOnly
        ? Promise.resolve(getStaticApiData('getDailyHadith'))
        : fetch('firestore-hadith-store?action=getDaily').then(response => parseJsonResponse(response));

    return dailyRequest
        .then(data => {
            if (data.success && data.data) {
                currentHadithIndex = data.position - 1;
                if (allHadiths.length === 0) {
                    allHadiths = [data.data];
                }
                displayHadith(data.data, data.position, data.total);
                hadithsLoaded = true;
                return data.data;
            }
            throw new Error('Invalid daily hadith returned');
        })
        .catch(() => {
            if (allHadiths.length > 0) {
                const today = new Date().getDate();
                currentHadithIndex = today % allHadiths.length;
                displayHadith(allHadiths[currentHadithIndex], currentHadithIndex + 1, allHadiths.length);
                hadithsLoaded = true;
            } else {
                displayHadith(null, 0, 0);
                hadithsLoaded = true;
            }
            return null;
        });
}

// Display hadith in the UI
