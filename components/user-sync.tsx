"use client";

import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export function UserSync() {
    const { user, isLoaded } = useUser();
    const upsertUser = useMutation(api.users.upsertUser);

    useEffect(() => {
        if (!isLoaded || !user) return;

        // Sync user to Convex
        upsertUser({
            clerkId: user.id,
            email: user.primaryEmailAddress?.emailAddress || "",
            name: user.fullName || user.username || "Anonymous",
            imageUrl: user.imageUrl,
        });
    }, [isLoaded, user, upsertUser]);

    return null;
}
