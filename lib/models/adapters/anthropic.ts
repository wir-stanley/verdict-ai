/**
 * Anthropic Adapter
 * 
 * Creates a unified adapter for any Anthropic model (Claude).
 */

import Anthropic from "@anthropic-ai/sdk";
import type { ModelAdapter, ModelConfig, Message } from "../types";

export function createAnthropicAdapter(config: ModelConfig): ModelAdapter {
    const getClient = () => {
        const apiKey = process.env[config.apiKeyEnv];
        if (!apiKey) {
            throw new Error(`${config.apiKeyEnv} not set`);
        }
        return new Anthropic({ apiKey });
    };

    const normalizeInput = (input: string | Message[]) => {
        if (typeof input === "string") {
            return { messages: [{ role: "user" as const, content: input }] };
        }

        const systemMessage = input.find(m => m.role === "system");
        const messages = input
            .filter(m => m.role !== "system")
            .map(m => ({
                role: m.role as "user" | "assistant",
                content: m.content
            }));

        return { messages, system: systemMessage?.content };
    };

    return {
        config,

        async *stream(input: string | Message[]) {
            const client = getClient();
            const { messages, system } = normalizeInput(input);

            const streamOptions: Anthropic.MessageCreateParamsStreaming = {
                model: config.modelName,
                max_tokens: 16384,
                messages,
                system,
                stream: true,
            };

            // Add thinking mode if enabled
            if (config.thinkingEnabled) {
                streamOptions.thinking = {
                    type: "enabled",
                    budget_tokens: config.thinkingBudget || 10000,
                };
            }

            const stream = await client.messages.stream(streamOptions);

            for await (const event of stream) {
                if (event.type === "content_block_delta") {
                    // Skip thinking output - only yield final response
                    if (event.delta.type === "thinking_delta") {
                        continue;
                    } else if (event.delta.type === "text_delta") {
                        const text = event.delta.text;
                        // Catch overloaded/error responses sent as text
                        if (text.startsWith('{"type":"error"')) {
                            throw new Error(`Anthropic API Error: ${text}`);
                        }
                        yield text;
                    }
                }
            }
        },

        async complete(input: string | Message[]): Promise<string> {
            const client = getClient();
            const { messages, system } = normalizeInput(input);

            const options: Anthropic.MessageCreateParams = {
                model: config.modelName,
                max_tokens: 16384,
                messages,
                system,
            };

            // Add thinking mode if enabled
            if (config.thinkingEnabled) {
                options.thinking = {
                    type: "enabled",
                    budget_tokens: config.thinkingBudget || 10000,
                };
            }

            const response = await client.messages.create(options);

            // Only return the text response, not the thinking
            for (const block of response.content) {
                if (block.type === "text") {
                    return block.text;
                }
            }
            return "";
        },
    };
}
