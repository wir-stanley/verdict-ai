import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { getJudgeAdapter, getActiveModelConfigs } from "@/lib/models";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface AnalysisRequest {
    prompt: string;
    responses: Record<string, string>;
}

export async function POST(req: NextRequest) {
    // 1. Authenticate and Check Waitlist Status
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await convex.query(api.users.getUserByClerkId, { clerkId: userId });

    // Block if waitlisted or rejected
    // Allow if status is undefined (Legacy/Admin) or "active"
    if (user && (user.status === "waitlist" || user.status === "rejected")) {
        return NextResponse.json(
            { error: "Access Denied: You are currently on the waitlist." },
            { status: 403 }
        );
    }

    // Get client IP for rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ||
        req.headers.get("x-real-ip") ||
        "anonymous";

    // Rate limit: 10 requests per minute per IP
    const rateLimitResult = rateLimit(`analyze-${ip}`, 10, 60000);

    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: "Rate limit exceeded. Please try again later." },
            { status: 429 }
        );
    }

    const { prompt, responses }: AnalysisRequest = await req.json();

    if (!prompt || !responses) {
        return NextResponse.json(
            { error: "Prompt and responses are required" },
            { status: 400 }
        );
    }

    // Get active models for dynamic prompt generation
    const activeModels = getActiveModelConfigs();

    // Build responses section dynamically
    const responsesSection = activeModels
        .map((model) => `**${model.name} (${model.id}):**\n${responses[model.id] || "[No response]"}`)
        .join("\n\n");

    // Build model ratings schema dynamically
    const modelRatingsSchema = activeModels
        .map((model) => `    "${model.id}": { "score": 1-10, "note": "Brief note on this model's response" }`)
        .join(",\n");

    // Build winner options dynamically
    const winnerOptions = [...activeModels.map((m) => `"${m.id}"`), '"tie"'].join(" | ");

    // Build conflicts schema example
    const conflictsExample = `[
    {
      "topic": "What the models disagree about",
      "positions": {
${activeModels.map(m => `        "${m.id}": "${m.name}'s stance on this topic"`).join(",\n")}
      },
      "judgeNote": "Your analysis of who is likely correct and why",
      "severity": "minor" | "major" | "critical"
    }
  ]`;

    // Build textHighlights schema example
    const textHighlightsExample = `[
    {
      "modelId": "modelId" | "master", // Use "master" to highlight text in your "verdict"
      "text": "exact quote from text",
      "type": "consensus" | "conflict",
      "conflictIndex": 0,
      "note": "Attribution (e.g. 'Credit: GPT-5')"
    }
  ]`;

    // Phase 11: Ambiguity Schema
    const needsContextExample = `[
    {
        "modelId": "modelId",
        "reason": "Brief explanation of what the model needs (e.g., 'Asked for exact year')"
    }
]`;

    const analysisPrompt = `You are a Chief Justice AI, a principal engineer with 20+ years of experience. Your goal is to critically evaluate answers from ${activeModels.length} frontier AI models and issue a definitive verdict.

Compare the following responses to the user prompt:

PROMPT:
${prompt}

RESPONSES:
${responsesSection}

---

Analyze these responses carefully. Identify where models AGREE and where they CONFLICT. For conflicts, explain each model's position and which is likely correct.

CRITICAL: You must also identify specific TEXT QUOTES from each model's response to highlight:
- CONSENSUS quotes (green): Key phrases/sentences where models agree
- CONFLICT quotes (amber/red): Phrases that contradict other models

Provide your judgment in EXACTLY this JSON format (no markdown, just raw JSON):

{
  "consensusLevel": "full" | "partial" | "none",
  "agreementCount": ${activeModels.length} | ${activeModels.length - 1} | 1 | 0,
  "headline": "A short 5-10 word summary of the verdict",
  "verdict": "Detailed explanation of the decision. Includes key phrases that will be HEATMAP HIGHLIGHTED to show attribution.",
  "agreements": ["List of key points where models agree"],
  "disagreements": ["Brief list of disagreements for backward compatibility"],
  "conflicts": ${conflictsExample},
  "textHighlights": ${textHighlightsExample},
  "needsContext": ${needsContextExample},
  "bestAnswer": "The synthesized best answer to the user's question. This should be a complete, actionable response that takes the best parts from all models. If it's code, include the full working code. If it's an explanation, make it comprehensive.",
  "modelRatings": {
    ${modelRatingsSchema}
  },
  "winner": ${winnerOptions}
}

GUIDELINES FOR CONFLICTS:
- Only include conflicts where models give genuinely different answers
- "minor" = stylistic or phrasing differences
- "major" = factual disagreements that could affect the user's decision
- "critical" = dangerous contradictions (e.g., in code, medical, legal advice)
- In judgeNote, cite evidence for why one model is likely correct

GUIDELINES FOR TEXT HIGHLIGHTS:
-   **Heatmap**: Use 'textHighlights' with modelId="master" to pinpoint attribution inside your 'verdict' text.
-   **Attribution**: In the 'note', credit the source model (e.g., "Idea from Claude").
-   **Witnesses**: You can still highlight quotes from model responses (modelId="gpt-5.2").
-   **Precision**: Text must be an EXACT substring match.

GUIDELINES FOR AMBIGUITY / NEEDS CONTEXT:
- If a model REFUSES to answer or asks a CLARIFYING question(e.g., "Do you mean X or Y?"), flag it in 'needsContext'.
- This warns the user that their prompt might be too vague.
- Example: User asks "How tall is it?", Model asks "How tall is what?".

IMPORTANT: Return ONLY valid JSON. No markdown code blocks. No additional text.`;

    try {
        const judgeAdapter = getJudgeAdapter();
        const analysisRaw = await judgeAdapter.complete(analysisPrompt);

        try {
            let cleanJson = analysisRaw.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.slice(7);
            }
            if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.slice(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.slice(0, -3);
            }
            cleanJson = cleanJson.trim();

            const analysis = JSON.parse(cleanJson);
            return NextResponse.json({ analysis, raw: analysisRaw });
        } catch {
            // Fallback if JSON parsing fails
            const defaultRatings: Record<string, { score: number; note: string }> = {};
            activeModels.forEach((m) => {
                defaultRatings[m.id] = { score: 7, note: "Response received" };
            });

            return NextResponse.json({
                analysis: {
                    consensusLevel: "partial",
                    agreementCount: 2,
                    headline: "Analysis Complete",
                    verdict: "See detailed analysis below.",
                    agreements: [],
                    disagreements: [],
                    bestAnswer: analysisRaw,
                    modelRatings: defaultRatings,
                    winner: "tie"
                },
                raw: analysisRaw
            });
        }
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Analysis failed" },
            { status: 500 }
        );
    }
}
