import { GoogleGenerativeAI } from "@google/generative-ai";

function getClient() {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
        throw new Error("GOOGLE_AI_API_KEY not set");
    }
    return new GoogleGenerativeAI(apiKey);
}

export async function* streamGemini(prompt: string) {
    try {
        const genAI = getClient();
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-preview",
            tools: [{ googleSearchRetrieval: {} }],
        });

        console.log("[Gemini] Starting stream request...");
        const result = await model.generateContentStream(prompt);

        for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
                yield text;
            }
        }
        console.log("[Gemini] Stream completed");
    } catch (error) {
        console.error("[Gemini] Error:", error);
        throw error;
    }
}

export async function getGeminiResponse(prompt: string): Promise<string> {
    try {
        const genAI = getClient();
        const model = genAI.getGenerativeModel({
            model: "gemini-3-pro-preview",
            tools: [{ googleSearchRetrieval: {} }],
        });

        console.log("[Gemini] Starting request...");
        const result = await model.generateContent(prompt);
        console.log("[Gemini] Request completed");
        return result.response.text();
    } catch (error) {
        console.error("[Gemini] Error:", error);
        throw error;
    }
}
