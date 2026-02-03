"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { VerdictCard } from "@/components/verdict-card";
import { type TribunalAnalysis } from "@/lib/types";

export function DemoSection() {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.5 });
    const [showVerdict, setShowVerdict] = useState(false);

    // Trigger verdict after witness animation cycle
    useEffect(() => {
        if (isInView) {
            const timer = setTimeout(() => setShowVerdict(true), 2500); // Wait for 2.5s (cycle length)
            return () => clearTimeout(timer);
        }
    }, [isInView]);

    // Mock data: Hard Logic / Coding Scenario
    const mockAnalysis: TribunalAnalysis = {
        headline: "Claude 4.5 identified a critical race condition in the optimized code.",
        verdict: "**Verdict: Fixed.** Claude’s semaphore logic merged with GPT’s naming conventions for a production-ready solution.",
        consensusLevel: "partial",
        agreementCount: 2,
        winner: "claude",
        bestAnswer: "# Final Verdict\n\n**Use the Semaphore-based approach.**\n\nOpting for raw speed here is dangerous. The `asyncio.Lock` implementation suggested by GPT-5.2 creates a potential deadlock when the queue is flushed mid-process.\n\n### The Fix:\n\n1.  **Safety**: Use `asyncio.Semaphore(1)` instead of `Lock` to allow graceful detachment.\n2.  **Readability**: Adopt the type hints from the GPT solution.\n\n```python\nasync def safe_process(queue: asyncio.Queue):\n    async with semaphore:\n        # Claude's conflict-free logic\n        while not queue.empty():\n            await process_item(queue.get_nowait())\n```",
        modelRatings: {
            "claude": { score: 9.8, note: "Caught the race condition. Flawless logic." },
            "gpt": { score: 8.5, note: "Fastest code, but unsafe for production." },
            "gemini": { score: 8.0, note: "Good middle ground, but missed the edge case (Gemini 3.0 Pro)." }
        },
        agreements: [
            "All models agree that `asyncio` is the correct library.",
            "Consensus on using a context manager for resource handling."
        ],
        disagreements: [
            "GPT prioritizes raw execution speed over thread safety.",
            "Claude insists on Semaphore vs Lock due to the flush requirement."
        ],
        conflicts: [],
        textHighlights: []
    };

    const mockRef = useRef<HTMLDivElement>(null);

    return (
        <section ref={sectionRef} className="py-24 bg-white/[0.02] border-y border-white/[0.04] overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Text Side */}
                    <div className="flex-1 text-center lg:text-left relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-6">
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                            Live Tribunal Demo
                        </div>

                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            See the <span className="gradient-text">Tribunal</span> think.
                        </h2>
                        <p className="text-zinc-400 text-lg mb-8">
                            Watch as our Judge AI adjudicates between conflicting answers from frontier models.
                        </p>

                        {/* The "Thinking" Animation */}
                        <div className="flex flex-col gap-4 p-6 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-sm max-w-md mx-auto lg:mx-0">
                            <div className="flex items-center gap-3 text-zinc-300 border-b border-white/5 pb-4 mb-2">
                                <span className="text-xl">🐍</span>
                                <span className="font-mono text-sm text-left">"Optimize this Python function for memory safety..."</span>
                            </div>

                            {/* Sequential Pulsing Witnesses */}
                            <div className="flex items-center justify-between px-2">
                                {/* Claude - Pulse 1 */}
                                <div className="flex flex-col items-center gap-2">
                                    <motion.div
                                        animate={isInView ? { scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] } : {}}
                                        transition={{ duration: 0.8, times: [0, 0.5, 1], delay: 0, repeat: Infinity, repeatDelay: 1.6 }}
                                        className="w-4 h-4 rounded-full bg-[#D97757] shadow-[0_0_15px_rgba(217,119,87,0.6)]"
                                    />
                                    <span className="text-[10px] uppercase tracking-wider text-zinc-500">Claude</span>
                                </div>
                                <div className="h-px w-8 bg-zinc-800" />
                                {/* GPT - Pulse 2 */}
                                <div className="flex flex-col items-center gap-2">
                                    <motion.div
                                        animate={isInView ? { scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] } : {}}
                                        transition={{ duration: 0.8, times: [0, 0.5, 1], delay: 0.8, repeat: Infinity, repeatDelay: 1.6 }}
                                        className="w-4 h-4 rounded-full bg-[#10A37F] shadow-[0_0_15px_rgba(16,163,127,0.6)]"
                                    />
                                    <span className="text-[10px] uppercase tracking-wider text-zinc-500">GPT</span>
                                </div>
                                <div className="h-px w-8 bg-zinc-800" />
                                {/* Gemini - Pulse 3 */}
                                <div className="flex flex-col items-center gap-2">
                                    <motion.div
                                        animate={isInView ? { scale: [1, 1.4, 1], opacity: [0.3, 1, 0.3] } : {}}
                                        transition={{ duration: 0.8, times: [0, 0.5, 1], delay: 1.6, repeat: Infinity, repeatDelay: 1.6 }}
                                        className="w-4 h-4 rounded-full bg-[#4285F4] shadow-[0_0_15px_rgba(66,133,244,0.6)]"
                                    />
                                    <span className="text-[10px] uppercase tracking-wider text-zinc-500">Gemini</span>
                                </div>
                            </div>

                            <div className="text-center text-xs text-purple-400 font-mono mt-2 flex items-center justify-center gap-2 h-4">
                                {showVerdict ? (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-green-400 font-bold tracking-widest"
                                    >
                                        VERDICT REACHED
                                    </motion.span>
                                ) : (
                                    <span className="animate-pulse">JUDGE ADJUDICATING...</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Card Side */}
                    <div className="flex-1 w-full max-w-2xl transform scale-95 lg:scale-100 transition-transform hover:scale-[1.02] duration-500">
                        <div className="relative">
                            <div className="absolute -inset-10 bg-gradient-to-r from-orange-500/20 via-purple-500/20 to-blue-500/20 blur-3xl rounded-full" />
                            <div className="relative">
                                {/* Only show card after "thinking" delay, or show loading state first if preferred. 
                                    User asked for "typing" effect. VerdictCard handles reveal animations. 
                                    Resetting key triggers re-animation. */}
                                <VerdictCard
                                    key={showVerdict ? "loaded" : "loading"} // Force re-render/animate
                                    analysis={showVerdict ? mockAnalysis : null}
                                    isLoading={!showVerdict}
                                    conflictMatrixRef={mockRef}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
