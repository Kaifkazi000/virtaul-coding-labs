"use client";

import React, { useState } from "react";
import { X, Lock, ShieldCheck, Loader2 } from "lucide-react";

interface ChangePasswordModalProps {
               isOpen: boolean;
               onClose: () => void;
               userType: "student" | "teacher" | "hod";
}

export default function ChangePasswordModal({ isOpen, onClose, userType }: ChangePasswordModalProps) {
               const [newPassword, setNewPassword] = useState("");
               const [confirmPassword, setConfirmPassword] = useState("");
               const [loading, setLoading] = useState(false);
               const [message, setMessage] = useState("");
               const [error, setError] = useState("");

               if (!isOpen) return null;

               const handleSubmit = async (e: React.FormEvent) => {
                              e.preventDefault();
                              setMessage("");
                              setError("");

                              if (newPassword.length < 6) {
                                             setError("Password must be at least 6 characters long");
                                             return;
                              }

                              if (newPassword !== confirmPassword) {
                                             setError("Passwords do not match");
                                             return;
                              }

                              try {
                                             setLoading(true);
                                             const tokenKey = userType === "student" ? "student_token" : userType === "teacher" ? "teacher_token" : "hod_token";
                                             const token = localStorage.getItem(tokenKey);

                                             const res = await fetch("/api/auth/update-password", {
                                                            method: "PUT",
                                                            headers: {
                                                                           "Content-Type": "application/json",
                                                                           "Authorization": `Bearer ${token}`
                                                            },
                                                            body: JSON.stringify({ newPassword })
                                             });

                                             const data = await res.json();

                                             if (!res.ok) throw new Error(data.message || "Failed to update password");

                                             setMessage("Password updated successfully!");
                                             setNewPassword("");
                                             setConfirmPassword("");
                                             setTimeout(onClose, 2000);
                              } catch (err: any) {
                                             setError(err.message);
                              } finally {
                                             setLoading(false);
                              }
               };

               return (
                              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
                                             <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                                                            <div className="p-8">
                                                                           <div className="flex items-center justify-between mb-8">
                                                                                          <div className="flex items-center gap-3">
                                                                                                         <div className="bg-indigo-600 p-2 rounded-xl text-white">
                                                                                                                        <Lock className="w-5 h-5" />
                                                                                                         </div>
                                                                                                         <div>
                                                                                                                        <h3 className="text-xl font-bold text-slate-900">Security</h3>
                                                                                                                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest leading-none">Update Password</p>
                                                                                                         </div>
                                                                                          </div>
                                                                                          <button onClick={onClose} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
                                                                                                         <X className="w-5 h-5 text-slate-400" />
                                                                                          </button>
                                                                           </div>

                                                                           <form onSubmit={handleSubmit} className="space-y-6">
                                                                                          <div className="space-y-2">
                                                                                                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">New Password</label>
                                                                                                         <input
                                                                                                                        type="password"
                                                                                                                        required
                                                                                                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                                                                                                        placeholder="Min. 6 characters"
                                                                                                                        value={newPassword}
                                                                                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                                                                         />
                                                                                          </div>

                                                                                          <div className="space-y-2">
                                                                                                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Confirm New Password</label>
                                                                                                         <input
                                                                                                                        type="password"
                                                                                                                        required
                                                                                                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                                                                                                                        placeholder="Repeat password"
                                                                                                                        value={confirmPassword}
                                                                                                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                                                                                         />
                                                                                          </div>

                                                                                          {error && (
                                                                                                         <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center animate-in fade-in duration-300">
                                                                                                                        {error}
                                                                                                         </div>
                                                                                          )}

                                                                                          {message && (
                                                                                                         <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center animate-in fade-in duration-300 flex items-center justify-center gap-2">
                                                                                                                        <ShieldCheck className="w-4 h-4" />
                                                                                                                        {message}
                                                                                                         </div>
                                                                                          )}

                                                                                          <button
                                                                                                         type="submit"
                                                                                                         disabled={loading}
                                                                                                         className="w-full bg-indigo-600 text-white py-5 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-95 transition-all text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                                                                          >
                                                                                                         {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Update Credentials"}
                                                                                          </button>
                                                                           </form>
                                                            </div>
                                             </div>
                              </div>
               );
}
