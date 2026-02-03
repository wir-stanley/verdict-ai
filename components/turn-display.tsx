"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { VerdictCard } from "@/components/verdict-card";
import { VerdictFeedback } from "@/components/verdict-feedback";
import { RawResponses } from "@/components/raw-responses";
import { StreamingComparison } from "@/components/streaming-comparison";
import type { TribunalAnalysis } from "@/lib/types";
import type { Id } from "@/convex/_generated/dataModel";

export interface TurnData {
    id: string; // Client-side ID for keys
    queryId: Id<"queries"> | null;
    prompt: string;
    responses: Record<string, string>;
    streaming: Record<string, boolean>;
    errors: Record<string, string | undefined>;
    analysis: TribunalAnalysis | null;
    isAnalyzing: boolean;
    streamingComplete: boolean;
    timestamp: number;
}

interface TurnDisplayProps {
    turn: TurnData;
    isLast: boolean;
}

export function TurnDisplay({ turn, isLast }: TurnDisplayProps) {
    const [highlightedModel, setHighlightedModel] = useState<string | null>(null);
    const conflictMatrixRef = useRef<HTMLDivElement>(null);

    const isAnyStreaming = Object.values(turn.streaming).some(Boolean);
    const activeModelIds = Object.keys(turn.responses);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col gap-6 py-8 border-b border-white/[0.04]"
        >
            {/* User Prompt */}
            <div className="flex items-start gap-4 max-w-4xl mx-auto w-full px-4">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0">
                    👤
                </div>
                <div className="bg-zinc-800/50 rounded-2xl rounded-tl-sm px-6 py-4 text-zinc-100">
                    <p className="whitespace-pre-wrap">{turn.prompt}</p>
                </div>
            </div>

            {/* AI Turn */}
            <div className="max-w-4xl mx-auto w-full px-4 flex flex-col gap-6">

                {/* Streaming Status */}
                {isAnyStreaming && (
                    <div className="text-center animate-fade-in self-center">
                        <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06]">
                            <div className="flex gap-1.5">
                                {activeModelIds.map((p) => (
                                    <div
                                        key={p}
                                        className={`w-2 h-2 rounded-full transition-all duration-300 ${turn.streaming[p] ? "animate-pulse" : ""}`}
                                        style={{
                                            backgroundColor: turn.streaming[p] ? "#a855f7" : turn.responses[p] ? "#22c55e" : "#3f3f46"
                                        }}
                                    />
                                ))}
                            </div>
                            <span className="text-sm text-zinc-400">
                                Gathering responses...
                            </span>
                        </div>
                    </div>
                )}

                {/* Live Streaming Comparison */}
                {isAnyStreaming && (
                    <StreamingComparison responses={turn.responses} streaming={turn.streaming} />
                )}

                {/* Verdict Card */}
                {(turn.isAnalyzing || turn.analysis) && turn.streamingComplete && (
                    <VerdictCard
                        analysis={turn.analysis}
                        isLoading={turn.isAnalyzing}
                        conflictMatrixRef={conflictMatrixRef}
                    />
                )}

                {/* Feedback */}
                {turn.analysis && turn.streamingComplete && turn.queryId && (
                    <VerdictFeedback queryId={turn.queryId} winner={turn.analysis.winner} />
                )}

                {/* Raw Responses */}
                {turn.streamingComplete && (
                    <RawResponses
                        responses={turn.responses}
                        errors={turn.errors}
                        conflicts={turn.analysis?.conflicts}
                        textHighlights={turn.analysis?.textHighlights}
                        highlightedModel={highlightedModel}
                        onModelHover={setHighlightedModel}
                        conflictMatrixRef={conflictMatrixRef}
                    />
                )}
            </div>
        </motion.div >
    );
}
