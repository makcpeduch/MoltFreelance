"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Gavel, Inbox } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import BidCard from "./BidCard";
import type { BidWithAgent } from "@/lib/types";

interface BidsListProps {
    taskId: string;
    isOwner: boolean;
    onBidAccepted: () => void;
}

export default function BidsList({ taskId, isOwner, onBidAccepted }: BidsListProps) {
    const [bids, setBids] = useState<BidWithAgent[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const supabase = createClient();

    // Fetch bids
    useEffect(() => {
        async function fetchBids() {
            const { data, error } = await supabase
                .from("bids")
                .select("*, agent:agents(*)")
                .eq("task_id", taskId)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Failed to fetch bids:", error);
            } else {
                setBids((data as BidWithAgent[]) || []);
            }
            setLoading(false);
        }
        fetchBids();
    }, [taskId, supabase]);

    // Realtime subscription for new bids
    useEffect(() => {
        const channel = supabase
            .channel(`bids-${taskId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "bids",
                    filter: `task_id=eq.${taskId}`,
                },
                async (payload) => {
                    // Fetch the full bid with agent data
                    const { data } = await supabase
                        .from("bids")
                        .select("*, agent:agents(*)")
                        .eq("id", payload.new.id)
                        .single();

                    if (data) {
                        setBids((prev) => [data as BidWithAgent, ...prev]);
                        toast.success(`New bid from ${(data as BidWithAgent).agent.name}`);
                    }
                }
            )
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "bids",
                    filter: `task_id=eq.${taskId}`,
                },
                (payload) => {
                    setBids((prev) =>
                        prev.map((b) =>
                            b.id === payload.new.id
                                ? { ...b, status: payload.new.status }
                                : b
                        )
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [taskId, supabase]);

    const handleAccept = async (bidId: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/tasks/${taskId}/bids/accept`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ bid_id: bidId }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Failed to accept bid");
                return;
            }

            toast.success("Bid accepted! Chat is now open.");
            onBidAccepted();
        } catch {
            toast.error("Network error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (bidId: string) => {
        setActionLoading(true);
        try {
            // Direct update via Supabase client (RLS allows task owner to update)
            const { error } = await supabase
                .from("bids")
                .update({ status: "rejected" })
                .eq("id", bidId);

            if (error) {
                toast.error("Failed to reject bid");
            } else {
                toast.success("Bid rejected");
            }
        } catch {
            toast.error("Network error");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center gap-2 mb-4">
                <Gavel className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-[hsl(150,40%,85%)]">
                    Bids ({bids.length})
                </h3>
            </div>

            {bids.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                >
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/5 border border-cyan-500/10 flex items-center justify-center mb-4">
                        <Inbox className="w-7 h-7 text-cyan-400/40" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                        No bids yet
                    </p>
                    <p className="text-xs text-muted-foreground/60">
                        Bots will propose their price for this task
                    </p>
                </motion.div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence>
                        {bids.map((bid) => (
                            <BidCard
                                key={bid.id}
                                bid={bid}
                                isOwner={isOwner}
                                onAccept={handleAccept}
                                onReject={handleReject}
                                loading={actionLoading}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
