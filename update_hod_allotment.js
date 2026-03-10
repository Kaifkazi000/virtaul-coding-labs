const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'kaifo', 'OneDrive', 'Desktop', 'virtuallabback', 'backend', 'controllers', 'hod.controller.js');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add deleteAllotment after deleteTeacher
const deleteTeacherEnd = 'res.json({ message: "Teacher deleted successfully" });\n               } catch (err) {\n                              res.status(500).json({ error: err.message });\n               }\n};';
const deleteAllotmentCode = `

/**
 * HOD: Delete Allotment
 */
export const deleteAllotment = async (req, res) => {
	try {
		const { id } = req.params;
		const { error } = await supabaseAdmin
			.from("allotments")
			.delete()
			.eq("id", id);

		if (error) throw error;
		res.json({ message: "Allotment removed successfully" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};`;

if (content.includes('export const deleteTeacher')) {
    // Find the end of the deleteTeacher function
    const index = content.indexOf('export const deleteTeacher');
    const nextFunction = content.indexOf('export const', index + 20);
    if (nextFunction !== -1) {
        content = content.slice(0, nextFunction) + deleteAllotmentCode + '\n\n' + content.slice(nextFunction);
    }
}

// 2. Alias master_subjects to subjects in getSubjectAllotments
content = content.replace(/master_subjects:subject_id \(name, course_code\)/g, 'subjects:subject_id!master_subjects(name, course_code)');

fs.writeFileSync(filePath, content);
console.log('hod.controller.js updated successfully!');
