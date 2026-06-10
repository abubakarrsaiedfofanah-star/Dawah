// Runtime slice from admin.js: switchAdminView.
function switchAdminView(viewName) {
    // Hide all views
    document.querySelectorAll('.admin-content').forEach(view => {
        view.classList.remove('active');
    });
    
    // Remove active class from nav links
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Show selected view
    const viewElement = document.getElementById(viewName + 'View');
    if (viewElement) {
        viewElement.classList.add('active');
        
        // Add active class to nav link
        const activeEvent = typeof event !== 'undefined' ? event : null;
        if (activeEvent && activeEvent.target) {
            activeEvent.target.closest('a')?.classList.add('active');
        }
        
        // Update page title
        const titles = {
            'dashboard': '<i class="fas fa-chart-line"></i> Dashboard',
            'announcements': '<i class="fas fa-bell"></i> Announcements',
            'events': '<i class="fas fa-calendar"></i> Events',
            'leadership': '<i class="fas fa-users"></i> Leadership',
            'gallery': '<i class="fas fa-images"></i> Gallery',
            'contactVoices': '<i class="fas fa-pen-to-square"></i> Public Content',
            'welfare': '<i class="fas fa-hands-helping"></i> Welfare',
            'prayer': '<i class="fas fa-mosque"></i> Prayer & Religious Activities',
            'account': '<i class="fas fa-user-gear"></i> My Account',
            'settings': '<i class="fas fa-gear"></i> Settings',
            'resources': '<i class="fas fa-folder-open"></i> Resources',
            'hadiths': '<i class="fas fa-book"></i> Hadiths'
        };
        document.getElementById('pageTitle').innerHTML = titles[viewName] || '';
        
        // Load view-specific data
        loadViewData(viewName);
    }
}
