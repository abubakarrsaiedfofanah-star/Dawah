// Runtime slice from daawah.js: updateInstallButtonLabels.
function updateInstallButtonLabels(label) {
    document.querySelectorAll('#installAppTopButton, #installAppButton').forEach(button => {
        button.innerHTML = `<i class=\"fas fa-${label === 'Install App' ? 'download' : 'mobile-screen-button'}\" aria-hidden=\"true\"></i> ${label}`;
    });
}
