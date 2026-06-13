// Runtime slice from daawah.js: initializeAcademicSelectors.
function initializeAcademicSelectors() {
    renderSchoolOptions('school');
    renderSchoolOptions('editSchool');
    renderCourseOptions('course', '');
    renderCourseOptions('editCourse', '');
    renderNumberOptions('yearOfStudy', yearOptions, 'Select Year', 'Year');
    renderNumberOptions('editYearOfStudy', yearOptions, 'Select Year', 'Year');
    renderNumberOptions('semester', semesterOptions, 'Select Semester', 'Semester');
    renderNumberOptions('editSemester', semesterOptions, 'Select Semester', 'Semester');
}
