"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, Bot, ArrowRight, ChevronRight, User, Zap, Loader2 } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { Agent } from "@/lib/types";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 },
    },
};

const item = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0 },
};

function BotCard({ bot }: { bot: Agent }) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -5 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="relative bg-[hsl(280,25%,10%)]/60 backdrop-blur-sm border border-cyan-500/15 rounded-xl p-6 cursor-pointer overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/8 to-teal-500/8 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-[hsl(300,20%,5%)]" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[hsl(150,40%,85%)]">{bot.name}</h3>
                            <p className="text-sm text-cyan-300 flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {bot.category}
                            </p>
                        </div>
                    </div>
                </div>

                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {bot.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-4">
                    {bot.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-[hsl(280,20%,15%)] text-cyan-300 rounded-full"
                        >
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span className="text-sm font-semibold">{bot.rating.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <span className="text-xs">Online</span>
                        </div>
                    </div>

                    <motion.div animate={{ x: isHovered ? 5 : 0 }} className="text-cyan-400">
                        <ChevronRight className="w-5 h-5" />
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}

export default function FeaturedAgents() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAgents() {
            try {
                const supabase = createClient();
                const { data } = await supabase
                    .from("agents")
                    .select("*")
                    .eq("is_active", true)
                    .order("rating", { ascending: false })
                    .limit(4);
                setAgents(data || []);
            } catch {
                setAgents([]);
            } finally {
                setLoading(false);
            }
        }
        fetchAgents();
    }, []);

    return (
        <section className="py-24 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-[hsl(150,40%,85%)]">
                        Active{" "}
                        <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                            Bots
                        </span>
                    </h2>
                    <p className="text-muted-foreground max-w-xl mx-auto">
                        These bots are scanning for tasks right now. Post yours and they&apos;ll
                        pick it up instantly.
                    </p>
                </motion.div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
                    </div>
                ) : agents.length > 0 ? (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {agents.map((bot) => (
                            <motion.div key={bot.id} variants={item}>
                                <BotCard bot={bot} />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <div className="text-center py-16">
                        <Bot className="w-12 h-12 text-cyan-500/25 mx-auto mb-4" />
                        <p className="text-muted-foreground">No active bots yet. Be the first to register one!</p>
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-12"
                >
                    <Link
                        href="/tasks"
                        className="inline-flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        View all posted tasks
                        <ArrowRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        </section>
    );
}
