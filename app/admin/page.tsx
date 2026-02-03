"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { motion } from "framer-motion";
import type { Id } from "@/convex/_generated/dataModel";

export default function AdminDashboard() {
    const { user, isLoaded } = useUser();
    const convexUser = useQuery(api.users.getUserByClerkId,
        user?.id ? { clerkId: user.id } : "skip"
    );

    const pendingUsers = useQuery(api.users.getPendingUsers);
    const approveUser = useMutation(api.users.approveUser);
    const rejectUser = useMutation(api.users.rejectUser);

    const [processingId, setProcessingId] = useState<Id<"users"> | null>(null);

    if (!isLoaded || !convexUser) {
        return <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-500">Loading...</div>;
    }

    // Security Gate
    if (convexUser.role !== "admin") {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                    <span className="text-3xl">🚫</span>
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
                <p className="text-zinc-500">You do not have permission to view this page.</p>
            </div>
        );
    }

    const handleApprove = async (userId: Id<"users">, name: string) => {
        if (!confirm(`Generic "Approve" for ${name}?`)) return;
        setProcessingId(userId);
        try {
            await approveUser({ userId });
        } catch (e) {
            console.error(e);
            alert("Failed");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (userId: Id<"users">, name: string) => {
        if (!confirm(`Generic "Reject" for ${name}?`)) return;
        setProcessingId(userId);
        try {
            await rejectUser({ userId });
        } catch (e) {
            console.error(e);
            alert("Failed");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8">
            <div className="max-w-7xl mx-auto">
                <header className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-3xl font-bold gradient-text mb-2">Alpha Admin</h1>
                        <p className="text-zinc-500">Manage waitlist and user access.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-zinc-900 rounded-lg border border-white/5 text-sm">
                            <span className="text-zinc-500">Pending:</span> <span className="text-white font-mono ml-2">{pendingUsers?.length || 0}</span>
                        </div>
                    </div>
                </header>

                <main>
                    {!pendingUsers ? (
                        <div className="text-zinc-500">Loading applicants...</div>
                    ) : pendingUsers.length === 0 ? (
                        <div className="text-center py-20 bg-white/[0.02] rounded-2xl border border-white/[0.05] border-dashed">
                            <span className="text-4xl mb-4 block">😴</span>
                            <h3 className="text-lg font-medium text-white mb-1">No pending applications</h3>
                            <p className="text-zinc-500">Current queue is empty.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {pendingUsers.map((applicant) => (
                                <motion.div
                                    key={applicant._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-zinc-900/40 border border-white/[0.05] rounded-xl p-6 hover:border-white/[0.1] transition-colors"
                                >
                                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                        <div className="flex items-start gap-4">
                                            <img
                                                src={applicant.imageUrl || ""}
                                                alt={applicant.name || ""}
                                                className="w-12 h-12 rounded-full bg-zinc-800 object-cover"
                                            />
                                            <div>
                                                <div className="flex items-center gap-3 mb-1">
                                                    <h3 className="text-lg font-bold text-white">{applicant.name}</h3>
                                                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/5">
                                                        {applicant.profession || "Unknown"}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-zinc-500 font-mono mb-3">{applicant.email}</p>

                                                <div className="p-3 bg-black/40 rounded-lg border border-white/5 max-w-2xl">
                                                    <p className="text-sm text-zinc-300 italic">"{applicant.useCase}"</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <button
                                                onClick={() => handleReject(applicant._id, applicant.name || "User")}
                                                disabled={processingId === applicant._id}
                                                className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all disabled:opacity-50"
                                            >
                                                Reject
                                            </button>
                                            <button
                                                onClick={() => handleApprove(applicant._id, applicant.name || "User")}
                                                disabled={processingId === applicant._id}
                                                className="px-6 py-2 rounded-lg text-sm font-bold text-black bg-white hover:bg-zinc-200 transition-all disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {processingId === applicant._id ? (
                                                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <span>Approve Access</span>
                                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12l5 5L20 7" /></svg>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex items-center gap-4 text-xs text-zinc-600 font-mono">
                                        <span>Applied: {new Date(applicant.applicationDate || 0).toLocaleString()}</span>
                                        <span>ID: {applicant.clerkId.slice(-8)}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
