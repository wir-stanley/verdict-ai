import Image from "next/image";

export const OpenAILogo = ({ className }: { className?: string }) => (
    <div className={`relative ${className}`}>
        <Image
            src="/logos/openai.png"
            alt="OpenAI Logo"
            fill
            className="object-contain brightness-0 invert"
            unoptimized
        />
    </div>
);

export const AnthropicLogo = ({ className }: { className?: string }) => (
    <div className={`relative ${className}`}>
        <Image
            src="/logos/anthropic.png"
            alt="Anthropic Logo"
            fill
            className="object-contain brightness-0 invert"
            unoptimized
        />
    </div>
);

export const GeminiLogo = ({ className }: { className?: string }) => (
    <div className={`relative ${className}`}>
        <Image
            src="/logos/gemini.png"
            alt="Gemini Logo"
            fill
            className="object-contain brightness-0 invert"
            unoptimized
        />
    </div>
);
