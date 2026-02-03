"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function TrustSection() {
    return (
        <section className="py-24 relative">
            <div className="container mx-auto px-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-sm font-medium mb-8">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                        Private Alpha
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold mb-8">
                        Join the <span className="gradient-text">Tribunal</span>.
                    </h2>

                    <p className="text-zinc-400 text-lg mb-12">
                        We are currently onboarding 10 users per day to ensure system stability and quality.
                        Apply now to secure your spot in the queue.
                    </p>

                    <Link
                        href="/sign-up"
                        className="group relative inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-lg overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-purple-600 transition-transform duration-300 group-hover:scale-105" />
                        <span className="relative text-white flex items-center gap-2">
                            Apply for Alpha Access
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </span>
                    </Link>

                    {/* <div className="mt-12 flex items-center justify-center gap-8 text-zinc-600 grayscale opacity-60">
                    </div> */}
                </motion.div>
            </div>
        </section>
    );
}
