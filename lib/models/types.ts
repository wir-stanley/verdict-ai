/**
 * Model Registry Types
 * 
 * Defines the interfaces for config-driven model management.
 * Adding a new model only requires adding a config entry and adapter.
 */

// Supported model providers
export type ModelProvider = "anthropic" | "openai" | "google" | "moonshot";

// Model configuration
export interface ModelConfig {
    id: string;
    name: string;
    provider: ModelProvider;
    modelName: string;          // API model name (e.g., "claude-opus-4-5-20251101")
    color: string;              // UI accent color
    icon: string;               // UI icon/emoji
    apiKeyEnv: string;          // Environment variable name for API key
    thinkingEnabled?: boolean;  // For models with thinking/reasoning mode
    thinkingBudget?: number;    // Token budget for thinking
}

// Chat message type
export interface Message {
    role: "user" | "assistant" | "system";
    content: string;
}

// Unified model adapter interface
export interface ModelAdapter {
    config: ModelConfig;

    // Stream response chunks
    stream(input: string | Message[]): AsyncGenerator<string, void, unknown>;

    // Get complete response (for judge/analysis)
    complete(input: string | Message[]): Promise<string>;
}

// Active model selection for tribunal
export interface TribunalConfig {
    activeModels: string[];     // 3 model IDs for the tribunal
    judgeModel: string;         // Model ID for the orchestrator/judge
}
