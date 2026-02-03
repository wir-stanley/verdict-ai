"use client";

import { LLM_INFO, type LLMProvider } from "@/lib/types";
import { useEffect, useRef } from "react";

interface ResponsePanelProps {
    provider: LLMProvider;
    content: string;
    isStreaming: boolean;
    error?: string;
}

export function ResponsePanel({
    provider,
    content,
    isStreaming,
    error,
}: ResponsePanelProps) {
    const info = LLM_INFO[provider];
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current && isStreaming) {
            contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
    }, [content, isStreaming]);

    const glowClass = provider === "claude" ? "glow-claude" : provider === "gpt" ? "glow-gpt" : "glow-gemini";

    return (
        <div className={`relative h-full animate-fade-in-scale ${isStreaming ? glowClass : ""}`} style={{ animationDelay: `${provider === "claude" ? 0 : provider === "gpt" ? 100 : 200}ms` }}>
            {/* Subtle glow behind card */}
            <div
                className={`absolute -inset-2 rounded-3xl blur-xl transition-opacity duration-700 ${isStreaming ? "opacity-30" : "opacity-0"}`}
                style={{ backgroundColor: info.color }}
            />

            {/* Main card */}
            <div className="relative h-full glass rounded-2xl overflow-hidden flex flex-col transition-all duration-300 hover:border-white/10">
                {/* Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.04]">
                    {/* Provider icon with color */}
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium"
                        style={{
                            backgroundColor: `${info.color}15`,
                            color: info.color
                        }}
                    >
                        {info.icon}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-sm">{info.name}</h3>
                        <p className="text-[11px] text-zinc-500 truncate">{info.model}</p>
                    </div>

                    {/* Status indicator */}
                    {isStreaming && (
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <span
                                    className="block w-2 h-2 rounded-full animate-pulse"
                                    style={{ backgroundColor: info.color }}
                                />
                                <span
                                    className="absolute inset-0 w-2 h-2 rounded-full animate-ping opacity-75"
                                    style={{ backgroundColor: info.color }}
                                />
                            </div>
                            <span className="text-[11px] text-zinc-400">Streaming</span>
                        </div>
                    )}

                    {!isStreaming && content && !error && (
                        <div className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M20 6L9 17l-5-5" />
                            </svg>
                            <span className="text-[11px] text-zinc-400">Done</span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div
                    ref={contentRef}
                    className="flex-1 p-4 overflow-y-auto text-[13px] text-zinc-300 leading-relaxed"
                >
                    {error ? (
                        <div className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                            <svg className="w-4 h-4 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    ) : content ? (
                        <div className={`whitespace-pre-wrap ${isStreaming ? "typing-cursor" : ""}`}>
                            {content}
                        </div>
                    ) : isStreaming ? (
                        <div className="space-y-3">
                            <div className="h-4 rounded animate-shimmer w-3/4" />
                            <div className="h-4 rounded animate-shimmer w-full" />
                            <div className="h-4 rounded animate-shimmer w-5/6" />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-zinc-600 text-sm">
                            Awaiting query...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
