import OpenAI from "openai";

function getClient() {
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    });
}

export async function* streamGPT(prompt: string) {
    const openai = getClient();
    const stream = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [{ role: "user", content: prompt }],
        stream: true,
    });

    for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
            yield content;
        }
    }
}

export async function getGPTResponse(prompt: string): Promise<string> {
    const openai = getClient();
    const response = await openai.chat.completions.create({
        model: "gpt-5.2",
        messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0]?.message?.content || "";
}
