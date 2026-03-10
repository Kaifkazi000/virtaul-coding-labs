"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
               Users,
               BookOpen,
               GraduationCap,
               FileText,
               Plus,
               Trash2,
               Search,
               Loader2,
               CheckCircle2,
               AlertCircle,
               X,
               ArrowRight,
               Shield,
               Calendar,
               ChevronLeft,
               BookMarked,
               Activity,
               Code2,
               FileSpreadsheet,
               Upload,
               Settings,
               Lock,
               RefreshCw
} from "lucide-react";
import HodNavbar from "@/components/HodNavbar";
import ChangePasswordModal from "@/components/ChangePasswordModal";

export default function HodDashboard() {
               const router = useRouter();
               const [hod, setHod] = useState<any>(null);
               const [activeTab, setActiveTab] = useState("overview");
               const [loading, setLoading] = useState(true);
               const [message, setMessage] = useState("");
               const [error, setError] = useState("");

               // Data States
               const [stats, setStats] = useState({
                              totalStudents: 0,
                              totalSubjects: 0,
                              totalTeachers: 0,
                              totalAllotments: 0
               });
               const [subjects, setSubjects] = useState<any[]>([]);
               const [teachers, setTeachers] = useState<any[]>([]);
               const [students, setStudents] = useState<any[]>([]);
               const [allotments, setAllotments] = useState<any[]>([]);

               // Syllabus Drill-down States
               const [selectedSubject, setSelectedSubject] = useState<any>(null);
               const [masterPracticals, setMasterPracticals] = useState<any[]>([]);

               // Modal States
               const [showSubjectModal, setShowSubjectModal] = useState(false);
               const [showStudentModal, setShowStudentModal] = useState(false);
               const [showBulkModal, setShowBulkModal] = useState(false);
               const [isImporting, setIsImporting] = useState(false);
               const [importProgress, setImportProgress] = useState(0);
               const [showAllotmentModal, setShowAllotmentModal] = useState(false);
               const [showPracticalModal, setShowPracticalModal] = useState(false);
               const [showTeacherModal, setShowTeacherModal] = useState(false);
               const [alumniSearch, setAlumniSearch] = useState("");
               const [alumniData, setAlumniData] = useState<any>(null);
               const [promotionBatch, setPromotionBatch] = useState({ semester: 1, batch_name: "A" });
               const [showPasswordModal, setShowPasswordModal] = useState(false);

               // Form States
               const [newSubject, setNewSubject] = useState({ name: "", course_code: "" });
               const [newStudent, setNewStudent] = useState({ name: "", email: "", prn: "", roll: "", semester: "1", batch_name: "A", academic_year: new Date().getFullYear().toString() });
               const [newAllotment, setNewAllotment] = useState({ master_subject_id: "", teacher_id: "", semester: "1", batch_name: "A", academic_year: new Date().getFullYear().toString() });
               const [newPractical, setNewPractical] = useState({ pr_no: "", title: "", description: "", language: "javascript" });
               const [newTeacher, setNewTeacher] = useState({ name: "", email: "", department: "CSE", password: "" });
               const [bulkFields, setBulkFields] = useState({ semester: "1", batch_name: "A", academic_year: new Date().getFullYear().toString() });

               const loadData = useCallback(async () => {
                              try {
                                             setLoading(true);
                                             const [statsRes, subjRes, teachRes, studRes, allotRes] = await Promise.all([
                                                            fetch("/api/hod/stats"),
                                                            fetch("/api/hod/master-subjects"),
                                                            fetch("/api/hod/teachers"),
                                                            fetch("/api/hod/students"),
                                                            fetch("/api/hod/allotments")
                                             ]);

                                             if (statsRes.ok) setStats(await statsRes.json());
                                             if (subjRes.ok) setSubjects(await subjRes.json());
                                             if (teachRes.ok) setTeachers(await teachRes.json());
                                             if (studRes.ok) setStudents(await studRes.json());
                                             if (allotRes.ok) setAllotments(await allotRes.json());
                              } catch (err) {
                                             console.error("Load Error:", err);
                                             setError("Failed to sync with server");
                              } finally {
                                             setLoading(false);
                              }
               }, []);

               const fetchSyllabus = async (subjectId: string) => {
                              try {
                                             const res = await fetch(`/api/hod/master-subjects/${subjectId}/practicals`);
                                             if (res.ok) setMasterPracticals(await res.json());
                              } catch (err) {
                                             console.error("Fetch Syllabus Error:", err);
                              }
               };

               useEffect(() => {
                              const hodData = localStorage.getItem("hod_data");
                              if (hodData) {
                                             setHod(JSON.parse(hodData));
                              } else {
                                             setHod({ name: "Administrator", role: "hod" });
                              }
                              loadData();
               }, [loadData]);

               // Actions
               const handleCreateSubject = async (e: React.FormEvent) => {
                              e.preventDefault();
                              try {
                                             const res = await fetch("/api/hod/master-subjects", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify(newSubject)
                                             });
                                             if (!res.ok) throw new Error("Failed to create subject");
                                             setMessage("Subject created successfully!");
                                             setShowSubjectModal(false);
                                             setNewSubject({ name: "", course_code: "" });
                                             loadData();
                              } catch (err: any) {
                                             setError(err.message);
                              }
               };

               const handleCreatePractical = async (e: React.FormEvent) => {
                              e.preventDefault();
                              try {
                                             const res = await fetch("/api/hod/master-practical", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({ ...newPractical, master_subject_id: selectedSubject.id })
                                             });
                                             if (!res.ok) {
                                                            const data = await res.json();
                                                            throw new Error(data.error || "Failed to add practical");
                                             }
                                             setMessage("Practical template added to syllabus!");
                                             setShowPracticalModal(false);
                                             fetchSyllabus(selectedSubject.id);
                              } catch (err: any) {
                                             setError(err.message);
                              }
               };

               const handleRegisterStudent = async (e: React.FormEvent) => {
                              e.preventDefault();
                              try {
                                             const res = await fetch("/api/hod/register-student", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify(newStudent)
                                             });
                                             if (!res.ok) throw new Error("Registration failed");
                                             setMessage("Student account created!");
                                             setShowStudentModal(false);
                                             loadData();
                              } catch (err: any) {
                                             setError(err.message);
                              }
               };

               const handleCreateAllotment = async (e: React.FormEvent) => {
                              e.preventDefault();
                              try {
                                             const res = await fetch("/api/hod/allot-subject", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify(newAllotment)
                                             });
                                             if (!res.ok) throw new Error("Allotment failed");
                                             setMessage("Subject allotted to teacher!");
                                             setShowAllotmentModal(false);
                                             loadData();
                              } catch (err: any) {
                                             setError(err.message);
                              }
               };

               const handleRegisterTeacher = async (e: React.FormEvent) => {
                              e.preventDefault();
                              try {
                                             const res = await fetch("/api/hod/register-teacher", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify(newTeacher)
                                             });
                                             if (!res.ok) {
                                                            const data = await res.json();
                                                            throw new Error(data.error || "Registration failed");
                                             }
                                             setMessage("Teacher account created!");
                                             setShowTeacherModal(false);
                                             setNewTeacher({ name: "", email: "", department: "CSE", password: "" });
                                             loadData();
                              } catch (err: any) {
                                             setError(err.message);
                              }
               };

               const handleDeleteTeacher = async (id: string) => {
                              if (!confirm("Are you sure? This will delete the teacher profile and authentication account.")) return;
                              try {
                                             const res = await fetch(`/api/hod/teachers/${id}`, { method: "DELETE" });
                                             if (!res.ok) throw new Error("Deletion failed");
                                             setMessage("Teacher deleted successfully");
                                             loadData();
                              } catch (err: any) {
                                             setError(err.message);
                              }
               };

               const handleAlumniSearch = async () => {
                              if (!alumniSearch) return;
                              try {
                                             const res = await fetch(`/api/hod/alumni?prn=${alumniSearch}`);
                                             const data = await res.json();
                                             if (data) setAlumniData(data);
                                             else setError("No alumni found with this PRN");
                              } catch (err: any) {
                                             setError("Search failed");
                              }
               };

               const handlePromoteBatch = async () => {
                              if (!confirm(`Are you sure you want to promote Batch ${promotionBatch.batch_name} from Semester ${promotionBatch.semester}? This will move Semester 8 students to Alumni.`)) return;
                              try {
                                             const res = await fetch("/api/hod/promote-batch", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" },
                                                            body: JSON.stringify({ current_semester: Number(promotionBatch.semester), batch_name: promotionBatch.batch_name })
                                             });
                                             if (!res.ok) throw new Error("Promotion failed");
                                             setMessage("Batch promoted successfully!");
                                             loadData();
                              } catch (err: any) {
                                             setError(err.message);
                              }
               };

               const handleBulkImport = async (file: File, commonFields: { semester: string; batch_name: string; academic_year: string }) => {
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
                                                                                          semester: commonFields.semester,
                                                                                          admission_year: commonFields.academic_year
                                                                           };
                                                                           headers.forEach((header, i) => {
                                                                           let val = values[i];
                                                                           if (header.includes('name')) student.full_name = val;
                                                                           if (header.includes('email')) student.email = val;
                                                                           if (header.includes('prn')) {
                                                                                          if (val && val.toString().includes('E+')) {
                                                                                                         student.prn = Number(val).toLocaleString('fullwide', {useGrouping:false});
                                                                                          } else {
                                                                                                         student.prn = val;
                                                                                          }
                                                                           }
                                                                           if (header.includes('roll')) student.roll_no = val;
                                                                           });
                                                                           return student;
                                                            }).filter(s => (s.full_name || s.name) && s.email && s.prn);

                                                            if (parsedStudents.length === 0) {
                                                                           alert("No valid students found in CSV. Expected Headers: Name, Email, PRN, Roll");
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
                                                                           alert(`Import finished: ${result.results.filter((r: any) => r.status === 'success').length} successful, ${result.results.filter((r: any) => r.status === 'error').length} failed.`);
                                                                           loadData();
                                                                           setShowBulkModal(false);
                                                            } else {
                                                                           alert("Bulk import failed at server.");
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

               const handleDelete = async (type: string, id: string) => {
                              if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;
                              try {
                                             const endpoint = type === 'subject'
                                                            ? `/api/hod/master-subjects/${id}`
                                                            : type === 'practical'
                                                                           ? `/api/hod/master-practicals/${id}`
                                                                           : `/api/hod/students/${id}`;

                                             const res = await fetch(endpoint, { method: "DELETE" });
                                             if (!res.ok) throw new Error("Delete failed");
                                             setMessage(`${type} removed successfully`);
                                             if (type === 'practical' && selectedSubject) fetchSyllabus(selectedSubject.id);
                                             else loadData();
                              } catch (err: any) {
                                             setError(err.message);
                              }
               };

               if (loading && !stats.totalSubjects) {
                              return (
                                             <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                                                            <div className="flex flex-col items-center gap-4">
                                                                           <Loader2 className="w-12 h-12 text-slate-400 animate-spin" />
                                                                           <p className="text-slate-500 font-medium font-serif">Syncing Department Repository...</p>
                                                            </div>
                                             </div>
                              );
               }

               return (
                              <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
                                             {/* Navigation */}
                                             <HodNavbar
                                                            hodName={hod?.name || "HOD Admin"}
                                                            onSettingsClick={() => setShowPasswordModal(true)}
                                             />

                                             <ChangePasswordModal
                                                            isOpen={showPasswordModal}
                                                            onClose={() => setShowPasswordModal(false)}
                                                            userType="hod"
                                             />

                                             <main className="max-w-screen-2xl mx-auto p-8">
                                                            {/* Stats */}
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                                                           <StatCard label="Faculty Strength" value={stats.totalTeachers} icon={<Users className="w-6 h-6" />} color="text-indigo-600" bg="bg-indigo-50" />
                                                                           <StatCard label="Master Repository" value={stats.totalSubjects} icon={<BookMarked className="w-6 h-6" />} color="text-amber-600" bg="bg-amber-50" />
                                                                           <StatCard label="Active Workloads" value={stats.totalAllotments} icon={<Activity className="w-6 h-6" />} color="text-violet-600" bg="bg-violet-50" />
                                                                           <StatCard label="Enrolled Students" value={stats.totalStudents} icon={<GraduationCap className="w-6 h-6" />} color="text-emerald-600" bg="bg-emerald-50" />
                                                            </div>

                                                            {/* Nav */}
                                                            <div className="flex items-center justify-between mb-8 bg-white p-2 rounded-2xl border border-slate-200">
                                                                           <div className="flex gap-2">
                                                                                          <TabButton label="Dashboard" active={activeTab === 'overview'} onClick={() => { setActiveTab('overview'); setSelectedSubject(null); }} />
                                                                                          <TabButton label="Master Repository" active={activeTab === 'repository'} onClick={() => { setActiveTab('repository'); setSelectedSubject(null); }} />
                                                                                          <TabButton label="Faculty Registry" active={activeTab === 'faculty'} onClick={() => { setActiveTab('faculty'); setSelectedSubject(null); }} />
                                                                                          <TabButton label="Students" active={activeTab === 'students'} onClick={() => { setActiveTab('students'); setSelectedSubject(null); }} />
                                                                                          <TabButton label="Promotion" active={activeTab === 'promotion'} onClick={() => { setActiveTab('promotion'); setSelectedSubject(null); }} />
                                                                                          <TabButton label="Alumni" active={activeTab === 'alumni'} onClick={() => { setActiveTab('alumni'); setSelectedSubject(null); }} />
                                                                           </div>
                                                                           <div className="flex gap-3 px-2">
                                                                                          <button onClick={() => setShowSubjectModal(true)} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"><Plus className="w-4 h-4" /> New Subject</button>
                                                                                          <button onClick={() => setShowAllotmentModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95"><Calendar className="w-4 h-4" /> Create Allotment</button>
                                                                           </div>
                                                            </div>

                                                            {/* Bulk Import Modal */}
                                                            {showBulkModal && (
                                                                           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                                                                                          <div className="bg-white w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                                                                                                         <div className="bg-slate-900 p-10 text-white relative">
                                                                                                                        <button onClick={() => setShowBulkModal(false)} className="absolute top-8 right-8 text-slate-400 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                                                                                                                        <div className="w-16 h-16 bg-indigo-500 rounded-3xl flex items-center justify-center mb-6 shadow-2xl"><FileSpreadsheet className="w-8 h-8" /></div>
                                                                                                                        <h2 className="text-3xl font-black tracking-tight">Bulk Student Import</h2>
                                                                                                                        <p className="text-slate-400 mt-2 text-sm font-bold uppercase tracking-widest">CSV Format: Name, Email, PRN, Roll</p>
                                                                                                         </div>
                                                                                                         <div className="p-10 space-y-8">
                                                                                                                        <div className="grid grid-cols-3 gap-4">
                                                                                                                                       <div className="space-y-2 col-span-2">
                                                                                                                                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Semester</label>
                                                                                                                                                      <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-sm font-bold appearance-none focus:outline-none" value={bulkFields.semester} onChange={e => setBulkFields({ ...bulkFields, semester: e.target.value })}>
                                                                                                                                                                     {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                                                                                                                                      </select>
                                                                                                                                       </div>
                                                                                                                                       <div className="space-y-2">
                                                                                                                                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admission Year</label>
                                                                                                                                                      <input type="number" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-sm font-bold" value={bulkFields.academic_year} onChange={e => setBulkFields({ ...bulkFields, academic_year: e.target.value })} />
                                                                                                                                       </div>
                                                                                                                        </div>

                                                                                                                        <div className="border-2 border-dashed border-slate-100 rounded-[2rem] p-12 flex flex-col items-center justify-center space-y-4 hover:border-indigo-100 transition-colors relative group">
                                                                                                                                       <input type="file" accept=".csv" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                                                                                                                                      const file = e.target.files?.[0];
                                                                                                                                                      if (file) handleBulkImport(file, bulkFields);
                                                                                                                                       }} disabled={isImporting} />
                                                                                                                                       <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 group-hover:text-indigo-600 transition-colors">
                                                                                                                                                      {isImporting ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                                                                                                                                       </div>
                                                                                                                                       <div className="text-center">
                                                                                                                                                      <p className="text-sm font-bold text-slate-900">{isImporting ? "Processing Batch..." : "Click to select CSV File"}</p>
                                                                                                                                                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Maximum 100 students per batch</p>
                                                                                                                                       </div>
                                                                                                                        </div>

                                                                                                                        <button onClick={() => setShowBulkModal(false)} className="w-full py-5 text-sm font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">Cancel Import</button>
                                                                                                         </div>
                                                                                          </div>
                                                                           </div>
                                                            )}
                                                            {/* Content */}
                                                            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
                                                                           {activeTab === "overview" && (
                                                                                          <div className="p-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
                                                                                                         <div className="lg:col-span-2 space-y-8">
                                                                                                                        <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                                                                                                                                       <div className="relative z-10">
                                                                                                                                                      <h2 className="text-3xl font-bold tracking-tight mb-2">Welcome Back, <span className="text-indigo-400">Head of Dept.</span></h2>
                                                                                                                                                      <p className="text-slate-400 text-sm max-w-md leading-relaxed">Your departmental assets are synced and secure. Manage your faculty allotments and master syllabus repository from here.</p>
                                                                                                                                                      <div className="flex gap-4 mt-8">
                                                                                                                                                                     <button onClick={() => setActiveTab('repository')} className="bg-white text-slate-900 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">Manage Syllabus <ArrowRight className="w-4 h-4" /></button>
                                                                                                                                                                     <button onClick={() => setActiveTab('faculty')} className="bg-slate-800 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 transition-all">View Faculty Load</button>
                                                                                                                                                      </div>
                                                                                                                                       </div>
                                                                                                                                       <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                                                                                                                        </div>

                                                                                                                        <div className="space-y-6">
                                                                                                                                       <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3"><Activity className="w-5 h-5 text-indigo-600" /> Recent Allotments</h3>
                                                                                                                                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                                                                                      {allotments.slice(0, 4).map(allot => (
                                                                                                                                                                     <div key={allot.id} className="p-5 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-between group">
                                                                                                                                                                                    <div>
                                                                                                                                                                                                   <div className="font-black text-slate-900">{allot.subjects?.name}</div>
                                                                                                                                                                                                   <p className="text-[10px] font-medium text-slate-500 mt-0.5">{allot.teachers?.name} <span className="text-slate-300">({allot.teacher_id?.substring(0, 8)})</span> • Sem {allot.semester}</p>
                                                                                                                                                                                    </div>
                                                                                                                                                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600 opacity-60 group-hover:opacity-100 transition-opacity">{allot.batch_name}</div>
                                                                                                                                                                     </div>
                                                                                                                                                      ))}
                                                                                                                                       </div>
                                                                                                                        </div>
                                                                                                         </div>

                                                                                                         <div className="space-y-8">
                                                                                                                        <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                                                                                                                                       <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Quick Actions</h4>
                                                                                                                                       <div className="space-y-3">
                                                                                                                                                      <button onClick={() => setShowStudentModal(true)} className="w-full text-left p-4 bg-white rounded-xl border border-slate-100 hover:border-indigo-300 transition-all group flex items-center justify-between">
                                                                                                                                                                     <div>
                                                                                                                                                                                    <p className="text-xs font-bold text-slate-900">Add New Student</p>
                                                                                                                                                                                    <p className="text-[10px] text-slate-500">Individual or bulk entry</p>
                                                                                                                                                                     </div>
                                                                                                                                                                     <Plus className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                                                                                                                                                      </button>
                                                                                                                                                      <button onClick={() => setShowPasswordModal(true)} className="w-full text-left p-4 bg-slate-900 text-white rounded-xl border border-slate-800 hover:bg-slate-800 transition-all group flex items-center justify-between">
                                                                                                                                                                     <div>
                                                                                                                                                                                    <p className="text-xs font-bold">Update Password</p>
                                                                                                                                                                                    <p className="text-[10px] opacity-60">Secure your account</p>
                                                                                                                                                                     </div>
                                                                                                                                                                     <Lock className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                                                                                                                                                      </button>
                                                                                                                                                      <button className="w-full text-left p-4 bg-white rounded-xl border border-slate-100 hover:border-indigo-300 transition-all group flex items-center justify-between opacity-50 cursor-not-allowed">
                                                                                                                                                                     <div>
                                                                                                                                                                                    <p className="text-xs font-bold text-slate-900">End Semester</p>
                                                                                                                                                                                    <p className="text-[10px] text-slate-500">Archive all active data</p>
                                                                                                                                                                     </div>
                                                                                                                                                                     <Shield className="w-4 h-4 text-slate-300" />
                                                                                                                                                      </button>
                                                                                                                                       </div>
                                                                                                                        </div>
                                                                                                         </div>
                                                                                          </div>
                                                                           )}

                                                                           {/* Repository Tab */}
                                                                           {activeTab === "repository" && (
                                                                                          <div className="p-10">
                                                                                                         {!selectedSubject ? (
                                                                                                                        <div className="space-y-8">
                                                                                                                                       <div className="flex items-center justify-between">
                                                                                                                                                      <div>
                                                                                                                                                                     <h2 className="text-2xl font-bold text-slate-900">Master <span className="text-indigo-600">Repository</span></h2>
                                                                                                                                                                     <p className="text-slate-500 text-sm font-medium mt-1">Manage departmental subjects and their syllabus templates.</p>
                                                                                                                                                      </div>
                                                                                                                                                      <div className="relative">
                                                                                                                                                                     <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                                                                                                                                     <input type="text" placeholder="Search Master Repository..." className="bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-6 text-xs font-bold focus:outline-none w-80" />
                                                                                                                                                      </div>
                                                                                                                                       </div>

                                                                                                                                       <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                                                                                                                                      {subjects.map(subj => (
                                                                                                                                                                     <div key={subj.id} className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group relative overflow-hidden">
                                                                                                                                                                                    <div className="flex justify-between items-start mb-6">
                                                                                                                                                                                                   <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                                                                                                                                                                                                  <BookOpen className="w-6 h-6" />
                                                                                                                                                                                                   </div>
                                                                                                                                                                                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subj.course_code}</span>
                                                                                                                                                                                    </div>
                                                                                                                                                                                    <h4 className="text-xl font-bold text-slate-900 mb-6 leading-tight group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{subj.name}</h4>
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
                                                                                                                                                      ))}
                                                                                                                                                      <div onClick={() => setShowSubjectModal(true)} className="border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center p-12 hover:border-indigo-200 hover:bg-slate-50 transition-all cursor-pointer group">
                                                                                                                                                                     <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-indigo-600 mb-4 transition-colors"><Plus className="w-6 h-6" /></div>
                                                                                                                                                                     <p className="text-xs font-bold text-slate-900">Add Subject Category</p>
                                                                                                                                                                     <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Master Repo</p>
                                                                                                                                                      </div>
                                                                                                                                       </div>
                                                                                                                        </div>
                                                                                                         ) : (
                                                                                                                        <div className="space-y-8 animate-in slide-in-from-right-10 duration-500">
                                                                                                                                       <div className="flex items-center justify-between">
                                                                                                                                                      <div className="flex items-center gap-6">
                                                                                                                                                                     <button onClick={() => setSelectedSubject(null)} className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"><ChevronLeft className="w-5 h-5" /></button>
                                                                                                                                                                     <div>
                                                                                                                                                                                    <div className="flex items-center gap-3">
                                                                                                                                                                                                   <h2 className="text-2xl font-bold text-slate-900">{selectedSubject.name}</h2>
                                                                                                                                                                                                   <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{selectedSubject.course_code}</span>
                                                                                                                                                                                    </div>
                                                                                                                                                                                    <p className="text-slate-500 text-sm font-medium mt-1">Master Syllabus Template Repository</p>
                                                                                                                                                                     </div>
                                                                                                                                                      </div>
                                                                                                                                                      <button onClick={() => setShowPracticalModal(true)} className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl active:scale-95"><Plus className="w-4 h-4" /> Add Practical Template</button>
                                                                                                                                       </div>

                                                                                                                                       <div className="grid grid-cols-1 gap-4">
                                                                                                                                                      {masterPracticals.sort((a, b) => (a.pr_no) - (b.pr_no)).map((prac, idx) => (
                                                                                                                                                                     <div key={prac.id} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-center justify-between hover:border-indigo-200 group transition-all">
                                                                                                                                                                                    <div className="flex items-center gap-8">
                                                                                                                                                                                                   <div className="text-2xl font-black text-slate-200 group-hover:text-indigo-100 transition-colors w-10">{prac.pr_no || idx + 1}</div>
                                                                                                                                                                                                   <div>
                                                                                                                                                                                                                  <h5 className="font-bold text-slate-900 flex items-center gap-3 text-base">
                                                                                                                                                                                                                                 {prac.title}
                                                                                                                                                                                                                                 <span className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-tighter">{prac.language}</span>
                                                                                                                                                                                                                  </h5>
                                                                                                                                                                                                                  <p className="text-xs text-slate-500 font-medium mt-1 pr-10">{prac.description?.substring(0, 120)}...</p>
                                                                                                                                                                                                   </div>
                                                                                                                                                                                    </div>
                                                                                                                                                                                    <div className="flex items-center gap-4">
                                                                                                                                                                                                   <button onClick={() => { setNewPractical({ pr_no: String(prac.pr_no), title: prac.title, description: prac.description || "", language: prac.language }); setShowPracticalModal(true); }} className="p-3 bg-white rounded-xl text-slate-400 hover:text-indigo-600 border border-slate-100 hover:border-indigo-100 transition-all"><Settings className="w-4 h-4" /></button>
                                                                                                                                                                                                   <button onClick={() => handleDelete('practical', prac.id)} className="p-3 bg-white rounded-xl text-slate-400 hover:text-rose-500 border border-slate-100 hover:border-rose-100 transition-all"><Trash2 className="w-4 h-4" /></button>
                                                                                                                                                                                    </div>
                                                                                                                                                                     </div>
                                                                                                                                                      ))}
                                                                                                                                                      {masterPracticals.length === 0 && (
                                                                                                                                                                     <div className="py-20 flex flex-col items-center text-slate-400 border-2 border-dashed border-slate-100 rounded-[2rem]">
                                                                                                                                                                                    <FileText className="w-12 h-12 mb-4 opacity-20" />
                                                                                                                                                                                    <p className="text-sm font-bold">No Syllabus Templates Yet</p>
                                                                                                                                                                                    <button onClick={() => setShowPracticalModal(true)} className="text-indigo-600 mt-2 text-[10px] font-black uppercase tracking-widest hover:underline">Add First Practical</button>
                                                                                                                                                                     </div>
                                                                                                                                                      )}
                                                                                                                                       </div>
                                                                                                                        </div>
                                                                                                         )}
                                                                                          </div>
                                                                           )}

                                                                           {/* Faculty Tab */}
                                                                           {activeTab === "faculty" && (
                                                                                          <div className="p-10">
                                                                                                         <div className="flex items-center justify-between mb-10">
                                                                                                                        <div>
                                                                                                                                       <h2 className="text-2xl font-bold text-slate-900">Faculty <span className="text-indigo-600">Registry</span></h2>
                                                                                                                                       <p className="text-slate-500 text-sm font-medium mt-1">Total Strength: {teachers.length} Active Instructors</p>
                                                                                                                        </div>
                                                                                                                        <div className="flex gap-4">
                                                                                                                                       <button onClick={() => setShowTeacherModal(true)} className="bg-white text-slate-900 border border-slate-100 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-200 transition-all flex items-center gap-2 shadow-sm focus:ring-2 focus:ring-indigo-100"><Plus className="w-4 h-4" /> Register Teacher</button>
                                                                                                                                       <button onClick={() => setShowAllotmentModal(true)} className="bg-slate-900 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center gap-2 hover:bg-slate-800"><Plus className="w-4 h-4" /> New Faculty Allotment</button>
                                                                                                                        </div>
                                                                                                         </div>

                                                                                                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                                                                                        {teachers.map(teacher => {
                                                                                                                                       const teacherLoad = allotments.filter(a => a.teacher_id === teacher.auth_user_id);
                                                                                                                                       return (
                                                                                                                                                      <div key={teacher.auth_user_id} className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group">
                                                                                                                                                                     <div className="flex items-center gap-4 mb-6">
                                                                                                                                                                                    <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-[0_10px_30px_rgba(79,70,229,0.3)]">
                                                                                                                                                                                                   {teacher.name.charAt(0)}
                                                                                                                                                                                    </div>
                                                                                                                                                                                    <div className="flex-1">
                                                                                                                                                                                                   <div className="flex items-center justify-between">
                                                                                                                                                                                                                  <h4 className="font-bold text-slate-900 text-base">{teacher.name}</h4>
                                                                                                                                                                                                                  <button onClick={() => handleDelete('teacher', teacher.id)} className="text-slate-300 hover:text-rose-500 transition-colors p-1" title="Delete Faculty Account">
                                                                                                                                                                                                                                 <Trash2 className="w-4 h-4" />
                                                                                                                                                                                                                  </button>
                                                                                                                                                                                                   </div>
                                                                                                                                                                                                   <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{teacher.department}</p>
                                                                                                                                                                                                   <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-tighter">ID: {teacher.auth_user_id}</p>
                                                                                                                                                                                    </div>
                                                                                                                                                                     </div>
                                                                                                                                                                     <div className="space-y-4">
                                                                                                                                                                                    <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                                                                                                                                                   <span>Active Load</span>
                                                                                                                                                                                                   <span className="text-slate-900">{teacherLoad.length} Subjects</span>
                                                                                                                                                                                    </div>
                                                                                                                                                                                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                                                                                                                                                                   <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(teacherLoad.length * 20, 100)}%` }}></div>
                                                                                                                                                                                    </div>
                                                                                                                                                                                    <div className="pt-4 divide-y divide-slate-100">
                                                                                                                                                                                                   {teacherLoad.map(allot => (
                                                                                                                                                                                                                  <div key={allot.id} className="py-2.5 flex items-center justify-between">
                                                                                                                                                                                                                                 <span className="text-[10px] font-bold text-slate-600">{allot.subjects?.name}</span>
                                                                                                                                                                                                                                 <span className="text-[9px] font-black text-slate-400">BATCH {allot.batch_name}</span>
                                                                                                                                                                                                                  </div>
                                                                                                                                                                                                   ))}
                                                                                                                                                                                    </div>
                                                                                                                                                                     </div>
                                                                                                                                                      </div>
                                                                                                                                       );
                                                                                                                        })}
                                                                                                         </div >
                                                                                          </div >
                                                                           )}

                                                                           {/* Students Tab */}
                                                                           {activeTab === "students" && (
                                                                                          <div className="p-10">
                                                                                                         <div className="flex items-center justify-between mb-8">
                                                                                                                        <h2 className="text-2xl font-bold text-slate-900">Academic <span className="text-indigo-600">Students</span></h2>
                                                                                                                        <div className="flex gap-4">
                                                                                                                                       <div className="relative">
                                                                                                                                                      <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                                                                                                                      <input type="text" placeholder="Search Directory..." className="bg-slate-50 border border-slate-100 rounded-xl py-3 pl-10 pr-6 text-xs font-bold focus:outline-none w-80" />
                                                                                                                                       </div>
                                                                                                                                       <div className="flex items-center gap-4">
                                                                                                                                                      <button onClick={() => setShowBulkModal(true)} className="bg-white text-slate-900 border border-slate-100 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-indigo-200 transition-all flex items-center gap-2"><Plus className="w-4 h-4" /> Bulk Import CSV</button>
                                                                                                                                                      
                                                                                                                                       </div>
                                                                                                                        </div>
                                                                                                         </div>
                                                                                                         <div className="space-y-12">
                                                                                                                        {[1, 2, 3, 4].map(year => (
                                                                                                                                       (() => {
                                                                                                                                                      // Improved Year calculation logic
                                                                                                                                                      const yearStudents = students.filter(s => {
                                                                                                                                                                     const sem = parseInt(String(s.semester || "1"));
                                                                                                                                                                     return Math.ceil(sem / 2) === year;
                                                                                                                                                      });

                                                                                                                                                      // Always show the container even if empty to maintain structure
                                                                                                                                                      return (
                                                                                                                                                                     <div key={year} className="space-y-6">
                                                                                                                                                                                    <div className="px-6 flex items-center justify-between">
                                                                                                                                                                                                   <div className="flex items-center gap-4 flex-1">
                                                                                                                                                                                                                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">{year}{year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year</h3>
                                                                                                                                                                                                                  <div className="h-px flex-1 bg-slate-100"></div>
                                                                                                                                                                                                   </div>
                                                                                                                                                                                                   
                                                                                                                                                                                                    <div className="flex items-center gap-3 ml-4">
                                                                                                                                                                                                                   <button 
                                                                                                                                                                                                                                  onClick={() => {
                                                                                                                                                                                                                                                 setNewStudent(prev => ({ ...prev, semester: String((year * 2) - 1) }));
                                                                                                                                                                                                                                                 setShowStudentModal(true);
                                                                                                                                                                                                                                  }}
                                                                                                                                                                                                                                  className="text-[9px] font-black text-indigo-600 bg-white border border-indigo-100 hover:bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-widest transition-all"
                                                                                                                                                                                                                   >
                                                                                                                                                                                                                                  + Add {year === 1 ? '1st' : year === 2 ? '2nd' : year === 3 ? '3rd' : '4th'} Year
                                                                                                                                                                                                                   </button>
                                                                                                                                                                                                                   <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-1.5 rounded-full uppercase tracking-widest">{yearStudents.length} Students</span>
                                                                                                                                                                                                    </div>
                                                                                                                                                                                    </div>

                                                                                                                                                                                    {yearStudents.length === 0 ? (
                                                                                                                                                                                                   <div className="mx-6 py-10 border-2 border-dashed border-slate-50 rounded-[2rem] flex flex-col items-center justify-center text-slate-300">
                                                                                                                                                                                                                  <p className="text-[10px] font-black uppercase tracking-widest leading-none">No students in {year}{year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year</p>
                                                                                                                                                                                                   </div>
                                                                                                                                                                                    ) : (
                                                                                                                                                                                                   <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4">
                                                                                                                                                                                                                  {yearStudents.map(student => (
                                                                                                                                                                                                                                 <div key={student.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                                                                                                                                                                                                                                                <div className="flex justify-between items-start mb-4">
                                                                                                                                                                                                                                                               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                                                                                                                                                                                                                                                                              <Users className="w-5 h-5" />
                                                                                                                                                                                                                                                               </div>
                                                                                                                                                                                                                                                               <div className="bg-slate-900 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                                                                                                                                                                                                                                                              Batch {student.batch_name || 'N/A'}
                                                                                                                                                                                                                                                               </div>
                                                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                                                <div>
                                                                                                                                                                                                                                                               <h4 className="font-bold text-slate-900 truncate leading-none mb-1">{student.full_name}</h4>
                                                                                                                                                                                                                                                               <p className="text-[10px] font-medium text-slate-400 truncate mb-4">{student.email}</p>

                                                                                                                                                                                                                                                               <div className="flex flex-wrap gap-2">
                                                                                                                                                                                                                                                                              <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-widest border border-slate-100">PRN: {student.prn}</div>
                                                                                                                                                                                                                                                                              <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-[8px] font-black text-slate-500 uppercase tracking-widest border border-slate-100">Roll: {student.roll_no}</div>
                                                                                                                                                                                                                                                               </div>
                                                                                                                                                                                                                                                </div>

                                                                                                                                                                                                                                                <button
                                                                                                                                                                                                                                                               onClick={() => handleDelete('student', student.id)}
                                                                                                                                                                                                                                                               className="absolute top-4 right-4 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                                                                                                                                                                                                                >
                                                                                                                                                                                                                                                               <Trash2 className="w-4 h-4" />
                                                                                                                                                                                                                                                </button>
                                                                                                                                                                                                                                 </div>
                                                                                                                                                                                                                  ))}
                                                                                                                                                                                                   </div>
                                                                                                                                                                                    )}
                                                                                                                                                                     </div>
                                                                                                                                                      );
                                                                                                                                       })()
                                                                                                                        ))}
                                                                                                         </div>
                                                                                                         {
                                                                                                                        students.length === 0 && (
                                                                                                                                       <div className="py-32 flex flex-col items-center text-slate-400 border-2 border-dashed border-slate-100 rounded-[3rem]">
                                                                                                                                                      <Users className="w-16 h-16 mb-4 opacity-10" />
                                                                                                                                                      <p className="text-sm font-bold">Academic Registry Empty</p>
                                                                                                                                                      <p className="text-xs mt-1">Start by adding individual students or using CSV Bulk Import.</p>
                                                                                                                                       </div>
                                                                                                                        )
                                                                                                         }
                                                                                          </div >
                                                                           )}

                                                                           {/* Promotion Tab */}
                                                                           {activeTab === "promotion" && (
                                                                                          <div className="p-10 space-y-10">
                                                                                                         <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                                                                                                                        <div className="relative z-10">
                                                                                                                                       <h2 className="text-3xl font-bold tracking-tight mb-2">Yearly <span className="text-indigo-400">Promotion</span></h2>
                                                                                                                                       <p className="text-slate-400 text-sm max-w-md leading-relaxed">Advance entire batches to the next semester. Students completing Semester 8 will be archived to History.</p>
                                                                                                                        </div>
                                                                                                                        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                                                                                                         </div>

                                                                                                         <div className="max-w-xl bg-slate-50 border border-slate-100 p-8 rounded-[2rem]">
                                                                                                                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Promotion Settings</h3>
                                                                                                                        <div className="grid grid-cols-2 gap-6 mb-8">
                                                                                                                                       <div className="space-y-2">
                                                                                                                                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Semester</label>
                                                                                                                                                      <select className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-sm font-bold appearance-none focus:outline-none" value={promotionBatch.semester} onChange={e => setPromotionBatch({ ...promotionBatch, semester: Number(e.target.value) })}>
                                                                                                                                                                     {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                                                                                                                                      </select>
                                                                                                                                       </div>
                                                                                                                                       <div className="space-y-2">
                                                                                                                                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch Name</label>
                                                                                                                                                      <select className="w-full bg-white border border-slate-200 rounded-xl py-4 px-6 text-sm font-bold appearance-none focus:outline-none" value={promotionBatch.batch_name} onChange={e => setPromotionBatch({ ...promotionBatch, batch_name: e.target.value })}>
                                                                                                                                                                     {["A", "B", "C", "D", "E"].map(b => <option key={b} value={b}>Batch {b}</option>)}
                                                                                                                                                      </select>
                                                                                                                                       </div>
                                                                                                                        </div>
                                                                                                                        <button onClick={handlePromoteBatch} className="w-full bg-slate-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95">
                                                                                                                                       <RefreshCw className="w-4 h-4" /> Execute Batch Promotion
                                                                                                                        </button>
                                                                                                         </div>
                                                                                          </div>
                                                                           )}

                                                                           {/* Alumni Tab */}
                                                                           {activeTab === "alumni" && (
                                                                                          <div className="p-10 space-y-10">
                                                                                                         <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 flex flex-col items-center text-center space-y-6">
                                                                                                                        <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-600 shadow-xl shadow-amber-900/5 transition-transform hover:scale-110 duration-500"><GraduationCap className="w-10 h-10" /></div>
                                                                                                                        <div>
                                                                                                                                       <h2 className="text-3xl font-bold tracking-tight text-slate-900">Alumni <span className="text-amber-500">Registry</span></h2>
                                                                                                                                       <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 font-medium">Search for graduated students in the historical repository by their Permanent Registration Number (PRN).</p>
                                                                                                                        </div>
                                                                                                                        <div className="w-full max-w-lg flex gap-3">
                                                                                                                                       <input
                                                                                                                                                      type="text"
                                                                                                                                                      placeholder="Enter Student PRN..."
                                                                                                                                                      value={alumniSearch}
                                                                                                                                                      onChange={e => setAlumniSearch(e.target.value)}
                                                                                                                                                      className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl py-5 px-8 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:bg-white transition-all"
                                                                                                                                       />
                                                                                                                                       <button onClick={handleAlumniSearch} className="bg-slate-900 text-white px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95">Search</button>
                                                                                                                        </div>
                                                                                                         </div>

                                                                                                         {alumniData && (
                                                                                                                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 grid grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-5">
                                                                                                                                       <div className="space-y-6">
                                                                                                                                                      <div>
                                                                                                                                                                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                                                                                                                                                                     <p className="text-xl font-bold text-slate-900">{alumniData.full_name}</p>
                                                                                                                                                      </div>
                                                                                                                                                      <div>
                                                                                                                                                                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Permanent ID (PRN)</label>
                                                                                                                                                                     <p className="text-xl font-bold text-slate-900">{alumniData.prn}</p>
                                                                                                                                                      </div>
                                                                                                                                       </div>
                                                                                                                                       <div className="space-y-6">
                                                                                                                                                      <div>
                                                                                                                                                                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Graduation Year</label>
                                                                                                                                                                     <p className="text-xl font-bold text-slate-900">{alumniData.passout_year}</p>
                                                                                                                                                      </div>
                                                                                                                                                      <div>
                                                                                                                                                                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Admission Year</label>
                                                                                                                                                                     <p className="text-xl font-bold text-slate-900">{alumniData.admission_year}</p>
                                                                                                                                                      </div>
                                                                                                                                       </div>
                                                                                                                        </div>
                                                                                                         )}
                                                                                          </div>
                                                                           )}
                                                            </div >
                                             </main >

                                             {/* Syllabus Practical Modal */}
                                             {
                                                            showPracticalModal && (
                                                                           <div className="fixed inset-0 z-[60] flex items-center justify-center p-10 pointer-events-none">
                                                                                          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md pointer-events-auto" onClick={() => setShowPracticalModal(false)} />
                                                                                          <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-12 relative z-10 pointer-events-auto animate-in zoom-in-95">
                                                                                                         <button onClick={() => setShowPracticalModal(false)} className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all"><X className="w-5 h-5" /></button>
                                                                                                         <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2 leading-tight">Master <span className="text-indigo-600">Syllabus</span></h2>
                                                                                                         <p className="text-slate-500 text-sm font-medium mb-10">Configure practical template details for the repository.</p>
                                                                                                         <form onSubmit={handleCreatePractical} className="space-y-6">
                                                                                                                        <div className="grid grid-cols-4 gap-6">
                                                                                                                                       <div className="space-y-2">
                                                                                                                                                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">PR No</label>
                                                                                                                                                      <input type="text" placeholder="1" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 text-center text-sm font-bold focus:outline-none" value={newPractical.pr_no} onChange={e => setNewPractical({ ...newPractical, pr_no: e.target.value })} required />
                                                                                                                                       </div>
                                                                                                                                       <div className="col-span-3 space-y-2">
                                                                                                                                                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Practical Title</label>
                                                                                                                                                      <input type="text" placeholder="Implementation of Stack" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-sm font-bold focus:outline-none" value={newPractical.title} onChange={e => setNewPractical({ ...newPractical, title: e.target.value })} required />
                                                                                                                                       </div>
                                                                                                                        </div>
                                                                                                                        <div className="space-y-2">
                                                                                                                                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Problem Statement</label>
                                                                                                                                       <textarea rows={4} placeholder="Write the objective and task details here..." className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-sm font-bold focus:outline-none resize-none" value={newPractical.description} onChange={e => setNewPractical({ ...newPractical, description: e.target.value })} required />
                                                                                                                        </div>
                                                                                                                        <div className="space-y-2">
                                                                                                                                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Language</label>
                                                                                                                                       <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-sm font-bold appearance-none focus:outline-none focus:border-indigo-300 transition-colors cursor-pointer" value={newPractical.language} onChange={e => setNewPractical({ ...newPractical, language: e.target.value })}>
                                                                                                                                                      {['javascript', 'python', 'java', 'cpp', 'c', 'sql', 'html', 'css'].map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                                                                                                                                       </select>
                                                                                                                        </div>
                                                                                                                        <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all mt-4">Save Template Changes</button>
                                                                                                         </form>
                                                                                          </div>
                                                                           </div>
                                                            )
                                             }

                                             {/* Modals from previous version kept for stability */}
                                             {/* Allotment Modal */}
                                             {
                                                            showAllotmentModal && (
                                                                           <div className="fixed inset-0 z-[60] flex items-center justify-center p-10 pointer-events-none">
                                                                                          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md pointer-events-auto" onClick={() => setShowAllotmentModal(false)} />
                                                                                          <div className="w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-12 relative z-10 pointer-events-auto animate-in zoom-in-95">
                                                                                                         <button onClick={() => setShowAllotmentModal(false)} className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all"><X className="w-5 h-5" /></button>
                                                                                                         <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">Subject <span className="text-indigo-600">Allotment</span></h2>
                                                                                                         <p className="text-slate-500 text-sm font-medium mb-10">Assign academic responsibilities to faculty</p>
                                                                                                         <form onSubmit={handleCreateAllotment} className="space-y-6">
                                                                                                                        <div className="space-y-2">
                                                                                                                                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Teacher</label>
                                                                                                                                       <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-sm font-bold appearance-none focus:outline-none" value={newAllotment.teacher_id} onChange={e => setNewAllotment({ ...newAllotment, teacher_id: e.target.value })} required>
                                                                                                                                                      <option value="">Choose Teacher...</option>
                                                                                                                                                      {teachers.map(t => <option key={t.auth_user_id} value={t.auth_user_id}>{t.name} (ID: {t.auth_user_id?.substring(0, 8)})</option>)}
                                                                                                                                       </select>
                                                                                                                        </div>
                                                                                                                        <div className="space-y-2">
                                                                                                                                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Subject</label>
                                                                                                                                       <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-sm font-bold appearance-none focus:outline-none" value={newAllotment.master_subject_id} onChange={e => setNewAllotment({ ...newAllotment, master_subject_id: e.target.value })} required>
                                                                                                                                                      <option value="">Select Category...</option>
                                                                                                                                                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name} [{s.course_code}]</option>)}
                                                                                                                                       </select>
                                                                                                                        </div>
                                                                                                                        <div className="grid grid-cols-2 gap-6">
                                                                                                                                       <div className="space-y-2">
                                                                                                                                                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center block">Semester</label>
                                                                                                                                                      <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 text-sm font-black text-center" value={newAllotment.semester} onChange={e => setNewAllotment({ ...newAllotment, semester: e.target.value })}>{[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s}>{s}</option>)}</select>
                                                                                                                                       </div>
                                                                                                                                       <div className="space-y-2">
                                                                                                                                                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center block">Batch</label>
                                                                                                                                                      <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 text-sm font-black text-center" value={newAllotment.batch_name} onChange={e => setNewAllotment({ ...newAllotment, batch_name: e.target.value })}>{['A', 'B', 'C', 'D'].map(b => <option key={b}>{b}</option>)}</select>
                                                                                                                                       </div>
                                                                                                                        </div>
                                                                                                                        <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all mt-4">Confirm Allotment</button>
                                                                                                         </form>
                                                                                          </div>
                                                                           </div>
                                                            )
                                             }

                                             {/* Subject Creation Modal */}
                                             {
                                                            showSubjectModal && (
                                                                           <div className="fixed inset-0 z-[60] flex items-center justify-center p-10 pointer-events-none">
                                                                                          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md pointer-events-auto" onClick={() => setShowSubjectModal(false)} />
                                                                                          <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-12 relative z-10 pointer-events-auto animate-in zoom-in-95">
                                                                                                         <button onClick={() => setShowSubjectModal(false)} className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all"><X className="w-5 h-5" /></button>
                                                                                                         <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2 leading-tight">New <span className="text-amber-600">Subject</span></h2>
                                                                                                         <p className="text-slate-500 text-sm font-medium mb-10">Add a course category to the repository.</p>
                                                                                                         <form onSubmit={handleCreateSubject} className="space-y-6">
                                                                                                                        <div className="space-y-2">
                                                                                                                                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Subject Name</label>
                                                                                                                                       <input type="text" placeholder="Algorithm Analysis" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-sm font-bold focus:outline-none" value={newSubject.name} onChange={e => setNewSubject({ ...newSubject, name: e.target.value })} required />
                                                                                                                        </div>
                                                                                                                        <div className="space-y-2">
                                                                                                                                       <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Course Code</label>
                                                                                                                                       <input type="text" placeholder="CS-402" className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-6 text-sm font-bold focus:outline-none" value={newSubject.course_code} onChange={e => setNewSubject({ ...newSubject, course_code: e.target.value })} required />
                                                                                                                        </div>
                                                                                                                        <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all mt-4">Add to Repository</button>
                                                                                                         </form>
                                                                                          </div>
                                                                           </div>
                                                            )
                                             }

                                             {/* Student Registration Modal */}
                                             {
                                                            showStudentModal && (
                                                                           <div className="fixed inset-0 z-[60] flex items-center justify-center p-10 pointer-events-none">
                                                                                          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md pointer-events-auto" onClick={() => setShowStudentModal(false)} />
                                                                                          <div className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl p-12 relative z-10 pointer-events-auto animate-in zoom-in-95">
                                                                                                         <button onClick={() => setShowStudentModal(false)} className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-2xl text-slate-400 transition-all"><X className="w-5 h-5" /></button>
                                                                                                         <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-2 leading-tight">Student <span className="text-emerald-600">Entry</span></h2>
                                                                                                         <p className="text-slate-500 text-sm font-medium mb-10">Register academic students to the database.</p>
                                                                                                         
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
                                                                                                          </form>
                                                                                          </div>
                                                                           </div>
                                                            )
                                             }
                                             {/* Teacher Registration Modal */}
                                             {
                                                            showTeacherModal && (
                                                                           <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                                                                                          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                                                                                                         <div className="p-10">
                                                                                                                        <div className="flex items-center justify-between mb-8">
                                                                                                                                       <div>
                                                                                                                                                      <h3 className="text-2xl font-black text-slate-900">Register <span className="text-indigo-600">Faculty</span></h3>
                                                                                                                                                      <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-widest">New Staff Authentication</p>
                                                                                                                                       </div>
                                                                                                                                       <button onClick={() => setShowTeacherModal(false)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors"><X className="w-5 h-5 text-slate-400" /></button>
                                                                                                                        </div>

                                                                                                                        <form onSubmit={handleRegisterTeacher} className="space-y-6">
                                                                                                                                       <div className="space-y-2">
                                                                                                                                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
                                                                                                                                                      <input
                                                                                                                                                                     type="text"
                                                                                                                                                                     required
                                                                                                                                                                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                                                                                                                                                     placeholder="e.g. Dr. Jane Smith"
                                                                                                                                                                     value={newTeacher.name}
                                                                                                                                                                     onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                                                                                                                                                      />
                                                                                                                                       </div>
                                                                                                                                       <div className="space-y-2">
                                                                                                                                                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
                                                                                                                                                      <input
                                                                                                                                                                     type="email"
                                                                                                                                                                     required
                                                                                                                                                                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                                                                                                                                                     placeholder="jane.smith@college.edu"
                                                                                                                                                                     value={newTeacher.email}
                                                                                                                                                                     onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                                                                                                                                                      />
                                                                                                                                       </div>
                                                                                                                                       <div className="grid grid-cols-2 gap-4">
                                                                                                                                                      <div className="space-y-2">
                                                                                                                                                                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Department</label>
                                                                                                                                                                     <select
                                                                                                                                                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500"
                                                                                                                                                                                    value={newTeacher.department}
                                                                                                                                                                                    onChange={(e) => setNewTeacher({ ...newTeacher, department: e.target.value })}
                                                                                                                                                                     >
                                                                                                                                                                                    <option value="CSE">CSE</option>
                                                                                                                                                                                    <option value="IT">IT</option>
                                                                                                                                                                                    <option value="ECE">ECE</option>
                                                                                                                                                                                    <option value="MECH">MECH</option>
                                                                                                                                                                     </select>
                                                                                                                                                      </div>
                                                                                                                                                      <div className="space-y-2">
                                                                                                                                                                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Initial Password</label>
                                                                                                                                                                     <input
                                                                                                                                                                                    type="text"
                                                                                                                                                                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-indigo-500"
                                                                                                                                                                                    placeholder="Faculty@123"
                                                                                                                                                                                    value={newTeacher.password}
                                                                                                                                                                                    onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                                                                                                                                                                     />
                                                                                                                                                      </div>
                                                                                                                                       </div>
                                                                                                                                       <div className="pt-4 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 group">
                                                                                                                                                      <p className="max-w-[150px]">Credentials will be active immediately</p>
                                                                                                                                                      <button type="submit" className="bg-indigo-600 text-white px-10 py-5 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all text-xs">Create Account</button>
                                                                                                                                       </div>
                                                                                                                        </form>
                                                                                                         </div>
                                                                                          </div>
                                                                           </div>
                                                            )
                                             }

                                             {/* Notifications */}
                                             {
                                                            message && (
                                                                           <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom-5 z-[100]">
                                                                                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                                                          {message}
                                                                                          <button onClick={() => setMessage("")} className="ml-4 opacity-40 hover:opacity-100"><X className="w-4 h-4" /></button>
                                                                           </div>
                                                            )
                                             }
                                             {
                                                            error && (
                                                                           <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl animate-in slide-in-from-bottom-5 z-[100]">
                                                                                          <AlertCircle className="w-4 h-4" />
                                                                                          {error}
                                                                                          <button onClick={() => setError("")} className="ml-4 opacity-40 hover:opacity-100"><X className="w-4 h-4" /></button>
                                                                           </div>
                                                            )
                                             }
                              </div>
               );
}

function StatCard({ label, value, icon, color, bg }: any) {
               return (
                              <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm flex items-center gap-6 hover:shadow-lg hover:-translate-y-1 transition-all group duration-300">
                                             <div className={`${bg} ${color} p-4 rounded-2xl transition-transform group-hover:scale-110 duration-500`}>
                                                            {icon}
                                             </div>
                                             <div>
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                                                            <p className="text-3xl font-bold text-slate-900 tracking-tight">{value}</p>
                                             </div>
                              </div>
               );
}

function TabButton({ label, active, onClick }: any) {
               return (
                              <button
                                             onClick={onClick}
                                             className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${active ? 'bg-slate-900 text-white shadow-lg ring-1 ring-white/10 scale-[1.02]' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
                              >
                                             {label}
                              </button>
               );
}
