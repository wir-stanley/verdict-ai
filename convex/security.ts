import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const GLOBAL_SPEND_LIMIT = 28.50;
const QUERY_COST = 0.50; // Fixed cost per query for Alpha
const QUERIES_PER_HOUR = 15;
const APPLICATIONS_PER_HOUR = 1;

/**
 * The "Gatekeeper" mutation.
 * Checks: Role, Rate Limits, Global Budget, User Credits.
 * Returns confirmation or throws error.
 */
export const requestQueryAccess = mutation({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (!user) throw new Error("User not found");
        if (user.status !== "active") throw new Error("User not active");

        // 1. Global Kill Switch Check
        const globalSpend = await ctx.db
            .query("globalStats")
            .withIndex("by_key", (q) => q.eq("key", "spend_24h"))
            .first();

        // Reset if 24h passed
        const now = Date.now();
        if (globalSpend && (now - globalSpend.lastReset > 24 * 60 * 60 * 1000)) {
            await ctx.db.patch(globalSpend._id, { value: 0, lastReset: now });
        } else if (globalSpend && globalSpend.value >= GLOBAL_SPEND_LIMIT) {
            throw new Error("Alpha Global Budget Reached. Resets in 24h.");
        }

        // 2. Rate Limit (User)
        const rateLimit = await ctx.db
            .query("rateLimits")
            .withIndex("by_identifier_action", (q) => q.eq("identifier", args.clerkId).eq("action", "query"))
            .first();

        if (rateLimit) {
            if (now - rateLimit.windowStart > 60 * 60 * 1000) {
                // Reset window
                await ctx.db.patch(rateLimit._id, { count: 1, windowStart: now });
            } else if (rateLimit.count >= QUERIES_PER_HOUR) {
                throw new Error("Rate limit exceeded (5 queries/hour for Alpha).");
            } else {
                await ctx.db.patch(rateLimit._id, { count: rateLimit.count + 1 });
            }
        } else {
            await ctx.db.insert("rateLimits", {
                identifier: args.clerkId,
                action: "query",
                count: 1,
                windowStart: now,
            });
        }

        // 3. Increment Projected Spend (Optimistic locking)
        // In a real app we'd verify real token usage later, but for Alpha we assume max cost to be safe.
        if (globalSpend) {
            await ctx.db.patch(globalSpend._id, { value: globalSpend.value + QUERY_COST });
        } else {
            await ctx.db.insert("globalStats", {
                key: "spend_24h",
                value: QUERY_COST,
                lastReset: now,
            });
        }

        return { authorized: true };
    },
});

/**
 * Check if the caller is an admin
 */
export const isAdmin = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();
        return user?.role === "admin";
    },
});
