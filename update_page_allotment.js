const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'kaifo', 'OneDrive', 'Desktop', 'virtuallabback', 'frontend', 'my-app', 'app\dashboard\hod', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update Repository View to show allotted teachers
const subjMapStart = '{subjects.map(subj => (';
const subjMapContent = `
                                                                                                                                                       {subjects.map(subj => {
                                                                                                                                                                      const subjAllotments = allotments.filter(a => a.subject_id === subj.id);
                                                                                                                                                                      return (
                                                                                                                                                                                     <div key={subj.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                                                                                                                                                                                                    <div className="flex justify-between items-start mb-6">
                                                                                                                                                                                                                   <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                                                                                                                                                                                                                  <BookOpen className="w-6 h-6" />
                                                                                                                                                                                                                   </div>
                                                                                                                                                                                                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subj.course_code}</span>
                                                                                                                                                                                                    </div>
                                                                                                                                                                                                    <h4 className="text-xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{subj.name}</h4>
                                                                                                                                                                                                    
                                                                                                                                                                                                    <div className="mb-6">
                                                                                                                                                                                                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Assignment Status</p>
                                                                                                                                                                                                                   {subjAllotments.length > 0 ? (
                                                                                                                                                                                                                                  <div className="flex flex-wrap gap-2">
                                                                                                                                                                                                                                                 {subjAllotments.map(a => (
                                                                                                                                                                                                                                                                <span key={a.id} className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border border-indigo-100">
                                                                                                                                                                                                                                                                               {a.teachers?.name} (B-{a.batch_name})
                                                                                                                                                                                                                                                                </span>
                                                                                                                                                                                                                                                 ))}
                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                   ) : (
                                                                                                                                                                                                                                  <span className="text-[9px] font-bold text-rose-400 italic">Not yet allotted</span>
                                                                                                                                                                                                                   )}
                                                                                                                                                                                                    </div>

                                                                                                                                                                                                    <div className="flex gap-2">
                                                                                                                                                                                                                   <button
                                                                                                                                                                                                                                  onClick={() => { setSelectedSubject(subj); fetchSyllabus(subj.id); }}
                                                                                                                                                                                                                                  className="flex-1 bg-slate-900 text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-800 transition-all"
                                                                                                                                                                                                                   >
                                                                                                                                                                                                                                  Manage Syllabus <ArrowRight className="w-4 h-4" />
                                                                                                                                                                                                                   </button>
                                                                                                                                                                                                                   <button onClick={() => handleDelete('subject', subj.id)} className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                                                                                                                                                                                    </div>
                                                                                                                                                                                     </div>
                                                                                                                                                                      );
                                                                                                                                                       })}
`;

// Replace the subjects.map section
const subjectsMapRegex = /\{subjects\.map\(subj => \([\s\S]+?\}\)\)\}/;
content = content.replace(subjectsMapRegex, subjMapContent);

// 2. Update Faculty Workload View to add delete (remove) button
const teacherLoadMapStart = '{teacherLoad.map(allot => (';
const teacherLoadMapContent = `
                                                                                                                                                                                                    {teacherLoad.map(allot => (
                                                                                                                                                                                                                   <div key={allot.id} className="py-2.5 flex items-center justify-between group/item">
                                                                                                                                                                                                                                  <div className="flex flex-col">
                                                                                                                                                                                                                                                 <span className="text-[10px] font-bold text-slate-600">{allot.subjects?.name}</span>
                                                                                                                                                                                                                                                 <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">BATCH {allot.batch_name} • SEM {allot.semester}</span>
                                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                                                  <button 
                                                                                                                                                                                                                                                 onClick={() => handleDelete('allotment', allot.id)}
                                                                                                                                                                                                                                                 className="text-slate-300 hover:text-rose-500 opacity-0 group-hover/item:opacity-100 transition-all p-1"
                                                                                                                                                                                                                                                 title="Remove Allotment"
                                                                                                                                                                                                                                  >
                                                                                                                                                                                                                                                 <X className="w-3.5 h-3.5" />
                                                                                                                                                                                                                                  </button>
                                                                                                                                                                                                                   </div>
                                                                                                                                                                                                    ))}
`;

const teacherLoadRegex = /\{teacherLoad\.map\(allot => \([\s\S]+?\}\)\)\}/;
content = content.replace(teacherLoadRegex, teacherLoadMapContent);

// 3. Ensure handleDelete supports 'allotment'
if (!content.includes("case 'allotment':")) {
    const caseSubject = "case 'subject':";
    const allotmentCase = `
                                                                             case 'allotment':
                                                                                            endpoint = \`/api/hod/allotments/\${id}\`;
                                                                                            break;`;
    content = content.replace(caseSubject, allotmentCase + "\n" + caseSubject);
}

fs.writeFileSync(filePath, content);
console.log('page.tsx updated successfully!');
