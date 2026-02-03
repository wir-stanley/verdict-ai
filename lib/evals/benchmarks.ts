/**
 * Benchmark Dataset
 * 
 * Curated prompts for automated model evaluation.
 * Categories: Coding, Reasoning, Creative, Factual
 */

export interface BenchmarkPrompt {
    id: string;
    category: "coding" | "reasoning" | "creative" | "factual";
    prompt: string;
    difficulty: "easy" | "medium" | "hard";
    evaluationCriteria: string[];  // What the Judge should look for
}

export const BENCHMARK_PROMPTS: BenchmarkPrompt[] = [
    // === CODING ===
    {
        id: "code-1",
        category: "coding",
        prompt: "Write a TypeScript function that debounces any function with proper typing. Explain your implementation.",
        difficulty: "medium",
        evaluationCriteria: [
            "Correct generic typing",
            "Proper cleanup of timeout",
            "Returns typed function",
            "Handles 'this' context correctly"
        ]
    },
    {
        id: "code-2",
        category: "coding",
        prompt: "Implement a simple LRU cache in Python with O(1) get and put operations.",
        difficulty: "hard",
        evaluationCriteria: [
            "Uses OrderedDict or doubly linked list + hashmap",
            "O(1) time complexity for both operations",
            "Handles capacity correctly",
            "Proper eviction of least recently used"
        ]
    },
    {
        id: "code-3",
        category: "coding",
        prompt: "Write a React hook that fetches data with loading, error, and refetch capabilities.",
        difficulty: "easy",
        evaluationCriteria: [
            "Handles loading state",
            "Handles error state",
            "Provides refetch function",
            "Cleans up on unmount"
        ]
    },
    {
        id: "code-4",
        category: "coding",
        prompt: "Write a SQL query to find the second highest salary in each department.",
        difficulty: "medium",
        evaluationCriteria: [
            "Correct use of window functions or subquery",
            "Handles ties correctly",
            "Groups by department",
            "Handles edge cases (single employee dept)"
        ]
    },
    {
        id: "code-5",
        category: "coding",
        prompt: "Implement a rate limiter using the token bucket algorithm in any language.",
        difficulty: "hard",
        evaluationCriteria: [
            "Correct token bucket implementation",
            "Thread-safe if relevant",
            "Configurable rate and capacity",
            "Handles edge cases"
        ]
    },

    // === REASONING ===
    {
        id: "reason-1",
        category: "reasoning",
        prompt: "A bat and ball cost $1.10. The bat costs $1.00 more than the ball. How much does the ball cost? Show your reasoning.",
        difficulty: "easy",
        evaluationCriteria: [
            "Correct answer ($0.05)",
            "Shows algebraic reasoning",
            "Explains common wrong answer trap ($0.10)",
            "Clear step-by-step logic"
        ]
    },
    {
        id: "reason-2",
        category: "reasoning",
        prompt: "You have 12 identical balls. One is either heavier or lighter than the rest. Using a balance scale, find the odd ball in 3 weighings. Explain your strategy.",
        difficulty: "hard",
        evaluationCriteria: [
            "Correct 3-weighing strategy",
            "Accounts for both heavier and lighter possibilities",
            "Systematic approach",
            "Complete solution for all cases"
        ]
    },
    {
        id: "reason-3",
        category: "reasoning",
        prompt: "Three doors. Behind one is a car, behind the others are goats. You pick door 1. The host opens door 3 (goat). Should you switch to door 2? Why?",
        difficulty: "medium",
        evaluationCriteria: [
            "Correct answer (switch)",
            "Explains 2/3 vs 1/3 probability",
            "Addresses conditional probability",
            "Clear intuition or mathematical proof"
        ]
    },
    {
        id: "reason-4",
        category: "reasoning",
        prompt: "A snail climbs 3 feet during the day and slides back 2 feet at night. How many days to climb a 10-foot wall?",
        difficulty: "easy",
        evaluationCriteria: [
            "Correct answer (8 days)",
            "Recognizes final day doesn't slide back",
            "Shows day-by-day reasoning",
            "Avoids off-by-one error"
        ]
    },
    {
        id: "reason-5",
        category: "reasoning",
        prompt: "If all Bloops are Razzies and all Razzies are Lazzies, are all Bloops definitely Lazzies? Explain with formal logic.",
        difficulty: "medium",
        evaluationCriteria: [
            "Correct answer (yes)",
            "Uses syllogistic reasoning",
            "Shows transitive property",
            "Could use set theory or predicate logic"
        ]
    },

    // === CREATIVE ===
    {
        id: "creative-1",
        category: "creative",
        prompt: "Write a 6-word story that captures loss. Then explain your creative choices.",
        difficulty: "easy",
        evaluationCriteria: [
            "Exactly 6 words",
            "Evokes emotional response",
            "Shows constraint mastery",
            "Thoughtful explanation"
        ]
    },
    {
        id: "creative-2",
        category: "creative",
        prompt: "Create a new word that describes the feeling of nostalgia for a future that will never happen. Define it and use it in a sentence.",
        difficulty: "medium",
        evaluationCriteria: [
            "Creative word construction",
            "Clear definition",
            "Natural usage in sentence",
            "Captures the concept well"
        ]
    },
    {
        id: "creative-3",
        category: "creative",
        prompt: "Write a haiku about a programmer debugging at 3am. Then write the same idea as a limerick.",
        difficulty: "medium",
        evaluationCriteria: [
            "Correct haiku format (5-7-5)",
            "Correct limerick format (AABBA)",
            "Same theme in both",
            "Clever or insightful content"
        ]
    },
    {
        id: "creative-4",
        category: "creative",
        prompt: "Pitch a startup idea that solves a problem that only becomes apparent in 2030.",
        difficulty: "hard",
        evaluationCriteria: [
            "Future-thinking but plausible",
            "Clear problem statement",
            "Viable solution",
            "Creative extrapolation of trends"
        ]
    },
    {
        id: "creative-5",
        category: "creative",
        prompt: "Describe a color that doesn't exist to someone who has never seen it.",
        difficulty: "hard",
        evaluationCriteria: [
            "Creative use of synesthesia",
            "Evocative language",
            "Avoids existing color references",
            "Creates vivid mental image"
        ]
    },

    // === FACTUAL ===
    {
        id: "factual-1",
        category: "factual",
        prompt: "What are the differences between TypeScript's `type` and `interface`? When should you use each?",
        difficulty: "medium",
        evaluationCriteria: [
            "Declaration merging for interfaces",
            "Union/intersection for types",
            "Extends vs intersection",
            "Practical guidance on when to use each"
        ]
    },
    {
        id: "factual-2",
        category: "factual",
        prompt: "Explain how HTTPS encryption works from the moment you type a URL to when the page renders.",
        difficulty: "hard",
        evaluationCriteria: [
            "DNS resolution",
            "TLS handshake",
            "Certificate verification",
            "Symmetric key exchange",
            "Data encryption/decryption"
        ]
    },
    {
        id: "factual-3",
        category: "factual",
        prompt: "What is the CAP theorem and what are its implications for distributed database design?",
        difficulty: "medium",
        evaluationCriteria: [
            "Correct definition (Consistency, Availability, Partition tolerance)",
            "Explains you can only have 2 of 3",
            "Real-world examples (CP vs AP systems)",
            "Trade-off discussion"
        ]
    },
    {
        id: "factual-4",
        category: "factual",
        prompt: "How do modern LLMs like GPT-4 and Claude work at a high level? Include training and inference.",
        difficulty: "hard",
        evaluationCriteria: [
            "Transformer architecture",
            "Pre-training on text data",
            "RLHF/fine-tuning",
            "Tokenization and inference process",
            "Attention mechanism basics"
        ]
    },
    {
        id: "factual-5",
        category: "factual",
        prompt: "What is the difference between concurrency and parallelism? Give examples in programming.",
        difficulty: "easy",
        evaluationCriteria: [
            "Clear distinction (structure vs execution)",
            "Correct examples of each",
            "Mentions single-core vs multi-core",
            "Relates to async programming"
        ]
    }
];

// Group prompts by category
export function getPromptsByCategory(category: BenchmarkPrompt["category"]): BenchmarkPrompt[] {
    return BENCHMARK_PROMPTS.filter(p => p.category === category);
}

// Get a random subset for quick evals
export function getRandomPrompts(count: number): BenchmarkPrompt[] {
    const shuffled = [...BENCHMARK_PROMPTS].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Get prompts balanced across categories
export function getBalancedPrompts(perCategory: number = 2): BenchmarkPrompt[] {
    const categories: BenchmarkPrompt["category"][] = ["coding", "reasoning", "creative", "factual"];
    const result: BenchmarkPrompt[] = [];

    for (const category of categories) {
        const categoryPrompts = getPromptsByCategory(category);
        const shuffled = categoryPrompts.sort(() => Math.random() - 0.5);
        result.push(...shuffled.slice(0, perCategory));
    }

    return result;
}
