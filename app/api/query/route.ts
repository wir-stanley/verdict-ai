import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getActiveAdapters } from "@/lib/models";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
    // 1. Authenticate and Check Waitlist Status
    const { userId } = await auth();
    if (!userId) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // 2. Security Gatekeeper (Kill Switch, Rate Limit, Status Check)
    try {
        await convex.mutation(api.security.requestQueryAccess, { clerkId: userId });
    } catch (err) {
        const message = err instanceof Error ? err.message : "Access Denied";
        const status = message.includes("Rate limit") ? 429 : 403;
        return new Response(JSON.stringify({ error: message }), { status });
    }

    // Get client IP for additional network-level rate limiting (DDoS protection)
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ||
        req.headers.get("x-real-ip") ||
        "anonymous";

    // Rate limit: 10 requests per minute per IP
    const rateLimitResult = rateLimit(ip, 10, 60000);

    if (!rateLimitResult.success) {
        return new Response(
            JSON.stringify({
                error: "Rate limit exceeded. Please try again later.",
                retryAfter: Math.ceil(rateLimitResult.resetIn / 1000)
            }),
            {
                status: 429,
                headers: {
                    "Content-Type": "application/json",
                    "Retry-After": String(Math.ceil(rateLimitResult.resetIn / 1000))
                },
            }
        );
    }

    const { prompt, previousTurns } = await req.json();

    if (!prompt || typeof prompt !== "string") {
        return new Response(JSON.stringify({ error: "Prompt is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Limit prompt length to prevent abuse
    if (prompt.length > 10000) {
        return new Response(JSON.stringify({ error: "Prompt too long (max 10,000 chars)" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    // Get adapters for active models from registry
    const adapters = getActiveAdapters();
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const streamPromises = adapters.map(async (adapter) => {
                const modelId = adapter.config.id;
                try {
                    // Construct history for this specific model
                    // We need to provide the "Message" type which has role: "user" | "assistant"
                    const messages: any[] = [];

                    if (previousTurns && Array.isArray(previousTurns)) {
                        previousTurns.forEach((turn: any) => {
                            if (turn.prompt) {
                                messages.push({ role: "user", content: turn.prompt });
                            }
                            if (turn.responses && turn.responses[modelId]) {
                                messages.push({ role: "assistant", content: turn.responses[modelId] });
                            }
                        });
                    }

                    messages.push({ role: "user", content: prompt });

                    for await (const chunk of adapter.stream(messages)) {
                        const data = JSON.stringify({
                            provider: modelId,
                            content: chunk,
                            done: false,
                        });
                        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                    }
                    const doneData = JSON.stringify({
                        provider: modelId,
                        content: "",
                        done: true,
                    });
                    controller.enqueue(encoder.encode(`data: ${doneData}\n\n`));
                } catch (error) {
                    const errorData = JSON.stringify({
                        provider: modelId,
                        content: "",
                        done: true,
                        error: error instanceof Error ? error.message : "Unknown error",
                    });
                    controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
                }
            });

            await Promise.all(streamPromises);
            controller.close();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            "X-RateLimit-Remaining": String(rateLimitResult.remaining),
        },
    });
}
