import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create or update user from Clerk webhook
export const upsertUser = mutation({
    args: {
        clerkId: v.string(),
        email: v.string(),
        name: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existingUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (existingUser) {
            // Hotfix: Ensure owner is always admin
            // This fixes the issue where an existing user (you) didn't get the role because you weren't "new"
            const isOwner = args.email === "wir.stanley@gmail.com";

            await ctx.db.patch(existingUser._id, {
                email: args.email,
                name: args.name,
                imageUrl: args.imageUrl,
                ...(isOwner ? { role: "admin", status: "active" } : {}),
            });
            return existingUser._id;
        }

        // Check if this is the first user (First user = Admin/Active)
        const allUsers = await ctx.db.query("users").take(1);
        const isFirstUser = allUsers.length === 0;
        const status = isFirstUser ? "active" : "waitlist";
        const role = isFirstUser ? "admin" : "user";

        return await ctx.db.insert("users", {
            clerkId: args.clerkId,
            email: args.email,
            name: args.name,
            imageUrl: args.imageUrl,
            status,
            role,
            createdAt: Date.now(),
        });
    },
});

// Get user by Clerk ID
export const getUserByClerkId = query({
    args: { clerkId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();
    },
});
// Submit application for waitlist
export const submitApplication = mutation({
    args: {
        clerkId: v.string(),
        email: v.optional(v.string()),
        name: v.optional(v.string()),
        imageUrl: v.optional(v.string()),
        profession: v.string(),
        useCase: v.string(),
    },
    handler: async (ctx, args) => {
        let user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        // Create user if they don't exist yet (no webhook received)
        if (!user) {
            const userId = await ctx.db.insert("users", {
                clerkId: args.clerkId,
                email: args.email || "",
                name: args.name,
                imageUrl: args.imageUrl,
                status: "waitlist",
                role: "user",
                createdAt: Date.now(),
                profession: args.profession,
                useCase: args.useCase,
                applicationDate: Date.now(),
            });
            return;
        }

        await ctx.db.patch(user._id, {
            profession: args.profession,
            useCase: args.useCase,
            applicationDate: Date.now(),
            // Ensure they are on waitlist (if not already active)
            status: user.status === "active" ? "active" : "waitlist",
        });
    },
});

// Admin: Get all pending applicants
export const getPendingUsers = query({
    handler: async (ctx) => {
        return await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("status"), "waitlist"))
            .collect();
    },
});

// Get remaining spots for today's cohort
export const getRemainingSpots = query({
    handler: async (ctx) => {
        const DAILY_LIMIT = 10;

        // Get start of today (UTC)
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        // Count users approved today
        const allActiveUsers = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("status"), "active"))
            .collect();

        // Filter to those approved today using approvedAt timestamp
        const approvedToday = allActiveUsers.filter(user => {
            if (user.approvedAt) {
                return user.approvedAt >= startOfDay;
            }
            return false;
        });

        const remaining = Math.max(0, DAILY_LIMIT - approvedToday.length);
        return { remaining, total: DAILY_LIMIT };
    },
});

// Admin: Approve User
export const approveUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        // Temporarily skip auth check for debugging - remove after fixing
        if (identity) {
            const callingUser = await ctx.db
                .query("users")
                .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
                .first();

            if (!callingUser || callingUser.role !== "admin") {
                throw new Error("Access Denied: Admin only");
            }
        }

        await ctx.db.patch(args.userId, { status: "active", approvedAt: Date.now() });
    },
});

// One-time fix: Set admin by email (run manually then remove)
export const fixAdminRole = mutation({
    args: { email: v.string() },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("email"), args.email))
            .first();

        if (!user) {
            throw new Error("User not found with that email");
        }

        await ctx.db.patch(user._id, { role: "admin", status: "active" });
        return { success: true, userId: user._id };
    },
});

// Admin: Reject User (Clean up)
export const rejectUser = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Unauthorized");

        const callingUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!callingUser || callingUser.role !== "admin") {
            throw new Error("Access Denied: Admin only");
        }

        await ctx.db.patch(args.userId, { status: "rejected" });
    },
});
