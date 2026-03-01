"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    ArrowLeft,
    Clock,
    Bot,
    CheckCircle,
    CircleDot,
    Loader2,
    User,
    DollarSign,
    Gavel,
    Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import BidsList from "@/components/task/BidsList";
import TaskChat from "@/components/chat/TaskChat";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Task, Agent } from "@/lib/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    open: {
        label: "Open — Waiting for bids",
        color: "text-cyan-400",
        bg: "bg-cyan-400/10",
        border: "border-cyan-400/20",
    },
    in_progress: {
        label: "In Progress",
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
        border: "border-yellow-400/20",
    },
    completed: {
        label: "Completed",
        color: "text-green-400",
        bg: "bg-green-400/10",
        border: "border-green-400/20",
    },
    failed: {
        label: "Failed",
        color: "text-red-400",
        bg: "bg-red-400/10",
        border: "border-red-400/20",
    },
};

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function TaskDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [task, setTask] = useState<Task | null>(null);
    const [claimedBot, setClaimedBot] = useState<Agent | null>(null);
    const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);

    const supabase = createClient();

    useEffect(() => {
        async function fetchData() {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setCurrentUser(user);

                const { data: taskData } = await supabase
                    .from("tasks")
                    .select("*")
                    .eq("id", params.id)
                    .single();

                if (taskData) {
                    setTask(taskData);

                    if (taskData.claimed_by_agent) {
                        const { data: agentData } = await supabase
                            .from("agents")
                            .select("*")
                            .eq("id", taskData.claimed_by_agent)
                            .single();
                        setClaimedBot(agentData || null);
                    }
                }
            } catch {
                setTask(null);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [params.id, supabase]);

    const handleBidAccepted = () => {
        router.refresh();
        globalThis.location.reload();
    };

    const [deleting, setDeleting] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDelete = async () => {
        if (!task || !currentUser) return;

        setDeleting(true);
        const { error } = await supabase
            .from("tasks")
            .delete()
            .eq("id", task.id)
            .eq("client_id", currentUser.id);

        if (error) {
            console.error("Delete error:", error);
            const { toast } = await import("sonner");
            toast.error("Failed to delete task.");
            setDeleting(false);
            return;
        }

        const { toast } = await import("sonner");
        toast.success("Task deleted.");
        router.push("/tasks");
    };

    const isOwner = currentUser?.id === task?.client_id;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
        );
    }

    if (!task) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-2 text-[hsl(150,40%,85%)]">Task Not Found</h1>
                    <p className="text-muted-foreground mb-4">
                        This task doesn&apos;t exist or has been removed.
                    </p>
                    <Link href="/tasks" className="text-cyan-400 hover:underline">
                        ← Back to Task Board
                    </Link>
                </div>
            </div>
        );
    }

    const config = statusConfig[task.status] || statusConfig.open;

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-8"
                >
                    <Link
                        href="/tasks"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Task Board
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 sm:p-8 rounded-2xl bg-[hsl(280,25%,10%)]/60 backdrop-blur-sm border border-cyan-500/12"
                >
                    <div className="flex items-start justify-between gap-4 mb-4">
                        <h1 className="text-xl sm:text-2xl font-bold text-[hsl(150,40%,85%)]">
                            {task.title}
                        </h1>
                        <Badge
                            variant="secondary"
                            className={`${config.bg} ${config.color} ${config.border} text-xs shrink-0`}
                        >
                            {task.status === "in_progress" && (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                            )}
                            {task.status === "completed" && (
                                <CheckCircle className="w-3 h-3 mr-1" />
                            )}
                            {task.status === "open" && (
                                <Gavel className="w-3 h-3 mr-1" />
                            )}
                            {task.status !== "in_progress" && task.status !== "completed" && task.status !== "open" && (
                                <CircleDot className="w-3 h-3 mr-1" />
                            )}
                            {config.label}
                        </Badge>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
                        <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Task #{task.id.slice(0, 8)}
                        </span>
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {timeAgo(task.created_at)}
                        </span>
                        {task.category && (
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/15 text-cyan-300 text-[10px]">
                                {task.category}
                            </span>
                        )}
                    </div>

                    <Separator className="bg-white/5 mb-6" />

                    <div className="mb-6">
                        <h3 className="text-sm font-semibold text-foreground mb-2">
                            Task Description
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {task.description}
                        </p>
                    </div>

                    {isOwner && task.status === "open" && (
                        <div className="mb-6">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteModal(true)}
                                className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/40 transition-all"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Task
                            </Button>
                        </div>
                    )}

                    {task.claimed_by_agent && claimedBot && (
                        <>
                            <Separator className="bg-white/5 mb-6" />
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-foreground mb-3">
                                    Assigned Bot
                                </h3>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(280,20%,8%)] border border-cyan-500/15">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-[hsl(300,20%,5%)]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-foreground">
                                            {claimedBot.name}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground">
                                            {claimedBot.total_tasks_completed.toLocaleString()} tasks done
                                        </p>
                                    </div>
                                    <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        <span className="text-[10px] font-medium text-green-400">Working</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/5 to-teal-500/5 border border-cyan-500/15 mb-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <DollarSign className="w-3.5 h-3.5" />
                                        Agreed Price
                                    </span>
                                    <span className="font-bold font-mono text-cyan-400">
                                        ${task.budget.toFixed(4)}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}

                    {task.status === "open" && (
                        <>
                            <Separator className="bg-white/5 mb-6" />
                            <BidsList
                                taskId={task.id}
                                isOwner={isOwner}
                                onBidAccepted={handleBidAccepted}
                            />
                        </>
                    )}
                </motion.div>

                {(task.status === "in_progress" || task.status === "completed") && currentUser && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-6"
                    >
                        <TaskChat
                            taskId={task.id}
                            currentUser={currentUser}
                            agentDeveloperId={claimedBot?.developer_id || null}
                        />
                    </motion.div>
                )}

                {showDeleteModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full max-w-md p-6 rounded-2xl bg-[hsl(280,25%,10%)] border border-red-500/20 shadow-2xl relative"
                        >
                            <h2 className="text-xl font-bold text-red-500 mb-2">Delete Task?</h2>
                            <p className="text-muted-foreground mb-6 text-sm">
                                Are you sure you want to delete this task? This action cannot be undone and will permanently remove the task from the board.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteModal(false)}
                                    disabled={deleting}
                                    className="border-white/10 hover:bg-white/5"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 transition-all"
                                >
                                    {deleting ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4 mr-2" />
                                    )}
                                    Delete Task
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
        </div>
    );
}
