"use client";

import { useState, useCallback, useRef } from "react";
import { useUser, UserButton } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { QueryInput } from "@/components/query-input";
import { HistorySidebar } from "@/components/history-sidebar";
import { TurnDisplay, type TurnData } from "@/components/turn-display";
import { getActiveModelIds, type TribunalAnalysis } from "@/lib/types";
import type { Id } from "@/convex/_generated/dataModel";
import { WaitlistScreen } from "@/components/waitlist-screen";
import { OnboardingForm } from "@/components/onboarding-form";
// Removed uuid import

// Get active model IDs from registry
const MODEL_IDS = getActiveModelIds();

// Helper to create empty state object for all models
function createModelState<T>(defaultValue: T): Record<string, T> {
  const state: Record<string, T> = {};
  MODEL_IDS.forEach((id) => { state[id] = defaultValue; });
  return state;
}

export default function AppPage() {
  const { user } = useUser();
  const convexUser = useQuery(api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  const saveQuery = useMutation(api.queries.saveQuery);

  // State is now a list of turns (Thread) -- MOVED UP
  const [turns, setTurns] = useState<TurnData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort("User stopped");
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  const handleNewChat = useCallback(() => {
    handleStop();
    setTurns([]);
  }, [handleStop]);

  // Focus ref for auto-scrolling could be added later

  const handleQuery = useCallback(async (prompt: string) => {
    setIsLoading(true);

    // Create new turn
    const turnId = crypto.randomUUID();
    const newTurn: TurnData = {
      id: turnId,
      queryId: null,
      prompt,
      responses: createModelState(""),
      streaming: createModelState(true),
      errors: createModelState(undefined),
      analysis: null,
      isAnalyzing: false,
      streamingComplete: false,
      timestamp: Date.now(),
    };

    setTurns((prev) => [...prev, newTurn]);

    // Prepare history for API
    const previousTurns = turns.map(t => ({
      prompt: t.prompt,
      responses: t.responses
    }));

    const completedProviders = new Set<string>();
    // Mutable accumulator for this specific request to avoid stale closure issues
    const currentResponses: Record<string, string> = createModelState("");

    const controller = new AbortController();
    abortControllerRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          previousTurns // Send history context
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error("Failed to query LLMs");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response stream");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n\n").filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              const provider = data.provider as string;

              // Update state for this specific turn
              setTurns((prev) => {
                const idx = prev.findIndex(t => t.id === turnId);
                if (idx === -1) return prev;

                const updatedTurn = { ...prev[idx] };

                if (data.error) {
                  updatedTurn.errors = { ...updatedTurn.errors, [provider]: data.error };
                  updatedTurn.streaming = { ...updatedTurn.streaming, [provider]: false };
                  completedProviders.add(provider);
                } else if (data.done) {
                  updatedTurn.streaming = { ...updatedTurn.streaming, [provider]: false };
                  completedProviders.add(provider);
                } else if (data.content) {
                  // Safety check: specific handling for Anthropic/Provider errors that leak as text
                  if (data.content.trim().startsWith('{"type":"error"') || data.content.includes('"type":"overloaded_error"')) {
                    console.error("Detected JSON error in stream content:", data.content);
                    updatedTurn.errors = { ...updatedTurn.errors, [provider]: "Provider Overloaded" };
                    updatedTurn.streaming = { ...updatedTurn.streaming, [provider]: false };
                    completedProviders.add(provider);
                  } else {
                    // Update the turn state
                    updatedTurn.responses = {
                      ...updatedTurn.responses,
                      [provider]: updatedTurn.responses[provider] + data.content
                    };
                  }
                }

                const newTurns = [...prev];
                newTurns[idx] = updatedTurn;
                return newTurns;
              });

              // Update the mutable accumulator OUTSIDE the state updater to avoid side-effects in Strict Mode
              if (data.content && !data.error && !data.done) {
                // Safety check for error strings again purely for accumulator
                if (!(data.content.trim().startsWith('{"type":"error"') || data.content.includes('"type":"overloaded_error"'))) {
                  currentResponses[provider] += data.content;
                }
              }

            } catch {
              // Skip malformed JSON
            }
          }
        }
      }

      // Mark streaming complete
      setTurns((prev) => {
        const idx = prev.findIndex(t => t.id === turnId);
        if (idx === -1) return prev;
        const newTurns = [...prev];
        newTurns[idx] = { ...newTurns[idx], streamingComplete: true };
        return newTurns;
      });

      // Trigger analysis when all complete
      // We check if we have responses from all active models
      if (completedProviders.size >= MODEL_IDS.length - 1) { // Tolerate 1 failure if needed, or strict ===
        // Set analyzing state
        setTurns((prev) => {
          const idx = prev.findIndex(t => t.id === turnId);
          if (idx === -1) return prev;
          const newTurns = [...prev];
          newTurns[idx] = { ...newTurns[idx], isAnalyzing: true };
          return newTurns;
        });

        let analysisResult: TribunalAnalysis | null = null;
        const analysisController = new AbortController();
        const analysisTimeout = setTimeout(() => analysisController.abort(), 60000); // 60s timeout

        try {
          const analysisResponse = await fetch("/api/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt,
              responses: currentResponses,
            }),
            signal: analysisController.signal,
          });
          clearTimeout(analysisTimeout);

          if (analysisResponse.ok) {
            const data = await analysisResponse.json();
            analysisResult = data.analysis;

            // Update turn with analysis
            setTurns((prev) => {
              const idx = prev.findIndex(t => t.id === turnId);
              if (idx === -1) return prev;
              const newTurns = [...prev];
              newTurns[idx] = { ...newTurns[idx], analysis: data.analysis, isAnalyzing: false };
              return newTurns;
            });
          }
        } catch (error) {
          console.error("Analysis failed:", error);
          setTurns((prev) => {
            const idx = prev.findIndex(t => t.id === turnId);
            if (idx === -1) return prev;
            const newTurns = [...prev];
            newTurns[idx] = { ...newTurns[idx], isAnalyzing: false };
            return newTurns;
          });
        }

        // Save to history
        if (user?.id) {
          try {
            // Get parent ID from previous turn if exists
            const parentTurn = turns.length > 0 ? turns[turns.length - 1] : null;
            const parentId = parentTurn?.queryId;

            // Sanitize analysis to remove nulls (Convex expects undefined for optional fields)
            const sanitizedAnalysis = analysisResult ? {
              consensusLevel: analysisResult.consensusLevel,
              agreementCount: analysisResult.agreementCount,
              headline: analysisResult.headline,
              verdict: analysisResult.verdict,
              bestAnswer: analysisResult.bestAnswer,
              winner: analysisResult.winner,
              conflicts: analysisResult.conflicts?.map(c => ({
                ...c,
                judgeNote: c.judgeNote ?? undefined,
              })),
              textHighlights: analysisResult.textHighlights?.map(h => ({
                ...h,
                conflictIndex: h.conflictIndex ?? undefined,
                note: h.note ?? undefined,
              })),
            } : undefined;

            const queryId = await saveQuery({
              clerkId: user.id,
              prompt,
              parentId: parentId || undefined,
              responses: currentResponses,
              analysis: sanitizedAnalysis,
            });

            // Update turn with saved query ID
            setTurns((prev) => {
              const idx = prev.findIndex(t => t.id === turnId);
              if (idx === -1) return prev;
              const newTurns = [...prev];
              newTurns[idx] = { ...newTurns[idx], queryId };
              return newTurns;
            });

          } catch (error) {
            console.error("Failed to save query:", error);
          }
        }
      }
    } catch (error) {
      console.error("Query failed:", error);
      // Handle global error for this turn
      setTurns((prev) => {
        const idx = prev.findIndex(t => t.id === turnId);
        if (idx === -1) return prev;
        const newTurns = [...prev];
        // Mark all as failed
        MODEL_IDS.forEach(p => {
          newTurns[idx].errors[p] = "Request failed";
          newTurns[idx].streaming[p] = false;
        });
        newTurns[idx].streamingComplete = true;
        return newTurns;
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, saveQuery, turns]); // Dependency on turns for history

  // Load a query from history
  const handleSelectQuery = useCallback((query: {
    prompt: string;
    responses: Record<string, string>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    analysis?: Record<string, any>;
  }) => {
    // When loading history, we currently just show that single turn
    // (Future: Load ancestor chain)

    let analysisObj: TribunalAnalysis | null = null;
    if (query.analysis) {
      analysisObj = {
        consensusLevel: query.analysis.consensusLevel || "partial",
        agreementCount: query.analysis.agreementCount || 2,
        headline: query.analysis.headline || "Loaded from History",
        verdict: query.analysis.verdict || "",
        agreements: query.analysis.agreements || [],
        disagreements: query.analysis.disagreements || [],
        bestAnswer: query.analysis.bestAnswer || "",
        modelRatings: query.analysis.modelRatings || {},
        winner: query.analysis.winner || "tie",
        conflicts: query.analysis.conflicts || [],
        textHighlights: query.analysis.textHighlights || [],
      };
    }

    const loadedTurn: TurnData = {
      id: crypto.randomUUID(),
      queryId: null, // We don't have the real ID passed from history sidebar easily without updating props, but it's ok
      prompt: query.prompt,
      responses: query.responses,
      streaming: createModelState(false),
      errors: createModelState(undefined),
      analysis: analysisObj,
      isAnalyzing: false,
      streamingComplete: true,
      timestamp: Date.now(),
    };

    setTurns([loadedTurn]);
  }, []);

  // --- RENDERING GATES ---
  // Handle Loading State
  if (convexUser === undefined) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/10 border-t-white/50 rounded-full animate-spin" />
      </div>
    );
  }

  // Strict Gate: Only 'active' users can pass.
  // This catches: 'waitlist', 'rejected', and legacy users (undefined status)
  if (!convexUser || (convexUser.status !== "active" && convexUser.role !== "admin")) {
    // If they have onboarding data, show the Waiting Room
    if (convexUser?.profession && convexUser?.useCase) {
      return <WaitlistScreen />;
    }
    // Otherwise, show the Application Form
    return <OnboardingForm />;
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-x-hidden">
      {/* Noise overlay */}
      <div className="noise-overlay" />

      {/* History Sidebar */}
      <HistorySidebar onSelectQuery={handleSelectQuery} onNewChat={handleNewChat} />

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-purple-900/20 via-purple-900/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 pl-12">
        {/* Header */}
        <header className={`transition-all duration-700 ${turns.length > 0 ? "py-4" : "py-12 lg:py-20"}`}>
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex-1" />
            <h1 className={`font-bold tracking-tight transition-all duration-700 ${turns.length > 0 ? "text-2xl md:text-3xl" : "text-5xl md:text-7xl lg:text-8xl"}`}>
              <span className="gradient-text">verdict.ai</span>
            </h1>
            <div className="flex-1 flex justify-end">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9",
                  }
                }}
              />
            </div>
          </div>

          {turns.length === 0 && (
            <p className="text-zinc-400 max-w-xl mx-auto mt-4 text-center text-base lg:text-lg">
              Ask once. Get answers from 3 frontier AI models.
              <br />
              <span className="text-zinc-500">We synthesize the verdict for you.</span>
            </p>
          )}
        </header>

        {/* Main */}
        <main className="container mx-auto px-4 pb-32"> {/* Added pb-32 for bottom input space */}

          {/* Initial Empty State Input */}
          {turns.length === 0 && (
            <div className="max-w-4xl mx-auto mt-6">
              <QueryInput onSubmit={handleQuery} onStop={handleStop} isLoading={isLoading} />
            </div>
          )}

          {/* Thread Turns */}
          <div className="flex flex-col">
            {turns.map((turn, index) => (
              <TurnDisplay
                key={turn.id}
                turn={turn}
                isLast={index === turns.length - 1}
              />
            ))}
          </div>

          {/* Follow-up Input (Sticky Bottom) */}
          {turns.length > 0 && (
            <div className="fixed bottom-0 left-12 right-0 p-6 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent z-20">
              <div className="max-w-3xl mx-auto">
                <QueryInput
                  onSubmit={handleQuery}
                  onStop={handleStop}
                  isLoading={isLoading}
                  placeholder="Ask a follow-up question..."
                />
              </div>
            </div>
          )}
        </main>

        {/* Footer */}
        {turns.length === 0 && (
          <footer className="text-center py-8 text-zinc-600 text-xs">
            <p>Powered by Claude Opus 4.5 · GPT-5.2 · Gemini 3 Pro</p>
          </footer>
        )}
      </div>
    </div>
  );
}
