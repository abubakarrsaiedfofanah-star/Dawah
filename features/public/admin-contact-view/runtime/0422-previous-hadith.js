// Runtime slice from daawah.js: previousHadith.
function previousHadith() {
    if (!hadithsLoaded && allHadiths.length === 0) {
        showNotification('Hadith data is still loading, please wait.', 'warning');
        return;
    }
    if (allHadiths.length === 0) return;

    currentHadithIndex = (currentHadithIndex - 1 + allHadiths.length) % allHadiths.length;
    displayHadith(allHadiths[currentHadithIndex], currentHadithIndex + 1, allHadiths.length);
}

// Keep the user view empty until admins add hadiths.
