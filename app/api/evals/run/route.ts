/**
 * Eval Runner
 * 
 * Runs all models through benchmark prompts and scores with Judge.
 * NOTE: This is an API route that can be triggered manually or via cron.
 */

import { NextResponse } from "next/server";
import { getActiveAdapters, getJudgeAdapter, getActiveModelConfigs } from "@/lib/models";
import { BENCHMARK_PROMPTS, getBalancedPrompts, type BenchmarkPrompt } from "@/lib/evals/benchmarks";

// Generate unique run ID
function generateRunId(): string {
    const date = new Date().toISOString().split("T")[0];
    const random = Math.random().toString(36).substring(2, 8);
    return `eval-${date}-${random}`;
}

// Score a single response with Judge
async function judgeResponse(
    prompt: BenchmarkPrompt,
    modelId: string,
    modelName: string,
    response: string
): Promise<{ score: number; judgeNote: string; criteriaMet: string[]; criteriaMissed: string[] }> {
    const judgeAdapter = getJudgeAdapter();

    const judgePrompt = `You are evaluating an AI model's response to a benchmark prompt.

**Benchmark Prompt:**
${prompt.prompt}

**Category:** ${prompt.category}
**Difficulty:** ${prompt.difficulty}

**Evaluation Criteria:**
${prompt.evaluationCriteria.map((c) => `- ${c}`).join("\n")}

**Model Response (${modelName}):**
${response}

---

Score this response on a scale of 1-10 based on how well it meets the criteria.

Return your evaluation in this exact JSON format (no markdown):
{
    "score": 1-10,
    "judgeNote": "Brief explanation of the score",
    "criteriaMet": ["List of criteria that were met"],
    "criteriaMissed": ["List of criteria that were missed or partially met"]
}

IMPORTANT: Return ONLY valid JSON.`;

    try {
        const judgeResponse = await judgeAdapter.complete(judgePrompt);
        let cleanJson = judgeResponse.trim();
        if (cleanJson.startsWith("```json")) cleanJson = cleanJson.slice(7);
        if (cleanJson.startsWith("```")) cleanJson = cleanJson.slice(3);
        if (cleanJson.endsWith("```")) cleanJson = cleanJson.slice(0, -3);
        cleanJson = cleanJson.trim();

        const parsed = JSON.parse(cleanJson);
        return {
            score: parsed.score || 5,
            judgeNote: parsed.judgeNote || "No note provided",
            criteriaMet: parsed.criteriaMet || [],
            criteriaMissed: parsed.criteriaMissed || [],
        };
    } catch (error) {
        console.error(`Judge error for ${modelId}:`, error);
        return {
            score: 5,
            judgeNote: "Could not parse judge response",
            criteriaMet: [],
            criteriaMissed: prompt.evaluationCriteria,
        };
    }
}

// Run a single model through a prompt
async function runModelOnPrompt(
    adapter: ReturnType<typeof getActiveAdapters>[0],
    prompt: BenchmarkPrompt
): Promise<{ response: string; timeMs: number }> {
    const startTime = Date.now();

    try {
        const response = await adapter.complete(prompt.prompt);
        return {
            response,
            timeMs: Date.now() - startTime,
        };
    } catch (error) {
        console.error(`Model ${adapter.config.id} error:`, error);
        return {
            response: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
            timeMs: Date.now() - startTime,
        };
    }
}

export interface EvalRunResult {
    runId: string;
    totalPrompts: number;
    results: Array<{
        promptId: string;
        promptCategory: string;
        prompt: string;
        modelResults: Array<{
            modelId: string;
            response: string;
            score: number;
            judgeNote: string;
            criteriaMet: string[];
            criteriaMissed: string[];
            responseTimeMs: number;
        }>;
    }>;
    modelScores: Record<string, {
        avgScore: number;
        wins: number;
        totalPrompts: number;
        byCategory: Record<string, number>;
    }>;
}

// Main runner function
export async function runEvaluation(
    promptCount: number = 8 // Default: 2 per category
): Promise<EvalRunResult> {
    const runId = generateRunId();
    const prompts = getBalancedPrompts(promptCount / 4);
    const adapters = getActiveAdapters();
    const modelConfigs = getActiveModelConfigs();

    const results: EvalRunResult["results"] = [];
    const modelScores: EvalRunResult["modelScores"] = {};

    // Initialize model scores
    for (const config of modelConfigs) {
        modelScores[config.id] = {
            avgScore: 0,
            wins: 0,
            totalPrompts: 0,
            byCategory: {},
        };
    }

    // Run each prompt
    for (const prompt of prompts) {
        console.log(`Running prompt: ${prompt.id}`);

        const promptResult: EvalRunResult["results"][0] = {
            promptId: prompt.id,
            promptCategory: prompt.category,
            prompt: prompt.prompt,
            modelResults: [],
        };

        let highestScore = 0;
        let winners: string[] = [];

        // Run all models on this prompt in parallel
        const modelPromises = adapters.map(async (adapter) => {
            const config = modelConfigs.find((c) => c.id === adapter.config.id)!;

            // Get model response
            const { response, timeMs } = await runModelOnPrompt(adapter, prompt);

            // Judge the response
            const judgment = await judgeResponse(prompt, config.id, config.name, response);

            return {
                modelId: config.id,
                response,
                score: judgment.score,
                judgeNote: judgment.judgeNote,
                criteriaMet: judgment.criteriaMet,
                criteriaMissed: judgment.criteriaMissed,
                responseTimeMs: timeMs,
            };
        });

        const modelResults = await Promise.all(modelPromises);
        promptResult.modelResults = modelResults;

        // Track scores
        for (const result of modelResults) {
            const scores = modelScores[result.modelId];
            scores.totalPrompts++;
            scores.avgScore = (scores.avgScore * (scores.totalPrompts - 1) + result.score) / scores.totalPrompts;
            scores.byCategory[prompt.category] = (scores.byCategory[prompt.category] || 0) + result.score;

            if (result.score > highestScore) {
                highestScore = result.score;
                winners = [result.modelId];
            } else if (result.score === highestScore) {
                winners.push(result.modelId);
            }
        }

        // Award wins (split for ties)
        for (const winner of winners) {
            modelScores[winner].wins += 1 / winners.length;
        }

        results.push(promptResult);
    }

    // Round scores for readability
    for (const id in modelScores) {
        modelScores[id].avgScore = Math.round(modelScores[id].avgScore * 10) / 10;
        modelScores[id].wins = Math.round(modelScores[id].wins * 10) / 10;
    }

    return {
        runId,
        totalPrompts: prompts.length,
        results,
        modelScores,
    };
}

// API route handler
export async function POST(request: Request) {
    // Optional: Add API key protection
    const authHeader = request.headers.get("Authorization");
    const expectedKey = process.env.EVAL_API_KEY;

    if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json().catch(() => ({}));
        const promptCount = body.promptCount || 8;

        console.log(`Starting eval run with ${promptCount} prompts...`);
        const result = await runEvaluation(promptCount);
        console.log(`Eval complete: ${result.runId}`);

        return NextResponse.json({
            success: true,
            ...result,
        });
    } catch (error) {
        console.error("Eval run failed:", error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Evaluation failed" },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: "POST to this endpoint to trigger an evaluation run",
        params: {
            promptCount: "Number of prompts to run (default: 8, balanced across categories)",
        },
        auth: "Set EVAL_API_KEY env var to require Authorization header",
    });
}
