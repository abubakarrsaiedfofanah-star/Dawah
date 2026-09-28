// Runtime slice from daawah.js: normalizeDatabaseVolunteerOpportunity.
function normalizeDatabaseVolunteerOpportunity(opportunity) {
    const schedule = [opportunity.start_date, opportunity.end_date].filter(Boolean).join(' to ') || opportunity.duration || 'Schedule will be announced';
    return {
        id: `db-volunteer-${opportunity.id}`,
        dbOpportunityId: Number(opportunity.id),
        source: 'database',
        title: opportunity.title,
        description: opportunity.description,
        kind: opportunity.kind || opportunity.type || opportunity.category || 'volunteer',
        requiredHours: opportunity.required_hours,
        goalAmount: Number(opportunity.goal_amount || opportunity.goalAmount || 0),
        schedule,
        signupCount: Number(opportunity.signup_count || 0)
    };
}
