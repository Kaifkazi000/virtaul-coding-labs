"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, ShieldAlert, CheckCircle2, ChevronRight, Download, Users, FileCheck, Clock } from "lucide-react";

export default function PracticalDetailsPage() {
               const router = useRouter();
               const params = useParams();
               const subjectId = params.subjectId as string;
               const practicalId = params.practicalId as string;

               const [practicalData, setPracticalData] = useState<any>(null);
               const [loading, setLoading] = useState(true);
               const [error, setError] = useState("");

               const fetchPracticalDetails = useCallback(async () => {
                              setLoading(true);
                              setError("");
                              try {
                                             const token = localStorage.getItem("teacher_token");
                                             if (!token) {
                                                            router.push("/auth/teacher");
                                                            return;
                                             }

                                             const res = await fetch(`/api/teacher-dashboard/practical/${practicalId}/students?t=${Date.now()}`, {
                                                            headers: { Authorization: `Bearer ${token}` },
                                                            cache: "no-store",
                                             });
                                             const data = await res.json();
                                             if (!res.ok) throw new Error(data.error || "Failed to fetch student data");
                                             setPracticalData(data);
                              } catch (e: any) {
                                             setError(e.message);
                              } finally {
                                             setLoading(false);
                              }
               }, [practicalId, router]);

               useEffect(() => {
                              fetchPracticalDetails();
               }, [fetchPracticalDetails]);

               const handleDownloadPDF = async () => {
                              try {
                                             const token = localStorage.getItem("teacher_token");
                                             const res = await fetch(`/api/pdf/practical/${practicalId}`, {
                                                            headers: { Authorization: `Bearer ${token}` },
                                             });
                                             if (!res.ok) throw new Error("Failed to generate PDF");

                                             const blob = await res.blob();
                                             const url = window.URL.createObjectURL(blob);
                                             const a = document.createElement("a");
                                             a.href = url;
                                             a.download = `PR-${practicalData?.practical?.pr_no || "report"}.pdf`;
                                             document.body.appendChild(a);
                                             a.click();
                                             window.URL.revokeObjectURL(url);
                                             document.body.removeChild(a);
                              } catch (e: any) {
                                             alert(e.message);
                              }
               };

               if (loading) return (
                              <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                                             <div className="flex flex-col items-center gap-4">
                                                            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                                            <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Syncing Submissions...</p>
                                             </div>
                              </div>
               );

               if (error) return (
                              <div className="p-8">
                                             <p className="text-red-600 mb-4">{error}</p>
                                             <button onClick={() => router.back()} className="text-blue-600 hover:underline">← Go Back</button>
                              </div>
               );

               const flaggedCount = practicalData.submitted.filter((s: any) => s.flagged).length;

               return (
                              <main className="min-h-screen bg-gray-50 p-4 md:p-10">
                                             <div className="max-w-7xl mx-auto space-y-8">
                                                            {/* Header Section */}
                                                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                                                                           <div>
                                                                                          <button onClick={() => router.back()} className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors mb-4 flex items-center gap-1 group">
                                                                                                         <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Practicals
                                                                                          </button>
                                                                                          <div className="flex items-center gap-3">
                                                                                                         <div className="bg-black text-white px-3 py-1 rounded-lg text-sm font-black tracking-tighter uppercase">
                                                                                                                        PR-{practicalData.practical.pr_no}
                                                                                                         </div>
                                                                                                         <h1 className="text-4xl font-black text-gray-900 tracking-tighter">
                                                                                                                        {practicalData.practical.title}
                                                                                                         </h1>
                                                                                          </div>
                                                                                          <p className="text-lg text-gray-500 font-medium mt-1">{practicalData.practical.subject_name}</p>
                                                                           </div>

                                                                           <button
                                                                                          onClick={handleDownloadPDF}
                                                                                          className="bg-white border-2 border-black text-black px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 active:translate-y-1 active:shadow-none"
                                                                           >
                                                                                          <Download className="w-4 h-4" /> Download Report
                                                                           </button>
                                                            </div>

                                                            {/* Stats Grid */}
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                                                                           <StatCard icon={<Users className="w-5 h-5" />} label="Total Students" value={practicalData.stats.total_students} color="blue" />
                                                                           <StatCard icon={<FileCheck className="w-5 h-5" />} label="Submitted" value={practicalData.stats.submitted_count} color="green" />
                                                                           <StatCard icon={<Clock className="w-5 h-5" />} label="Pending" value={practicalData.stats.not_submitted_count} color="gray" />
                                                                           <StatCard icon={<CheckCircle2 className="w-5 h-5" />} label="Completion" value={`${practicalData.stats.submission_rate}%`} color="orange" />
                                                                           <StatCard
                                                                                          icon={<ShieldAlert className="w-5 h-5" />}
                                                                                          label="Logic Alerts"
                                                                                          value={flaggedCount}
                                                                                          color={flaggedCount > 0 ? "red" : "green"}
                                                                                          highlight={flaggedCount > 0}
                                                                           />
                                                            </div>

                                                            <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
                                                                           {/* Main List */}
                                                                           <div className="xl:col-span-8 space-y-10">
                                                                                          <section>
                                                                                                         <div className="flex items-center justify-between mb-6">
                                                                                                                        <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                                                                                                                       <span className="w-3 h-8 bg-green-500 rounded-full"></span>
                                                                                                                                       Completed Submissions
                                                                                                                        </h2>
                                                                                                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-gray-100 shadow-sm">
                                                                                                                                       {practicalData.submitted.length} Students
                                                                                                                        </span>
                                                                                                         </div>

                                                                                                         {practicalData.submitted.length === 0 ? (
                                                                                                                        <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2rem] p-16 text-center text-gray-400">
                                                                                                                                       <p className="font-bold text-lg">No submissions yet.</p>
                                                                                                                                       <p className="text-sm">Wait for students to complete their code.</p>
                                                                                                                        </div>
                                                                                                         ) : (
                                                                                                                        <div className="space-y-4">
                                                                                                                                       {practicalData.submitted.map((s: any) => (
                                                                                                                                                      <SubmissionCard
                                                                                                                                                                     key={s.student_id}
                                                                                                                                                                     s={s}
                                                                                                                                                                     onClick={() => router.push(`/dashboard/teacher/submissions/${s.submission_id}`)}
                                                                                                                                                      />
                                                                                                                                       ))}
                                                                                                                        </div>
                                                                                                         )}
                                                                                          </section>
                                                                           </div>

                                                                           {/* Sidebar / Pending List */}
                                                                           <div className="xl:col-span-4 space-y-10">
                                                                                          <section>
                                                                                                         <h2 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-3 mb-6">
                                                                                                                        <span className="w-3 h-8 bg-gray-200 rounded-full"></span>
                                                                                                                        Incomplete
                                                                                                         </h2>
                                                                                                         <div className="bg-white border border-gray-100 rounded-[2rem] p-6 shadow-sm divide-y divide-gray-50 overflow-hidden">
                                                                                                                        {practicalData.not_submitted.length === 0 ? (
                                                                                                                                       <div className="text-center py-6">
                                                                                                                                                      <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                                                                                                                                                      <p className="font-black text-green-600 uppercase tracking-tight">All Done!</p>
                                                                                                                                       </div>
                                                                                                                        ) : (
                                                                                                                                       practicalData.not_submitted.map((s: any) => (
                                                                                                                                                      <div key={s.student_id} className="py-4 first:pt-0 last:pb-0">
                                                                                                                                                                     <p className="font-black text-gray-800 leading-tight">{s.name}</p>
                                                                                                                                                                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">PRN: {s.prn}</p>
                                                                                                                                                      </div>
                                                                                                                                       ))
                                                                                                                        )}
                                                                                                         </div>
                                                                                          </section>
                                                                           </div>
                                                            </div>
                                             </div>
                              </main>
               );
}

