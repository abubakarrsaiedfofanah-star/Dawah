// Runtime slice from daawah.js: toggleDetails.
function toggleDetails(detailsId) {
    const details = document.getElementById(detailsId);
    if (details) {
        details.classList.toggle('hidden');
        const icon = event.target.closest('.toggle-btn')?.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-chevron-down');
            icon.classList.toggle('fa-chevron-up');
        }
    }
}

// VOLUNTEER FUNCTIONS
