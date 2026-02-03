"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { type TextHighlight, LLM_INFO } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

interface HighlightedTextProps {
    text: string;
    modelId: string;
    highlights: TextHighlight[];
    onConflictClick?: (conflictIndex: number) => void;
    onConsensusClick?: () => void;
}

interface HighlightSegment {
    text: string;
    highlight?: TextHighlight;
    startIndex: number;
}

export function HighlightedText({
    text,
    modelId,
    highlights,
    onConflictClick,
    onConsensusClick,
}: HighlightedTextProps) {
    const [hoveredHighlight, setHoveredHighlight] = useState<TextHighlight | null>(null);
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

    // Filter highlights for this model
    const modelHighlights = useMemo(
        () => highlights.filter((h) => h.modelId === modelId),
        [highlights, modelId]
    );

    // Split text into segments: highlighted and non-highlighted
    const segments = useMemo((): HighlightSegment[] => {
        if (modelHighlights.length === 0) {
            return [{ text, startIndex: 0 }];
        }

        const result: HighlightSegment[] = [];
        let lastEnd = 0;

        // Find all highlight positions and sort by start index
        const positions: { start: number; end: number; highlight: TextHighlight }[] = [];

        for (const highlight of modelHighlights) {
            const start = text.toLowerCase().indexOf(highlight.text.toLowerCase());
            if (start !== -1) {
                positions.push({
                    start,
                    end: start + highlight.text.length,
                    highlight,
                });
            }
        }

        // Sort by start position
        positions.sort((a, b) => a.start - b.start);

        for (const pos of positions) {
            // Add non-highlighted text before this highlight
            if (pos.start > lastEnd) {
                result.push({
                    text: text.slice(lastEnd, pos.start),
                    startIndex: lastEnd,
                });
            }

            // Add highlighted text
            if (pos.start >= lastEnd) {
                result.push({
                    text: text.slice(pos.start, pos.end),
                    highlight: pos.highlight,
                    startIndex: pos.start,
                });
                lastEnd = pos.end;
            }
        }

        // Add remaining text
        if (lastEnd < text.length) {
            result.push({
                text: text.slice(lastEnd),
                startIndex: lastEnd,
            });
        }

        return result;
    }, [text, modelHighlights]);

    const handleMouseEnter = (
        highlight: TextHighlight,
        e: React.MouseEvent
    ) => {
        const element = e.currentTarget as HTMLElement;
        const rects = element.getClientRects();
        let targetRect = element.getBoundingClientRect();

        // Find the specific line segment being hovered
        for (let i = 0; i < rects.length; i++) {
            const r = rects[i];
            if (e.clientY >= r.top && e.clientY <= r.bottom && e.clientX >= r.left && e.clientX <= r.right) {
                targetRect = r as DOMRect;
                break;
            }
        }

        setTooltipPosition({
            x: targetRect.left + targetRect.width / 2,
            y: targetRect.top,
        });
        setHoveredHighlight(highlight);
    };

    const handleMouseLeave = () => {
        setHoveredHighlight(null);
    };

    const handleClick = (highlight: TextHighlight) => {
        if (highlight.type === "conflict" && highlight.conflictIndex !== undefined) {
            onConflictClick?.(highlight.conflictIndex);
        } else if (highlight.type === "consensus") {
            onConsensusClick?.();
        }
    };

    // If no highlights, just return the text
    if (modelHighlights.length === 0) {
        return <span>{text}</span>;
    }

    return (
        <>
            {segments.map((segment, i) => {
                if (!segment.highlight) {
                    return <span key={i}>{segment.text}</span>;
                }

                const isConsensus = segment.highlight.type === "consensus";
                const isConflict = segment.highlight.type === "conflict";

                return (
                    <span
                        key={i}
                        className={`
                            relative inline cursor-pointer transition-all duration-200
                            ${isConsensus
                                ? "bg-green-500/20 border-b-2 border-green-500/50 hover:bg-green-500/30"
                                : "bg-orange-500/20 border-b-2 border-orange-500/50 hover:bg-orange-500/30"
                            }
                            rounded-sm px-0.5
                        `}
                        onMouseEnter={(e) => handleMouseEnter(segment.highlight!, e)}
                        // onMouseMove removed to prevent following cursor
                        onMouseLeave={handleMouseLeave}
                        onClick={() => handleClick(segment.highlight!)}
                    >
                        {segment.text}
                        {/* Inline indicator */}
                        <span className="text-[10px] ml-1 opacity-60">
                            {isConsensus ? "✓" : "⚔️"}
                        </span>
                    </span>
                );
            })}

            {/* Floating tooltip - Portalled to body to escape transform contexts */}
            {hoveredHighlight && typeof document !== "undefined" && createPortal(
                <AnimatePresence>
                    <motion.div
                        key="tooltip"
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="fixed z-[100] px-3 py-2 rounded-lg shadow-xl max-w-xs pointer-events-none"
                        style={{
                            left: tooltipPosition.x,
                            top: tooltipPosition.y - 10,
                            transform: "translate(-50%, -100%)",
                            backgroundColor: hoveredHighlight.type === "consensus"
                                ? "rgba(34, 197, 94, 0.95)"
                                : "rgba(249, 115, 22, 0.95)",
                        }}
                    >
                        <div className="text-xs text-white font-medium mb-1">
                            {hoveredHighlight.type === "consensus" ? "✓ Consensus" : "⚔️ Conflict"}
                        </div>
                        {hoveredHighlight.note && (
                            <div className="text-xs text-white/90">
                                {hoveredHighlight.note}
                            </div>
                        )}
                        {hoveredHighlight.type === "conflict" && hoveredHighlight.conflictIndex !== undefined && (
                            <div className="text-[10px] text-white/70 mt-1">
                                Click to view full analysis →
                            </div>
                        )}
                        {hoveredHighlight.type === "consensus" && (
                            <div className="text-[10px] text-white/70 mt-1">
                                Click to view points →
                            </div>
                        )}
                        {/* Tooltip arrow */}
                        <div
                            className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-full w-0 h-0"
                            style={{
                                borderLeft: "6px solid transparent",
                                borderRight: "6px solid transparent",
                                borderTop: `6px solid ${hoveredHighlight.type === "consensus"
                                    ? "rgba(34, 197, 94, 0.95)"
                                    : "rgba(249, 115, 22, 0.95)"}`,
                            }}
                        />
                    </motion.div>
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}

// Legend component for the heatmap
export function HeatmapLegend() {
    return (
        <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-green-500/30 border border-green-500/50" />
                Consensus
            </span>
            <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-orange-500/30 border border-orange-500/50" />
                Conflict
            </span>
        </div>
    );
}
