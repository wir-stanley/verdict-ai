import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Submit feedback on a verdict
 * THE KILLER MOVE - Creates training data for future Judge improvements
 */
export const submitFeedback = mutation({
    args: {
        queryId: v.id("queries"),
        clerkId: v.string(),
        helpful: v.boolean(),
        correctWinner: v.optional(v.boolean()),
        suggestedWinner: v.optional(v.string()),
        comment: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Check if user already submitted feedback for this query
        const existingFeedback = await ctx.db
            .query("verdictFeedback")
            .withIndex("by_query_user", (q) =>
                q.eq("queryId", args.queryId).eq("clerkId", args.clerkId)
            )
            .first();

        if (existingFeedback) {
            // Update existing feedback
            await ctx.db.patch(existingFeedback._id, {
                helpful: args.helpful,
                correctWinner: args.correctWinner,
                suggestedWinner: args.suggestedWinner,
                comment: args.comment,
            });
            return { updated: true, feedbackId: existingFeedback._id };
        }

        // Create new feedback
        const feedbackId = await ctx.db.insert("verdictFeedback", {
            queryId: args.queryId,
            clerkId: args.clerkId,
            helpful: args.helpful,
            correctWinner: args.correctWinner,
            suggestedWinner: args.suggestedWinner,
            comment: args.comment,
            createdAt: Date.now(),
        });

        // Update query aggregates
        const queryDoc = await ctx.db.get(args.queryId);
        if (queryDoc) {
            const updates: Record<string, number> = {};

            if (args.helpful) {
                updates.helpfulVotes = (queryDoc.helpfulVotes || 0) + 1;
            } else {
                updates.notHelpfulVotes = (queryDoc.notHelpfulVotes || 0) + 1;
            }

            if (args.correctWinner !== undefined) {
                if (args.correctWinner) {
                    updates.correctWinnerVotes = (queryDoc.correctWinnerVotes || 0) + 1;
                } else {
                    updates.wrongWinnerVotes = (queryDoc.wrongWinnerVotes || 0) + 1;
                }
            }

            await ctx.db.patch(args.queryId, updates);
        }

        return { created: true, feedbackId };
    },
});

/**
 * Get feedback for a specific query
 */
export const getFeedbackForQuery = query({
    args: {
        queryId: v.id("queries"),
        clerkId: v.string(),
    },
    handler: async (ctx, args) => {
        const feedback = await ctx.db
            .query("verdictFeedback")
            .withIndex("by_query_user", (q) =>
                q.eq("queryId", args.queryId).eq("clerkId", args.clerkId)
            )
            .first();

        return feedback;
    },
});

/**
 * Get aggregate feedback stats (for future analytics dashboard)
 */
export const getFeedbackStats = query({
    args: {},
    handler: async (ctx) => {
        const allFeedback = await ctx.db.query("verdictFeedback").collect();

        const stats = {
            totalFeedback: allFeedback.length,
            helpfulCount: allFeedback.filter((f) => f.helpful).length,
            notHelpfulCount: allFeedback.filter((f) => !f.helpful).length,
            correctWinnerCount: allFeedback.filter((f) => f.correctWinner === true).length,
            wrongWinnerCount: allFeedback.filter((f) => f.correctWinner === false).length,
            suggestedWinners: allFeedback
                .filter((f) => f.suggestedWinner)
                .reduce((acc, f) => {
                    const winner = f.suggestedWinner!;
                    acc[winner] = (acc[winner] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>),
        };

        return stats;
    },
});
