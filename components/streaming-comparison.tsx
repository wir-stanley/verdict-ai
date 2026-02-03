"use client";

import { useMemo } from "react";
import { LLM_INFO, getActiveModelIds } from "@/lib/types";
import { motion } from "framer-motion";

interface StreamingComparisonProps {
    responses: Record<string, string>;
    streaming: Record<string, boolean>;
}

// Simple sentence tokenizer
function getSentences(text: string): string[] {
    return text
        .split(/[.!?]+/)
        .map(s => s.trim().toLowerCase())
        .filter(s => s.length > 10); // Ignore very short fragments
}

// Compute Jaccard similarity between two sets
function jaccardSimilarity(set1: Set<string>, set2: Set<string>): number {
    if (set1.size === 0 || set2.size === 0) return 0;

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
}

// Extract key phrases (simple n-grams)
function getKeyPhrases(text: string): Set<string> {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3);
    const phrases = new Set<string>();

    // Add bigrams
    for (let i = 0; i < words.length - 1; i++) {
        phrases.add(`${words[i]} ${words[i + 1]}`);
    }

    // Add trigrams
    for (let i = 0; i < words.length - 2; i++) {
        phrases.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }

    return phrases;
}

// Find common concepts across all responses
function findCommonConcepts(responses: Record<string, string>): string[] {
    const modelIds = getActiveModelIds();
    const allPhrases: Map<string, number> = new Map();

    modelIds.forEach(id => {
        const phrases = getKeyPhrases(responses[id] || '');
        phrases.forEach(phrase => {
            allPhrases.set(phrase, (allPhrases.get(phrase) || 0) + 1);
        });
    });

    // Return phrases that appear in 2+ models
    return Array.from(allPhrases.entries())
        .filter(([_, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([phrase]) => phrase);
}

export function StreamingComparison({ responses, streaming }: StreamingComparisonProps) {
    const modelIds = getActiveModelIds();
    const isAnyStreaming = Object.values(streaming).some(Boolean);

    // Compute real-time similarity matrix
    const similarityData = useMemo(() => {
        const data: { pair: [string, string]; similarity: number; label: string }[] = [];

        for (let i = 0; i < modelIds.length; i++) {
            for (let j = i + 1; j < modelIds.length; j++) {
                const id1 = modelIds[i];
                const id2 = modelIds[j];
                const phrases1 = getKeyPhrases(responses[id1] || '');
                const phrases2 = getKeyPhrases(responses[id2] || '');
                const similarity = jaccardSimilarity(phrases1, phrases2);

                const info1 = LLM_INFO[id1];
                const info2 = LLM_INFO[id2];

                data.push({
                    pair: [id1, id2],
                    similarity,
                    label: `${info1?.icon || ''} ↔ ${info2?.icon || ''}`
                });
            }
        }

        return data;
    }, [responses, modelIds]);

    // Find common concepts
    const commonConcepts = useMemo(() => findCommonConcepts(responses), [responses]);

    // Calculate overall consensus score
    const overallConsensus = useMemo(() => {
        if (similarityData.length === 0) return 0;
        const avg = similarityData.reduce((sum, d) => sum + d.similarity, 0) / similarityData.length;
        return Math.round(avg * 100);
    }, [similarityData]);

    // Don't show if no content yet
    const hasContent = modelIds.some(id => (responses[id]?.length || 0) > 50);
    if (!hasContent) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4 mb-4"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <span className="text-sm">📊</span>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Live Comparison</h3>
                        <p className="text-[10px] text-zinc-500">
                            {isAnyStreaming ? "Analyzing as models respond..." : "Analysis complete"}
                        </p>
                    </div>
                </div>

                {/* Overall consensus meter */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">Consensus</span>
                    <div className="relative w-16 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                        <motion.div
                            className="absolute inset-y-0 left-0 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${overallConsensus}%` }}
                            transition={{ duration: 0.5 }}
                            style={{
                                background: overallConsensus > 60
                                    ? "linear-gradient(to right, #22c55e, #4ade80)"
                                    : overallConsensus > 30
                                        ? "linear-gradient(to right, #f59e0b, #fbbf24)"
                                        : "linear-gradient(to right, #ef4444, #f87171)"
                            }}
                        />
                    </div>
                    <span className={`text-sm font-bold ${overallConsensus > 60 ? "text-green-400"
                            : overallConsensus > 30 ? "text-yellow-400"
                                : "text-red-400"
                        }`}>
                        {overallConsensus}%
                    </span>
                </div>
            </div>

            {/* Pairwise similarity meters */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                {similarityData.map(({ pair, similarity, label }) => {
                    const percent = Math.round(similarity * 100);
                    const info1 = LLM_INFO[pair[0]];
                    const info2 = LLM_INFO[pair[1]];

                    return (
                        <div key={pair.join('-')} className="text-center">
                            <div className="flex items-center justify-center gap-1.5 mb-1.5">
                                <span
                                    className="w-6 h-6 rounded flex items-center justify-center text-xs"
                                    style={{ backgroundColor: `${info1?.color}20`, color: info1?.color }}
                                >
                                    {info1?.icon}
                                </span>
                                <span className="text-zinc-600 text-xs">↔</span>
                                <span
                                    className="w-6 h-6 rounded flex items-center justify-center text-xs"
                                    style={{ backgroundColor: `${info2?.color}20`, color: info2?.color }}
                                >
                                    {info2?.icon}
                                </span>
                            </div>

                            <div className="relative h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                <motion.div
                                    className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                                    animate={{ width: `${percent}%` }}
                                    transition={{ duration: 0.3 }}
                                />
                            </div>

                            <span className="text-[10px] text-zinc-500 mt-1 block">
                                {percent}% overlap
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Common concepts - what models agree on */}
            {commonConcepts.length > 0 && (
                <div className="pt-3 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-400 text-xs">✓</span>
                        <span className="text-xs text-zinc-500">Emerging consensus on:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {commonConcepts.map((concept, i) => (
                            <motion.span
                                key={concept}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-400 text-[10px] border border-green-500/20"
                            >
                                {concept}
                            </motion.span>
                        ))}
                    </div>
                </div>
            )}

            {/* Streaming indicator */}
            {isAnyStreaming && (
                <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-center gap-2">
                    <motion.div
                        className="flex gap-1"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        {modelIds.map(id => {
                            const info = LLM_INFO[id];
                            const isStreaming = streaming[id];
                            return (
                                <div
                                    key={id}
                                    className={`w-2 h-2 rounded-full transition-all ${isStreaming ? "animate-pulse" : ""}`}
                                    style={{
                                        backgroundColor: isStreaming ? info?.color : "#3f3f46",
                                        boxShadow: isStreaming ? `0 0 8px ${info?.color}` : "none"
                                    }}
                                />
                            );
                        })}
                    </motion.div>
                    <span className="text-[10px] text-zinc-500">Updating in real-time...</span>
                </div>
            )}
        </motion.div>
    );
}
