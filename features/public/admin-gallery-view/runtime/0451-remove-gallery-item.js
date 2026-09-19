// Runtime slice from daawah.js: removeGalleryItem.
function removeGalleryItem(index) {
    if (!confirm('Are you sure you want to remove this gallery item?')) return;

    if (!frontendOnly) {
        fetch('supabase-required-endpoint?action=deleteGalleryItem', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gallery_id: index })
        })
        .then(response => parseJsonResponse(response))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'Error removing gallery item');
            }
            loadAdminGallery();
            loadGalleryContent();
            showNotification('Gallery item removed!', 'success');
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification(error.message || 'Error removing gallery item', 'danger');
        });
        return;
    }

    let galleryItems = readList('galleryItems');
    galleryItems.splice(index, 1);
    localStorage.setItem('galleryItems', JSON.stringify(galleryItems));
    logLocalRoleActivity('deleteGalleryItem', { gallery_id: index });

    loadAdminGallery();
    loadGalleryContent(); // Refresh landing page gallery
    showNotification('Gallery item removed!', 'success');
}

// Lightweight enhancements for a lively, accessible public site and dashboard.
(function () {
    function initialiseInterface() {
        const landingPage = document.getElementById('landingPage');
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (landingPage) {
            const updateProgress = () => {
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                landingPage.style.setProperty('--page-scroll', `${maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0}%`);
            };
            window.addEventListener('scroll', updateProgress, { passive: true });
            updateProgress();
            if (!reduceMotion && 'IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
                    if (entry.isIntersecting) { entry.target.classList.add('is-in-view'); observer.unobserve(entry.target); }
                }), { threshold: 0.12 });
                landingPage.querySelectorAll('.landing-section').forEach((section) => observer.observe(section));
            } else landingPage.querySelectorAll('.landing-section').forEach((section) => section.classList.add('is-in-view'));
        }
        const search = document.getElementById('sidebarNavSearch');
        if (search) {
            const filterMenu = () => {
                const term = search.value.trim().toLowerCase();
                document.querySelectorAll('.sidebar-menu .menu-section').forEach((section) => {
                    const links = [...section.querySelectorAll('.nav-link')];
                    const matches = links.filter((link) => link.textContent.toLowerCase().includes(term));
                    links.forEach((link) => { link.hidden = Boolean(term) && !matches.includes(link); });
                    section.classList.toggle('is-filtered-empty', Boolean(term) && matches.length === 0);
                });
            };
            search.addEventListener('input', filterMenu);
            document.querySelectorAll('.sidebar-menu .nav-link').forEach((link) => link.addEventListener('click', () => {
                search.value = '';
                filterMenu();
            }));
        }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialiseInterface, { once: true }); else initialiseInterface();
}());
