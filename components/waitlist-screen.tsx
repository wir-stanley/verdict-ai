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
                <div className="text-zinc-500 text-sm">
                    We'll email you at {user?.primaryEmailAddress?.emailAddress} when you're in.
                </div>
            </motion.div>
        </div>
    );
}
