"use client";

import { useState, useEffect, forwardRef } from "react";
import { LLM_INFO, type Conflict } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

interface ConflictMatrixProps {
    conflicts: Conflict[];
    onHighlightModel?: (modelId: string | null) => void;
}

export const ConflictMatrix = forwardRef<HTMLDivElement, ConflictMatrixProps>(
    function ConflictMatrix({ conflicts, onHighlightModel }, ref) {
        const [expandedConflict, setExpandedConflict] = useState<number | null>(null);
        const [hoveredModel, setHoveredModel] = useState<string | null>(null);

        // Listen for expand events from RawResponses
        useEffect(() => {
            const handleExpandConflict = (e: CustomEvent<{ index: number }>) => {
                setExpandedConflict(e.detail.index);
            };

            window.addEventListener("expandConflict", handleExpandConflict as EventListener);
            return () => window.removeEventListener("expandConflict", handleExpandConflict as EventListener);
        }, []);

        if (!conflicts || conflicts.length === 0) {
            return (
                <div className="p-6 text-center text-zinc-500">
                    <span className="text-2xl mb-2 block">✓</span>
                    <p className="text-sm">All models reached consensus</p>
                </div>
            );
        }

        const getSeverityConfig = (severity: string) => {
            switch (severity) {
                case "critical":
                    return {
                        bg: "bg-red-500/10",
                        border: "border-red-500/30",
                        hoverBg: "hover:bg-red-500/15",
                        badge: "bg-red-500/20 text-red-400",
                        glow: "shadow-red-500/20",
                        icon: "🔴",
                        label: "CRITICAL",
                    };
                case "major":
                    return {
                        bg: "bg-orange-500/10",
                        border: "border-orange-500/30",
                        hoverBg: "hover:bg-orange-500/15",
                        badge: "bg-orange-500/20 text-orange-400",
                        glow: "shadow-orange-500/20",
                        icon: "🟠",
                        label: "MAJOR",
                    };
                default:
                    return {
                        bg: "bg-yellow-500/10",
                        border: "border-yellow-500/30",
                        hoverBg: "hover:bg-yellow-500/15",
                        badge: "bg-yellow-500/20 text-yellow-400",
                        glow: "shadow-yellow-500/20",
                        icon: "🟡",
                        label: "MINOR",
                    };
            }
        };

        return (
            <div ref={ref} className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
                            <span className="text-xl">⚔️</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-white">Conflict Matrix</h3>
                            <p className="text-xs text-zinc-500">
                                {conflicts.length} point{conflicts.length !== 1 ? "s" : ""} of disagreement
                            </p>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-3 text-[10px]">
                        <div className="flex items-center gap-1.5">
                            <span>🟡</span>
                            <span className="text-zinc-500">Minor</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span>🟠</span>
                            <span className="text-zinc-500">Major</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span>🔴</span>
                            <span className="text-zinc-500">Critical</span>
                        </div>
                    </div>
                </div>

                {/* Conflict Cards */}
                <div className="space-y-3">
                    {conflicts.map((conflict, index) => {
                        const config = getSeverityConfig(conflict.severity);
                        const isExpanded = expandedConflict === index;
                        const modelIds = Object.keys(conflict.positions);

                        return (
                            <motion.div
                                key={index}
                                layout
                                className={`
                                rounded-xl border cursor-pointer transition-all duration-200
                                ${config.border} ${config.bg} ${config.hoverBg}
                                ${isExpanded ? `shadow-lg ${config.glow}` : ""}
                            `}
                                onClick={() => setExpandedConflict(isExpanded ? null : index)}
                            >
                                {/* Conflict Header - Always Visible */}
                                <div className="p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        {/* Topic */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-sm">{config.icon}</span>
                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${config.badge}`}>
                                                    {config.label}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-medium text-white leading-snug">
                                                {conflict.topic}
                                            </h4>
                                        </div>

                                        {/* Model Avatars */}
                                        <div className="flex -space-x-2">
                                            {modelIds.map((modelId) => {
                                                const info = LLM_INFO[modelId];
                                                if (!info) return null;
                                                return (
                                                    <div
                                                        key={modelId}
                                                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs border-2 border-[#0a0a0a] transition-transform hover:scale-110 hover:z-10"
                                                        style={{
                                                            backgroundColor: `${info.color}30`,
                                                            color: info.color,
                                                        }}
                                                        onMouseEnter={() => {
                                                            setHoveredModel(modelId);
                                                            onHighlightModel?.(modelId);
                                                        }}
                                                        onMouseLeave={() => {
                                                            setHoveredModel(null);
                                                            onHighlightModel?.(null);
                                                        }}
                                                    >
                                                        {info.icon}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Expand Icon */}
                                        <motion.div
                                            animate={{ rotate: isExpanded ? 180 : 0 }}
                                            className="text-zinc-500"
                                        >
                                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M6 9l6 6 6-6" />
                                            </svg>
                                        </motion.div>
                                    </div>
                                </div>

                                {/* Expanded Content - Model Positions */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 border-t border-white/[0.06] pt-4">
                                                {/* Model Positions */}
                                                <div className="space-y-3 mb-4">
                                                    {modelIds.map((modelId) => {
                                                        const info = LLM_INFO[modelId];
                                                        const position = conflict.positions[modelId];
                                                        if (!info) return null;

                                                        return (
                                                            <motion.div
                                                                key={modelId}
                                                                initial={{ x: -10, opacity: 0 }}
                                                                animate={{ x: 0, opacity: 1 }}
                                                                transition={{ delay: modelIds.indexOf(modelId) * 0.1 }}
                                                                className={`
                                                                rounded-lg p-3 border transition-all
                                                                ${hoveredModel === modelId
                                                                        ? "border-white/20 bg-white/[0.04]"
                                                                        : "border-white/[0.06] bg-white/[0.02]"
                                                                    }
                                                            `}
                                                                onMouseEnter={() => {
                                                                    setHoveredModel(modelId);
                                                                    onHighlightModel?.(modelId);
                                                                }}
                                                                onMouseLeave={() => {
                                                                    setHoveredModel(null);
                                                                    onHighlightModel?.(null);
                                                                }}
                                                            >
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <span
                                                                        className="w-5 h-5 rounded flex items-center justify-center text-xs"
                                                                        style={{
                                                                            backgroundColor: `${info.color}20`,
                                                                            color: info.color,
                                                                        }}
                                                                    >
                                                                        {info.icon}
                                                                    </span>
                                                                    <span
                                                                        className="text-xs font-medium"
                                                                        style={{ color: info.color }}
                                                                    >
                                                                        {info.name}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-zinc-300 leading-relaxed">
                                                                    "{position}"
                                                                </p>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Judge's Analysis Overlay */}
                                                {conflict.judgeNote && (
                                                    <motion.div
                                                        initial={{ y: 10, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        transition={{ delay: 0.3 }}
                                                        className="rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-4"
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/30 to-blue-500/30 flex items-center justify-center shrink-0">
                                                                <span className="text-sm">⚖️</span>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-medium text-purple-300 mb-1">
                                                                    Judge's Analysis
                                                                </p>
                                                                <p className="text-sm text-zinc-300 leading-relaxed">
                                                                    {conflict.judgeNote}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Summary Stats */}
                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="text-lg font-bold text-yellow-400">
                                {conflicts.filter((c) => c.severity === "minor").length}
                            </div>
                            <div className="text-[10px] text-zinc-500 uppercase">Minor</div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-orange-400">
                                {conflicts.filter((c) => c.severity === "major").length}
                            </div>
                            <div className="text-[10px] text-zinc-500 uppercase">Major</div>
                        </div>
                        <div>
                            <div className="text-lg font-bold text-red-400">
                                {conflicts.filter((c) => c.severity === "critical").length}
                            </div>
                            <div className="text-[10px] text-zinc-500 uppercase">Critical</div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);
