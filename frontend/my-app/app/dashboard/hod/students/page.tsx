"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
               Users,
               GraduationCap,
               Plus,
               Trash2,
               Search,
               Loader2,
               CheckCircle2,
               AlertCircle,
               X,
               ChevronLeft,
               FileSpreadsheet,
               Upload,
               ArrowRight
} from "lucide-react";
import HodNavbar from "@/components/HodNavbar";

export default function StudentsManagement() {
               const router = useRouter();
               const [hod, setHod] = useState<any>(null);
               const [loading, setLoading] = useState(true);
               const [message, setMessage] = useState("");
               const [error, setError] = useState("");
               const [students, setStudents] = useState<any[]>([]);
               const [searchTerm, setSearchTerm] = useState("");

               // Modal States
               const [showStudentModal, setShowStudentModal] = useState(false);
               const [showBulkModal, setShowBulkModal] = useState(false);
               const [isImporting, setIsImporting] = useState(false);

               // Form States
               const [newStudent, setNewStudent] = useState({
                              name: "",
                              email: "",
                              prn: "",
                              roll: "",
                              semester: "1",
                              batch_name: "A",
                              academic_year: new Date().getFullYear().toString()
               });
               const [bulkFields, setBulkFields] = useState({
                              semester: "1",
                              batch_name: "A",
                              academic_year: new Date().getFullYear().toString()
               });

               const loadStudents = useCallback(async () => {
                              try {
                                             setLoading(true);
                                             const res = await fetch("/api/hod/students");
                                             if (res.ok) setStudents(await res.json());
                              } catch (err) {
                                             console.error("Load Error:", err);
                                             setError("Failed to sync students");
                              } finally {
                                             setLoading(false);
                              }
               }, []);

               useEffect(() => {
                              const hodData = localStorage.getItem("hod_data");
                              if (hodData) setHod(JSON.parse(hodData));
                              loadStudents();
               }, [loadStudents]);

               const handleRegisterStudent = async (e: React.FormEvent) => {
                              e.preventDefault();
                              try {
                                             const res = await fetch("/api/hod/register-student", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify(newStudent)
                                             });
                                             if (!res.ok) {
                                                            const data = await res.json();
                                                            throw new Error(data.error || "Registration failed");
                                             }
                                             setMessage("Student account created!");
                                             setShowStudentModal(false);
                                             setNewStudent({
                                                            name: "",
                                                            email: "",
                                                            prn: "",
                                                            roll: "",
                                                            semester: "1",
                                                            batch_name: "A",
                                                            academic_year: new Date().getFullYear().toString()
                                             });
                                             loadStudents();
                              } catch (err: any) {
                                             setError(err.message);
                              }
               };

               const handleBulkImport = async (file: File) => {
                              try {
                                             setIsImporting(true);
                                             const reader = new FileReader();
                                             reader.onload = async (e) => {
                                                            const text = e.target?.result as string;
                                                            const lines = text.split('\n').map(l => l.trim()).filter(l => l);
                                                            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

                                                            const parsedStudents = lines.slice(1).map(line => {
                                                                           const values = line.split(',').map(v => v.trim());
                                                                           const student: any = {
                                                                                          semester: bulkFields.semester,
                                                                                          admission_year: bulkFields.academic_year
                                                                           };
                                                                           headers.forEach((header, i) => {
                                                                                          let val = values[i];
                                                                                          if (header.includes('name')) student.full_name = val;
                                                                                          if (header.includes('email')) student.email = val;
                                                                                                                                                                                     if (header.includes('prn')) {
                                                                                                          // Robust string-based expansion to prevent precision loss (> 2^53)
                                                                                                          let cleanPRN = val ? val.toString().trim() : "";
                                                                                                          if (cleanPRN.toLowerCase().includes('e+')) {
                                                                                                                         const [base, exp] = cleanPRN.toLowerCase().split('e+');
                                                                                                                         const power = parseInt(exp, 10);
                                                                                                                         const [intPart, fracPart = ""] = base.split('.');
                                                                                                                         student.prn = (intPart + fracPart + "0".repeat(Math.max(0, power - fracPart.length))).slice(0, intPart.length + power);
                                                                                                          } else {
                                                                                                                         student.prn = cleanPRN;
                                                                                                          }
                                                                                           }
                                                                                           if (header.includes('roll')) student.roll_no = val;
                                                                           });
                                                                           return student;
                                                            }).filter(s => (s.full_name || s.name) && s.email && s.prn);

                                                            if (parsedStudents.length === 0) {
                                                                           alert("No valid students found in CSV. Headers needed: Name, Email, PRN, Roll");
                                                                           setIsImporting(false);
                                                                           return;
                                                            }

                                                            const res = await fetch("/api/hod/bulk-register-students", {
                                                                           method: "POST",
                                                                           headers: { "Content-Type": "application/json" },
                                                                           body: JSON.stringify({ students: parsedStudents })
                                                            });

                                                            if (res.ok) {
                                                                           const result = await res.json();
                                                                           alert(`Import finished: ${result.results.filter((r: any) => r.status === 'success').length} successful.`);
                                                                           loadStudents();
                                                                           setShowBulkModal(false);
                                                            } else {
                                                                           const data = await res.json();
                                                                           alert(data.error || "Bulk import failed at server.");
                                                            }
                                                            setIsImporting(false);
                                             };
                                             reader.readAsText(file);
                              } catch (err) {
                                             console.error(err);
                                             setIsImporting(false);
                                             alert("Failed to parse CSV.");
                              }
               };

               const handleDeleteStudent = async (id: string) => {
                              if (!confirm("Are you sure you want to delete this student?")) return;
                              try {
                                             const res = await fetch(`/api/hod/students/${id}`, { method: "DELETE" });
                                             if (!res.ok) throw new Error("Delete failed");
                                             setMessage("Student removed successfully");
                                             loadStudents();
                              } catch (err: any) {
                                             setError(err.message);
                              }
               };

               const filteredStudents = students.filter(s =>
                              s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              s.prn?.includes(searchTerm) ||
                              s.email?.toLowerCase().includes(searchTerm.toLowerCase())
               );

               if (loading && !students.length) {
                              return (
                                             <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                                                            <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
                                             </div>
                              );
               }

               return (
                              <div className="min-h-screen bg-[#F8FAFC]">
                                             <NavHeader name={hod?.name} onBack={() => router.push('/dashboard/hod')} />

                                             <main className="max-w-screen-2xl mx-auto p-8">
                                                            {/* Header Section */}
                                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                                                                           <div>
                                                                                          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Student <span className="text-indigo-600">Management</span></h1>
                                                                                          <p className="text-slate-500 font-medium mt-2">Manage enrollment, registry and academic batches.</p>
                                                                           </div>
                                                                           <div className="flex items-center gap-3">
                                                                                          <button
                                                                                                         onClick={() => setShowStudentModal(true)}
                                                                                                         className="flex items-center gap-2 bg-white border border-slate-200 text-slate-900 px-6 py-3 rounded-2xl text-xs font-black shadow-sm hover:border-indigo-200 transition-all uppercase tracking-widest active:scale-95"
                                                                                          >
                                                                                                         <Plus className="w-4 h-4" /> Manual Entry
                                                                                          </button>
                                                                                          <button
                                                                                                         onClick={() => setShowBulkModal(true)}
                                                                                                         className="flex items-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-2xl text-xs font-black shadow-xl hover:bg-slate-800 transition-all uppercase tracking-widest active:scale-95"
                                                                                          >
                                                                                                         <FileSpreadsheet className="w-4 h-4" /> Bulk Add (CSV)
                                                                                          </button>
                                                                           </div>
                                                            </div>

                                                            {/* Filter & Stats */}
                                                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-10">
                                                                           <div className="lg:col-span-3 relative">
                                                                                          <Search className="w-5 h-5 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                                                                          <input
                                                                                                         type="text"
                                                                                                         placeholder="Search by name, PRN or email..."
                                                                                                         className="w-full bg-white border border-slate-200 rounded-[2rem] py-5 pl-16 pr-8 text-sm font-bold shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
                                                                                                         value={searchTerm}
                                                                                                         onChange={e => setSearchTerm(e.target.value)}
                                                                                          />
                                                                           </div>
                                                                           <div className="bg-indigo-600 rounded-[2rem] p-6 text-white flex items-center justify-between shadow-xl shadow-indigo-900/10">
                                                                                          <div>
                                                                                                         <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Enrolled</p>
                                                                                                         <p className="text-3xl font-black mt-1">{students.length}</p>
                                                                                          </div>
                                                                                          <GraduationCap className="w-10 h-10 opacity-20" />
                                                                           </div>
                                                            </div>

                                                            {/* Student List categorised by Year */}
                                                            <div className="space-y-12">
                                                                           {[1, 2, 3, 4].map(year => {
                                                                                          const yearStudents = filteredStudents.filter(s => {
                                                                                                         const sem = parseInt(s.semester || "0");
                                                                                                         return sem === (year * 2) - 1 || sem === (year * 2);
                                                                                          });

                                                                                          if (searchTerm && yearStudents.length === 0) return null;

                                                                                          return (
                                                                                                         <div key={year} className="space-y-6">
                                                                                                                        <div className="flex items-center gap-4 px-2">
                                                                                                                                       <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">{year}{year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Academic Year</h3>
                                                                                                                                       <div className="h-px flex-1 bg-slate-200"></div>
                                                                                                                                       <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-widest">{yearStudents.length} Students</span>
                                                                                                                        </div>

                                                                                                                        {yearStudents.length === 0 ? (
                                                                                                                                       <div className="py-12 bg-white rounded-[2.5rem] border border-slate-100 border-dashed flex flex-col items-center justify-center text-slate-300">
                                                                                                                                                      <Users className="w-10 h-10 mb-2 opacity-20" />
                                                                                                                                                      <p className="text-[10px] font-black uppercase tracking-widest">No active students in this year</p>
                                                                                                                                       </div>
                                                                                                                        ) : (
                                                                                                                                       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                                                                                                                                      {yearStudents.map(student => (
                                                                                                                                                                     <StudentCard key={student.id} student={student} onDelete={() => handleDeleteStudent(student.id)} />
                                                                                                                                                      ))}
                                                                                                                                       </div>
                                                                                                                        )}
                                                                                                         </div>
                                                                                          );
                                                                           })}
                                                            </div>
                                             </main>

                                             {/* Manual Entry Modal */}
                                             {showStudentModal && (
                                                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-sm bg-slate-900/40">
                                                                           <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                                                                                          <div className="p-12">
                                                                                                         <div className="flex items-center justify-between mb-10">
                                                                                                                        <div>
                                                                                                                                       <h2 className="text-3xl font-black text-slate-900 tracking-tight">Manual <span className="text-emerald-600">Entry</span></h2>
                                                                                                                                       <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Add individual student record</p>
                                                                                                                        </div>
                                                                                                                        <button onClick={() => setShowStudentModal(false)} className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-all"><X className="w-6 h-6" /></button>
                                                                                                         </div>

                                                                                                         <form onSubmit={handleRegisterStudent} className="space-y-6">
                                                                                                                        <div className="grid grid-cols-2 gap-6">
                                                                                                                                       <div className="space-y-2">
                                                                                                                                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                                                                                                                                                      <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} required placeholder="John Doe" />
                                                                                                                                       </div>
                                                                                                                                       <div className="space-y-2">
                                                                                                                                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                                                                                                                                                      <input type="email" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all" value={newStudent.email} onChange={e => setNewStudent({ ...newStudent, email: e.target.value })} required placeholder="john@college.edu" />
                                                                                                                                       </div>
                                                                                                                        </div>
                                                                                                                        <div className="grid grid-cols-2 gap-6">
                                                                                                                                       <div className="space-y-2">
                                                                                                                                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">PRN Number (16 Digits)</label>
                                                                                                                                                      <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" value={newStudent.prn} onChange={e => setNewStudent({ ...newStudent, prn: e.target.value })} required placeholder="e.g. 1234567890123456" />
                                                                                                                                       </div>
                                                                                                                                       <div className="space-y-2">
                                                                                                                                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Roll Number</label>
                                                                                                                                                      <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none" value={newStudent.roll} onChange={e => setNewStudent({ ...newStudent, roll: e.target.value })} required placeholder="101" />
                                                                                                                                       </div>
                                                                                                                        </div>
                                                                                                                        <div className="grid grid-cols-3 gap-6">
                                                                                                                                       <div className="space-y-2">
                                                                                                                                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Semester</label>
                                                                                                                                                      <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold appearance-none cursor-pointer" value={newStudent.semester} onChange={e => setNewStudent({ ...newStudent, semester: e.target.value })}>
                                                                                                                                                                     {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={String(s)}>Sem {s}</option>)}
                                                                                                                                                      </select>
                                                                                                                                       </div>
                                                                                                                                       <div className="space-y-2">
                                                                                                                                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Batch</label>
                                                                                                                                                      <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold appearance-none cursor-pointer" value={newStudent.batch_name} onChange={e => setNewStudent({ ...newStudent, batch_name: e.target.value })}>
                                                                                                                                                                     {['A', 'B', 'C', 'D'].map(b => <option key={b} value={b}>Batch {b}</option>)}
                                                                                                                                                      </select>
                                                                                                                                       </div>
                                                                                                                                       <div className="space-y-2">
                                                                                                                                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Adm. Year</label>
                                                                                                                                                      <input type="text" className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold" value={newStudent.academic_year} onChange={e => setNewStudent({ ...newStudent, academic_year: e.target.value })} />
                                                                                                                                       </div>
                                                                                                                        </div>
                                                                                                                        <button type="submit" className="w-full bg-slate-900 text-white py-6 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95">Register Student</button>
                                                                                                         </form>
                                                                                          </div>
                                                                           </div>
                                                            </div>
                                             )}

                                             {/* Bulk Import Modal */}
                                             {showBulkModal && (
                                                            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-900/60">
                                                                           <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in fade-in duration-300">
                                                                                          <div className="bg-slate-900 p-12 text-white relative">
                                                                                                         <button onClick={() => setShowBulkModal(false)} className="absolute top-10 right-10 text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                                                                                                         <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-indigo-500/20"><FileSpreadsheet className="w-8 h-8" /></div>
                                                                                                         <h2 className="text-4xl font-black tracking-tight">Bulk Upload Students</h2>
                                                                                                         <p className="text-slate-400 mt-2 text-xs font-bold uppercase tracking-widest">Select a CSV file to import multiple students at once.</p>
                                                                                          </div>
                                                                                          <div className="p-12 space-y-10">
                                                                                                         <div className="grid grid-cols-3 gap-6">
                                                                                                                        <div className="col-span-2 space-y-2">
                                                                                                                                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Set Default Semester for Import</label>
                                                                                                                                       <select className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-8 text-sm font-bold appearance-none cursor-pointer focus:ring-4 focus:ring-indigo-500/5 transition-all" value={bulkFields.semester} onChange={e => setBulkFields({ ...bulkFields, semester: e.target.value })}>
                                                                                                                                                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={String(s)}>Semester {s}</option>)}
                                                                                                                                       </select>
                                                                                                                        </div>
                                                                                                                        <div className="space-y-2">
                                                                                                                                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Admission Year</label>
                                                                                                                                       <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 px-8 text-sm font-bold" value={bulkFields.academic_year} onChange={e => setBulkFields({ ...bulkFields, academic_year: e.target.value })} />
                                                                                                                        </div>
                                                                                                         </div>

                                                                                                         <div className="border-4 border-dashed border-slate-100 rounded-[3rem] p-16 flex flex-col items-center justify-center space-y-6 hover:border-indigo-100 hover:bg-indigo-50/10 transition-all group relative cursor-pointer">
                                                                                                                        <input
                                                                                                                                       type="file"
                                                                                                                                       accept=".csv"
                                                                                                                                       className="absolute inset-0 opacity-0 cursor-pointer"
                                                                                                                                       onChange={(e) => {
                                                                                                                                                      const file = e.target.files?.[0];
                                                                                                                                                      if (file) handleBulkImport(file);
                                                                                                                                       }}
                                                                                                                                       disabled={isImporting}
                                                                                                                        />
                                                                                                                        <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-300 group-hover:bg-white group-hover:text-indigo-600 shadow-sm group-hover:shadow-md transition-all">
                                                                                                                                       {isImporting ? <Loader2 className="w-10 h-10 animate-spin" /> : <Upload className="w-10 h-10" />}
                                                                                                                        </div>
                                                                                                                        <div className="text-center">
                                                                                                                                       <p className="text-lg font-black text-slate-900 uppercase tracking-tighter">{isImporting ? "IMPORTING BATCH..." : "Select CSV File"}</p>
                                                                                                                                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Required Headers: Name, Email, PRN, Roll</p>
                                                                                                                        </div>
                                                                                                         </div>

                                                                                                         <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                                                                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 text-center">Batching Logic</p>
                                                                                                                        <div className="flex justify-around text-center">
                                                                                                                                       <div>
                                                                                                                                                      <p className="text-emerald-600 font-black text-xl tracking-tighter">5-7</p>
                                                                                                                                                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">per batch (small class)</p>
                                                                                                                                       </div>
                                                                                                                                       <div className="w-px h-10 bg-slate-200"></div>
                                                                                                                                       <div>
                                                                                                                                                      <p className="text-indigo-600 font-black text-xl tracking-tighter">30</p>
                                                                                                                                                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">per batch (large class)</p>
                                                                                                                                       </div>
                                                                                                                        </div>
                                                                                                         </div>
                                                                                          </div>
                                                                           </div>
                                                            </div>
                                             )}

                                             {/* Toasts */}
                                             {message && (
                                                            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-4 shadow-2xl z-[200] animate-in slide-in-from-bottom-5">
                                                                           <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                                                           {message}
                                                                           <button onClick={() => setMessage("")} className="ml-4 opacity-40 hover:opacity-100"><X className="w-4 h-4" /></button>
                                                            </div>
                                             )}
                                             {error && (
                                                            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-4 shadow-2xl z-[200] animate-in slide-in-from-bottom-5">
                                                                           <AlertCircle className="w-5 h-5" />
                                                                           {error}
                                                                           <button onClick={() => setError("")} className="ml-4 opacity-40 hover:opacity-100"><X className="w-4 h-4" /></button>
                                                            </div>
                                             )}
                              </div>
               );
}

