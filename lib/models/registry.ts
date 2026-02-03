/**
 * Model Registry
 * 
 * Central configuration for all available models.
 * To add a new model:
 * 1. Add entry to MODELS array
 * 2. Create adapter in adapters/ (if new provider)
 * 3. Add API key to .env.local
 * 4. Optionally update ACTIVE_MODELS
 */

import type { ModelConfig, TribunalConfig } from "./types";

// ============================================
// MODEL CONFIGURATIONS
// ============================================

export const MODELS: ModelConfig[] = [
    // Anthropic Models
    {
        id: "claude-opus-4.5",
        name: "Claude Opus 4.5",
        provider: "anthropic",
        modelName: "claude-opus-4-5-20251101",
        color: "#D97757",
        icon: "⟁",
        apiKeyEnv: "ANTHROPIC_API_KEY",
        thinkingEnabled: true,
        thinkingBudget: 10000,
    },
    {
        id: "claude-sonnet-4",
        name: "Claude Sonnet 4",
        provider: "anthropic",
        modelName: "claude-sonnet-4-20250514",
        color: "#D97757",
        icon: "⟁",
        apiKeyEnv: "ANTHROPIC_API_KEY",
    },

    // OpenAI Models
    {
        id: "gpt-5.2",
        name: "GPT-5.2",
        provider: "openai",
        modelName: "gpt-5.2",
        color: "#10A37F",
        icon: "◈",
        apiKeyEnv: "OPENAI_API_KEY",
    },
    {
        id: "gpt-4.1",
        name: "GPT-4.1",
        provider: "openai",
        modelName: "gpt-4.1",
        color: "#10A37F",
        icon: "◈",
        apiKeyEnv: "OPENAI_API_KEY",
    },
    {
        id: "o3",
        name: "o3",
        provider: "openai",
        modelName: "o3",
        color: "#10A37F",
        icon: "◈",
        apiKeyEnv: "OPENAI_API_KEY",
    },

    // Google Models
    {
        id: "gemini-3-pro",
        name: "Gemini 3 Pro",
        provider: "google",
        modelName: "gemini-3-pro-preview",
        color: "#4285F4",
        icon: "✦",
        apiKeyEnv: "GOOGLE_AI_API_KEY",
    },
    {
        id: "gemini-2.5-pro",
        name: "Gemini 2.5 Pro",
        provider: "google",
        modelName: "gemini-2.5-pro-preview-05-06",
        color: "#4285F4",
        icon: "✦",
        apiKeyEnv: "GOOGLE_AI_API_KEY",
    },

    // Future: Add more providers here
    // {
    //   id: "kimi-k2.5",
    //   name: "Kimi k2.5",
    //   provider: "moonshot",
    //   modelName: "kimi-k2.5-thinking",
    //   color: "#6366f1",
    //   icon: "🌙",
    //   apiKeyEnv: "MOONSHOT_API_KEY",
    // },
];

// ============================================
// ACTIVE MODEL SELECTION
// ============================================

export const TRIBUNAL_CONFIG: TribunalConfig = {
    // The 3 models that compete in the tribunal
    activeModels: ["claude-opus-4.5", "gpt-5.2", "gemini-3-pro"],

    // The model that analyzes and synthesizes the verdict
    judgeModel: "claude-opus-4.5",
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getModelConfig(modelId: string): ModelConfig | undefined {
    return MODELS.find((m) => m.id === modelId);
}

export function getActiveModelConfigs(): ModelConfig[] {
    return TRIBUNAL_CONFIG.activeModels
        .map((id) => getModelConfig(id))
        .filter((m): m is ModelConfig => m !== undefined);
}

export function getJudgeModelConfig(): ModelConfig | undefined {
    return getModelConfig(TRIBUNAL_CONFIG.judgeModel);
}

// Re-export types
export type { ModelConfig, ModelProvider, ModelAdapter, TribunalConfig } from "./types";
