// Runtime slice from daawah.js: isDesktopView.
function isDesktopView() {
    return window.innerWidth >= 1024;
}

// Accessibility
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const openModals = document.querySelectorAll('.modal.show');
        openModals.forEach(modal => {
            bootstrap.Modal.getInstance(modal)?.hide();
        });
    }
});

// Performance Optimization