function StudentCard({ student, onDelete }: any) {
               return (
                              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                             <div className="flex justify-between items-start mb-6">
                                                            <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                                                           <Users className="w-7 h-7" />
                                                            </div>
                                                            <div className="bg-slate-900 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg">
                                                                           Batch {student.batch_name || 'N/A'}
                                                            </div>
                                             </div>

                                             <div className="space-y-1">
                                                            <h4 className="text-xl font-bold text-slate-900 truncate tracking-tight">{student.full_name}</h4>
                                                            <p className="text-[11px] font-medium text-slate-400 truncate mb-6 uppercase tracking-tight">{student.email}</p>
                                             </div>

                                             <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-50">
                                                            <div className="bg-slate-50 px-4 py-2 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-100">PRN: {student.prn}</div>
                                                            <div className="bg-slate-50 px-4 py-2 rounded-xl text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-100">Roll: {student.roll_no}</div>
                                             </div>

                                             <button
                                                            onClick={onDelete}
                                                            className="absolute top-8 right-8 p-3 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"
                                             >
                                                            <Trash2 className="w-5 h-5" />
                                             </button>
                              </div>
               );
}

function NavHeader({ name, onBack }: any) {
               return (
                              <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                                             <div className="max-w-screen-2xl mx-auto px-8 h-24 flex items-center justify-between">
                                                            <div className="flex items-center gap-8">
                                                                           <button onClick={onBack} className="p-4 bg-slate-50 rounded-2xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                                                                          <ChevronLeft className="w-6 h-6" />
                                                                           </button>
                                                                           <div className="w-px h-8 bg-slate-200"></div>
                                                                           <div>
                                                                                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">HOD Console</p>
                                                                                          <p className="text-sm font-bold text-slate-900 tracking-tight">{name}</p>
                                                                           </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                           <div className="text-right hidden sm:block">
                                                                                          <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Department Secured</p>
                                                                                          <p className="text-xs font-bold text-slate-400 mt-1 uppercase">Student Records System</p>
                                                                           </div>
                                                            </div>
                                             </div>
                              </header>
               );
}
