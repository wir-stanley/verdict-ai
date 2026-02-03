import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    // Users table - synced from Clerk
    users: defineTable({
        clerkId: v.string(),
        email: v.string(),
        name: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        // 'active' | 'waitlist' | 'rejected'
        status: v.optional(v.string()),
        // 'admin' | 'user'
        role: v.optional(v.string()),
        // Onboarding Data
        profession: v.optional(v.string()),
        useCase: v.optional(v.string()),
        applicationDate: v.optional(v.number()),
        createdAt: v.number(),
    })
        .index("by_clerk_id", ["clerkId"])
        .index("by_email", ["email"]),

    // Query history
    queries: defineTable({
        userId: v.id("users"),
        parentId: v.optional(v.id("queries")), // Threading support
        prompt: v.string(),
        // Dynamic responses object - keys are model IDs
        responses: v.any(), // Record<modelId, string>
        analysis: v.optional(
            v.object({
                consensusLevel: v.string(),
                agreementCount: v.number(),
                headline: v.string(),
                verdict: v.string(),
                bestAnswer: v.string(),
                winner: v.string(),
                // Structured conflicts for Conflict Matrix
                conflicts: v.optional(v.array(v.object({
                    topic: v.string(),
                    positions: v.any(), // Record<modelId, string>
                    judgeNote: v.optional(v.union(v.string(), v.null())),
                    severity: v.string(),
                }))),
                textHighlights: v.optional(v.array(v.object({
                    modelId: v.string(),
                    text: v.string(),
                    type: v.string(), // "consensus" | "conflict"
                    conflictIndex: v.optional(v.union(v.number(), v.null())),
                    note: v.optional(v.union(v.string(), v.null())),
                }))),
                // Phase 11: Ambiguity Detection / Follow-up Needed
                needsContext: v.optional(v.array(v.object({
                    modelId: v.string(),
                    reason: v.string(), // e.g. "Asked if user meant World Happiness Report vs GDP"
                }))),
            })
        ),
        // Feedback aggregates
        helpfulVotes: v.optional(v.number()),
        notHelpfulVotes: v.optional(v.number()),
        correctWinnerVotes: v.optional(v.number()),
        wrongWinnerVotes: v.optional(v.number()),
        createdAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_created", ["createdAt"]),

    // User feedback on verdicts - THE KILLER MOVE
    verdictFeedback: defineTable({
        queryId: v.id("queries"),
        clerkId: v.string(),
        // Was the verdict helpful?
        helpful: v.boolean(),
        // Did we pick the right winner?
        correctWinner: v.optional(v.boolean()),
        // If user disagrees, which model should have won?
        suggestedWinner: v.optional(v.string()),
        // Optional comment
        comment: v.optional(v.string()),
        createdAt: v.number(),
    })
        .index("by_query", ["queryId"])
        .index("by_user", ["clerkId"])
        .index("by_query_user", ["queryId", "clerkId"]),

    // Automated evaluation runs
    evalRuns: defineTable({
        // Unique run identifier
        runId: v.string(),
        // When the run started/finished
        startedAt: v.number(),
        completedAt: v.optional(v.number()),
        // Run status
        status: v.string(), // "running" | "completed" | "failed"
        // Number of prompts in this run
        totalPrompts: v.number(),
        completedPrompts: v.optional(v.number()),
        // Aggregate scores by model
        modelScores: v.optional(v.any()), // Record<modelId, { avgScore, wins, totalPrompts }>
        // Error message if failed
        error: v.optional(v.string()),
    })
        .index("by_run_id", ["runId"])
        .index("by_completed", ["completedAt"]),

    // Individual eval results
    evalResults: defineTable({
        // Reference to parent run
        runId: v.string(),
        // Benchmark prompt info
        promptId: v.string(),
        promptCategory: v.string(),
        prompt: v.string(),
        // Model being evaluated
        modelId: v.string(),
        // The response
        response: v.string(),
        // Judge's score and reasoning
        score: v.number(), // 1-10
        judgeNote: v.string(),
        // Criteria met
        criteriaMet: v.optional(v.array(v.string())),
        criteriaMissed: v.optional(v.array(v.string())),
        // Timing
        responseTimeMs: v.optional(v.number()),
        createdAt: v.number(),
    })
        .index("by_model", ["modelId"])
        .index("by_prompt", ["promptId"])
        .index("by_run", ["runId"]),

    // Security & Limits
    globalStats: defineTable({
        key: v.string(), // "spend_24h"
        value: v.number(),
        lastReset: v.number(),
    }).index("by_key", ["key"]),

    rateLimits: defineTable({
        identifier: v.string(), // userId or IP
        action: v.string(), // "query" | "application"
        count: v.number(),
        windowStart: v.number(),
    })
        .index("by_identifier_action", ["identifier", "action"]),
});
