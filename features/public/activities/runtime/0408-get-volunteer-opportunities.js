// Runtime slice from daawah.js: getVolunteerOpportunities.
function getVolunteerOpportunities() {
    const savedOpportunities = readList('volunteerOpportunities').map(item => ({ ...item, source: item.source || 'local' }));
    const activityOpportunities = getActivities()
        .filter(activity => /volunteer|service|support|outreach/i.test(`${activity.title} ${activity.description}`))
        .map(activity => ({
            id: `activity-${activity.id || activity.title}`,
            title: activity.title,
            description: activity.description,
            requiredHours: 2,
            schedule: activity.schedule || 'Schedule will be announced'
        }));

    const seen = new Set();
    return [...savedOpportunities, ...databaseVolunteerOpportunities, ...activityOpportunities, ...defaultVolunteerOpportunities]
        .filter(opportunity => {
            if (String(opportunity.status || 'open').toLowerCase() !== 'open') return false;
            const key = String(opportunity.title || opportunity.id || '').trim().toLowerCase();
            if (!key || seen.has(key)) return false;
            seen.add(key);
            return true;
        });
}
