"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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

               if (loading) return <div className="p-8">Loading submission history...</div>;
               if (error) return (
                              <div className="p-8">
                                             <p className="text-red-600 mb-4">{error}</p>
                                             <button onClick={() => router.back()} className="text-blue-600 hover:underline">← Go Back</button>
                              </div>
               );

               return (
                              <main className="min-h-screen bg-gray-50 p-6">
                                             <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-100">
                                                            <div className="flex justify-between items-center mb-6">
                                                                           <div>
                                                                                          <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline mb-2 block">
                                                                                                         ← Back to List
                                                                                          </button>
                                                                                          <h1 className="text-2xl font-bold text-gray-800">
                                                                                                         PR-{practicalData.practical.pr_no}: {practicalData.practical.title}
                                                                                          </h1>
                                                                                          <p className="text-gray-600">{practicalData.practical.subject_name}</p>
                                                                           </div>
                                                                           <button
                                                                                          onClick={handleDownloadPDF}
                                                                                          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
                                                                           >
                                                                                          📥 Download Combined PDF
                                                                           </button>
                                                            </div>

                                                            {/* Stats Grid */}
                                                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                                                                           <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl">
                                                                                          <p className="text-sm text-blue-600 font-medium">Total Students</p>
                                                                                          <p className="text-3xl font-bold text-blue-900">{practicalData.stats.total_students}</p>
                                                                           </div>
                                                                           <div className="bg-green-50/50 border border-green-100 p-4 rounded-xl">
                                                                                          <p className="text-sm text-green-600 font-medium">Submitted</p>
                                                                                          <p className="text-3xl font-bold text-green-900">{practicalData.stats.submitted_count}</p>
                                                                           </div>
                                                                           <div className="bg-red-50/50 border border-red-100 p-4 rounded-xl">
                                                                                          <p className="text-sm text-red-600 font-medium">Pending</p>
                                                                                          <p className="text-3xl font-bold text-red-900">{practicalData.stats.not_submitted_count}</p>
                                                                           </div>
                                                                           <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl">
                                                                                          <p className="text-sm text-orange-600 font-medium">Submission Rate</p>
                                                                                          <p className="text-3xl font-bold text-orange-900">{practicalData.stats.submission_rate}%</p>
                                                                           </div>
                                                            </div>

                                                            <div className="space-y-8">
                                                                           {/* Submitted Section */}
                                                                           <section>
                                                                                          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                                                                         <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                                                                                                         Submitted Students ({practicalData.submitted.length})
                                                                                          </h2>
                                                                                          {practicalData.submitted.length === 0 ? (
                                                                                                         <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
                                                                                                                        No submissions yet
                                                                                                         </div>
                                                                                          ) : (
                                                                                                         <div className="grid grid-cols-1 gap-3">
                                                                                                                        {practicalData.submitted.map((s: any) => (
                                                                                                                                       <div key={s.student_id} className="group border border-gray-100 rounded-xl p-4 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex justify-between items-center">
                                                                                                                                                      <div>
                                                                                                                                                                     <h3 className="font-semibold text-gray-800">{s.name}</h3>
                                                                                                                                                                     <p className="text-sm text-gray-500">PRN: {s.prn} • Roll: {s.roll}</p>
                                                                                                                                                                     <p className="text-xs text-gray-400 mt-1">
                                                                                                                                                                                    at {new Date(s.submitted_at).toLocaleString()}
                                                                                                                                                                     </p>
                                                                                                                                                      </div>
                                                                                                                                                      <div className="flex items-center gap-4">
                                                                                                                                                                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${s.execution_status === "success"
                                                                                                                                                                                                   ? "bg-green-100 text-green-700"
                                                                                                                                                                                                   : "bg-red-100 text-red-700"
                                                                                                                                                                                    }`}>
                                                                                                                                                                                    {s.execution_status}
                                                                                                                                                                     </span>
                                                                                                                                                                     <button
                                                                                                                                                                                    onClick={() => router.push(`/dashboard/teacher/submissions/${s.submission_id}`)}
                                                                                                                                                                                    className="bg-white border border-gray-200 text-gray-700 px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
                                                                                                                                                                     >
                                                                                                                                                                                    View Code
                                                                                                                                                                     </button>
                                                                                                                                                      </div>
                                                                                                                                       </div>
                                                                                                                        ))}
                                                                                                         </div>
                                                                                          )}
                                                                           </section>

                                                                           {/* Not Submitted Section */}
                                                                           <section>
                                                                                          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                                                                                         <span className="w-2 h-6 bg-red-500 rounded-full"></span>
                                                                                                         Not Submitted Yet ({practicalData.not_submitted.length})
                                                                                          </h2>
                                                                                          {practicalData.not_submitted.length === 0 ? (
                                                                                                         <p className="text-green-600 font-medium">All students have submitted! 🎉</p>
                                                                                          ) : (
                                                                                                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                                                                        {practicalData.not_submitted.map((s: any) => (
                                                                                                                                       <div key={s.student_id} className="border border-gray-100 rounded-lg p-3 bg-gray-50/50">
                                                                                                                                                      <p className="font-medium text-gray-700">{s.name}</p>
                                                                                                                                                      <p className="text-xs text-gray-500">PRN: {s.prn}</p>
                                                                                                                                       </div>
                                                                                                                        ))}
                                                                                                         </div>
                                                                                          )}
                                                                           </section>
                                                            </div>
                                             </div>
                              </main>
               );
}
