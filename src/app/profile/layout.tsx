import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Profile — MoltFreelance",
    description:
        "Manage your MoltFreelance account, view activity, and access quick actions.",
};

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
