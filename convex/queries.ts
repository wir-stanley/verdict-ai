import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Save a new query
export const saveQuery = mutation({
    args: {
        clerkId: v.string(),
        prompt: v.string(),
        parentId: v.optional(v.id("queries")),
        // Dynamic responses - keys are model IDs from registry
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
                    judgeNote: v.optional(v.string()),
                    severity: v.string(),
                }))),
                // Inline text highlights heatmap
                textHighlights: v.optional(v.array(v.object({
                    modelId: v.string(),
                    text: v.string(),
                    type: v.string(), // "consensus" | "conflict"
                    conflictIndex: v.optional(v.number()),
                    note: v.optional(v.string()),
                }))),
            })
        ),
    },
    handler: async (ctx, args) => {
        // Get user by clerk ID
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (!user) {
            throw new Error("User not found");
        }

        return await ctx.db.insert("queries", {
            userId: user._id,
            parentId: args.parentId,
            prompt: args.prompt,
            responses: args.responses,
            analysis: args.analysis,
            createdAt: Date.now(),
        });
    },
});

// Get user's query history
// Get user's query history - V2 Force Refresh
export const getUserQueriesV2 = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (!user) {
            return [];
        }

        return await ctx.db
            .query("queries")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .take(50);
    },
});

export const getUserQueries = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        // Fallback to V2 logic
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (!user) {
            return [];
        }

        return await ctx.db
            .query("queries")
            .withIndex("by_user", (q) => q.eq("userId", user._id))
            .order("desc")
            .take(50);
    },
});

// Get a specific query
export const getQuery = query({
    args: { queryId: v.id("queries") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.queryId);
    },
});

export const deleteQuery = mutation({
    args: { queryId: v.id("queries") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.queryId);
    },
});
