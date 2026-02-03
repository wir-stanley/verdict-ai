"use client";

import { useState } from "react";
import { LLM_INFO, getActiveModelIds, type Conflict, type TextHighlight } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { HighlightedText, HeatmapLegend } from "./highlighted-text";

interface RawResponsesProps {
    responses: Record<string, string>;
    errors: Record<string, string | undefined>;
    conflicts?: Conflict[];
    textHighlights?: TextHighlight[];
    highlightedModel?: string | null;
    onModelHover?: (modelId: string | null) => void;
    conflictMatrixRef?: React.RefObject<HTMLDivElement | null>;
}

export function RawResponses({
    responses,
    errors,
    conflicts = [],
    textHighlights = [],
    highlightedModel,
    onModelHover,
    conflictMatrixRef
}: RawResponsesProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [showHeatmap, setShowHeatmap] = useState(false);

    const modelIds = getActiveModelIds();
    const hasAnyContent = modelIds.some((p) => responses[p] || errors[p]);

    // Set first model as active tab if none selected
    if (activeTab === null && modelIds.length > 0 && responses[modelIds[0]]) {
        setActiveTab(modelIds[0]);
    }

    // Count conflicts per model
    const getConflictsForModel = (modelId: string) => {
        const modelConflicts = conflicts
            .map((c, i) => ({ index: i, conflict: c }))
            .filter(({ conflict }) => conflict.positions && modelId in conflict.positions);
        return { count: modelConflicts.length, conflicts: modelConflicts };
    };

    // Get severity color
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "critical": return { bg: "bg-red-500", text: "text-red-400", border: "border-red-500/30" };
            case "major": return { bg: "bg-orange-500", text: "text-orange-400", border: "border-orange-500/30" };
            default: return { bg: "bg-yellow-500", text: "text-yellow-400", border: "border-yellow-500/30" };
        }
    };

    // Scroll to conflict matrix
    const scrollToConflict = (conflictIndex: number) => {
        if (conflictMatrixRef?.current) {
            conflictMatrixRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
            window.dispatchEvent(new CustomEvent("expandConflict", { detail: { index: conflictIndex } }));
        }
    };

    if (!hasAnyContent) {
        return null;
    }

    const activeContent = activeTab ? responses[activeTab] : null;
    const activeError = activeTab ? errors[activeTab] : null;
    const activeInfo = activeTab ? LLM_INFO[activeTab] : null;
    const activeConflicts = activeTab ? getConflictsForModel(activeTab) : { count: 0, conflicts: [] };

    return (
        <div className="w-full animate-fade-in">
            {/* Header with toggle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-center gap-2 py-4 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
                <svg
                    className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path d="M19 9l-7 7-7-7" />
                </svg>
                <span className="font-medium">{isExpanded ? "Hide" : "Show"} Model Responses</span>
                {conflicts.length > 0 && (
                    <span className="ml-2 px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">
                        ⚔️ {conflicts.length} conflict{conflicts.length !== 1 ? "s" : ""}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        {/* Tab bar - Model selector */}
                        <div className="flex items-center gap-1 p-2 bg-white/[0.02] rounded-xl mb-4">
                            {modelIds.map((modelId) => {
                                const info = LLM_INFO[modelId];
                                if (!info) return null;

                                const isActive = activeTab === modelId;
                                const { count: conflictCount } = getConflictsForModel(modelId);
                                const hasResponse = !!responses[modelId];
                                const hasError = !!errors[modelId];

                                return (
                                    <button
                                        key={modelId}
                                        onClick={() => setActiveTab(modelId)}
                                        onMouseEnter={() => onModelHover?.(modelId)}
                                        onMouseLeave={() => onModelHover?.(null)}
                                        className={`
                                            flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-lg
                                            transition-all duration-200 relative
                                            ${isActive
                                                ? "bg-white/[0.08] shadow-lg"
                                                : "hover:bg-white/[0.04]"
                                            }
                                            ${!hasResponse && !hasError ? "opacity-50" : ""}
                                        `}
                                        disabled={!hasResponse && !hasError}
                                    >
                                        {/* Model icon */}
                                        <div
                                            className={`
                                                w-10 h-10 rounded-xl flex items-center justify-center text-lg
                                                transition-all duration-200
                                                ${isActive ? "scale-110" : ""}
                                            `}
                                            style={{
                                                backgroundColor: isActive ? `${info.color}25` : `${info.color}10`,
                                                color: info.color,
                                                boxShadow: isActive ? `0 0 20px ${info.color}30` : "none"
                                            }}
                                        >
                                            {info.icon}
                                        </div>

                                        {/* Model name */}
                                        <div className="text-left">
                                            <div className={`font-semibold text-sm ${isActive ? "text-white" : "text-zinc-400"}`}>
                                                {info.name}
                                            </div>
                                            <div className="text-xs text-zinc-500 truncate max-w-[100px]">
                                                {info.model}
                                            </div>
                                        </div>

                                        {/* Conflict badge */}
                                        {conflictCount > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center">
                                                {conflictCount}
                                            </span>
                                        )}

                                        {/* Active indicator */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeTab"
                                                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full"
                                                style={{ backgroundColor: info.color }}
                                            />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Heatmap Controls */}
                        {textHighlights.length > 0 && (
                            <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] rounded-lg mb-4">
                                <HeatmapLegend />
                                <button
                                    onClick={() => setShowHeatmap(!showHeatmap)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                                        ${showHeatmap
                                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                            : "bg-white/[0.04] text-zinc-400 border border-white/[0.06]"
                                        }
                                    `}
                                >
                                    <span>{showHeatmap ? "🔥" : "📝"}</span>
                                    {showHeatmap ? "Heatmap ON" : "Heatmap OFF"}
                                </button>
                            </div>
                        )}

                        {/* Content Area - Full width, larger text */}
                        {activeTab && activeInfo && (
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="glass rounded-2xl overflow-hidden"
                            >
                                {/* Content header */}
                                <div
                                    className="flex items-center gap-4 px-6 py-4 border-b border-white/[0.06]"
                                    style={{ borderLeft: `4px solid ${activeInfo.color}` }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
                                        style={{ backgroundColor: `${activeInfo.color}20`, color: activeInfo.color }}
                                    >
                                        {activeInfo.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-white">{activeInfo.name}</h3>
                                        <p className="text-sm text-zinc-500">{activeInfo.model}</p>
                                    </div>

                                    {/* Conflict badges for active model */}
                                    {activeConflicts.count > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {activeConflicts.conflicts.map(({ index, conflict }) => {
                                                const colors = getSeverityColor(conflict.severity);
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={() => scrollToConflict(index)}
                                                        title={conflict.topic} // Show full text on hover
                                                        className={`
                                                            px-3 py-1.5 rounded-full text-xs font-medium transition-all
                                                            ${colors.text} bg-white/[0.05] hover:bg-white/[0.1]
                                                            border ${colors.border}
                                                        `}
                                                    >
                                                        ⚔️ {conflict.topic.length > 25
                                                            ? conflict.topic.substring(0, 25) + "..."
                                                            : conflict.topic}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    {/* Char count */}
                                    {activeContent && (
                                        <span className="text-sm text-zinc-500">
                                            {activeContent.length.toLocaleString()} chars
                                        </span>
                                    )}
                                </div>

                                {/* Response content - LARGER text, more padding */}
                                <div className="p-6">
                                    {activeError ? (
                                        <div className="text-red-400 text-base">{activeError}</div>
                                    ) : activeContent ? (
                                        <div className="prose prose-invert prose-lg max-w-none prose-p:text-zinc-300 prose-p:leading-relaxed prose-headings:text-white prose-code:text-purple-300 prose-pre:bg-black/30">
                                            {showHeatmap && textHighlights.length > 0 ? (
                                                <div className="text-base leading-relaxed text-zinc-300 whitespace-pre-wrap">
                                                    <HighlightedText
                                                        text={activeContent}
                                                        modelId={activeTab}
                                                        highlights={textHighlights}
                                                        onConflictClick={scrollToConflict}
                                                    />
                                                </div>
                                            ) : (
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{activeContent}</ReactMarkdown>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-zinc-600 italic text-base">No response received</span>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Conflict legend */}
                        {conflicts.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-white/[0.04] flex items-center justify-center gap-6 text-sm text-zinc-500">
                                <span>Click conflict tags to jump to analysis</span>
                                <div className="flex gap-4">
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" /> Minor
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Major
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Critical
                                    </span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
