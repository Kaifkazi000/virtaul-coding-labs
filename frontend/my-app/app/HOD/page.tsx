"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, Github } from "lucide-react";

export default function HODLoginPage() {
               const [email, setEmail] = useState("");
               const [password, setPassword] = useState("");
               const [error, setError] = useState("");
               const [loading, setLoading] = useState(false);
               const router = useRouter();

               const handleLogin = async (e: React.FormEvent) => {
                              e.preventDefault();
                              setError("");
                              setLoading(true);

                              try {
                                             // Mock login for now
                                             localStorage.setItem("hod_token", "mock_token");
                                             localStorage.setItem("hod_data", JSON.stringify({
                                                            id: "mock_id",
                                                            name: "Demo Admin",
                                                            email: email || "admin@demo.com",
                                                            role: "hod"
                                             }));

                                             router.push("/dashboard/hod");
                              } catch (err: any) {
                                             setError(err.message);
                              } finally {
                                             setLoading(false);
                              }
               };

               return (
                              <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 selection:bg-blue-500/30">
                                             {/* Background Glow */}
                                             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full"></div>

                                             <div className="w-full max-w-md relative z-10">
                                                            <div className="flex flex-col items-center mb-10">
                                                                           <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl mb-6 ring-1 ring-white/10 group animate-in zoom-in-50 duration-500">
                                                                                          <ShieldCheck className="w-8 h-8 text-black group-hover:scale-110 transition-transform" />
                                                                           </div>
                                                                           <h1 className="text-3xl font-black text-white tracking-tighter mb-2">HOD Gateway</h1>
                                                                           <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.2em]">Administrative Login</p>
                                                            </div>

                                                            <div className="bg-[#111111] border border-white/5 p-10 rounded-[2.5rem] shadow-2xl backdrop-blur-xl">
                                                                           <form onSubmit={handleLogin} className="space-y-6">
                                                                                          <div className="space-y-2">
                                                                                                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Academic Email</label>
                                                                                                         <div className="relative group">
                                                                                                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                                                                                                                        <input
                                                                                                                                       type="email"
                                                                                                                                       value={email}
                                                                                                                                       onChange={(e) => setEmail(e.target.value)}
                                                                                                                                       className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                                                                                                                                       placeholder="name@college.edu"
                                                                                                                                       required
                                                                                                                        />
                                                                                                         </div>
                                                                                          </div>

                                                                                          <div className="space-y-2">
                                                                                                         <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Secure Password</label>
                                                                                                         <div className="relative group">
                                                                                                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 group-focus-within:text-blue-500 transition-colors" />
                                                                                                                        <input
                                                                                                                                       type="password"
                                                                                                                                       value={password}
                                                                                                                                       onChange={(e) => setPassword(e.target.value)}
                                                                                                                                       className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all font-medium"
                                                                                                                                       placeholder="••••••••"
                                                                                                                                       required
                                                                                                                        />
                                                                                                         </div>
                                                                                          </div>

                                                                                          {error && (
                                                                                                         <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 animate-in shake-1 duration-300">
                                                                                                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                                                                                                        <p className="text-rose-400 text-xs font-bold uppercase tracking-tight">{error}</p>
                                                                                                         </div>
                                                                                          )}

                                                                                          <button
                                                                                                         type="submit"
                                                                                                         disabled={loading}
                                                                                                         className="w-full bg-white hover:bg-gray-100 text-black font-black py-4 rounded-2xl text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-white/5"
                                                                                          >
                                                                                                         {loading ? (
                                                                                                                        <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                                                                                                         ) : (
                                                                                                                        <>
                                                                                                                                       Authenticate Access
                                                                                                                                       <ArrowRight className="w-4 h-4" />
                                                                                                                        </>
                                                                                                         )}
                                                                                          </button>
                                                                           </form>
                                                            </div>

                                                            <div className="mt-12 text-center space-y-4">
                                                                           <p className="text-gray-600 text-[10px] font-bold uppercase tracking-[0.3em]">Authorized Personnel Only</p>
                                                                           <div className="flex items-center justify-center gap-6">
                                                                                          <Github className="w-4 h-4 text-gray-800 hover:text-white transition-colors cursor-pointer" />
                                                                                          <div className="w-px h-3 bg-white/5"></div>
                                                                                          <span className="text-gray-800 text-[9px] font-black uppercase tracking-widest">v2.0 HOD OS</span>
                                                                           </div>
                                                            </div>
                                             </div>

                                             <div className="fixed bottom-10 text-white/5 font-black text-[120px] pointer-events-none select-none">
                                                            ADMIN
                                             </div>
                              </div>
               );
}
