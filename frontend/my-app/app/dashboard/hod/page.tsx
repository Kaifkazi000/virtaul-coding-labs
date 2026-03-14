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
               RefreshCw,
               ChevronRight
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
               const [allotments, setAllotments] = useState<any[]>([]);

               // Syllabus Drill-down States
               const [selectedSubject, setSelectedSubject] = useState<any>(null);
               const [masterPracticals, setMasterPracticals] = useState<any[]>([]);

               // Modal States
               const [showSubjectModal, setShowSubjectModal] = useState(false);
               const [showAllotmentModal, setShowAllotmentModal] = useState(false);
               const [showPracticalModal, setShowPracticalModal] = useState(false);
               const [showTeacherModal, setShowTeacherModal] = useState(false);
               const [showPasswordModal, setShowPasswordModal] = useState(false);
               const [availableBatches, setAvailableBatches] = useState<string[]>([]);

               // Form States
               const [newSubject, setNewSubject] = useState({ name: "", course_code: "" });
               const [newAllotment, setNewAllotment] = useState({ master_subject_id: "", teacher_id: "", semester: "1", batch_name: "A", academic_year: new Date().getFullYear().toString() });
               const [newPractical, setNewPractical] = useState({ pr_no: "", title: "", description: "", language: "javascript" });
               const [newTeacher, setNewTeacher] = useState({ name: "", email: "", department: "CSE", password: "" });

               const loadData = useCallback(async () => {
                              try {
                                             setLoading(true);
                                             const [statsRes, subjRes, teachRes, allotRes] = await Promise.all([
                                                            fetch("/api/hod/stats"),
                                                            fetch("/api/hod/master-subjects"),
                                                            fetch("/api/hod/teachers"),
                                                            fetch("/api/hod/allotments")
                                             ]);

                                             if (statsRes.ok) setStats(await statsRes.json());
                                             if (subjRes.ok) setSubjects(await subjRes.json());
                                             if (teachRes.ok) setTeachers(await teachRes.json());
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

               const fetchAvailableBatches = useCallback(async (sem: string, year: string) => {
                              if (!sem || !year) return;
                              try {
                                             const res = await fetch(`/api/hod/available-batches?semester=${sem}&academic_year=${year}`);
                                             if (res.ok) {
                                                            const batches = await res.json();
                                                            setAvailableBatches(batches);
                                                            if (batches.length > 0 && !batches.includes(newAllotment.batch_name)) {
                                                                           setNewAllotment(prev => ({ ...prev, batch_name: batches[0] }));
                                                            }
                                             }
                              } catch (err) {
                                             console.error("Fetch Batches Error:", err);
                              }
               }, [newAllotment.batch_name]);

               useEffect(() => {
                              if (showAllotmentModal) {
                                             fetchAvailableBatches(newAllotment.semester, newAllotment.academic_year);
                              }
               }, [newAllotment.semester, newAllotment.academic_year, showAllotmentModal, fetchAvailableBatches]);

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
                                             const res = await fetch("/api/hod/master-practicals", {
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
                                             setNewPractical({ pr_no: "", title: "", description: "", language: "javascript" });
                                             fetchSyllabus(selectedSubject.id);
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

               const handleDelete = async (type: string, id: string) => {
                              if (!confirm(`Are you sure you want to delete this ${type}? This action cannot be undone.`)) return;
                              try {
                                             const endpoint = type === 'subject'
                                                            ? `/api/hod/master-subjects/${id}`
                                                            : `/api/hod/master-practicals/${id}`;

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
                                                                                          <TabButton label="Students" active={activeTab === 'students'} onClick={() => router.push('/dashboard/hod/students')} />
                                                                                          <TabButton label="Promotion" active={activeTab === 'promotion'} onClick={() => router.push('/dashboard/hod/promotion')} />
                                                                                          <TabButton label="Alumni" active={activeTab === 'alumni'} onClick={() => router.push('/dashboard/hod/promotion')} />
                                                                                          <TabButton label="Progress Tracker" active={activeTab === 'progress'} onClick={() => router.push('/dashboard/hod/progress')} />
                                                                           </div>
                                                                           <div className="flex gap-3 px-2">
                                                                                          <button onClick={() => setShowSubjectModal(true)} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"><Plus className="w-4 h-4" /> New Subject</button>
                                                                                          <button onClick={() => setShowAllotmentModal(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95"><Calendar className="w-4 h-4" /> Create Allotment</button>
                                                                           </div>
                                                            </div>

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
                                                                                                                                                                                                   <p className="text-[10px] font-medium text-slate-500 mt-0.5">{allot.teachers?.name} <span className="text-slate-300">({allot.teachers?.email})</span> • Sem {allot.semester}</p>
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
                                                                                                                                                      <button onClick={() => router.push('/dashboard/hod/students')} className="w-full text-left p-4 bg-white rounded-xl border border-slate-100 hover:border-indigo-300 transition-all group flex items-center justify-between">
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
                                                                                                                                       <div className="flex items-center gap-6">
                                                                                                                                                      <button onClick={() => setSelectedSubject(null)} className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-all"><ChevronLeft className="w-5 h-5" /></button>
                                                                                                                                                      <div>
                                                                                                                                                                     <div className="flex items-center gap-3">
                                                                                                                                                                                    <h2 className="text-2xl font-bold text-slate-900">{selectedSubject.name}</h2>
                                                                                                                                                                                    <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">{selectedSubject.course_code}</span>
                                                                                                                                                                     </div>
                                                                                                                                                                     <p className="text-slate-500 text-sm font-medium mt-1">Master Syllabus Template Repository</p>
                                                                                                                                                      </div>
                                                                                                                                                      <button
                                                                                                                                                                     onClick={() => {
                                                                                                                                                                                    setNewPractical({ pr_no: "", title: "", description: "", language: "javascript" });
                                                                                                                                                                                    setShowPracticalModal(true);
                                                                                                                                                                     }}
                                                                                                                                                                     className="bg-slate-900 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl active:scale-95"
                                                                                                                                                      >
                                                                                                                                                                     <Plus className="w-4 h-4" /> Add Practical Template
                                                                                                                                                      </button>
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
                                                                                                                                                                                    <button
                                                                                                                                                                                                   onClick={() => {
                                                                                                                                                                                                                  setNewPractical({ pr_no: "1", title: "", description: "", language: "javascript" });
                                                                                                                                                                                                                  setShowPracticalModal(true);
                                                                                                                                                                                                   }}
                                                                                                                                                                                                   className="text-indigo-600 mt-2 text-[10px] font-black uppercase tracking-widest hover:underline"
                                                                                                                                                                                    >
                                                                                                                                                                                                   Add First Practical
                                                                                                                                                                                    </button>
                                                                                                                                                                     </div>
                                                                                                                                                      )}
                                                                                                                                       </div>
                                                                                                                        </div>
                                                                                                         )}
                                                                                          </div>
                                                                           )}

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
                                                                                                                                                      <div
                                                                                                                                                                     key={teacher.auth_user_id}
                                                                                                                                                                     onClick={() => router.push(`/dashboard/hod/teachers/${teacher.auth_user_id}`)}
                                                                                                                                                                     className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all group cursor-pointer relative overflow-hidden"
                                                                                                                                                      >
                                                                                                                                                                     <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                                                                                                                    <ChevronRight className="w-5 h-5 text-indigo-400" />
                                                                                                                                                                     </div>
                                                                                                                                                                     <div className="flex items-center gap-4 mb-6">
                                                                                                                                                                                    <div className="w-14 h-14 bg-indigo-500 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-[0_10px_30px_rgba(79,70,229,0.3)]">
                                                                                                                                                                                                   {teacher.name.charAt(0)}
                                                                                                                                                                                    </div>
                                                                                                                                                                                    <div className="flex-1">
                                                                                                                                                                                                   <div className="flex items-center justify-between">
                                                                                                                                                                                                                  <h4 className="font-bold text-slate-900 text-base">{teacher.name}</h4>
                                                                                                                                                                                                                  <button
                                                                                                                                                                                                                                 onClick={(e) => { e.stopPropagation(); handleDeleteTeacher(teacher.auth_user_id); }}
                                                                                                                                                                                                                                 className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                                                                                                                                                                                                                                 title="Delete Faculty Account"
                                                                                                                                                                                                                  >
                                                                                                                                                                                                                                 <Trash2 className="w-4 h-4" />
                                                                                                                                                                                                                  </button>
                                                                                                                                                                                                   </div>
                                                                                                                                                                                                   <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{teacher.department}</p>
                                                                                                                                                                                                   <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-tighter">Email: {teacher.email}</p>
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
                                                                                                                                                                                    <div className="flex items-center justify-between mt-4">
                                                                                                                                                                                                   <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Click to Manage</span>
                                                                                                                                                                                                   <div className="flex -space-x-2">
                                                                                                                                                                                                                  {teacherLoad.slice(0, 3).map((_, i) => (
                                                                                                                                                                                                                                 <div key={i} className="w-6 h-6 rounded-full bg-white border-2 border-slate-50 flex items-center justify-center">
                                                                                                                                                                                                                                                <BookOpen className="w-3 h-3 text-slate-300" />
                                                                                                                                                                                                                                 </div>
                                                                                                                                                                                                                  ))}
                                                                                                                                                                                                                  {teacherLoad.length > 3 && (
                                                                                                                                                                                                                                 <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[8px] font-bold flex items-center justify-center border-2 border-white">
                                                                                                                                                                                                                                                +{teacherLoad.length - 3}
                                                                                                                                                                                                                                 </div>
                                                                                                                                                                                                                  )}
                                                                                                                                                                                                   </div>
                                                                                                                                                                                    </div>
                                                                                                                                                                     </div>
                                                                                                                                                      </div>
                                                                                                                                       );
                                                                                                                        })}
                                                                                                         </div>
                                                                                          </div>
                                                                           )}


                                                            </div>

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
                                                                                                                                                                     <select className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 text-sm font-black text-center" value={newAllotment.batch_name} onChange={e => setNewAllotment({ ...newAllotment, batch_name: e.target.value })}>
                                                                                                                                                                                    {availableBatches.length > 0 ? (
                                                                                                                                                                                                   availableBatches.map(b => <option key={b} value={b}>{b}</option>)
                                                                                                                                                                                    ) : (
                                                                                                                                                                                                   <option disabled>No Batches Found</option>
                                                                                                                                                                                    )}
                                                                                                                                                                     </select>
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
                                             </main>
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
