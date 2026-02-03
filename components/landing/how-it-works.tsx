"use client";

import { motion } from "framer-motion";

export function HowItWorks() {
    return (
        <section className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">
                        <span className="gradient-text">How it works</span>
                    </h2>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                        We orchestrated a tribunal of the world&apos;s best AI models to ensure you get the most accurate answer possible.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 relative z-10">
                    {/* Step 1: Ask */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-purple-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative p-8 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-sm h-full">
                            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-6 text-3xl">
                                🗣️
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-white">1. Ask Once</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Submit your query to our unified interface. We handle the complexity of prompting multiple models simultaneously.
                            </p>
                        </div>
                    </div>

                    {/* Step 2: Synthesize */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative p-8 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-sm h-full">
                            <div className="w-16 h-16 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 text-3xl">
                                ⚡
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-white">2. Tribunal Debate</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                Claude, GPT-5, and Gemini debate your query in real-time. Our Judge AI identifies conflicts, consensus, and hallucinations.
                            </p>

                            {/* Visual representation of 3 models */}
                            <div className="mt-6 flex items-center justify-center gap-4 opacity-50">
                                <div className="w-2 h-2 rounded-full bg-[#D97757]" />
                                <div className="w-2 h-2 rounded-full bg-[#10A37F]" />
                                <div className="w-2 h-2 rounded-full bg-[#4285F4]" />
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Decide */}
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="relative p-8 rounded-3xl bg-black/40 border border-white/10 backdrop-blur-sm h-full">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-3xl">
                                ⚖️
                            </div>
                            <h3 className="text-xl font-bold mb-4 text-white">3. Final Verdict</h3>
                            <p className="text-zinc-400 leading-relaxed">
                                You get a synthesized "Best Answer" along with a detailed report on where the models agreed and disagreed.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-[45%] left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent -z-10" />
            </div>
        </section>
    );
}
