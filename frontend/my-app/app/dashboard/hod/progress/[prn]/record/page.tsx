'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  GraduationCap,
  Calendar,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Clock,
  ChevronDown,
  ChevronUp,
  Activity,
  Award
} from 'lucide-react';

export default function StudentTranscriptPage() {
  const params = useParams();
  const router = useRouter();
  const prn = params.prn as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<any>(null);
  const [openSemesters, setOpenSemesters] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/history/student/${prn}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch transcript');
        }

        setData(result);
        
        // Auto-open the highest semester
        if (result.transcript && Object.keys(result.transcript).length > 0) {
          const sems = Object.keys(result.transcript).map(Number).sort((a, b) => b - a);
          setOpenSemesters({ [sems[0].toString()]: true });
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [prn]);

  const toggleSemester = (sem: string) => {
    setOpenSemesters((prev) => ({
      ...prev,
      [sem]: !prev[sem],
    }));
  };

  const getStatusDisplay = (status: string, prName: string, grade: string) => {
    if (status === 'checked') {
      const isA = grade?.includes('A');
      const isB = grade?.includes('B');
      const isC = grade?.includes('C');
      
      let badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
      if (isB) badgeStyle = 'bg-blue-50 text-blue-700 border-blue-200';
      if (isC) badgeStyle = 'bg-amber-50 text-amber-700 border-amber-200';
      
      const gradeStr = isA ? 'A' : isB ? 'B' : isC ? 'C' : 'Checked';

      return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${badgeStyle} flex items-center gap-1.5`}>
          <CheckCircle2 className="w-3 h-3" />
          Grade {gradeStr}
        </span>
      );
    } else if (status === 'submitted') {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          Pending Check
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border bg-slate-50 text-slate-500 border-slate-200 flex items-center gap-1.5">
        <Activity className="w-3 h-3" />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafbfc] flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#fafbfc] p-12">
        <div className="max-w-2xl mx-auto bg-rose-50 border border-rose-100 rounded-[2rem] p-8 flex items-start gap-5">
          <AlertCircle className="w-6 h-6 text-rose-500 flex-shrink-0" />
          <div>
            <h3 className="text-rose-900 font-bold text-lg mb-1">Transcript Error</h3>
            <p className="text-rose-600/80 text-sm font-medium">{error || "No data found."}</p>
            <button onClick={() => router.back()} className="mt-4 text-rose-700 text-sm font-bold hover:underline">
              &larr; Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { student, transcript } = data;
  const semesters = Object.keys(transcript).map(Number).sort((a, b) => b - a); // Highest first

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      {/* Header */}
      <div className="bg-white border-b border-slate-200/60 sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push('/dashboard/hod/progress')}
              className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                Official <span className="text-indigo-600">Transcript</span>
                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1">
                  <Award className="w-3 h-3" /> Verified Record
                </div>
              </h1>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-1">Permanent Academic History</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-screen-xl mx-auto p-8 lg:p-12">
        {/* Student Profile Overview */}
        <div className="bg-white border border-slate-200/60 rounded-[3rem] p-10 shadow-sm mb-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-24 h-24 bg-slate-900 rounded-[2rem] flex items-center justify-center text-white text-3xl font-black shadow-xl flex-shrink-0">
              {student.full_name?.charAt(0)}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-black text-slate-900 mb-2">{student.full_name}</h2>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><FileText className="w-4 h-4 text-indigo-500" /> PRN: {student.prn}</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-violet-500" /> Dept: {student.department}</span>
                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-emerald-500" /> Batch: {student.batch || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Semesters / Accordion List */}
        <div className="space-y-6">
          {semesters.length === 0 && (
            <div className="bg-white border border-slate-200 rounded-[2rem] p-16 flex flex-col items-center justify-center text-center">
               <Activity className="w-12 h-12 text-slate-300 mb-4" />
               <h3 className="text-xl font-black text-slate-900 mb-2">No Records Found</h3>
               <p className="text-slate-500 font-medium">This student does not have any recorded grades or submissions yet.</p>
            </div>
          )}

          {semesters.map((semStr) => {
            const semSubjects = transcript[semStr];
            const isOpen = openSemesters[semStr];

            return (
              <div key={semStr} className={`bg-white border ${isOpen ? 'border-indigo-200 shadow-md' : 'border-slate-200/60 shadow-sm'} rounded-[2.5rem] transition-all duration-300 overflow-hidden`}>
                {/* Accordion Header */}
                <button 
                  onClick={() => toggleSemester(semStr)}
                  className={`w-full px-10 py-8 flex items-center justify-between transition-colors ${isOpen ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-6">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isOpen ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
                       <Calendar className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <h3 className={`text-2xl font-black ${isOpen ? 'text-indigo-900' : 'text-slate-900'} tracking-tight`}>Semester {semStr}</h3>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                        {semSubjects.length} Registered Subjects
                      </p>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${isOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
                    {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>

                {/* Accordion Body */}
                {isOpen && (
                  <div className="p-8 pt-0 border-t border-indigo-100/50">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                      {semSubjects.map((subj: any) => (
                        <div key={subj.subject_id} className="bg-slate-50 border border-slate-200 rounded-3xl p-6 relative group hover:border-indigo-200 hover:shadow-md transition-all">
                          {/* Subject Header */}
                          <div className="flex items-start justify-between mb-6 pb-6 border-b border-slate-200/60">
                            <div>
                               <div className="flex items-center gap-2 mb-1">
                                 <BookOpen className="w-4 h-4 text-indigo-500" />
                                 <h4 className="text-base font-black text-slate-900">{subj.subject_name}</h4>
                               </div>
                               <span className="text-[10px] font-black bg-white border border-slate-200 text-slate-500 px-2 py-0.5 rounded-md uppercase">Code: {subj.course_code || 'N/A'}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-black text-indigo-600">{subj.practicals.length}</span>
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Records</p>
                            </div>
                          </div>

                          {/* Grades List */}
                          <div className="space-y-3">
                            {subj.practicals.length === 0 && (
                               <p className="text-xs text-slate-400 font-medium italic">No practicals attempted.</p>
                            )}
                            {subj.practicals.map((prac: any) => (
                              <div key={prac.submission_id} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center justify-between group/item hover:border-slate-300 transition-colors">
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black ring-1 ring-inset ring-indigo-100/50">
                                    P{prac.pr_no}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-slate-800 line-clamp-1">{prac.title}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">
                                      {prac.checked_at ? new Date(prac.checked_at).toLocaleDateString() : 'Pending'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex-shrink-0 ml-4">
                                  {getStatusDisplay(prac.status, prac.title, prac.feedback)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
