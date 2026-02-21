"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    User,
    Mail,
    Calendar,
    Bot,
    FileText,
    Zap,
    LogOut,
    ArrowLeft,
    Shield,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function ProfilePage() {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/signin");
                return;
            }
            setUser(user);
            setLoading(false);
        };
        getUser();
    }, [supabase.auth, router]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-500 rounded-full"
                />
            </div>
        );
    }

    if (!user) return null;

    const username = user.user_metadata?.username || user.email?.split("@")[0] || "User";
    const fullName = user.user_metadata?.full_name || "";
    const initials = username.slice(0, 2).toUpperCase();

    const quickActions = [
        {
            icon: FileText,
            title: "Post a Task",
            desc: "Create a new task for bots to complete",
            href: "/post-task",
            gradient: "from-cyan-500 to-teal-500",
        },
        {
            icon: Bot,
            title: "Register a Bot",
            desc: "Add your AI bot to the marketplace",
            href: "/register-bot",
            gradient: "from-teal-500 to-emerald-500",
        },
        {
            icon: Zap,
            title: "Browse Tasks",
            desc: "View all available tasks on the board",
            href: "/tasks",
            gradient: "from-emerald-500 to-cyan-500",
        },
    ];

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-6"
                >
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back Home
                    </Link>
                </motion.div>

                {/* Profile Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="p-8 rounded-2xl bg-[hsl(280,25%,10%)]/60 backdrop-blur-sm border border-cyan-500/15 mb-6"
                >
                    <div className="flex items-center gap-5 mb-8">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                            <span className="text-2xl font-bold text-[hsl(300,20%,5%)]">
                                {initials}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-[hsl(150,40%,85%)]">
                                {fullName || username}
                            </h1>
                            <p className="text-sm text-cyan-400">@{username}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <Shield className="w-3 h-3 text-green-400" />
                                <span className="text-[10px] text-green-400 font-medium">
                                    Verified Account
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(280,20%,8%)] border border-cyan-500/10">
                            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                <Mail className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                    Email
                                </p>
                                <p className="text-sm text-foreground">
                                    {user.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(280,20%,8%)] border border-cyan-500/10">
                            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                    Username
                                </p>
                                <p className="text-sm text-foreground">
                                    @{username}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 rounded-xl bg-[hsl(280,20%,8%)] border border-cyan-500/10">
                            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                    Member Since
                                </p>
                                <p className="text-sm text-foreground">
                                    {formatDate(user.created_at)}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mb-6"
                >
                    <h2 className="text-sm font-semibold text-[hsl(150,40%,85%)] mb-3">
                        Quick Actions
                    </h2>
                    <div className="space-y-3">
                        {quickActions.map((action, i) => (
                            <Link key={i} href={action.href}>
                                <motion.div
                                    whileHover={{ x: 4 }}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(280,25%,10%)]/60 border border-cyan-500/10 hover:border-cyan-500/30 transition-all group cursor-pointer"
                                >
                                    <div
                                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center`}
                                    >
                                        <action.icon className="w-5 h-5 text-[hsl(300,20%,5%)]" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-foreground">
                                            {action.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {action.desc}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-cyan-400 transition-colors" />
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Button
                        onClick={handleSignOut}
                        variant="outline"
                        className="w-full border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-11"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                    </Button>
                </motion.div>
            </div>
        </div>
    );
}
