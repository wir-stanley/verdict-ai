"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { HowItWorks } from "@/components/landing/how-it-works";
import { DemoSection } from "@/components/landing/demo-section";
import { TrustSection } from "@/components/landing/trust-section";
import { ComparisonSection } from "@/components/landing/comparison-section";
import { QualityModal } from "@/components/landing/quality-modal";
import { OpenAILogo, AnthropicLogo, GeminiLogo } from "@/components/icons";

export default function MarketingPage() {
    const [isQualityModalOpen, setIsQualityModalOpen] = useState(false);
    const spotsData = useQuery(api.users.getRemainingSpots);

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-purple-500/30">
            <QualityModal isOpen={isQualityModalOpen} onClose={() => setIsQualityModalOpen(false)} />

            {/* Noise overlay */}
            <div className="noise-overlay" />

            {/* Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] bg-gradient-to-b from-purple-900/30 via-purple-900/10 to-transparent rounded-full blur-3xl" />
                <div className="absolute top-1/4 -left-60 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl" />
                <div className="absolute top-1/3 -right-60 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-50">
                {/* Nav */}
                <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
                    <div className="text-xl font-bold gradient-text">verdict.ai</div>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/sign-in"
                            className="text-sm text-zinc-400 hover:text-white transition-colors hidden md:block"
                        >
                            Sign in
                        </Link>
                        <div className="relative group">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-purple-600 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-200"></div>
                            <Link
                                href="/sign-up"
                                className="relative flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-black text-white hover:bg-zinc-900 transition-all border border-white/10"
                            >
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Apply for Alpha
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Hero */}
                <section className="container mx-auto px-6 pt-20 pb-24 text-center">
                    <div className="max-w-5xl mx-auto">
                        {/* Technical Badge */}
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06] mb-8 animate-fade-in hover:bg-white/[0.05] transition-colors cursor-default">
                            <div className="flex -space-x-2">
                                <div className="w-6 h-6 rounded-full bg-[#10A37F] flex items-center justify-center border border-black p-1">
                                    <OpenAILogo className="w-full h-full text-white" />
                                </div>
                                <div className="w-6 h-6 rounded-full bg-[#D97757] flex items-center justify-center border border-black p-1">
                                    <AnthropicLogo className="w-full h-full text-white" />
                                </div>
                                <div className="w-6 h-6 rounded-full bg-[#4285F4] flex items-center justify-center border border-black p-0.5">
                                    <GeminiLogo className="w-full h-full text-white" />
                                </div>
                            </div>
                            <span className="text-sm text-zinc-400 font-mono">Real-time synthesis: ChatGPT • Anthropic • Gemini</span>
                        </div>

                        {/* Title - "Stop Guessing" */}
                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tight mb-8 animate-fade-in">
                            <span className="gradient-text">Stop Guessing.</span>
                            <br />
                            <span className="text-white relative">
                                Get the Verdict.
                                <svg className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-3 md:h-6 text-purple-500 opacity-50" viewBox="0 0 100 10" preserveAspectRatio="none">
                                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="2" fill="none" />
                                </svg>
                            </span>
                        </h1>

                        {/* Subtitle - "Tie Breaker" */}
                        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 animate-fade-in leading-relaxed">
                            When <strong>ChatGPT</strong> and <strong>Claude</strong> disagree, you lose hours to manual research.
                            Our Judge AI adjudicates the logic to give you the definitive answer instantly.
                        </p>

                        {/* CTA with Scarcity */}
                        <div className="flex flex-col items-center gap-4 animate-fade-in">
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                                <Link
                                    href="/sign-up"
                                    className="group relative px-8 py-4 rounded-xl font-semibold text-lg overflow-hidden shadow-2xl shadow-purple-900/30"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-purple-600 transition-transform duration-300 group-hover:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    <span className="relative flex items-center gap-2 text-white">
                                        Apply for Alpha Access
                                        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M5 12h14M12 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </Link>
                                <Link
                                    href="#demo"
                                    className="px-8 py-4 rounded-xl font-medium text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                                >
                                    See the Tribunal
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M19 9l-7 7-7-7" />
                                    </svg>
                                </Link>
                            </div>

                            {/* Live Status Badge */}
                            <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${
                                spotsData?.remaining === 0
                                    ? "text-orange-400 bg-orange-500/10 border-orange-500/20"
                                    : "text-green-400 bg-green-500/10 border-green-500/20"
                            }`}>
                                <span className="relative flex h-2 w-2">
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                                        spotsData?.remaining === 0 ? "bg-orange-400" : "bg-green-400"
                                    }`}></span>
                                    <span className={`relative inline-flex rounded-full h-2 w-2 ${
                                        spotsData?.remaining === 0 ? "bg-orange-500" : "bg-green-500"
                                    }`}></span>
                                </span>
                                {spotsData?.remaining === 0
                                    ? "Today's cohort is full — join waitlist"
                                    : `${spotsData?.remaining ?? "..."} spots remaining for today's cohort`
                                }
                            </div>

                            {/* Transparency Link */}
                            <button
                                onClick={() => setIsQualityModalOpen(true)}
                                className="text-xs text-zinc-500 hover:text-zinc-300 underline underline-offset-2 transition-colors mt-2"
                            >
                                Why a waitlist? Read our stance on Inference Quality.
                            </button>
                        </div>
                    </div>
                </section>

                {/* Optimized For - Target Interests */}
                <div className="w-full border-y border-white/[0.04] bg-white/[0.01] py-6 mb-24">
                    <div className="container mx-auto px-6 text-center">
                        <p className="text-sm font-medium text-zinc-500 uppercase tracking-widest mb-0">
                            Optimized for High-Stakes Logic
                        </p>
                        <div className="mt-4 flex flex-wrap justify-center items-center gap-4 md:gap-8 text-zinc-400 font-mono text-sm md:text-base">
                            <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
                                <span>🦀</span> Rust
                            </span>
                            <span className="text-zinc-800">|</span>
                            <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
                                <span>🐍</span> Python
                            </span>
                            <span className="text-zinc-800">|</span>
                            <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
                                <span>⚛️</span> React
                            </span>
                            <span className="text-zinc-800">|</span>
                            <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
                                <span>⚖️</span> Legal Review
                            </span>
                            <span className="text-zinc-800">|</span>
                            <span className="flex items-center gap-2 hover:text-white transition-colors cursor-default">
                                <span>🔬</span> Scientific Research
                            </span>
                        </div>
                    </div>
                </div>

                {/* Comparison Section */}
                <ComparisonSection />

                {/* How it Works */}
                <HowItWorks />

                {/* Demo Section */}
                <div id="demo">
                    <DemoSection />
                </div>

                <TrustSection />

                {/* Footer */}
                <footer className="border-t border-white/[0.04] py-12 bg-black/20 backdrop-blur-sm">
                    <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="text-sm text-zinc-600">
                            © 2026 verdict.ai. All rights reserved.
                        </div>
                        <div className="flex items-center gap-6 text-sm text-zinc-500">
                            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                            <Link href="#" className="hover:text-white transition-colors">Contact</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </div>
    );
}
