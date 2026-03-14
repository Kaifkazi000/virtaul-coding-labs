'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
               Search,
               ArrowLeft,
               LineChart,
               Calendar,
               User,
               GraduationCap,
               ChevronRight,
               Clock,
               FileText,
               AlertCircle,
               CheckCircle2,
               Activity
} from 'lucide-react';

export default function StudentProgressPage() {
               const router = useRouter();
               const [prn, setPrn] = useState('');
               const [loading, setLoading] = useState(false);
               const [error, setError] = useState('');
               const [data, setData] = useState<any>(null);

               const handleSearch = async (e: React.FormEvent) => {
                              e.preventDefault();
                              if (!/^\d{16}$/.test(prn)) {
                                             setError('PRN must be exactly 16 numeric digits');
                                             return;
                              }

                              setLoading(true);
                              setError('');
                              setData(null);

                              try {
                                             const response = await fetch(`http://localhost:5000/api/hod/student-history/${prn}`);
                                             const result = await response.json();

                                             if (!response.ok) {
                                                            throw new Error(result.error || 'Failed to fetch progress record');
                                             }

                                             setData(result);
                              } catch (err: any) {
                                             setError(err.message);
                              } finally {
                                             setLoading(false);
                              }
               };

               return (
                              <div className="min-h-screen bg-[#fafbfc] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
                                             {/* Header */}
                                             <div className="bg-white border-b border-slate-200/60 sticky top-0 z-30 transition-all duration-300">
                                                            <div className="max-w-screen-2xl mx-auto px-8 py-5 flex items-center justify-between">
                                                                           <div className="flex items-center gap-6">
                                                                                          <button
                                                                                                         onClick={() => router.push('/dashboard/hod')}
                                                                                                         className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all duration-300 group"
                                                                                          >
                                                                                                         <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                                                                          </button>
                                                                                          <div>
                                                                                                         <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                                                                                                                        Student <span className="text-indigo-600">Progress</span>
                                                                                                                        <div className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">Tracker</div>
                                                                                                         </h1>
                                                                                                         <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">Academic Lifecycle Performance</p>
                                                                                          </div>
                                                                           </div>

                                                                           <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-12 relative group">
                                                                                          <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                                                                                                         <Search className="w-5 h-5 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
                                                                                          </div>
                                                                                          <input
                                                                                                         type="text"
                                                                                                         placeholder="Enter 16-digit Student PRN..."
                                                                                                         className="w-full bg-slate-50 border border-slate-200/60 rounded-3xl pl-16 pr-6 py-4 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all group-hover:bg-white"
                                                                                                         value={prn}
                                                                                                         onChange={(e) => setPrn(e.target.value)}
                                                                                          />
                                                                                          <button
                                                                                                         type="submit"
                                                                                                         disabled={loading}
                                                                                                         className="absolute right-3 top-2 bottom-2 bg-slate-900 text-white px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50"
                                                                                          >
                                                                                                         {loading ? 'Searching...' : 'Track Progress'}
                                                                                          </button>
                                                                           </form>
                                                            </div>
                                             </div>

                                             <main className="max-w-screen-2xl mx-auto p-12">
                                                            {error && (
                                                                           <div className="max-w-2xl mx-auto mb-8 bg-rose-50 border border-rose-100 rounded-[2rem] p-8 flex items-start gap-5 animate-in slide-in-from-top-4">
                                                                                          <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-rose-200">
                                                                                                         <AlertCircle className="w-6 h-6" />
                                                                                          </div>
                                                                                          <div>
                                                                                                         <h3 className="text-rose-900 font-bold text-lg mb-1">Lookup Error</h3>
                                                                                                         <p className="text-rose-600/80 text-sm font-medium leading-relaxed">{error}</p>
                                                                                          </div>
                                                                           </div>
                                                            )}

                                                            {!data && !error && !loading && (
                                                                           <div className="flex flex-col items-center justify-center py-32 opacity-40">
                                                                                          <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mb-8 border-2 border-dashed border-slate-200">
                                                                                                         <Activity className="w-10 h-10 text-slate-400" />
                                                                                          </div>
                                                                                          <p className="text-slate-400 text-sm font-black uppercase tracking-[0.3em]">Enter PRN to visualize progress</p>
                                                                           </div>
                                                            )}

                                                            {data && (
                                                                           <div className="space-y-12 animate-in fade-in zoom-in-95 duration-500">
                                                                                          {/* Summary Header */}
                                                                                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                                                                                         <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-[3rem] p-12 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden">
                                                                                                                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32 group-hover:bg-indigo-100/50 transition-colors"></div>
                                                                                                                        <div className="relative z-10">
                                                                                                                                       <div className="flex items-center gap-8 mb-10">
                                                                                                                                                      <div className="w-28 h-28 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white text-4xl font-black shadow-2xl relative">
                                                                                                                                                                     {data.profile.full_name?.charAt(0)}
                                                                                                                                                                     <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center border-4 border-white">
                                                                                                                                                                                    <CheckCircle2 className="w-5 h-5 text-white" />
                                                                                                                                                                     </div>
                                                                                                                                                      </div>
                                                                                                                                                      <div>
                                                                                                                                                                     <div className="flex items-center gap-4 mb-2">
                                                                                                                                                                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">{data.profile.full_name}</h2>
                                                                                                                                                                                    {data.profile.status === 'alumni' && (
                                                                                                                                                                                                   <span className="bg-amber-100 text-amber-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-200">Alumni</span>
                                                                                                                                                                                    )}
                                                                                                                                                                                    {data.profile.status === 'active' && (
                                                                                                                                                                                                   <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-200">Active Student</span>
                                                                                                                                                                                    )}
                                                                                                                                                                     </div>
                                                                                                                                                                     <div className="flex items-center gap-6 text-slate-400 text-sm font-bold uppercase tracking-widest">
                                                                                                                                                                                    <div className="flex items-center gap-2">
                                                                                                                                                                                                   <FileText className="w-4 h-4 text-indigo-500" />
                                                                                                                                                                                                   PRN: {data.profile.prn}
                                                                                                                                                                                    </div>
                                                                                                                                                                                    <div className="flex items-center gap-2">
                                                                                                                                                                                                   <User className="w-4 h-4 text-violet-500" />
                                                                                                                                                                                                   Roll: {data.profile.roll_no || 'N/A'}
                                                                                                                                                                                    </div>
                                                                                                                                                                     </div>
                                                                                                                                                      </div>
                                                                                                                                       </div>

                                                                                                                                       <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-10 border-t border-slate-100">
                                                                                                                                                      <div>
                                                                                                                                                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Department</p>
                                                                                                                                                                     <p className="text-lg font-bold text-slate-900 capitalize">{data.profile.department}</p>
                                                                                                                                                      </div>
                                                                                                                                                      <div>
                                                                                                                                                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Sem</p>
                                                                                                                                                                     <p className="text-lg font-bold text-indigo-600">{data.profile.semester}</p>
                                                                                                                                                      </div>
                                                                                                                                                      <div>
                                                                                                                                                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Academic Year</p>
                                                                                                                                                                     <p className="text-lg font-bold text-slate-900">{data.profile.admission_year || data.profile.academic_year}</p>
                                                                                                                                                      </div>
                                                                                                                                                      <div>
                                                                                                                                                                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Batch</p>
                                                                                                                                                                     <p className="text-lg font-bold text-slate-900">Section {data.profile.batch_name}</p>
                                                                                                                                                      </div>
                                                                                                                                       </div>
                                                                                                                        </div>
                                                                                                         </div>

                                                                                                         <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[3rem] p-12 text-white shadow-2xl shadow-indigo-200 relative overflow-hidden group">
                                                                                                                        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                                                                                                                                       <GraduationCap className="w-32 h-32" />
                                                                                                                        </div>
                                                                                                                        <h3 className="text-xl font-black mb-1 tracking-tight">Academic Journey</h3>
                                                                                                                        <p className="text-indigo-100/60 text-xs font-bold uppercase tracking-widest mb-10 text-indigo-100">Progress Overview</p>

                                                                                                                        <div className="space-y-6 relative z-10">
                                                                                                                                       <div className="flex items-center justify-between py-4 border-b border-white/10">
                                                                                                                                                      <span className="text-[11px] font-black uppercase tracking-widest text-indigo-100/70">Completed Semesters</span>
                                                                                                                                                      <span className="text-2xl font-black">{data.history.length}</span>
                                                                                                                                       </div>
                                                                                                                                       <div className="flex items-center justify-between py-4 border-b border-white/10">
                                                                                                                                                      <span className="text-[11px] font-black uppercase tracking-widest text-indigo-100/70">Admission Date</span>
                                                                                                                                                      <span className="text-sm font-bold">{new Date(data.profile.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                                                                                                       </div>
                                                                                                                                       <div className="flex items-center justify-between py-4">
                                                                                                                                                      <span className="text-[11px] font-black uppercase tracking-widest text-indigo-100/70">Next Promotion</span>
                                                                                                                                                      <span className="text-sm font-bold flex items-center gap-2 text-emerald-300">
                                                                                                                                                                     <Clock className="w-4 h-4" />
                                                                                                                                                                     Active
                                                                                                                                                      </span>
                                                                                                                                       </div>
                                                                                                                        </div>
                                                                                                         </div>
                                                                                          </div>

                                                                                          {/* History Timeline */}
                                                                                          <div className="space-y-8">
                                                                                                         <div className="flex items-center gap-4">
                                                                                                                        <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center shadow-sm">
                                                                                                                                       <LineChart className="w-5 h-5 text-indigo-600" />
                                                                                                                        </div>
                                                                                                                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Progression <span className="text-indigo-600">Timeline</span></h3>
                                                                                                         </div>

                                                                                                         <div className="space-y-6 relative">
                                                                                                                        <div className="absolute left-10 top-0 bottom-0 w-px bg-slate-200 dashed-border"></div>

                                                                                                                        {data.history.length === 0 && (
                                                                                                                                       <div className="bg-white border border-slate-100 rounded-[2rem] p-12 text-center text-slate-400 font-bold text-sm uppercase tracking-widest">
                                                                                                                                                      No archived progress records found.
                                                                                                                                       </div>
                                                                                                                        )}

                                                                                                                        {data.history.map((record: any, index: number) => (
                                                                                                                                       <div key={record.id} className="relative pl-32 animate-in slide-in-from-left-4" style={{ animationDelay: `${index * 100}ms` }}>
                                                                                                                                                      <div className="absolute left-0 top-6 w-20 flex flex-col items-end">
                                                                                                                                                                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Semester</span>
                                                                                                                                                                     <span className="text-2xl font-black text-indigo-600">{record.semester}</span>
                                                                                                                                                      </div>
                                                                                                                                                      <div className="absolute left-[39px] top-6 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full z-10"></div>

                                                                                                                                                      <div className="bg-white border border-slate-200/60 rounded-[2.5rem] p-8 shadow-sm hover:shadow-lg transition-all flex items-center justify-between group">
                                                                                                                                                                     <div className="flex items-center gap-8">
                                                                                                                                                                                    <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-50 transition-colors">
                                                                                                                                                                                                   <Calendar className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                                                                                                                                                                                    </div>
                                                                                                                                                                                    <div>
                                                                                                                                                                                                   <h4 className="text-lg font-black text-slate-900 mb-1">Year {record.academic_year} Progression</h4>
                                                                                                                                                                                                   <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                                                                                                                                                                                  <span>Batch {record.batch_name}</span>
                                                                                                                                                                                                                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                                                                                                                                                                                  <span>Archived on {new Date(record.created_at).toLocaleDateString()}</span>
                                                                                                                                                                                                   </div>
                                                                                                                                                                                    </div>
                                                                                                                                                                     </div>

                                                                                                                                                                     <div className="flex items-center gap-3">
                                                                                                                                                                                    <button className="bg-indigo-50 text-indigo-600 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-indigo-100 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                                                                                                                                                                   View Record
                                                                                                                                                                                    </button>
                                                                                                                                                                                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 group-hover:text-slate-900 transition-colors">
                                                                                                                                                                                                   <ChevronRight className="w-5 h-5" />
                                                                                                                                                                                    </div>
                                                                                                                                                                     </div>
                                                                                                                                                      </div>
                                                                                                                                       </div>
                                                                                                                        ))}

                                                                                                                        {/* Final Current Entry */}
                                                                                                                        <div className="relative pl-32 opacity-60">
                                                                                                                                       <div className="absolute left-0 top-6 w-20 flex flex-col items-end">
                                                                                                                                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">In-Progress</span>
                                                                                                                                                      <span className="text-2xl font-black text-slate-300">{data.profile.semester}</span>
                                                                                                                                       </div>
                                                                                                                                       <div className="absolute left-[39px] top-6 w-3 h-3 bg-slate-200 border-2 border-white rounded-full z-10"></div>
                                                                                                                                       <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[2.5rem] p-8 flex items-center gap-8">
                                                                                                                                                      <div className="p-4 bg-white rounded-2xl border border-slate-100">
                                                                                                                                                                     <Clock className="w-6 h-6 text-slate-300" />
                                                                                                                                                      </div>
                                                                                                                                                      <div>
                                                                                                                                                                     <h4 className="text-lg font-black text-slate-400 mb-1 leading-tight tracking-tight">Active Academic Session</h4>
                                                                                                                                                                     <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Snapshot pending promotion</p>
                                                                                                                                                      </div>
                                                                                                                                       </div>
                                                                                                                        </div>
                                                                                                         </div>
                                                                                          </div>
                                                                           </div>
                                                            )}
                                             </main>
                              </div>
               );
}

function CLOCK({ className }: { className?: string }) {
               return <Clock className={className} />;
}
