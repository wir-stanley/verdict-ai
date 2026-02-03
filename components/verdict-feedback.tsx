"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { LLM_INFO, getActiveModelIds } from "@/lib/types";
import type { Id } from "@/convex/_generated/dataModel";

interface VerdictFeedbackProps {
    queryId?: Id<"queries">;
    winner?: string;
}

export function VerdictFeedback({ queryId, winner }: VerdictFeedbackProps) {
    const { user } = useUser();
    const [helpful, setHelpful] = useState<boolean | null>(null);
    const [correctWinner, setCorrectWinner] = useState<boolean | null>(null);
    const [suggestedWinner, setSuggestedWinner] = useState<string>("");
    const [comment, setComment] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [showComment, setShowComment] = useState(false);

    const submitFeedback = useMutation(api.feedback.submitFeedback);

    const existingFeedback = useQuery(
        api.feedback.getFeedbackForQuery,
        queryId && user?.id ? { queryId, clerkId: user.id } : "skip"
    );

    // Load existing feedback if present
    useEffect(() => {
        if (existingFeedback) {
            setHelpful(existingFeedback.helpful);
            setCorrectWinner(existingFeedback.correctWinner ?? null);
            setSuggestedWinner(existingFeedback.suggestedWinner ?? "");
            setComment(existingFeedback.comment ?? "");
            setSubmitted(true);
        }
    }, [existingFeedback]);

    const handleSubmit = async () => {
        if (!queryId || !user?.id || helpful === null) return;

        try {
            await submitFeedback({
                queryId,
                clerkId: user.id,
                helpful,
                correctWinner: correctWinner ?? undefined,
                suggestedWinner: suggestedWinner || undefined,
                comment: comment || undefined,
            });
            setSubmitted(true);
        } catch (error) {
            console.error("Failed to submit feedback:", error);
        }
    };

    if (!queryId || !user) return null;

    const modelIds = getActiveModelIds();

    return (
        <div className="animate-fade-in">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-orange-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-white">Help us improve</h3>
                        <p className="text-xs text-zinc-500">Your feedback trains our verdict engine</p>
                    </div>
                </div>

                {/* Was this helpful? */}
                <div className="mb-6">
                    <p className="text-sm text-zinc-400 mb-3">Was this verdict helpful?</p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setHelpful(true)}
                            className={`flex-1 py-3 px-4 rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${helpful === true
                                    ? "border-green-500/50 bg-green-500/10 text-green-400"
                                    : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/10 hover:bg-white/[0.04]"
                                }`}
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                            Yes
                        </button>
                        <button
                            onClick={() => setHelpful(false)}
                            className={`flex-1 py-3 px-4 rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${helpful === false
                                    ? "border-red-500/50 bg-red-500/10 text-red-400"
                                    : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/10 hover:bg-white/[0.04]"
                                }`}
                        >
                            <svg className="w-5 h-5 rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                            No
                        </button>
                    </div>
                </div>

                {/* Did we pick the right winner? */}
                {winner && winner !== "tie" && helpful !== null && (
                    <div className="mb-6 animate-fade-in">
                        <p className="text-sm text-zinc-400 mb-3">
                            Did we pick the right winner?
                            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-white/[0.06]" style={{ color: LLM_INFO[winner]?.color || "#a855f7" }}>
                                {LLM_INFO[winner]?.name || winner}
                            </span>
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setCorrectWinner(true); setSuggestedWinner(""); }}
                                className={`flex-1 py-3 px-4 rounded-xl border transition-all duration-200 ${correctWinner === true
                                        ? "border-green-500/50 bg-green-500/10 text-green-400"
                                        : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/10 hover:bg-white/[0.04]"
                                    }`}
                            >
                                Yes, correct
                            </button>
                            <button
                                onClick={() => setCorrectWinner(false)}
                                className={`flex-1 py-3 px-4 rounded-xl border transition-all duration-200 ${correctWinner === false
                                        ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                                        : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/10 hover:bg-white/[0.04]"
                                    }`}
                            >
                                No, wrong pick
                            </button>
                        </div>
                    </div>
                )}

                {/* Suggest correct winner */}
                {correctWinner === false && (
                    <div className="mb-6 animate-fade-in">
                        <p className="text-sm text-zinc-400 mb-3">Which model should have won?</p>
                        <div className="flex gap-2 flex-wrap">
                            {modelIds.filter(id => id !== winner).map((modelId) => (
                                <button
                                    key={modelId}
                                    onClick={() => setSuggestedWinner(modelId)}
                                    className={`py-2 px-4 rounded-xl border transition-all duration-200 flex items-center gap-2 ${suggestedWinner === modelId
                                            ? "border-purple-500/50 bg-purple-500/10"
                                            : "border-white/[0.06] bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                                        }`}
                                    style={{ color: LLM_INFO[modelId]?.color || "#a855f7" }}
                                >
                                    <span>{LLM_INFO[modelId]?.icon}</span>
                                    <span className="text-sm">{LLM_INFO[modelId]?.name || modelId}</span>
                                </button>
                            ))}
                            <button
                                onClick={() => setSuggestedWinner("tie")}
                                className={`py-2 px-4 rounded-xl border transition-all duration-200 flex items-center gap-2 ${suggestedWinner === "tie"
                                        ? "border-purple-500/50 bg-purple-500/10 text-purple-400"
                                        : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:border-white/10 hover:bg-white/[0.04]"
                                    }`}
                            >
                                <span>⚖️</span>
                                <span className="text-sm">It was a tie</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Optional comment */}
                {helpful !== null && (
                    <div className="mb-6 animate-fade-in">
                        {!showComment ? (
                            <button
                                onClick={() => setShowComment(true)}
                                className="text-sm text-zinc-500 hover:text-zinc-400 transition-colors"
                            >
                                + Add a comment (optional)
                            </button>
                        ) : (
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Tell us more about your experience..."
                                className="w-full bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50 resize-none"
                                rows={3}
                            />
                        )}
                    </div>
                )}

                {/* Submit button */}
                {helpful !== null && (
                    <button
                        onClick={handleSubmit}
                        disabled={submitted}
                        className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${submitted
                                ? "bg-green-500/20 text-green-400 cursor-default"
                                : "bg-gradient-to-r from-purple-500 to-orange-500 text-white hover:from-purple-400 hover:to-orange-400"
                            }`}
                    >
                        {submitted ? (
                            <span className="flex items-center justify-center gap-2">
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 6L9 17l-5-5" />
                                </svg>
                                Thanks for your feedback!
                            </span>
                        ) : (
                            "Submit Feedback"
                        )}
                    </button>
                )}
            </div>
        </div>
    );
}
