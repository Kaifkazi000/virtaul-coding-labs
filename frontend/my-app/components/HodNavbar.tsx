"use client";

import { useRouter } from "next/navigation";
import {
               LogOut,
               ShieldCheck,
               LayoutDashboard,
               BookOpen,
               Users,
               UserPlus,
               ArrowUpCircle
} from "lucide-react";

export default function HodNavbar({ hodName }: { hodName: string }) {
               const router = useRouter();

               const handleLogout = () => {
                              localStorage.removeItem("hod_token");
                              localStorage.removeItem("hod_data");
                              router.push("/HOD");
               };

               return (
                              <nav className="bg-white border-b border-gray-100 sticky top-0 z-[100] px-8 py-4 flex items-center justify-between shadow-sm">
                                             <div className="flex items-center gap-12">
                                                            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => router.push("/dashboard/hod")}>
                                                                           <div className="bg-black p-2 rounded-xl text-white shadow-lg transition-transform group-hover:scale-110">
                                                                                          <ShieldCheck className="w-5 h-5" />
                                                                           </div>
                                                                           <span className="text-xl font-black text-black tracking-tighter uppercase">HOD OS</span>
                                                            </div>

                                                            <div className="hidden md:flex items-center gap-8">
                                                                           <NavLink icon={<LayoutDashboard className="w-4 h-4" />} label="Overview" active />
                                                                           <NavLink icon={<BookOpen className="w-4 h-4" />} label="Subjects" />
                                                                           <NavLink icon={<Users className="w-4 h-4" />} label="Teachers" />
                                                                           <NavLink icon={<UserPlus className="w-4 h-4" />} label="Students" />
                                                                           <NavLink icon={<ArrowUpCircle className="w-4 h-4" />} label="Promotion" />
                                                            </div>
                                             </div>

                                             <div className="flex items-center gap-6">
                                                            <div className="flex flex-col items-end">
                                                                           <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Administrator</span>
                                                                           <span className="text-sm font-black text-black leading-tight">{hodName || "HOD Admin"}</span>
                                                            </div>
                                                            <button
                                                                           onClick={handleLogout}
                                                                           className="p-3 hover:bg-rose-50 rounded-2xl text-gray-400 hover:text-rose-600 transition-all active:scale-95 group border border-transparent hover:border-rose-100"
                                                            >
                                                                           <LogOut className="w-5 h-5" />
                                                            </button>
                                             </div>
                              </nav>
               );
}

function NavLink({ icon, label, active = false }: { icon: any; label: string; active?: boolean }) {
               return (
                              <div className={`flex items-center gap-2 cursor-pointer transition-all group ${active ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}>
                                             <div className={`p-2 rounded-xl transition-all ${active ? 'bg-black text-white' : 'bg-transparent text-black group-hover:bg-gray-100'}`}>
                                                            {icon}
                                             </div>
                                             <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
                              </div>
               );
}
