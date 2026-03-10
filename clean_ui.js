const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/my-app/app/dashboard/hod/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Remove the global Add Student button
content = content.replace(
               /<button onClick=\{\(\) => setShowStudentModal\(true\)\} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-\[10px\] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95 flex items-center gap-2"><Plus className="w-4 h-4" \/> Add Student<\/button>/g,
               ''
);

fs.writeFileSync(filePath, content);
console.log('Global Button removed successfully');
