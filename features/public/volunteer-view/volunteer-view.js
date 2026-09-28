// Feature: public/volunteer-view
// Source: index.html#volunteerView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["public/volunteer-view"] = {
    source: "index.html#volunteerView",
    ids: [
        "volunteerManagerPanel",
        "volunteerOpportunityGoal",
        "volunteerOpportunityGoalField",
        "volunteerOpportunityHoursField",
        "volunteerOpportunityKind",
        "volunteerOpportunitiesList",
        "volunteerOpportunityDescription",
        "volunteerOpportunityForm",
        "volunteerOpportunityHours",
        "volunteerOpportunitySchedule",
        "volunteerOpportunityTitle",
        "volunteerOpportunityScheduleLabel",
        "volunteerRecordsList",
        "volunteerView"
    ],
    handlers: [
        "showVolunteerModal"
    ]
  };
}());
