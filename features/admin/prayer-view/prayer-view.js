// Feature: admin/prayer-view
// Source: admin.html#prayerView
// This module records the DOM IDs and global handlers owned by the feature.
// Move handler implementations here from the legacy page bundle when editing this feature.
(function registerFeatureModule() {
  window.DawaahFeatureModules = window.DawaahFeatureModules || {};
  window.DawaahFeatureModules["admin/prayer-view"] = {
    source: "admin.html#prayerView",
    ids: [
        "jummahAdminSection",
        "jummahDate",
        "jummahNote",
        "jummahSaveBtn",
        "jummahSpeaker",
        "jummahTime",
        "jummahTopic",
        "lectureAdminSection",
        "lectureDescription",
        "lectureSaveBtn",
        "lectureSchedule",
        "lectureSpeaker",
        "lectureTitle",
        "prayerAsr",
        "prayerDate",
        "prayerDhuhr",
        "prayerFajr",
        "prayerIsha",
        "prayerJummah",
        "prayerMaghrib",
        "prayerPreview",
        "prayerView",
        "ramadanAdminSection",
        "ramadanDate",
        "ramadanEvent",
        "ramadanNote",
        "ramadanSaveBtn",
        "ramadanTime",
        "religiousActivitiesList"
    ],
    handlers: [
        "savePrayerTimes",
        "saveReligiousActivity"
    ]
  };
}());
