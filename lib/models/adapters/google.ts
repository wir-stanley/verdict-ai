/**
 * Google Adapter
 * 
 * Creates a unified adapter for any Google model (Gemini).
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ModelAdapter, ModelConfig, Message } from "../types";

export function createGoogleAdapter(config: ModelConfig): ModelAdapter {
    const getClient = () => {
        const apiKey = process.env[config.apiKeyEnv];
        if (!apiKey) {
            throw new Error(`${config.apiKeyEnv} not set`);
        }
        return new GoogleGenerativeAI(apiKey);
    };

    return {
        config,

        async *stream(input: string | Message[]) {
            const genAI = getClient();

            // Handle string input (simple generation)
            if (typeof input === "string") {
                const model = genAI.getGenerativeModel({ model: config.modelName });
                const result = await model.generateContentStream(input);
                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    if (text) yield text;
                }
                return;
            }

            // Handle chat input
            const systemMessage = input.find(m => m.role === "system");
            const model = genAI.getGenerativeModel({
                model: config.modelName,
                systemInstruction: systemMessage?.content
            });

            const chatMessages = input.filter(m => m.role !== "system");
            const lastMessage = chatMessages[chatMessages.length - 1];
            const history = chatMessages.slice(0, -1).map(m => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }]
            }));

            const chat = model.startChat({ history });
            const result = await chat.sendMessageStream(lastMessage?.content || "");

            for await (const chunk of result.stream) {
                const text = chunk.text();
                if (text) yield text;
            }
        },

        async complete(input: string | Message[]): Promise<string> {
            const genAI = getClient();

            if (typeof input === "string") {
                const model = genAI.getGenerativeModel({ model: config.modelName });
                const result = await model.generateContent(input);
                return result.response.text();
            }

            const systemMessage = input.find(m => m.role === "system");
            const model = genAI.getGenerativeModel({
                model: config.modelName,
                systemInstruction: systemMessage?.content
            });

            const chatMessages = input.filter(m => m.role !== "system");
            const lastMessage = chatMessages[chatMessages.length - 1];
            const history = chatMessages.slice(0, -1).map(m => ({
                role: m.role === "assistant" ? "model" : "user",
                parts: [{ text: m.content }]
            }));

            const chat = model.startChat({ history });
            const result = await chat.sendMessage(lastMessage?.content || "");
            return result.response.text();
        },
    };
}
