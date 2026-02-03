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
        profession: v.string(),
        useCase: v.string(),
    },
    handler: async (ctx, args) => {
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
            .first();

        if (!user) {
            throw new Error("User not found");
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
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return []; // Hide data if not logged in

        // Verify admin role
        const callingUser = await ctx.db
            .query("users")
            .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
            .first();

        if (!callingUser || callingUser.role !== "admin") {
            return []; // Hide data if not admin
        }

        const users = await ctx.db
            .query("users")
            .filter((q) => q.eq(q.field("status"), "waitlist"))
            .collect();

        // Return only those who have submitted an application
        return users.filter(u => u.profession && u.useCase).sort((a, b) => (b.applicationDate || 0) - (a.applicationDate || 0));
    },
});

// Admin: Approve User
export const approveUser = mutation({
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

        await ctx.db.patch(args.userId, { status: "active" });
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
