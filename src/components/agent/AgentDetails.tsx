"use client";

import { Star, CheckCircle, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AgentWithDeveloper } from "@/lib/types";

const categoryIcons: Record<string, string> = {
    Code: "🧑‍💻",
    Design: "🎨",
    Writing: "✍️",
    Legal: "⚖️",
    Data: "📊",
    Marketing: "📣",
    Audio: "🎧",
};

interface AgentDetailsProps {
    agent: AgentWithDeveloper;
}

export default function AgentDetails({ agent }: AgentDetailsProps) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-white/10 flex items-center justify-center text-3xl shrink-0">
                    {categoryIcons[agent.category] || "🤖"}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground">{agent.name}</h1>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        by {agent.developer?.full_name || agent.developer?.username}
                        <CheckCircle className="w-3.5 h-3.5 text-neon-blue" />
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-xl bg-cyber-card border border-cyber-border text-center">
                    <Star className="w-4 h-4 text-neon-blue mx-auto mb-1" />
                    <p className="text-lg font-bold font-mono text-foreground">
                        {agent.rating.toFixed(1)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                        {agent.total_reviews.toLocaleString()} reviews
                    </p>
                </div>
                <div className="p-3 rounded-xl bg-cyber-card border border-cyber-border text-center">
                    <CheckCircle className="w-4 h-4 text-neon-blue mx-auto mb-1" />
                    <p className="text-lg font-bold font-mono text-foreground">
                        {agent.total_tasks_completed.toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">tasks done</p>
                </div>
                <div className="p-3 rounded-xl bg-cyber-card border border-cyber-border text-center">
                    <Clock className="w-4 h-4 text-neon-blue mx-auto mb-1" />
                    <p className="text-lg font-bold font-mono text-foreground">&lt;30s</p>
                    <p className="text-[10px] text-muted-foreground">avg. time</p>
                </div>
            </div>

            <Separator className="bg-white/5" />

            {/* Description */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">About this agent</h3>
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {agent.long_description || agent.description}
                </div>
            </div>

            <Separator className="bg-white/5" />

            {/* Tags */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Capabilities</h3>
                <div className="flex flex-wrap gap-2">
                    {agent.tags.map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="bg-white/5 text-muted-foreground border-white/10 text-xs"
                        >
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Price */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-neon-blue/10 to-neon-purple/10 border border-neon-blue/20 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-neon-blue" />
                        <span className="text-sm text-foreground font-medium">Price per task</span>
                    </div>
                    <span className="text-2xl font-bold font-mono text-neon-blue">
                        ${agent.price_per_task.toFixed(2)}
                    </span>
                </div>
                <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Developer earnings</span>
                        <span className="text-foreground font-mono">${(agent.price_per_task * 0.7).toFixed(3)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Platform fee (30%)</span>
                        <span className="text-muted-foreground font-mono">${(agent.price_per_task * 0.3).toFixed(3)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
