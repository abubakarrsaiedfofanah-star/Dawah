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

    return [...databaseVolunteerOpportunities, ...savedOpportunities, ...activityOpportunities, ...defaultVolunteerOpportunities].filter((opportunity, index, list) => {
        const key = opportunity.id || opportunity.title;
        return index === list.findIndex(item => (item.id || item.title) === key);
    });
}
