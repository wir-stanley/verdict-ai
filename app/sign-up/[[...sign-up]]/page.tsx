import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center">
            <SignUp
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "bg-zinc-900 border border-zinc-800",
                    }
                }}
            />
        </div>
    );
}
