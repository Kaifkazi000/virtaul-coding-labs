const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'frontend/my-app/app/dashboard/hod/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Update the Student Modal content
const newModalContent = `
                                                                                                          <form onSubmit={handleRegisterStudent} className="space-y-6">
                                                                                                                         <div className="grid grid-cols-2 gap-6">
                                                                                                                                        <div className="space-y-1">
                                                                                                                                                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                                                                                                                                       <input type="text" placeholder="Jane Doe" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-sm font-bold focus:outline-none" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} required />
                                                                                                                                        </div>
                                                                                                                                        <div className="space-y-1">
                                                                                                                                                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                                                                                                                                       <input type="email" placeholder="jane@college.edu" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-sm font-bold focus:outline-none" value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} required />
                                                                                                                                        </div>
                                                                                                                         </div>
                                                                                                                         <div className="grid grid-cols-2 gap-6">
                                                                                                                                        <div className="space-y-1">
                                                                                                                                                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">PRN Number</label>
                                                                                                                                                       <input type="text" placeholder="PRN2024..." className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-sm font-bold focus:outline-none" value={newStudent.prn} onChange={e => setNewStudent({ ...newStudent, prn: e.target.value })} required />
                                                                                                                                        </div>
                                                                                                                                        <div className="space-y-1">
                                                                                                                                                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Roll Number</label>
                                                                                                                                                       <input type="text" placeholder="101" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-sm font-bold focus:outline-none" value={newStudent.roll} onChange={e => setNewStudent({ ...newStudent, roll: e.target.value })} required />
                                                                                                                                        </div>
                                                                                                                         </div>
                                                                                                                         
                                                                                                                         <div className="grid grid-cols-3 gap-6">
                                                                                                                                        <div className="space-y-1">
                                                                                                                                                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Semester</label>
                                                                                                                                                       <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 text-sm font-bold appearance-none focus:outline-none" value={newStudent.semester} onChange={e => setNewStudent({ ...newStudent, semester: e.target.value })} required>
                                                                                                                                                                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={String(s)}>Sem {s}</option>)}
                                                                                                                                                       </select>
                                                                                                                                        </div>
                                                                                                                                        <div className="space-y-1">
                                                                                                                                                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Batch</label>
                                                                                                                                                       <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 text-sm font-bold appearance-none focus:outline-none" value={newStudent.batch_name} onChange={e => setNewStudent({ ...newStudent, batch_name: e.target.value })} required>
                                                                                                                                                                      {['A', 'B', 'C', 'D'].map(b => <option key={b} value={b}>Batch {b}</option>)}
                                                                                                                                                       </select>
                                                                                                                                        </div>
                                                                                                                                        <div className="space-y-1">
                                                                                                                                                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Adm. Year</label>
                                                                                                                                                       <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 text-sm font-bold focus:outline-none" value={newStudent.academic_year} onChange={e => setNewStudent({ ...newStudent, academic_year: e.target.value })} required />
                                                                                                                                        </div>
                                                                                                                         </div>

                                                                                                                         <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all mt-4">Create Student Account</button>
                                                                                                          </form>`;

content = content.replace(
               /<form onSubmit=\{handleRegisterStudent\} className="space-y-4">[\s\S]*?<\/form>/,
               newModalContent
);

fs.writeFileSync(filePath, content);
console.log('Modal Patched successfully');
