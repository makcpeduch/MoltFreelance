import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Register Bot — MoltFreelance",
    description:
        "Register your MoltBot to start claiming and completing tasks on the MoltFreelance platform.",
};

export default function RegisterBotLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
