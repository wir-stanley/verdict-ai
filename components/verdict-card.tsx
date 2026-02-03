"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { LLM_INFO, getActiveModelIds, type TribunalAnalysis } from "@/lib/types";
import { ConflictMatrix } from "./conflict-matrix";
import { HighlightedText } from "./highlighted-text";

interface VerdictCardProps {
    analysis: TribunalAnalysis | null;
    isLoading: boolean;
    conflictMatrixRef?: React.RefObject<HTMLDivElement | null>;
}

export function VerdictCard({ analysis, isLoading, conflictMatrixRef }: VerdictCardProps) {
    // If not loading and no analysis, show nothing (or handle error state upstream)
    if (!isLoading && !analysis) {
        return null;
    }

    const getConsensusColor = (level: string) => {
        switch (level) {
            case "full": return "from-green-500 to-emerald-500";
            case "partial": return "from-yellow-500 to-orange-500";
            case "none": return "from-red-500 to-rose-500";
            default: return "from-purple-500 to-blue-500";
        }
    };

    const getConsensusText = (level: string, count: number) => {
        if (level === "full") return "Full Consensus";
        if (level === "partial") return `${count}/3 Models Agree`;
        return "No Consensus";
    };

    const agreementsRef = React.useRef<HTMLDivElement>(null);

    return (
        <div className="w-full">
            <div className="relative">
                {/* Gradient glow - Animated */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.4 }}
                    transition={{ duration: 1 }}
                    className="absolute -inset-4 rounded-3xl blur-2xl bg-gradient-to-r from-orange-500/30 via-purple-500/30 to-blue-500/30 animate-pulse-glow"
                />

                {/* Main card */}
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative glass-strong rounded-2xl overflow-hidden"
                >
                    {/* Header */}
                    <div className="relative px-6 py-5 border-b border-white/[0.04]">
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-purple-500/5 to-blue-500/5" />

                        <div className="relative flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    initial={{ rotate: -10, scale: 0 }}
                                    animate={{ rotate: 0, scale: 1 }}
                                    transition={{ type: "spring" }}
                                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 via-purple-500/20 to-blue-500/20 flex items-center justify-center shrink-0 text-2xl"
                                >
                                    ⚖️
                                </motion.div>

                                <div>
                                    <h2 className="font-bold text-white text-xl">The Verdict</h2>
                                    {isLoading ? (
                                        <div className="h-4 w-40 rounded animate-shimmer mt-1" />
                                    ) : (
                                        <motion.p
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="text-sm text-zinc-400 mt-0.5"
                                        >
                                            {analysis?.headline}
                                        </motion.p>
                                    )}
                                </div>
                            </div>

                            {!isLoading && analysis && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2, type: "spring" }}
                                    className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${getConsensusColor(analysis.consensusLevel)} text-white text-xs font-semibold shrink-0`}
                                >
                                    {getConsensusText(analysis.consensusLevel, analysis.agreementCount)}
                                </motion.div>
                            )}

                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20"
                                >
                                    <svg className="w-3.5 h-3.5 animate-spin-slow text-purple-400" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    <span className="text-xs text-purple-300">Analyzing</span>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                exit={{ opacity: 0 }}
                                className="p-6 space-y-4"
                            >
                                <div className="space-y-2">
                                    <div className="h-4 rounded animate-shimmer w-full" />
                                    <div className="h-4 rounded animate-shimmer w-5/6" />
                                </div>
                                <div className="h-32 rounded-xl animate-shimmer" />
                            </motion.div>
                        ) : analysis && (
                            <motion.div
                                key="content"
                                initial="hidden"
                                animate="visible"
                                variants={{
                                    hidden: { opacity: 0 },
                                    visible: {
                                        opacity: 1,
                                        transition: { staggerChildren: 0.1 }
                                    }
                                }}
                                className="divide-y divide-white/[0.04]"
                            >
                                {/* Ambiguity Alert */}
                                {analysis.needsContext && analysis.needsContext.length > 0 && (
                                    <motion.div variants={{ hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } }}>
                                        <div className="p-6 bg-amber-500/10 border-b border-amber-500/20">
                                            {/* ... Ambiguity Content ... */}
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500 mt-0.5">
                                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <circle cx="12" cy="12" r="10" />
                                                        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                                                        <line x1="12" y1="17" x2="12.01" y2="17" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-semibold text-amber-400 mb-1">Clarification Suggested</h3>
                                                    <p className="text-xs text-zinc-400 mb-3">Some models requested more context to give a precise answer.</p>
                                                    <div className="space-y-2">
                                                        {analysis.needsContext.map((item, i) => {
                                                            const info = LLM_INFO[item.modelId];
                                                            return (
                                                                <div key={i} className="flex items-center gap-2 text-xs bg-amber-500/5 px-3 py-2 rounded-lg border border-amber-500/10">
                                                                    <span className="font-medium text-amber-300">{info?.name || item.modelId}:</span>
                                                                    <span className="text-zinc-300">"{item.reason}"</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Verdict summary */}
                                <motion.div
                                    variants={{ hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                                    className="p-6"
                                >
                                    <div className="text-zinc-300 leading-relaxed">
                                        <HighlightedText
                                            text={analysis.verdict}
                                            modelId="master"
                                            highlights={analysis.textHighlights || []}
                                            onConflictClick={(index) => {
                                                if (conflictMatrixRef?.current) {
                                                    conflictMatrixRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
                                                }
                                            }}
                                            onConsensusClick={() => {
                                                if (agreementsRef.current) {
                                                    agreementsRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
                                                }
                                            }}
                                        />
                                    </div>
                                </motion.div>

                                {/* Model ratings */}
                                <motion.div
                                    variants={{ hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                                    className="p-6"
                                >
                                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Model Performance</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        {getActiveModelIds().map((modelId) => {
                                            const info = LLM_INFO[modelId];
                                            const rating = analysis.modelRatings[modelId];
                                            const isWinner = analysis.winner === modelId;

                                            if (!info) return null;

                                            return (
                                                <motion.div
                                                    key={modelId}
                                                    whileHover={{ y: -2 }}
                                                    className={`relative p-4 rounded-xl border transition-all ${isWinner
                                                        ? "border-yellow-500/30 bg-yellow-500/5"
                                                        : "border-white/[0.04] bg-white/[0.02]"
                                                        }`}
                                                >
                                                    {isWinner && (
                                                        <motion.div
                                                            initial={{ scale: 0, rotate: -45 }}
                                                            animate={{ scale: 1, rotate: 15 }}
                                                            transition={{ type: "spring", delay: 0.5 }}
                                                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-xs shadow-lg shadow-yellow-500/20"
                                                        >
                                                            👑
                                                        </motion.div>
                                                    )}
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span style={{ color: info.color }}>{info.icon}</span>
                                                        <span className="text-sm font-medium text-white">{info.name.split(" ")[0]}</span>
                                                    </div>
                                                    <div className="flex items-baseline gap-1 mb-1">
                                                        <span className="text-2xl font-bold text-white">{rating?.score || "?"}</span>
                                                        <span className="text-xs text-zinc-500">/10</span>
                                                    </div>
                                                    <p className="text-xs text-zinc-500 line-clamp-2">{rating?.note}</p>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </motion.div>

                                {/* Best Answer */}
                                <motion.div
                                    variants={{ hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                                    className="p-6"
                                >
                                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Synthesized Best Answer</h3>
                                    <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/5 to-emerald-500/5 border border-green-500/10">
                                        <div className="prose prose-sm prose-invert max-w-none text-zinc-300 leading-relaxed">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    h1: ({ children }) => <h1 className="text-lg font-bold text-white mt-4 mb-2">{children}</h1>,
                                                    h2: ({ children }) => <h2 className="text-base font-semibold text-white mt-3 mb-2">{children}</h2>,
                                                    h3: ({ children }) => <h3 className="text-sm font-semibold text-white mt-2 mb-1">{children}</h3>,
                                                    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                                                    ul: ({ children }) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
                                                    ol: ({ children }) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
                                                    li: ({ children }) => <li className="text-zinc-300">{children}</li>,
                                                    strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                                                    em: ({ children }) => <em className="italic text-zinc-200">{children}</em>,
                                                    code: ({ children, className }) => {
                                                        const isInline = !className;
                                                        return isInline ? (
                                                            <code className="px-1.5 py-0.5 bg-white/10 rounded text-pink-300 text-[13px] font-mono">{children}</code>
                                                        ) : (
                                                            <code className="block p-3 bg-black/40 rounded-lg text-[13px] font-mono overflow-x-auto">{children}</code>
                                                        );
                                                    },
                                                    pre: ({ children }) => <pre className="bg-black/40 rounded-lg p-4 overflow-x-auto mb-3">{children}</pre>,
                                                    a: ({ href, children }) => <a href={href} className="text-blue-400 hover:underline">{children}</a>,
                                                }}
                                            >
                                                {analysis.bestAnswer}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Agreements */}
                                {(analysis.agreements.length > 0 || analysis.textHighlights?.some(h => h.type === "consensus")) && (
                                    <motion.div
                                        variants={{ hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                                        ref={agreementsRef}
                                        className="p-6 border-b border-white/[0.04]"
                                    >
                                        <h3 className="text-xs font-semibold text-green-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <span>✓</span> Consensus Points
                                        </h3>
                                        {/* ... (Agreements list content same as before) ... */}
                                        {analysis.agreements.length > 0 ? (
                                            <ul className="space-y-2">
                                                {analysis.agreements.map((item, i) => (
                                                    <li key={i} className="text-sm text-zinc-400 flex items-start gap-2">
                                                        <span className="text-green-500 mt-1">•</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-sm text-zinc-500 italic">
                                                See highlighted text in the verdict for consensus details.
                                            </p>
                                        )}
                                    </motion.div>
                                )}

                                {/* CONFLICT MATRIX */}
                                {analysis.conflicts && analysis.conflicts.length > 0 && (
                                    <motion.div
                                        variants={{ hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                                        className="border-t border-white/[0.04]"
                                    >
                                        <ConflictMatrix ref={conflictMatrixRef} conflicts={analysis.conflicts} />
                                    </motion.div>
                                )}

                                {/* Legacy disagreements (if no conflicts) */}
                                {(!analysis.conflicts || analysis.conflicts.length === 0) && analysis.disagreements.length > 0 && (
                                    <motion.div
                                        variants={{ hidden: { y: 10, opacity: 0 }, visible: { y: 0, opacity: 1 } }}
                                        className="p-6 bg-amber-500/5"
                                    >
                                        <h3 className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            <span className="animate-pulse">⚠️</span> Model Disagreements
                                        </h3>
                                        <ul className="space-y-2">
                                            {analysis.disagreements.map((item, i) => (
                                                <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                                                    <span className="text-amber-500 mt-1">!</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
