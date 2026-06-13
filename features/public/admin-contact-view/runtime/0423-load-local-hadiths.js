// Runtime slice from daawah.js: loadLocalHadiths.
function loadLocalHadiths() {
    allHadiths = [];
    currentHadithIndex = 0;
    displayHadith(null, 0, 0);
    hadithsLoaded = true;
}

// Call initialize hadiths when dashboard shows
const originalShowDashboard = window.showDashboard;
window.showDashboard = function() {
    originalShowDashboard();
    setTimeout(() => initializeHadiths(), 600);
};

// CONTACT MANAGEMENT
