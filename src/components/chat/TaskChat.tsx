"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, MessageCircle, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage } from "@/lib/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface TaskChatProps {
    taskId: string;
    currentUser: SupabaseUser;
    agentDeveloperId: string | null;
}

export default function TaskChat({ taskId, currentUser, agentDeveloperId }: TaskChatProps) {
    const [messages, setMessages] = useState<(ChatMessage & { sender_name?: string })[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const supabase = createClient();

    const scrollToBottom = useCallback(() => {
        setTimeout(() => {
            scrollRef.current?.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: "smooth",
            });
        }, 100);
    }, []);

    useEffect(() => {
        async function fetchMessages() {
            const { data, error } = await supabase
                .from("chat_messages")
                .select("*, sender:profiles(username, full_name)")
                .eq("task_id", taskId)
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Failed to fetch messages:", error);
            } else {
                const mapped = (data || []).map((msg: Record<string, unknown>) => ({
                    ...msg,
                    sender_name:
                        (msg.sender as Record<string, string>)?.full_name ||
                        (msg.sender as Record<string, string>)?.username ||
                        "Unknown",
                })) as (ChatMessage & { sender_name?: string })[];
                setMessages(mapped);
            }
            setLoading(false);
            scrollToBottom();
        }
        fetchMessages();
    }, [taskId, supabase, scrollToBottom]);

    useEffect(() => {
        const channel = supabase
            .channel(`chat-${taskId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_messages",
                    filter: `task_id=eq.${taskId}`,
                },
                async (payload) => {
                    const { data } = await supabase
                        .from("chat_messages")
                        .select("*, sender:profiles(username, full_name)")
                        .eq("id", payload.new.id)
                        .single();

                    if (data) {
                        const msg = {
                            ...data,
                            sender_name:
                                (data.sender as Record<string, string>)?.full_name ||
                                (data.sender as Record<string, string>)?.username ||
                                "Unknown",
                        } as ChatMessage & { sender_name?: string };

                        setMessages((prev) => {
                            if (prev.some((m) => m.id === msg.id)) return prev;
                            return [...prev, msg];
                        });
                        scrollToBottom();
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [taskId, supabase, scrollToBottom]);

    const handleSend = async () => {
        if (!input.trim() || sending) return;

        const content = input.trim();
        setInput("");
        setSending(true);

        const { error } = await supabase.from("chat_messages").insert({
            task_id: taskId,
            sender_id: currentUser.id,
            content,
        });

        if (error) {
            console.error("Failed to send:", error);
            setInput(content);
        }

        setSending(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isOwnMessage = (senderId: string) => senderId === currentUser.id;
    const isBotDeveloper = (senderId: string) => senderId === agentDeveloperId;

    function formatTime(dateStr: string) {
        return new Date(dateStr).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return (
        <div className="flex flex-col rounded-xl bg-[hsl(280,25%,10%)]/60 backdrop-blur-sm border border-cyan-500/15 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
                <MessageCircle className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-[hsl(150,40%,85%)]">
                    Task Chat
                </h3>
                <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[10px] text-green-400">Live</span>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[300px] max-h-[500px] scrollbar-thin"
            >
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <MessageCircle className="w-8 h-8 text-cyan-400/20 mb-3" />
                        <p className="text-sm text-muted-foreground">
                            No messages yet. Start the conversation!
                        </p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {messages.map((msg) => {
                            const own = isOwnMessage(msg.sender_id);
                            const botDev = isBotDeveloper(msg.sender_id);
                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex ${own ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`max-w-[75%] ${own ? "items-end" : "items-start"} flex flex-col gap-1`}>
                                        <div className={`flex items-center gap-1.5 px-1 ${own ? "flex-row-reverse" : ""}`}>
                                            {botDev ? (
                                                <Bot className="w-3 h-3 text-cyan-400" />
                                            ) : (
                                                <User className="w-3 h-3 text-teal-400" />
                                            )}
                                            <span className="text-[10px] text-muted-foreground">
                                                {own ? "You" : msg.sender_name}
                                            </span>
                                            <span className="text-[9px] text-muted-foreground/50">
                                                {formatTime(msg.created_at)}
                                            </span>
                                        </div>
                                        <div
                                            className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${own
                                                ? "bg-gradient-to-r from-cyan-500/20 to-teal-500/20 border border-cyan-500/20 text-foreground rounded-br-md"
                                                : "bg-[hsl(280,20%,8%)] border border-white/5 text-foreground rounded-bl-md"
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>

            <div className="p-3 border-t border-white/5 bg-white/[0.01]">
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        className="flex-1 bg-[hsl(280,20%,8%)] border border-cyan-500/10 rounded-lg px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-cyan-500/30 transition-colors"
                    />
                    <Button
                        onClick={handleSend}
                        disabled={!input.trim() || sending}
                        size="sm"
                        className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:shadow-lg hover:shadow-cyan-500/20 text-[hsl(300,20%,5%)] font-semibold border-0 h-10 w-10 p-0 shrink-0"
                    >
                        {sending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
