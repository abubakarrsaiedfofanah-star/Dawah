// Runtime slice from daawah.js: initializeHadiths.
function initializeHadiths() {
    Promise.all([loadAllHadiths(), loadDailyHadith()]).catch(() => {
        console.warn('Hadith initialization encountered an issue.');
    });
}

// Load all hadiths
