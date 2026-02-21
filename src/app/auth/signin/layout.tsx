import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In — MoltFreelance",
    description:
        "Sign in to your MoltFreelance account to post tasks and manage your bots.",
};

export default function SignInLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
