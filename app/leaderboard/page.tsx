"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { LLM_INFO, getActiveModelIds } from "@/lib/types";
import Link from "next/link";

export default function LeaderboardPage() {
    const leaderboard = useQuery(api.evals.getLeaderboard);
    const latestRuns = useQuery(api.evals.getLatestEvalRuns, { limit: 5 });
    const modelIds = getActiveModelIds();

    // Sort models by score
    const rankedModels = leaderboard?.modelScores
        ? Object.entries(leaderboard.modelScores)
            .map(([id, scores]) => ({
                id,
                ...(scores as any),
                info: LLM_INFO[id],
            }))
            .sort((a, b) => b.avgScore - a.avgScore)
        : [];

    return (
        <div className="min-h-screen bg-[#050505] text-white">
            {/* Header */}
            <header className="border-b border-white/[0.04]">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-purple-500 to-blue-500 flex items-center justify-center text-lg">
                            ⚖️
                        </div>
                        <span className="text-lg font-bold">Verdict.ai</span>
                    </Link>
                    <Link
                        href="/app"
                        className="text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                        Back to Tribunal →
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12">
                {/* Page title */}
                <div className="mb-12">
                    <h1 className="text-3xl font-bold mb-2">Model Leaderboard</h1>
                    <p className="text-zinc-400">
                        Automated evaluations across coding, reasoning, creative, and factual
                        benchmarks
                    </p>
                    {leaderboard?.completedAt && (
                        <p className="text-xs text-zinc-500 mt-2">
                            Last updated:{" "}
                            {new Date(leaderboard.completedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                    )}
                </div>

                {/* No data state */}
                {!leaderboard && (
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">📊</span>
                        </div>
                        <h2 className="text-xl font-semibold mb-2">No Evaluation Data Yet</h2>
                        <p className="text-zinc-400 mb-6">
                            Run your first evaluation to see model rankings
                        </p>
                        <div className="inline-block text-left text-sm bg-black/30 rounded-lg p-4 font-mono">
                            <p className="text-zinc-500"># Trigger an eval run:</p>
                            <p className="text-green-400">
                                curl -X POST http://localhost:3000/api/evals/run
                            </p>
                        </div>
                    </div>
                )}

                {/* Leaderboard table */}
                {leaderboard && rankedModels.length > 0 && (
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden mb-12">
                        <div className="px-6 py-4 border-b border-white/[0.04] bg-white/[0.02]">
                            <h2 className="font-semibold">Current Rankings</h2>
                        </div>
                        <div className="divide-y divide-white/[0.04]">
                            {rankedModels.map((model, index) => (
                                <div
                                    key={model.id}
                                    className={`px-6 py-4 flex items-center gap-4 ${index === 0 ? "bg-yellow-500/5" : ""
                                        }`}
                                >
                                    {/* Rank */}
                                    <div
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${index === 0
                                            ? "bg-yellow-500/20 text-yellow-400"
                                            : index === 1
                                                ? "bg-zinc-400/20 text-zinc-300"
                                                : index === 2
                                                    ? "bg-orange-700/20 text-orange-400"
                                                    : "bg-white/[0.04] text-zinc-500"
                                            }`}
                                    >
                                        {index === 0 ? "👑" : `#${index + 1}`}
                                    </div>

                                    {/* Model info */}
                                    <div className="flex items-center gap-3 flex-1">
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                                            style={{
                                                backgroundColor: model.info
                                                    ? `${model.info.color}20`
                                                    : "#333",
                                                color: model.info?.color || "#fff",
                                            }}
                                        >
                                            {model.info?.icon || "?"}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-white">
                                                {model.info?.name || model.id}
                                            </h3>
                                            <p className="text-xs text-zinc-500">
                                                {model.totalPrompts} prompts evaluated
                                            </p>
                                        </div>
                                    </div>

                                    {/* Wins */}
                                    <div className="text-center px-4">
                                        <div className="text-lg font-bold text-green-400">
                                            {model.wins}
                                        </div>
                                        <div className="text-xs text-zinc-500">wins</div>
                                    </div>

                                    {/* Score */}
                                    <div className="text-center px-4">
                                        <div className="text-2xl font-bold">
                                            {model.avgScore}
                                            <span className="text-sm text-zinc-500">/10</span>
                                        </div>
                                        <div className="text-xs text-zinc-500">avg score</div>
                                    </div>

                                    {/* Score bar */}
                                    <div className="w-32">
                                        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-orange-500"
                                                style={{ width: `${(model.avgScore / 10) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Category breakdown */}
                {leaderboard && rankedModels.length > 0 && rankedModels[0].byCategory && (
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden mb-12">
                        <div className="px-6 py-4 border-b border-white/[0.04] bg-white/[0.02]">
                            <h2 className="font-semibold">Performance by Category</h2>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-4 gap-4">
                                {["coding", "reasoning", "creative", "factual"].map((category) => (
                                    <div
                                        key={category}
                                        className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
                                    >
                                        <h3 className="text-sm font-medium text-zinc-400 capitalize mb-3">
                                            {category === "coding" && "🧑‍💻 "}
                                            {category === "reasoning" && "🧠 "}
                                            {category === "creative" && "🎨 "}
                                            {category === "factual" && "📚 "}
                                            {category}
                                        </h3>
                                        <div className="space-y-2">
                                            {rankedModels
                                                .sort(
                                                    (a, b) =>
                                                        (b.byCategory[category] || 0) -
                                                        (a.byCategory[category] || 0)
                                                )
                                                .map((model, idx) => (
                                                    <div
                                                        key={model.id}
                                                        className="flex items-center gap-2 text-sm"
                                                    >
                                                        <span className="text-zinc-500">
                                                            {idx + 1}.
                                                        </span>
                                                        <span
                                                            style={{
                                                                color: model.info?.color || "#fff",
                                                            }}
                                                        >
                                                            {model.info?.icon}
                                                        </span>
                                                        <span className="flex-1 truncate">
                                                            {model.info?.name.split(" ")[0] ||
                                                                model.id}
                                                        </span>
                                                        <span className="text-zinc-400">
                                                            {model.byCategory[category] || 0}
                                                        </span>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Recent runs */}
                {latestRuns && latestRuns.length > 0 && (
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                        <div className="px-6 py-4 border-b border-white/[0.04] bg-white/[0.02]">
                            <h2 className="font-semibold">Recent Evaluation Runs</h2>
                        </div>
                        <div className="divide-y divide-white/[0.04]">
                            {latestRuns.map((run) => (
                                <div
                                    key={run.runId}
                                    className="px-6 py-3 flex items-center gap-4 text-sm"
                                >
                                    <span className="font-mono text-zinc-500">{run.runId}</span>
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs ${run.status === "completed"
                                            ? "bg-green-500/10 text-green-400"
                                            : run.status === "running"
                                                ? "bg-yellow-500/10 text-yellow-400"
                                                : "bg-red-500/10 text-red-400"
                                            }`}
                                    >
                                        {run.status}
                                    </span>
                                    <span className="text-zinc-500">
                                        {run.totalPrompts} prompts
                                    </span>
                                    <span className="text-zinc-500 ml-auto">
                                        {run.completedAt &&
                                            new Date(run.completedAt).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="text-center py-8 text-zinc-600 text-xs border-t border-white/[0.04]">
                <p>
                    Evaluations powered by automated benchmarks · Judge: Claude Opus 4.5
                </p>
            </footer>
        </div>
    );
}
