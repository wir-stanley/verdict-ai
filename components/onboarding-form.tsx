"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";

export function OnboardingForm() {
    const { user } = useUser();
    const submitApplication = useMutation(api.users.submitApplication);

    const [profession, setProfession] = useState("");
    const [useCase, setUseCase] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id || !profession || !useCase) return;

        setIsSubmitting(true);
        try {
            await submitApplication({
                clerkId: user.id,
                profession,
                useCase,
            });
            // The parent component (app/page.tsx) will handle the redirect/state change 
            // once the user data updates via the reactive query.
        } catch (error) {
            console.error("Failed to submit application:", error);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center p-6 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                {/* Header */}
                <div className="mb-8">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                        <span className="text-xl">👋</span>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">
                        Welcome to the Inner Circle
                    </h1>
                    <p className="text-zinc-400 text-sm">
                        To maintain quality, we're onboarding users manually. <br />
                        Tell us a bit about yourself to get approved faster.
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                            Profession / Role
                        </label>
                        <select
                            value={profession}
                            onChange={(e) => setProfession(e.target.value)}
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-colors appearance-none"
                            required
                        >
                            <option value="" disabled className="bg-zinc-900">Select your role...</option>
                            <option value="Developer" className="bg-zinc-900">Software Engineer / Developer</option>
                            <option value="Researcher" className="bg-zinc-900">Researcher / Scientist</option>
                            <option value="Student" className="bg-zinc-900">Student</option>
                            <option value="Founder" className="bg-zinc-900">Founder / Executive</option>
                            <option value="Creative" className="bg-zinc-900">Creative / Designer</option>
                            <option value="Other" className="bg-zinc-900">Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
                            Your Main Use Case
                        </label>
                        <textarea
                            value={useCase}
                            onChange={(e) => setUseCase(e.target.value)}
                            placeholder="e.g. Debugging React code, Summarizing legal papers, Comparing medical advice..."
                            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-colors min-h-[100px] resize-none"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-white text-black font-semibold py-3 rounded-lg hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                Submitting...
                            </div>
                        ) : (
                            "Apply for Access"
                        )}
                    </button>
                </form>

                <p className="mt-6 text-xs text-zinc-600">
                    We process applications daily. You'll get an email when approved.
                </p>
            </motion.div>
        </div>
    );
}
