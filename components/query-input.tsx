"use client";

import { useState, FormEvent, useRef, useEffect } from "react";

interface QueryInputProps {
    onSubmit: (prompt: string) => void;
    onStop?: () => void;
    isLoading: boolean;
    placeholder?: string;
}

export function QueryInput({ onSubmit, onStop, isLoading, placeholder }: QueryInputProps) {
    const [prompt, setPrompt] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (prompt.trim() && !isLoading) {
            onSubmit(prompt.trim());
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [prompt]);

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto animate-fade-in">
            <div className="relative group">
                {/* Animated gradient border */}
                <div
                    className={`absolute -inset-[1px] rounded-2xl transition-opacity duration-500 ${isFocused ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                        }`}
                >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 animate-gradient" />
                </div>

                {/* Glow effect */}
                <div
                    className={`absolute -inset-4 rounded-3xl blur-2xl transition-opacity duration-500 ${isFocused ? "opacity-40" : "opacity-0"
                        }`}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 via-purple-500/30 to-blue-500/30" />
                </div>

                {/* Main input container */}
                <div className="relative glass-strong rounded-2xl overflow-hidden">
                    <textarea
                        ref={textareaRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder={placeholder || "Ask anything across AI models..."}
                        className="w-full bg-transparent text-white placeholder:text-zinc-500 px-5 pt-5 pb-2 pr-32 text-[15px] leading-relaxed resize-none focus:outline-none min-h-[60px] max-h-[200px]"
                        disabled={false} // Allow typing while generating
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                                handleSubmit(e);
                            }
                        }}
                    />

                    {/* Bottom bar - seamless with textarea */}
                    <div className="flex items-center justify-between px-5 pb-4 pt-2">
                        <div className="flex items-center gap-3 text-xs text-zinc-600">
                            <span className="flex items-center gap-1.5">
                                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-500 font-mono text-[10px]">⌘</kbd>
                                <span>+</span>
                                <kbd className="px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-500 font-mono text-[10px]">↵</kbd>
                                <span className="ml-1">to send</span>
                            </span>
                        </div>

                        <button
                            type={isLoading ? "button" : "submit"}
                            onClick={isLoading ? onStop : undefined}
                            disabled={(!prompt.trim() && !isLoading)}
                            className={`relative px-5 py-2.5 rounded-xl font-medium text-sm overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed group/btn transition-colors ${isLoading ? "bg-red-500/20 hover:bg-red-500/30" : ""}`}
                        >
                            {/* Button gradient background - Only show if NOT loading (or use red for stop) */}
                            {!isLoading && (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-purple-600 transition-transform duration-300 group-hover/btn:scale-105" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-purple-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                                </>
                            )}

                            {/* Stop background */}
                            {isLoading && (
                                <div className="absolute inset-0 bg-red-500/20" />
                            )}

                            <span className="relative flex items-center gap-2 text-white">
                                {isLoading ? (
                                    <>
                                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                            <rect x="6" y="6" width="12" height="12" rx="2" />
                                        </svg>
                                        Stop
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        Query All
                                    </>
                                )}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}
