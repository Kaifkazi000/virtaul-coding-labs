"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
               ArrowLeft,
               BookOpen,
               Trash2,
               User,
               Shield,
               Calendar,
               Layers,
               ChevronRight,
               Loader2,
               CheckCircle2
} from "lucide-react";

export default function TeacherDetailPage() {
               const { teacherId } = useParams();
               const router = useRouter();
               const [teacher, setTeacher] = useState<any>(null);
               const [allotments, setAllotments] = useState<any[]>([]);
               const [loading, setLoading] = useState(true);
               const [error, setError] = useState<string | null>(null);
               const [message, setMessage] = useState<string | null>(null);

               useEffect(() => {
                              fetchData();
               }, [teacherId]);

               const fetchData = async () => {
                              try {
                                             setLoading(true);
                                             // 1. Get all teachers to find the name (or we could have a specific endpoint)
                                             const tRes = await fetch("/api/hod/teachers");
                                             const teachers = await tRes.json();
                                             const currentTeacher = teachers.find((t: any) => t.auth_user_id === teacherId);
                                             setTeacher(currentTeacher);

                                             // 2. Get all allotments and filter for this teacher
                                             const aRes = await fetch("/api/hod/allotments");
                                             const allAllotments = await aRes.json();
                                             const teacherAllotments = allAllotments.filter((a: any) => a.teacher_id === teacherId);
                                             setAllotments(teacherAllotments);

                              } catch (err: any) {
                                             setError("Failed to load teacher data");
                              } finally {
                                             setLoading(false);
                              }
               };

               const handleDeleteAllotment = async (id: string) => {
                              if (!confirm("Are you sure you want to remove this subject allotment?")) return;
                              try {
                                             const res = await fetch(`/api/hod/allotments/${id}`, { method: "DELETE" });
                                             if (!res.ok) throw new Error("Deletion failed");
                                             setMessage("Allotment removed successfully");
                                             setAllotments(allotments.filter(a => a.id !== id));
                                             setTimeout(() => setMessage(null), 3000);
                              } catch (err: any) {
                                             setError(err.message);
                                             setTimeout(() => setError(null), 3000);
                              }
               };

               if (loading) {
                              return (
                                             <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                                                            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                                             </div>
                              );
               }

               return (
                              <div className="min-h-screen bg-[#F8FAFC]">
                                             {/* Header */}
                                             <nav className="bg-white border-b border-slate-200 sticky top-0 z-30 px-8 py-6">
                                                            <div className="max-w-7xl mx-auto flex items-center justify-between">
                                                                           <div className="flex items-center gap-6">
                                                                                          <button
                                                                                                         onClick={() => router.push("/dashboard/hod")}
                                                                                                         className="p-3 bg-slate-50 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all border border-slate-100"
                                                                                          >
                                                                                                         <ArrowLeft className="w-5 h-5" />
                                                                                          </button>
                                                                                          <div>
                                                                                                         <div className="flex items-center gap-3">
                                                                                                                        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                                                                                                                                       Faculty <span className="text-indigo-600">Workload</span>
                                                                                                                        </h1>
                                                                                                                        <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                                                                                                                       Management
                                                                                                                        </span>
                                                                                                         </div>
                                                                                                         <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Review & Modify Allotments</p>
                                                                                          </div>
                                                                           </div>
                                                            </div>
                                             </nav>

                                             <main className="max-w-7xl mx-auto p-10 space-y-10">
                                                            {/* Alerts */}
                                                            {message && (
                                                                           <div className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-8 py-4 rounded-2xl text-xs font-bold flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                                                                          <CheckCircle2 className="w-4 h-4" /> {message}
                                                                           </div>
                                                            )}
                                                            {error && (
                                                                           <div className="bg-rose-50 border border-rose-100 text-rose-600 px-8 py-4 rounded-2xl text-xs font-bold flex items-center gap-3">
                                                                                          <Trash2 className="w-4 h-4" /> {error}
                                                                           </div>
                                                            )}

                                                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                                                           {/* Profile Card */}
                                                                           <div className="space-y-6">
                                                                                          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm relative overflow-hidden group">
                                                                                                         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:bg-indigo-500/10 transition-colors" />

                                                                                                         <div className="relative z-10 space-y-8">
                                                                                                                        <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-[0_20px_40px_rgba(79,70,229,0.3)] transform transition-transform group-hover:scale-105 duration-500">
                                                                                                                                       {teacher?.name?.charAt(0) || "T"}
                                                                                                                        </div>

                                                                                                                        <div>
                                                                                                                                       <h2 className="text-3xl font-black text-slate-900 leading-tight">
                                                                                                                                                      {teacher?.name}
                                                                                                                                       </h2>
                                                                                                                                       <p className="text-indigo-600 text-xs font-bold uppercase tracking-[0.2em] mt-2">
                                                                                                                                                      {teacher?.department || "CSE"} Department
                                                                                                                                       </p>
                                                                                                                        </div>

                                                                                                                        <div className="space-y-4 pt-4 border-t border-slate-100">
                                                                                                                                       <div className="flex items-center gap-4">
                                                                                                                                                      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400"><User className="w-4 h-4" /></div>
                                                                                                                                                      <div>
                                                                                                                                                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authentication ID</p>
                                                                                                                                                                     <p className="text-[11px] font-bold text-slate-600 truncate max-w-[150px]">{teacherId}</p>
                                                                                                                                                      </div>
                                                                                                                                       </div>
                                                                                                                                       <div className="flex items-center gap-4">
                                                                                                                                                      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400"><Shield className="w-4 h-4" /></div>
                                                                                                                                                      <div>
                                                                                                                                                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Role</p>
                                                                                                                                                                     <p className="text-[11px] font-bold text-slate-600 uppercase">Faculty Representative</p>
                                                                                                                                                      </div>
                                                                                                                                       </div>
                                                                                                                        </div>
                                                                                                         </div>
                                                                                          </div>

                                                                                          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
                                                                                                         <div className="relative z-10">
                                                                                                                        <h3 className="text-sm font-black text-indigo-400 uppercase tracking-widest mb-2">Current Load</h3>
                                                                                                                        <div className="flex items-baseline gap-2">
                                                                                                                                       <span className="text-6xl font-black">{allotments.length}</span>
                                                                                                                                       <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">Subjects</span>
                                                                                                                        </div>
                                                                                                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-6 leading-relaxed">
                                                                                                                                       Maximum recommended load is 5 subjects per semester for optimal academic performance.
                                                                                                                        </p>
                                                                                                         </div>
                                                                                                         <Layers className="absolute -bottom-10 -right-10 w-48 h-48 text-white/5" />
                                                                                          </div>
                                                                           </div>

                                                                           {/* Allotment List */}
                                                                           <div className="lg:col-span-2 space-y-6">
                                                                                          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                                                                                                         <BookOpen className="w-5 h-5 text-indigo-600" /> Allotted Subjects
                                                                                          </h3>

                                                                                          <div className="grid grid-cols-1 gap-4">
                                                                                                         {allotments.map((allot) => (
                                                                                                                        <div
                                                                                                                                       key={allot.id}
                                                                                                                                       className="bg-white border border-slate-200 rounded-[2rem] p-8 flex items-center justify-between hover:shadow-xl hover:border-indigo-100 transition-all group"
                                                                                                                        >
                                                                                                                                       <div className="flex items-center gap-8">
                                                                                                                                                      <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all duration-300">
                                                                                                                                                                     <BookOpen className="w-8 h-8" />
                                                                                                                                                      </div>
                                                                                                                                                      <div>
                                                                                                                                                                     <h4 className="text-xl font-black text-slate-900 leading-none mb-2">
                                                                                                                                                                                    {allot.subjects?.name}
                                                                                                                                                                     </h4>
                                                                                                                                                                     <div className="flex items-center gap-4 mt-3">
                                                                                                                                                                                    <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 flex items-center gap-1.5">
                                                                                                                                                                                                   <Calendar className="w-3 h-3 opacity-50" /> Sem {allot.semester}
                                                                                                                                                                                    </div>
                                                                                                                                                                                    <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest border border-slate-100 flex items-center gap-1.5">
                                                                                                                                                                                                   <Layers className="w-3 h-3 opacity-50" /> Batch {allot.batch_name}
                                                                                                                                                                                    </div>
                                                                                                                                                                                    <span className="text-[10px] font-black text-indigo-200 uppercase tracking-tighter">
                                                                                                                                                                                                   Code: {allot.subjects?.course_code}
                                                                                                                                                                                    </span>
                                                                                                                                                                     </div>
                                                                                                                                                      </div>
                                                                                                                                       </div>

                                                                                                                                       <button
                                                                                                                                                      onClick={() => handleDeleteAllotment(allot.id)}
                                                                                                                                                      className="p-4 bg-slate-50 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100"
                                                                                                                                       >
                                                                                                                                                      <Trash2 className="w-5 h-5" />
                                                                                                                                       </button>
                                                                                                                        </div>
                                                                                                         ))}

                                                                                                         {allotments.length === 0 && (
                                                                                                                        <div className="py-32 flex flex-col items-center text-center bg-white border border-dashed border-slate-200 rounded-[3rem]">
                                                                                                                                       <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-6">
                                                                                                                                                      <BookOpen className="w-10 h-10" />
                                                                                                                                       </div>
                                                                                                                                       <h4 className="text-lg font-bold text-slate-900">No Active Load</h4>
                                                                                                                                       <p className="text-slate-400 text-sm mt-1 max-w-xs font-medium">Use the faculty dashboard to assign new subjects to this teacher.</p>
                                                                                                                        </div>
                                                                                                         )}
                                                                                          </div>
                                                                           </div>
                                                            </div>
                                             </main>
                              </div>
               );
}
