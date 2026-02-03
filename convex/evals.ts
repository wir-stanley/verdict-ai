import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Create a new eval run
 */
export const createEvalRun = mutation({
    args: {
        runId: v.string(),
        totalPrompts: v.number(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("evalRuns", {
            runId: args.runId,
            startedAt: Date.now(),
            status: "running",
            totalPrompts: args.totalPrompts,
            completedPrompts: 0,
        });
    },
});

/**
 * Save an individual eval result
 */
export const saveEvalResult = mutation({
    args: {
        runId: v.string(),
        promptId: v.string(),
        promptCategory: v.string(),
        prompt: v.string(),
        modelId: v.string(),
        response: v.string(),
        score: v.number(),
        judgeNote: v.string(),
        criteriaMet: v.optional(v.array(v.string())),
        criteriaMissed: v.optional(v.array(v.string())),
        responseTimeMs: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // Save the result
        await ctx.db.insert("evalResults", {
            runId: args.runId,
            promptId: args.promptId,
            promptCategory: args.promptCategory,
            prompt: args.prompt,
            modelId: args.modelId,
            response: args.response,
            score: args.score,
            judgeNote: args.judgeNote,
            criteriaMet: args.criteriaMet,
            criteriaMissed: args.criteriaMissed,
            responseTimeMs: args.responseTimeMs,
            createdAt: Date.now(),
        });

        // Update run progress
        const run = await ctx.db
            .query("evalRuns")
            .withIndex("by_run_id", (q) => q.eq("runId", args.runId))
            .first();

        if (run) {
            await ctx.db.patch(run._id, {
                completedPrompts: (run.completedPrompts || 0) + 1,
            });
        }
    },
});

/**
 * Complete an eval run with aggregate scores
 */
export const completeEvalRun = mutation({
    args: {
        runId: v.string(),
        modelScores: v.any(), // Record<modelId, { avgScore, wins, totalPrompts }>
    },
    handler: async (ctx, args) => {
        const run = await ctx.db
            .query("evalRuns")
            .withIndex("by_run_id", (q) => q.eq("runId", args.runId))
            .first();

        if (run) {
            await ctx.db.patch(run._id, {
                status: "completed",
                completedAt: Date.now(),
                modelScores: args.modelScores,
            });
        }
    },
});

/**
 * Mark an eval run as failed
 */
export const failEvalRun = mutation({
    args: {
        runId: v.string(),
        error: v.string(),
    },
    handler: async (ctx, args) => {
        const run = await ctx.db
            .query("evalRuns")
            .withIndex("by_run_id", (q) => q.eq("runId", args.runId))
            .first();

        if (run) {
            await ctx.db.patch(run._id, {
                status: "failed",
                completedAt: Date.now(),
                error: args.error,
            });
        }
    },
});

/**
 * Get the latest completed eval runs for leaderboard
 */
export const getLatestEvalRuns = query({
    args: {
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 10;

        const runs = await ctx.db
            .query("evalRuns")
            .withIndex("by_completed")
            .order("desc")
            .filter((q) => q.eq(q.field("status"), "completed"))
            .take(limit);

        return runs;
    },
});

/**
 * Get current leaderboard (from most recent completed run)
 */
export const getLeaderboard = query({
    args: {},
    handler: async (ctx) => {
        const latestRun = await ctx.db
            .query("evalRuns")
            .withIndex("by_completed")
            .order("desc")
            .filter((q) => q.eq(q.field("status"), "completed"))
            .first();

        if (!latestRun || !latestRun.modelScores) {
            return null;
        }

        return {
            runId: latestRun.runId,
            completedAt: latestRun.completedAt,
            totalPrompts: latestRun.totalPrompts,
            modelScores: latestRun.modelScores,
        };
    },
});

/**
 * Get detailed results for a specific run
 */
export const getEvalRunDetails = query({
    args: {
        runId: v.string(),
    },
    handler: async (ctx, args) => {
        const run = await ctx.db
            .query("evalRuns")
            .withIndex("by_run_id", (q) => q.eq("runId", args.runId))
            .first();

        if (!run) return null;

        const results = await ctx.db
            .query("evalResults")
            .withIndex("by_run", (q) => q.eq("runId", args.runId))
            .collect();

        return {
            run,
            results,
        };
    },
});

/**
 * Get model performance over time (for charts)
 */
export const getModelPerformanceHistory = query({
    args: {
        modelId: v.string(),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 10;

        const runs = await ctx.db
            .query("evalRuns")
            .withIndex("by_completed")
            .order("desc")
            .filter((q) => q.eq(q.field("status"), "completed"))
            .take(limit);

        return runs
            .filter((run) => run.modelScores && run.modelScores[args.modelId])
            .map((run) => ({
                runId: run.runId,
                completedAt: run.completedAt,
                score: run.modelScores[args.modelId].avgScore,
                wins: run.modelScores[args.modelId].wins,
            }));
    },
});
