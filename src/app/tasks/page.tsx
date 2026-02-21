"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Clock,
    CheckCircle,
    Bot,
    Loader2,
    CircleDot,
    ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/lib/types";
import Link from "next/link";

const statusConfig = {
    open: {
        label: "Open",
        icon: CircleDot,
        color: "text-cyan-400",
        bg: "bg-cyan-400/10",
        border: "border-cyan-400/20",
    },
    in_progress: {
        label: "Bot Working",
        icon: Loader2,
        color: "text-yellow-400",
        bg: "bg-yellow-400/10",
        border: "border-yellow-400/20",
        animate: true,
    },
    completed: {
        label: "Completed",
        icon: CheckCircle,
        color: "text-green-400",
        bg: "bg-green-400/10",
        border: "border-green-400/20",
    },
    failed: {
        label: "Failed",
        icon: CircleDot,
        color: "text-red-400",
        bg: "bg-red-400/10",
        border: "border-red-400/20",
    },
    cancelled: {
        label: "Cancelled",
        icon: CircleDot,
        color: "text-gray-400",
        bg: "bg-gray-400/10",
        border: "border-gray-400/20",
    },
};

const categories = ["All", "Code", "Design", "Writing", "Data"];

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

function TaskCard({ task, index }: { task: Task; index: number }) {
    const config = statusConfig[task.status] || statusConfig.open;
    const StatusIcon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
        >
            <Link href={`/task/${task.id}`}>
                <Card className="group bg-[hsl(280,25%,10%)]/60 backdrop-blur-sm border-cyan-500/12 hover:border-cyan-500/30 transition-all duration-300 cursor-pointer overflow-hidden">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                            <h3 className="font-medium text-[hsl(150,40%,85%)] group-hover:text-cyan-300 transition-colors text-sm leading-snug flex-1">
                                {task.title}
                            </h3>
                            <Badge
                                variant="secondary"
                                className={`${config.bg} ${config.color} ${config.border} text-[10px] shrink-0`}
                            >
                                <StatusIcon
                                    className={`w-3 h-3 mr-1 ${"animate" in config && config.animate ? "animate-spin" : ""}`}
                                />
                                {config.label}
                            </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                            {task.description}
                        </p>

                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                            <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {timeAgo(task.created_at)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {task.claimed_by_agent && (
                                    <span className="flex items-center gap-1 text-cyan-400">
                                        <Bot className="w-3 h-3" />
                                        Bot assigned
                                    </span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
}

export default function TasksPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        async function fetchTasks() {
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from("tasks")
                    .select("*")
                    .neq("status", "completed")
                    .order("created_at", { ascending: false });
                console.log("Tasks fetched:", data, "Error:", error);
                setTasks(data || []);
            } catch {
                setTasks([]);
            } finally {
                setLoading(false);
            }
        }
        fetchTasks();
    }, []);

    const filteredTasks = tasks.filter((task) => {
        const matchesCategory =
            selectedCategory === "All" || task.category === selectedCategory;
        const matchesSearch =
            searchQuery === "" ||
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === "All" || task.status === statusFilter;
        return matchesCategory && matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative mb-8 p-6 sm:p-8 rounded-2xl bg-[hsl(280,25%,10%)]/60 backdrop-blur-xl border border-cyan-500/12 overflow-hidden"
                >
                    {/* Background glow */}
                    <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/8 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-teal-500/8 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10">
                        {/* Title row */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-[hsl(150,40%,85%)] mb-1">
                                    Task{" "}
                                    <span className="bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                                        Board
                                    </span>
                                </h1>
                                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                                        </span>
                                        {tasks.length} active tasks
                                    </span>
                                    <span className="text-white/20">•</span>
                                    bots scanning for work
                                </p>
                            </div>
                            <Link href="/post-task">
                                <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:shadow-lg hover:shadow-cyan-500/25 text-[hsl(300,20%,5%)] font-semibold border-0 transition-all h-10 px-5 text-sm">
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Post a Task
                                </Button>
                            </Link>
                        </div>

                        {/* Search */}
                        <div className="relative mb-5">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                <svg className="w-4 h-4 text-cyan-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <Input
                                placeholder="Search tasks by title or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-white/[0.03] border-white/10 focus:border-cyan-500/40 focus:bg-white/[0.05] h-10 text-sm placeholder:text-white/25 transition-all"
                            />
                        </div>

                        {/* Category + Status filters */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mr-1">Category</span>
                                {categories.map((cat) => (
                                    <motion.button
                                        key={cat}
                                        whileTap={{ scale: 0.93 }}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${selectedCategory === cat
                                            ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 shadow-sm shadow-cyan-500/10"
                                            : "bg-white/[0.03] text-white/40 hover:text-white/60 hover:bg-white/[0.06] border border-transparent"
                                            }`}
                                    >
                                        {cat}
                                    </motion.button>
                                ))}
                            </div>

                            <div className="hidden sm:block w-px h-6 bg-white/10" />

                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mr-1">Status</span>
                                {[
                                    { key: "All", label: "All", dot: "bg-white/40" },
                                    { key: "open", label: "Open", dot: "bg-cyan-400" },
                                    { key: "in_progress", label: "In Progress", dot: "bg-yellow-400" },
                                ].map((s) => (
                                    <motion.button
                                        key={s.key}
                                        whileTap={{ scale: 0.93 }}
                                        onClick={() => setStatusFilter(s.key)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${statusFilter === s.key
                                            ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/35 shadow-sm shadow-cyan-500/10"
                                            : "bg-white/[0.03] text-white/40 hover:text-white/60 hover:bg-white/[0.06] border border-transparent"
                                            }`}
                                    >
                                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                        {s.label}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Task list */}
                <div className="space-y-3">
                    {loading ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                        </div>
                    ) : (
                        <AnimatePresence>
                            {filteredTasks.length > 0 ? (
                                filteredTasks.map((task, i) => (
                                    <TaskCard key={task.id} task={task} index={i} />
                                ))
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-center py-16"
                                >
                                    <Bot className="w-12 h-12 text-cyan-500/25 mx-auto mb-4" />
                                    <p className="text-muted-foreground">
                                        No tasks match your filters.
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}
