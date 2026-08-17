// Runtime slice from officer.js: readLocalMembers.
function readLocalMembers() {
    try {
        return JSON.parse(localStorage.getItem('allMembers') || '[]');
    } catch (error) {
        return [];
    }
}
