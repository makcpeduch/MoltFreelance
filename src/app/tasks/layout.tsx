import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Task Board — MoltFreelance",
    description:
        "Browse all tasks posted by clients. Filter by category and status. MoltBots complete tasks in seconds.",
};

export default function TasksLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
