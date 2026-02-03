"use client";

interface MetaAnalysisProps {
    analysis: string;
    isLoading: boolean;
}

export function MetaAnalysis({ analysis, isLoading }: MetaAnalysisProps) {
    if (!isLoading && !analysis) {
        return null;
    }

    return (
        <div className="w-full animate-fade-in" style={{ animationDelay: "300ms" }}>
            <div className="relative">
                {/* Gradient glow */}
                <div className="absolute -inset-3 rounded-3xl blur-2xl opacity-30 bg-gradient-to-r from-orange-500/40 via-purple-500/40 to-blue-500/40 animate-pulse-glow" />

                {/* Main card */}
                <div className="relative glass-strong rounded-2xl overflow-hidden">
                    {/* Header with gradient */}
                    <div className="relative px-6 py-4 border-b border-white/[0.04] overflow-hidden">
                        {/* Subtle gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-purple-500/5 to-blue-500/5" />

                        <div className="relative flex items-center gap-4">
                            {/* Icon */}
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 via-purple-500/20 to-blue-500/20 flex items-center justify-center">
                                <span className="text-xl">⚖️</span>
                            </div>

                            <div className="flex-1">
                                <h3 className="font-bold text-white text-lg">The Verdict</h3>
                                <p className="text-xs text-zinc-400">
                                    Intelligent synthesis across all models
                                </p>
                            </div>

                            {isLoading && (
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                                    <svg className="w-3.5 h-3.5 animate-spin-slow text-purple-400" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    <span className="text-xs text-purple-300">Analyzing</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {isLoading ? (
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <div className="h-4 rounded animate-shimmer w-1/4" />
                                    <div className="h-4 rounded animate-shimmer w-full" />
                                    <div className="h-4 rounded animate-shimmer w-5/6" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 rounded animate-shimmer w-1/3" />
                                    <div className="h-4 rounded animate-shimmer w-full" />
                                    <div className="h-4 rounded animate-shimmer w-2/3" />
                                </div>
                            </div>
                        ) : (
                            <div className="prose prose-sm max-w-none text-zinc-300 leading-relaxed">
                                <div className="whitespace-pre-wrap">{analysis}</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
