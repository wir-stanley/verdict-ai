"use client";

import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { LLM_INFO } from "@/lib/types";

interface HistorySidebarProps {
    onSelectQuery: (query: {
        prompt: string;
        responses: Record<string, string>;
        analysis?: {
            consensusLevel: string;
            agreementCount: number;
            headline: string;
            verdict: string;
            bestAnswer: string;
            winner: string;
            conflicts?: Array<{
                topic: string;
                positions: Record<string, string>;
                judgeNote?: string | null;
                severity: string;
            }>;
            textHighlights?: Array<{
                modelId: string;
                text: string;
                type: string;
                conflictIndex?: number | null;
                note?: string | null;
            }>;
        };
    }) => void;
    onNewChat: () => void;
}

export function HistorySidebar({ onSelectQuery, onNewChat }: HistorySidebarProps) {
    const { user } = useUser();
    const deleteQuery = useMutation(api.queries.deleteQuery);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [timedOut, setTimedOut] = useState(false);

    // If usage is skipped, queries is undefined.
    // We should only show spinner if we EXPECT a result.
    // If not logged in, show unrelated message.

    // @ts-ignore
    const queries = useQuery(
        // @ts-ignore
        api.queries.getUserQueriesV2 || api.queries.getUserQueries,
        user ? { clerkId: user.id } : "skip"
    );

    useEffect(() => {
        if (user && queries === undefined) {
            const timer = setTimeout(() => setTimedOut(true), 10000);
            return () => clearTimeout(timer);
        }
        setTimedOut(false);
    }, [user, queries]);


    const formatTimeAgo = (timestamp: number) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Just now";
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    const truncatePrompt = (prompt: string, maxLength = 50) => {
        if (prompt.length <= maxLength) return prompt;
        return prompt.substring(0, maxLength) + "...";
    };

    return (
        <div
            className={`fixed left-0 top-0 h-full z-50 flex transition-all duration-300 ${isCollapsed ? "w-12" : "w-72"
                }`}
        >
            {/* Sidebar content */}
            <div className={`h-full bg-[#0a0a0a] border-r border-white/[0.04] flex flex-col ${isCollapsed ? "w-12" : "w-72"
                }`}>
                {/* Header */}
                <div className="p-4 border-b border-white/[0.04] flex items-center justify-between">
                    {!isCollapsed && (
                        <h2 className="text-sm font-semibold text-zinc-400">History</h2>
                    )}
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors text-zinc-500 hover:text-white"
                    >
                        <svg
                            className={`w-4 h-4 transition-transform ${isCollapsed ? "rotate-180" : ""}`}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                </div>

                {/* New Chat Button */}
                <div className={`px-4 pt-4 pb-2 ${isCollapsed ? "flex justify-center px-2" : ""}`}>
                    <button
                        onClick={onNewChat}
                        className={`w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 transition-colors rounded-lg font-medium group ${isCollapsed ? "p-2 h-8 w-8" : "py-2.5 px-4"
                            }`}
                        title="New Chat"
                    >
                        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14m-7-7h14" />
                        </svg>
                        {!isCollapsed && <span>New Chat</span>}
                    </button>
                </div>

                {/* Query list */}
                {!isCollapsed && (
                    <div className="flex-1 overflow-y-auto py-2">
                        {!user && (
                            <div className="px-4 py-8 text-center">
                                <p className="text-sm text-zinc-600">Sign in to see history</p>
                            </div>
                        )}

                        {user && !queries && (
                            <div className="px-4 py-8 text-center">
                                {timedOut ? (
                                    <p className="text-xs text-red-400">
                                        Loading timed out.<br />
                                        Try refreshing.
                                    </p>
                                ) : (
                                    <div className="w-6 h-6 border-2 border-zinc-600 border-t-purple-500 rounded-full animate-spin mx-auto" />
                                )}
                            </div>
                        )}

                        {user && queries && queries.length === 0 && (
                            <div className="px-4 py-8 text-center">
                                <p className="text-sm text-zinc-600">No queries yet</p>
                            </div>
                        )}

                        {queries && queries.map((query) => (
                            <div
                                key={query._id}
                                className="group/item relative w-full"
                            >
                                <button
                                    onClick={() => onSelectQuery({
                                        prompt: query.prompt,
                                        responses: query.responses,
                                        analysis: query.analysis,
                                    })}
                                    className="w-full px-4 py-3 text-left hover:bg-white/[0.02] transition-colors border-b border-white/[0.02] group"
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Winner badge */}
                                        {query.analysis?.winner && query.analysis.winner !== "tie" && LLM_INFO[query.analysis.winner] && (
                                            <div
                                                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 mt-0.5"
                                                style={{
                                                    backgroundColor: `${LLM_INFO[query.analysis.winner].color}20`,
                                                    color: LLM_INFO[query.analysis.winner].color
                                                }}
                                            >
                                                {LLM_INFO[query.analysis.winner].icon}
                                            </div>
                                        )}
                                        {(!query.analysis?.winner || query.analysis.winner === "tie") && (
                                            <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-xs shrink-0 mt-0.5 text-zinc-500">
                                                ⚖️
                                            </div>
                                        )}

                                        <div className="flex-1 min-w-0 pr-6">
                                            <p className="text-sm text-zinc-300 group-hover:text-white transition-colors line-clamp-2">
                                                {truncatePrompt(query.prompt)}
                                            </p>
                                            <p className="text-xs text-zinc-600 mt-1">
                                                {formatTimeAgo(query.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                </button>

                                {/* Delete Button - Visible on Hover */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm("Delete this chat?")) {
                                            deleteQuery({ queryId: query._id });
                                        }
                                    }}
                                    className="absolute right-2 top-3 p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-white/5 opacity-0 group-hover/item:opacity-100 transition-all"
                                    title="Delete Chat"
                                >
                                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Collapsed state - show icon only */}
                {isCollapsed && (
                    <div className="flex-1 flex items-start justify-center pt-4">
                        <svg className="w-5 h-5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                )}
            </div>
        </div>
    );
}
