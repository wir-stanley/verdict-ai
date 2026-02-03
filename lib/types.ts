/**
 * UI Types
 * 
 * Types for UI components. Model info is derived from the registry.
 * This maintains backward compatibility while using the new model system.
 */

import { TRIBUNAL_CONFIG, getActiveModelConfigs, type ModelConfig } from "./models";

// Dynamic model ID type based on active models
export type ModelId = string;

// Legacy type alias for backward compatibility
export type LLMProvider = ModelId;

export interface LLMResponse {
    provider: ModelId;
    content: string;
    isComplete: boolean;
    error?: string;
}

export interface StreamChunk {
    provider: ModelId;
    content: string;
    done: boolean;
}

export interface ModelRating {
    score: number;
    note: string;
}

// Structured conflict for Arena View - shows where models disagree
export interface Conflict {
    topic: string;                          // What they disagree about
    positions: Record<ModelId, string>;     // Each model's position
    judgeNote?: string;                     // Judge's analysis of the conflict
    severity: string;                       // "minor" | "major" | "critical"
}

// Text highlight for inline heatmap - marks specific text spans in responses
export interface TextHighlight {
    modelId: ModelId;                       // Which model's response this is in
    text: string;                           // The exact text to highlight (substring match)
    type: "consensus" | "conflict";         // Green for consensus, Amber/Red for conflict
    conflictIndex?: number;                 // If conflict, which conflict this links to
    note?: string;                          // Brief explanation on hover
}

export interface TribunalAnalysis {
    consensusLevel: "full" | "partial" | "none";
    agreementCount: number;
    headline: string;
    verdict: string;
    agreements: string[];
    disagreements: string[];                // Legacy: simple string list
    conflicts?: Conflict[];                 // New: structured conflict objects
    textHighlights?: TextHighlight[];       // Inline text highlights for heatmap
    needsContext?: { modelId: ModelId; reason: string }[]; // Phase 11: Ambiguity Detection
    bestAnswer: string;
    modelRatings: Record<ModelId, ModelRating>;
    winner: ModelId | "tie";
}

// Re-export ModelConfig for UI usage
export type { ModelConfig } from "./models";

// Model info for UI components - derived from registry
function buildModelInfo(): Record<string, { name: string; model: string; color: string; icon: string }> {
    const info: Record<string, { name: string; model: string; color: string; icon: string }> = {};

    getActiveModelConfigs().forEach((model: ModelConfig) => {
        info[model.id] = {
            name: model.name,
            model: model.modelName,
            color: model.color,
            icon: model.icon,
        };
    });

    return info;
}

// Export for UI components - rebuilt on each access to reflect registry changes
export const LLM_INFO = buildModelInfo();

// Get active model IDs for iteration
export function getActiveModelIds(): ModelId[] {
    return TRIBUNAL_CONFIG.activeModels;
}
