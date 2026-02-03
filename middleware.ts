import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that don't require authentication
const isPublicRoute = createRouteMatcher([
    "/",                    // Marketing landing page
    "/sign-in(.*)",         // Sign in pages
    "/sign-up(.*)",         // Sign up pages
    "/api/webhook(.*)",     // Webhooks (for Clerk/Convex sync)
]);

export default clerkMiddleware(async (auth, request) => {
    // If not a public route, require authentication
    if (!isPublicRoute(request)) {
        await auth.protect();
    }
});

export const config = {
    matcher: [
        // Skip Next.js internals and static files
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        // Always run for API routes
        "/(api|trpc)(.*)",
    ],
};