function StatCard({ icon, label, value, color, highlight = false }: any) {
               const colors: any = {
                              blue: "bg-blue-50 text-blue-600 border-blue-100",
                              green: "bg-green-50 text-green-600 border-green-100",
                              red: "bg-red-50 text-red-600 border-red-100",
                              orange: "bg-orange-50 text-orange-600 border-orange-100",
                              gray: "bg-gray-50 text-gray-500 border-gray-100",
               };

               return (
                              <div className={`bg-white border rounded-[2rem] p-6 shadow-sm transition-all hover:scale-[1.02] ${highlight ? 'ring-2 ring-red-500' : 'border-gray-100'}`}>
                                             <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 ${colors[color]}`}>
                                                            {icon}
                                             </div>
                                             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                                             <p className="text-3xl font-black text-gray-900 tracking-tighter">{value}</p>
                              </div>
               );
}

function SubmissionCard({ s, onClick }: any) {
               return (
                              <div
                                             onClick={onClick}
                                             className={`group bg-white border border-gray-100 rounded-[2rem] p-6 pr-8 hover:border-black hover:bg-black transition-all duration-500 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative shadow-sm hover:shadow-xl`}
                              >
                                             <div className="relative z-10 flex-1">
                                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                                           <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${s.execution_status === 'success' ? 'bg-green-100 text-green-700 group-hover:bg-green-500 group-hover:text-white' : 'bg-red-100 text-red-700 group-hover:bg-red-500 group-hover:text-white'}`}>
                                                                                          {s.execution_status}
                                                                           </span>
                                                                           {s.flagged && (
                                                                                          <span className="flex items-center gap-1 bg-red-500 text-white px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/30 animate-pulse">
                                                                                                         <ShieldAlert className="w-3 h-3" /> Logic Alert
                                                                                          </span>
                                                                           )}
                                                            </div>

                                                            <h3 className="text-2xl font-black text-gray-900 group-hover:text-white tracking-tighter leading-tight transition-colors">
                                                                           {s.name}
                                                            </h3>
                                                            <p className="text-xs font-bold text-gray-400 group-hover:text-gray-500 uppercase tracking-widest mt-1">
                                                                           PRN: {s.prn} • Roll: {s.roll}
                                                            </p>
                                             </div>

                                             <div className="relative z-10 flex items-center gap-6">
                                                            <div className="text-right flex flex-col items-end">
                                                                           <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest group-hover:text-gray-600 mb-1">Logic Similarity</p>
                                                                           <div className="flex items-center gap-2">
                                                                                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${s.flagged ? 'bg-red-500 text-white' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-800'}`}>
                                                                                                         {s.similarity_score}%
                                                                                          </div>
                                                                           </div>
                                                            </div>

                                                            <div className="text-gray-200 group-hover:text-white transition-all transform group-hover:translate-x-2">
                                                                           <ChevronRight className="w-8 h-8" />
                                                            </div>
                                             </div>

                                             {/* Decorative hover element */}
                                             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 group-hover:bg-white/10 transition-colors pointer-events-none" />
                              </div>
               );
}
