import fs from 'fs';
import path from 'path';

const controllerPath = 'c:/Users/kaifo/OneDrive/Desktop/virtuallabback/backend/controllers/hod.controller.js';
let content = fs.readFileSync(controllerPath, 'utf8');

const oldCode = `export const getStudents = async (req, res) => {
	try {
		const { semester, batch } = req.query;
		let query = supabaseAdmin
			.from("students")
			.select("*")
			.order("roll", { ascending: true });

		if (semester) query = query.eq("semester", semester);
		if (batch) query = query.eq("batch_name", batch);

		const { data, error } = await query;
		if (error) throw error;
		res.json(data);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};`;

const newCode = `export const getStudents = async (req, res) => {
	try {
		console.log("[DEBUG] getStudents called. Query params:", req.query);
		const { semester, batch } = req.query;
		let query = supabaseAdmin
			.from("students")
			.select("*")
			.order("roll_no", { ascending: true }); // Fixed roll -> roll_no

		if (semester) {
			console.log("[DEBUG] Filtering by semester:", semester);
			query = query.eq("semester", String(semester));
		}
		if (batch) query = query.eq("batch_name", batch);

		const { data, error } = await query;
		if (error) {
			console.error("[DEBUG] Students Fetch Error:", error.message);
			throw error;
		}
		console.log(\`[DEBUG] Found \${data?.length || 0} students\`);
		res.json(data);
	} catch (err) {
		console.error("[DEBUG] CRITICAL Error in getStudents:", err.message);
		res.status(500).json({ error: err.message });
	}
};`;

// Try to find the rough block if exact match fails
const lines = content.split('\n');
let startLine = -1;
let endLine = -1;

for (let i = 0; i < lines.length; i++) {
               if (lines[i].includes('export const getStudents = async (req, res) => {')) {
                              startLine = i;
                              for (let j = i; j < lines.length; j++) {
                                             if (lines[j].includes('};') && j > i + 5) {
                                                            endLine = j;
                                                            break;
                                             }
                              }
                              break;
               }
}

if (startLine !== -1 && endLine !== -1) {
               console.log(`Found getStudents block at lines ${startLine + 1} to ${endLine + 1}`);
               const newLines = lines.slice(0, startLine);
               newLines.push(newCode);
               newLines.push(...lines.slice(endLine + 1));
               fs.writeFileSync(controllerPath, newLines.join('\n'));
               console.log("Successfully patched hod.controller.js");
} else {
               console.error("Could not find getStudents block");
}
