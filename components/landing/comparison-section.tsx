"use client";

import { motion } from "framer-motion";

export function ComparisonSection() {
    return (
        <section className="py-24 bg-[#0A0A0A]">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        From Tab-Switching Fatigue to <span className="gradient-text">Instant Certainty</span>.
                    </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
                    {/* BEFORE: The Pain */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col"
                    >
                        <div className="text-sm font-bold text-red-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                            <span>❌</span> The Old Way
                        </div>
                        <div className="relative flex-1 rounded-2xl border border-white/5 bg-zinc-900/50 overflow-hidden font-sans select-none min-h-[300px]">
                            {/* Browser Bar */}
                            <div className="h-8 bg-zinc-800 border-b border-white/5 flex items-center px-3 gap-2">
                                <div className="flex gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                                </div>
                                <div className="flex-1 bg-zinc-900 rounded-md h-5 ml-4" />
                            </div>

                            {/* Tabs Chaos */}
                            <div className="flex border-b border-white/5 text-xs text-zinc-400 bg-zinc-800/50">
                                <div className="px-3 py-2 border-r border-white/5 flex items-center gap-2 bg-zinc-800 text-zinc-300">
                                    <span>ChatGPT...</span>
                                    <span>×</span>
                                </div>
                                <div className="px-3 py-2 border-r border-white/5 flex items-center gap-2">
                                    <span>Claude...</span>
                                    <span>×</span>
                                </div>
                                <div className="px-3 py-2 border-r border-white/5 flex items-center gap-2">
                                    <span>Gemini...</span>
                                    <span>×</span>
                                </div>
                                <div className="px-3 py-2 flex items-center">+</div>
                            </div>

                            {/* Chaotic Content Mock */}
                            <div className="p-6 opacity-50 relative pointer-events-none">
                                <div className="space-y-4 filter blur-[1px]">
                                    <div className="w-3/4 h-4 bg-zinc-700 rounded" />
                                    <div className="w-1/2 h-4 bg-zinc-700 rounded" />
                                    <div className="w-full h-24 bg-zinc-800 rounded p-4">
                                        <div className="w-full h-2 bg-zinc-700/50 rounded mb-2" />
                                        <div className="w-5/6 h-2 bg-zinc-700/50 rounded mb-2" />
                                        <div className="w-4/6 h-2 bg-zinc-700/50 rounded" />
                                    </div>
                                    <div className="w-5/6 h-4 bg-zinc-700 rounded mt-8" />
                                    <div className="w-full h-12 bg-red-500/10 border border-red-500/20 rounded flex items-center justify-center text-red-400 text-xs">
                                        Wait... which one is right?
                                    </div>
                                </div>

                                {/* Frustrated Cursor Overlay */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-xs text-red-200">
                                    Manual Comparison = Pain 😫
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* AFTER: The Verdict */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="flex flex-col"
                    >
                        <div className="text-sm font-bold text-green-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                            <span>✅</span> verdict.ai
                        </div>
                        <div className="relative flex-1 rounded-2xl border border-green-500/20 bg-gradient-to-b from-green-500/5 to-transparent overflow-hidden min-h-[300px]">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-green-500">⚖️</div>
                                        <div className="font-bold text-white">Verdict</div>
                                    </div>
                                    <div className="px-2 py-1 rounded-full bg-green-500/10 text-green-400 text-xs font-medium">
                                        Consensus Reached
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                                        <div className="h-2 w-3/4 bg-green-500/30 rounded mb-2" />
                                        <div className="h-2 w-1/2 bg-green-500/30 rounded" />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="h-16 w-1/3 bg-white/5 rounded-lg border border-white/5" />
                                        <div className="h-16 w-1/3 bg-white/5 rounded-lg border border-white/5" />
                                        <div className="h-16 w-1/3 bg-white/5 rounded-lg border border-white/5" />
                                    </div>
                                </div>

                                <div className="absolute bottom-6 right-6">
                                    <div className="px-4 py-2 rounded-lg bg-green-500 text-black text-xs font-bold shadow-lg shadow-green-500/20">
                                        Problem Solved.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
