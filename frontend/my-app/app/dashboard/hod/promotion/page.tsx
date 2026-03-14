"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
               ChevronLeft,
               RefreshCw,
               Shield,
               CheckCircle2,
               Loader2,
               GraduationCap,
               ArrowRight,
               Search,
               X,
               AlertCircle
} from "lucide-react";

export default function PromotionPage() {
               const router = useRouter();
               const [hod, setHod] = useState<any>(null);
               const [loading, setLoading] = useState(false);
               const [message, setMessage] = useState("");
               const [error, setError] = useState("");

               // Alumni States
               const [alumniSearch, setAlumniSearch] = useState("");
               const [alumniData, setAlumniData] = useState<any>(null);

               useEffect(() => {
                              const hodData = localStorage.getItem("hod_data");
                              if (hodData) setHod(JSON.parse(hodData));
               }, []);

               const handlePromoteDepartment = async () => {
                              if (!confirm("CRITICAL ACTION: This will promote the ENTIRE department. Semester 8 students will be moved to Alumni, and Semesters 1-7 will increment. Academic history snapshots will be taken. Proceed?")) return;
                              try {
                                             setLoading(true);
                                             const res = await fetch("/api/hod/promote-department", {
                                                            method: "POST",
                                                            headers: { "Content-Type": "application/json" }
                                             });
                                             if (!res.ok) throw new Error("Synchronization failed");
                                             const result = await res.json();
                                             setMessage(result.message);
                              } catch (err: any) {
                                             setError(err.message);
                              } finally {
                                             setLoading(false);
                              }
               };

               const handleAlumniSearch = async () => {
                              if (!alumniSearch) return;
                              try {
                                             const res = await fetch(`/api/hod/alumni?prn=${alumniSearch}`);
                                             if (!res.ok) throw new Error("Search failed");
                                             const data = await res.json();
                                             if (data) setAlumniData(data);
                                             else setError("No alumni found with this PRN");
                              } catch (err: any) {
                                             setError(err.message);
                              }
               };

               return (
                              <div className="min-h-screen bg-[#F8FAFC]">
                                             {/* Header */}
                                             <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                                                            <div className="max-w-screen-2xl mx-auto px-8 h-24 flex items-center justify-between">
                                                                           <div className="flex items-center gap-8">
                                                                                          <button onClick={() => router.push('/dashboard/hod')} className="p-4 bg-slate-50 rounded-2xl text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                                                                                                         <ChevronLeft className="w-6 h-6" />
                                                                                          </button>
                                                                                          <div className="w-px h-8 bg-slate-200"></div>
                                                                                          <div>
                                                                                                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">HOD Console</p>
                                                                                                         <p className="text-sm font-bold text-slate-900 tracking-tight">{hod?.name || "Admin"}</p>
                                                                                          </div>
                                                                           </div>
                                                            </div>
                                             </header>

                                             <main className="max-w-screen-2xl mx-auto p-8">
                                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                                                                           <div>
                                                                                          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic <span className="text-indigo-600">Lifecycle</span></h1>
                                                                                          <p className="text-slate-500 font-medium mt-2">Promotion synchronization and alumni registry management.</p>
                                                                           </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                                                           {/* Promotion Section */}
                                                                           <div className="space-y-8">
                                                                                          <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
                                                                                                         <div className="relative z-10">
                                                                                                                        <h2 className="text-3xl font-bold tracking-tight mb-2">Department <span className="text-indigo-400">Promotion</span></h2>
                                                                                                                        <p className="text-slate-400 text-sm max-w-md leading-relaxed">Advance the entire department in one click. Semester 8 graduates to Alumni, others increment semesters.</p>
                                                                                                         </div>
                                                                                                         <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                                                                                          </div>

                                                                                          <div className="bg-white border-2 border-slate-900 p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-between">
                                                                                                         <div className="space-y-6">
                                                                                                                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center shadow-xl shadow-red-900/5"><Shield className="w-8 h-8" /></div>
                                                                                                                        <div>
                                                                                                                                       <h4 className="text-2xl font-black text-slate-900">Synchronize Semesters</h4>
                                                                                                                                       <p className="text-slate-500 text-sm font-medium mt-2 leading-relaxed">By clicking below, you initiate a department-wide increment. Everyone moves up one level.</p>
                                                                                                                        </div>
                                                                                                                        <ul className="space-y-3 text-xs font-bold text-slate-600">
                                                                                                                                       <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Auto-snapshot performance to history</li>
                                                                                                                                       <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Graduate Semester 8 to Alumni Registry</li>
                                                                                                                                       <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Bulk increment Sem 1-7</li>
                                                                                                                        </ul>
                                                                                                         </div>

                                                                                                         <button
                                                                                                                        onClick={handlePromoteDepartment}
                                                                                                                        disabled={loading}
                                                                                                                        className="w-full mt-10 bg-slate-900 text-white py-6 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(15,23,42,0.3)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                                                         >
                                                                                                                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                                                                                                                        Synchronize & Promote Entire Department
                                                                                                         </button>
                                                                                          </div>
                                                                           </div>

                                                                           {/* Alumni Section */}
                                                                           <div className="space-y-8">
                                                                                          <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 flex flex-col items-center text-center space-y-6">
                                                                                                         <div className="w-20 h-20 bg-amber-50 rounded-3xl flex items-center justify-center text-amber-600 shadow-xl shadow-amber-900/5 transition-transform hover:scale-110 duration-500"><GraduationCap className="w-10 h-10" /></div>
                                                                                                         <div>
                                                                                                                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Alumni <span className="text-amber-500">Registry</span></h2>
                                                                                                                        <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2 font-medium">Search for graduated students by their PRN.</p>
                                                                                                         </div>
                                                                                                         <div className="w-full flex gap-3">
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
                                                                                                         <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-bottom-5 shadow-sm">
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
                                                            </div>
                                             </main>

                                             {/* Toasts */}
                                             {message && (
                                                            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-4 shadow-2xl z-[200]">
                                                                           <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                                                           {message}
                                                                           <button onClick={() => setMessage("")} className="ml-4 opacity-40 hover:opacity-100"><X className="w-4 h-4" /></button>
                                                            </div>
                                             )}
                                             {error && (
                                                            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-4 shadow-2xl z-[200]">
                                                                           <AlertCircle className="w-5 h-5" />
                                                                           {error}
                                                                           <button onClick={() => setError("")} className="ml-4 opacity-40 hover:opacity-100"><X className="w-4 h-4" /></button>
                                                            </div>
                                             )}
                              </div>
               );
}
