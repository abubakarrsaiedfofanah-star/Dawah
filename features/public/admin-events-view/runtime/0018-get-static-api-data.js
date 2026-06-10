// Runtime slice from daawah.js: getStaticApiData.
function getStaticApiData(action) {
    switch (action) {
        case 'getLeaders':
            return { success: true, data: readList('publicLeaders') };
        case 'getGallery':
            return { success: true, data: readList('galleryItems') };
        case 'getSiteSettings':
            return { success: true, data: getLocalSiteSettings() };
        case 'getAnnouncements':
            return { success: true, data: readList('adminAnnouncements') };
        case 'getEvents':
            return { success: true, data: readList('adminEvents') };
        case 'getPrayerTimes':
            return { success: true, data: readStoredObject('adminPrayerTimes', null) };
        case 'getResources':
            return { success: true, data: readList('adminResources') };
        case 'getAllHadiths':
            return { success: true, data: readList('adminHadiths') };
        case 'getDailyHadith': {
            const hadiths = readList('adminHadiths');
            if (hadiths.length === 0) {
                return { success: false, data: null };
            }
            const index = new Date().getDate() % hadiths.length;
            return {
                success: true,
                data: hadiths[index],
                position: index + 1,
                total: hadiths.length
            };
        }
        default:
            return { success: false, data: [] };
    }
}

// PAGE NAVIGATION FUNCTIONS
