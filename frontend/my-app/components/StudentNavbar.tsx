"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut, GraduationCap, User } from "lucide-react";

interface StudentNavbarProps {
               studentName?: string;
}

export default function StudentNavbar({ studentName }: StudentNavbarProps) {
               const router = useRouter();

               const handleLogout = () => {
                              localStorage.removeItem("student_logged_in");
                              localStorage.removeItem("student_data");
                              localStorage.removeItem("student_token");
                              router.push("/auth/student");
               };

               return (
                              <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
                                             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                                                            <div className="flex justify-between h-16 items-center">
                                                                           {/* Logo & College Name */}
                                                                           <div
                                                                                          className="flex items-center gap-3 cursor-pointer group"
                                                                                          onClick={() => router.push("/dashboard/student")}
                                                                           >
                                                                                          <div className="bg-black p-2 rounded-lg group-hover:bg-gray-800 transition-colors">
                                                                                                         <GraduationCap className="w-6 h-6 text-white" />
                                                                                          </div>
                                                                                          <div className="flex flex-col">
                                                                                                         <span className="text-sm font-black text-black uppercase tracking-tighter leading-none">
                                                                                                                        Government College of Engineering
                                                                                                         </span>
                                                                                                         <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                                                                                                                        Chandrapur
                                                                                                         </span>
                                                                                          </div>
                                                                           </div>

                                                                           {/* User Section */}
                                                                           <div className="flex items-center gap-4">
                                                                                          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
                                                                                                         <User className="w-4 h-4 text-gray-400" />
                                                                                                         <span className="text-sm font-bold text-black">{studentName || "Student"}</span>
                                                                                          </div>

                                                                                          <button
                                                                                                         onClick={handleLogout}
                                                                                                         className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                                                         title="Logout"
                                                                                          >
                                                                                                         <LogOut className="w-5 h-5" />
                                                                                          </button>
                                                                           </div>
                                                            </div>
                                             </div>
                              </nav>
               );
}
