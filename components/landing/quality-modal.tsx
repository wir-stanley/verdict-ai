"use client";

import { motion, AnimatePresence } from "framer-motion";

interface QualityModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function QualityModal({ isOpen, onClose }: QualityModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md p-6 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl"
                    >
                        <h3 className="text-xl font-bold text-white mb-6">The Tribunal Quality Manifesto</h3>

                        <div className="space-y-6">
                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <span className="text-purple-500">01.</span> Zero Quantization
                                </h4>
                                <p className="text-sm text-zinc-400">
                                    We never use "compressed" models. You get 100% of the model's reasoning weight (FP16/BF16), avoiding the "lobotomy" of 4-bit quantization.
                                </p>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <span className="text-purple-500">02.</span> Flagship Consistency
                                </h4>
                                <p className="text-sm text-zinc-400">
                                    No stealth-routing to "mini" models. If the UI says <strong>GPT-5.2</strong>, the API hits <strong>GPT-5.2</strong>. We pull the heavy levers every single time.
                                </p>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <span className="text-purple-500">03.</span> Diverse Personalities
                                </h4>
                                <p className="text-sm text-zinc-400">
                                    Each witness is calibrated with a unique cognitive bias (Security vs. Speed vs. Creativity) to ensure a 360-degree technical review.
                                </p>
                            </div>

                            <div className="space-y-1">
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <span className="text-purple-500">04.</span> High-Stakes Adjudication
                                </h4>
                                <p className="text-sm text-zinc-400">
                                    Our Judge AI is always a Tier-1 Frontier model (e.g., Claude Opus 4.5), ensuring the synthesis is as intellectually rigorous as the witnesses themselves.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="mt-6 w-full py-3 rounded-xl bg-white text-black font-semibold hover:bg-zinc-200 transition-colors"
                        >
                            Understood
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
