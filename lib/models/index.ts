/**
 * Model Adapter Factory
 * 
 * Central factory for creating model adapters.
 * Use getAdapter(modelId) to get an adapter for any configured model.
 */

import type { ModelAdapter, ModelConfig } from "./types";
import { getModelConfig, getActiveModelConfigs, getJudgeModelConfig } from "./registry";
import { createAnthropicAdapter } from "./adapters/anthropic";
import { createOpenAIAdapter } from "./adapters/openai";
import { createGoogleAdapter } from "./adapters/google";

// ============================================
// ADAPTER FACTORY
// ============================================

export function createAdapter(config: ModelConfig): ModelAdapter {
    switch (config.provider) {
        case "anthropic":
            return createAnthropicAdapter(config);
        case "openai":
            return createOpenAIAdapter(config);
        case "google":
            return createGoogleAdapter(config);
        default:
            throw new Error(`Unknown provider: ${config.provider}`);
    }
}

export function getAdapter(modelId: string): ModelAdapter {
    const config = getModelConfig(modelId);
    if (!config) {
        throw new Error(`Model not found: ${modelId}`);
    }
    return createAdapter(config);
}

// ============================================
// TRIBUNAL HELPERS
// ============================================

export function getActiveAdapters(): ModelAdapter[] {
    return getActiveModelConfigs().map(createAdapter);
}

export function getJudgeAdapter(): ModelAdapter {
    const config = getJudgeModelConfig();
    if (!config) {
        throw new Error("Judge model not configured");
    }
    return createAdapter(config);
}

// ============================================
// RE-EXPORTS
// ============================================

export {
    MODELS,
    TRIBUNAL_CONFIG,
    getModelConfig,
    getActiveModelConfigs,
    getJudgeModelConfig,
} from "./registry";

export type {
    ModelConfig,
    ModelProvider,
    ModelAdapter,
    TribunalConfig,
} from "./types";
