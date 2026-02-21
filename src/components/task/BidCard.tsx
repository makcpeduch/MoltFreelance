"use client";

import { motion } from "framer-motion";
import { Bot, DollarSign, MessageSquare, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BidWithAgent } from "@/lib/types";

interface BidCardProps {
    bid: BidWithAgent;
    isOwner: boolean;
    onAccept: (bidId: string) => void;
    onReject: (bidId: string) => void;
    loading?: boolean;
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function BidCard({ bid, isOwner, onAccept, onReject, loading }: BidCardProps) {
    const statusColors = {
        pending: "border-cyan-500/15",
        accepted: "border-green-500/30",
        rejected: "border-red-500/20 opacity-50",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl bg-[hsl(280,25%,10%)]/60 backdrop-blur-sm border ${statusColors[bid.status]} transition-all`}
        >
            <div className="flex items-start justify-between gap-3">
                {/* Agent info */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-teal-500/20 border border-cyan-500/25 flex items-center justify-center shrink-0">
                        <Bot className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-[hsl(150,40%,85%)] truncate">
                            {bid.agent.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {timeAgo(bid.created_at)}
                        </p>
                    </div>
                </div>

                {/* Price badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 shrink-0">
                    <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-sm font-bold font-mono text-cyan-300">
                        {bid.proposed_price.toFixed(4)}
                    </span>
                </div>
            </div>

            {/* Message */}
            {bid.message && (
                <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-[hsl(280,20%,8%)] border border-white/5">
                    <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {bid.message}
                    </p>
                </div>
            )}

            {/* Status badge or action buttons */}
            {bid.status === "accepted" && (
                <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                        <Check className="w-3 h-3 text-green-400" />
                        <span className="text-xs font-medium text-green-400">Accepted</span>
                    </div>
                </div>
            )}

            {bid.status === "rejected" && (
                <div className="mt-3 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20">
                        <X className="w-3 h-3 text-red-400" />
                        <span className="text-xs font-medium text-red-400">Rejected</span>
                    </div>
                </div>
            )}

            {bid.status === "pending" && isOwner && (
                <div className="mt-3 flex items-center gap-2">
                    <Button
                        size="sm"
                        onClick={() => onAccept(bid.id)}
                        disabled={loading}
                        className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:shadow-lg hover:shadow-cyan-500/20 text-[hsl(300,20%,5%)] font-semibold border-0 h-8 text-xs"
                    >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        Accept
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onReject(bid.id)}
                        disabled={loading}
                        className="border-red-500/20 text-red-400 hover:bg-red-500/10 h-8 text-xs"
                    >
                        <X className="w-3.5 h-3.5 mr-1" />
                        Decline
                    </Button>
                </div>
            )}
        </motion.div>
    );
}
