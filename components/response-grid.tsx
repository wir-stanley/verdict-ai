"use client";

import { motion } from "framer-motion";
import { ResponsePanel } from "./response-panel";
import type { LLMProvider } from "@/lib/types";

interface ResponseGridProps {
    responses: Record<LLMProvider, string>;
    streaming: Record<LLMProvider, boolean>;
    errors: Record<LLMProvider, string | undefined>;
}

const providers: LLMProvider[] = ["claude", "gpt", "gemini"];

export function ResponseGrid({
    responses,
    streaming,
    errors,
}: ResponseGridProps) {
    const hasAnyContent = providers.some(
        (p) => responses[p] || streaming[p] || errors[p]
    );

    if (!hasAnyContent) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {providers.map((provider) => (
                <motion.div
                    key={provider}
                    className="min-h-[380px]"
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    <ResponsePanel
                        provider={provider}
                        content={responses[provider]}
                        isStreaming={streaming[provider]}
                        error={errors[provider]}
                    />
                </motion.div>
            ))}
        </div>
    );
}
