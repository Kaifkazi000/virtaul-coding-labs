"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LogOut, GraduationCap, User, Settings, Bell } from "lucide-react";

interface StudentNavbarProps {
               studentName?: string;
               onSettingsClick?: () => void;
}

export default function StudentNavbar({ studentName, onSettingsClick }: StudentNavbarProps) {
               const router = useRouter();
               const [notifications, setNotifications] = React.useState<any[]>([]);
               const [showNotifs, setShowNotifs] = React.useState(false);

               React.useEffect(() => {
                               const fetchNotifications = async () => {
                                              const token = localStorage.getItem("student_token");
                                              if (!token) return;

                                              try {
                                                             const res = await fetch("/api/practicals/student/notifications", {
                                                                            headers: { Authorization: `Bearer ${token}` }
                                                             });
                                                             const data = await res.json();
                                                             if (Array.isArray(data)) setNotifications(data);
                                              } catch (err) {
                                                             console.error("Notif error:", err);
                                              }
                               };

                               fetchNotifications();
                               const interval = setInterval(fetchNotifications, 30000); // Check every 30s
                               return () => clearInterval(interval);
               }, []);

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

                                                                                           <div className="relative">
                                                                                                          <button
                                                                                                                         onClick={() => setShowNotifs(!showNotifs)}
                                                                                                                         className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all relative"
                                                                                                                         title="Notifications"
                                                                                                          >
                                                                                                                         <Bell className="w-5 h-5" />
                                                                                                                         {notifications.length > 0 && (
                                                                                                                                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                                                                                                                         )}
                                                                                                          </button>

                                                                                                          {showNotifs && (
                                                                                                                         <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 z-[100] animate-in slide-in-from-top-2 duration-200">
                                                                                                                                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 px-2">Recent Updates</h3>
                                                                                                                                        <div className="space-y-2 max-h-[300px] overflow-auto custom-scrollbar">
                                                                                                                                                       {notifications.length === 0 ? (
                                                                                                                                                                      <p className="text-sm font-medium text-gray-400 text-center py-4">No new notifications</p>
                                                                                                                                                       ) : (
                                                                                                                                                                      notifications.map((n, i) => (
                                                                                                                                                                                     <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 group hover:bg-indigo-50 transition-colors">
                                                                                                                                                                                                    <p className="text-[13px] font-bold text-gray-900 leading-tight">Your practical has been checked!</p>
                                                                                                                                                                                                    <p className="text-[11px] font-medium text-indigo-600 mt-1">{n.master_practicals?.title || "Update"}</p>
                                                                                                                                                                                                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-black">{new Date(n.checked_at).toLocaleDateString()}</p>
                                                                                                                                                                                     </div>
                                                                                                                                                                      ))
                                                                                                                                                       )}
                                                                                                                                        </div>
                                                                                                                         </div>
                                                                                                          )}
                                                                                           </div>

                                                                                           <button
                                                                                                          onClick={onSettingsClick}
                                                                                                          className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                                                                                                          title="Change Password"
                                                                                           >
                                                                                                          <Settings className="w-5 h-5" />
                                                                                           </button>

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
