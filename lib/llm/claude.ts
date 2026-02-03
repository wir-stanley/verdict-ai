import Anthropic from "@anthropic-ai/sdk";

function getClient() {
    return new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
    });
}

export async function* streamClaude(prompt: string) {
    const anthropic = getClient();
    const stream = await anthropic.messages.stream({
        model: "claude-opus-4-5-20251101",
        max_tokens: 16384,
        thinking: {
            type: "enabled",
            budget_tokens: 10000,
        },
        messages: [{ role: "user", content: prompt }],
    });

    let isThinking = true;

    for await (const event of stream) {
        if (event.type === "content_block_delta") {
            if (event.delta.type === "thinking_delta") {
                // Skip thinking output - only show final response
                continue;
            } else if (event.delta.type === "text_delta") {
                isThinking = false;
                yield event.delta.text;
            }
        }
    }
}

export async function getClaudeResponse(prompt: string): Promise<string> {
    const anthropic = getClient();
    const response = await anthropic.messages.create({
        model: "claude-opus-4-5-20251101",
        max_tokens: 16384,
        thinking: {
            type: "enabled",
            budget_tokens: 10000,
        },
        messages: [{ role: "user", content: prompt }],
    });

    // Only return the text response, not the thinking
    for (const block of response.content) {
        if (block.type === "text") {
            return block.text;
        }
    }
    return "";
}
