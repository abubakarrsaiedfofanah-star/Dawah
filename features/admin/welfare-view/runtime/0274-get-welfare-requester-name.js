// Runtime slice from admin.js: getWelfareRequesterName.
function getWelfareRequesterName(req) {
    return req.submittedByName ||
        req.submittedBy ||
        req.name ||
        [req.first_name, req.last_name].filter(Boolean).join(' ') ||
        'Unknown member';
}
