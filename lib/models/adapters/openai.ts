/**
 * OpenAI Adapter
 * 
 * Creates a unified adapter for any OpenAI model (GPT, o-series).
 */

import OpenAI from "openai";
import type { ModelAdapter, ModelConfig, Message } from "../types";

export function createOpenAIAdapter(config: ModelConfig): ModelAdapter {
    const getClient = () => {
        const apiKey = process.env[config.apiKeyEnv];
        if (!apiKey) {
            throw new Error(`${config.apiKeyEnv} not set`);
        }
        return new OpenAI({ apiKey });
    };

    const normalizeInput = (input: string | Message[]): OpenAI.Chat.ChatCompletionMessageParam[] => {
        if (typeof input === "string") {
            return [{ role: "user", content: input }];
        }
        return input.map(m => ({
            role: m.role,
            content: m.content
        }));
    };

    return {
        config,

        async *stream(input: string | Message[]) {
            const client = getClient();
            const messages = normalizeInput(input);

            const stream = await client.chat.completions.create({
                model: config.modelName,
                messages,
                stream: true,
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    yield content;
                }
            }
        },

        async complete(input: string | Message[]): Promise<string> {
            const client = getClient();
            const messages = normalizeInput(input);

            const response = await client.chat.completions.create({
                model: config.modelName,
                messages,
            });

            return response.choices[0]?.message?.content || "";
        },
    };
}
