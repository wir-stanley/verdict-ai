"use client";

import { motion } from "framer-motion";
import { UserButton, useUser } from "@clerk/nextjs";

export function WaitlistScreen() {
    const { user } = useUser();

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
            {/* Header with User Profile */}
            <div className="absolute top-4 right-4">
                <UserButton />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <h1 className="text-2xl font-bold text-white mb-2">
                    You're in the Queue, {user?.firstName}!
                </h1>
                <p className="text-zinc-500 mb-8">
                    We've received your application.
                </p>

                {/* Status Tracker */}
                <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4 mb-8 text-left">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="flex-1 h-1 bg-white/[0.1] rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-full" />
                        </div>
                        <div className="flex-1 h-1 bg-white/[0.1] rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 w-1/2 animate-pulse" />
                        </div>
                        <div className="flex-1 h-1 bg-white/[0.1] rounded-full overflow-hidden">
                            <div className="h-full bg-white/[0.05] w-full" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-400">Application Received</span>
                        <span className="text-amber-400 font-medium animate-pulse">Under Review</span>
                        <span className="text-zinc-600">Access Granted</span>
                    </div>
                </div>

                {/* Queue Jump CTA */}
                <div className="text-sm bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8">
                    <p className="text-blue-200 font-medium mb-1">Want to jump the line?</p>
                    <p className="text-blue-300/70 text-xs mb-3">
                        Follow us on X and DM us your email. We prioritize active community members.
                    </p>
                    <a
                        href="https://twitter.com/verdict_ai" // Placeholder
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-xs font-semibold transition-colors"
                    >
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zl-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        @verdict_ai
                    </a>
                </div>

                {/* Mini Education / Hype */}
                <div className="text-left border-t border-white/[0.05] pt-6">
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">While you wait</p>
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <div className="w-16 h-12 bg-zinc-800 rounded mb-2 shrink-0 border border-white/10" />
                            <div>
                                <h3 className="text-sm text-zinc-300 font-medium">How the "Tribunal" works</h3>
                                <p className="text-xs text-zinc-500">Learn how we synthesize 3 models into one answer.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
