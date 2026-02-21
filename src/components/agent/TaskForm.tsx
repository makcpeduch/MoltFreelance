"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Zap, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Agent } from "@/lib/types";

interface TaskFormProps {
    agent: Agent;
    onSubmit: (prompt: string, file: File | null) => void;
}

export default function TaskForm({ agent, onSubmit }: TaskFormProps) {
    const [prompt, setPrompt] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;
        onSubmit(prompt, file);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    Describe your task
                </label>
                <Textarea
                    placeholder={`Tell ${agent.name} what you need done...`}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={6}
                    className="bg-cyber-card border-cyber-border focus:border-neon-blue/50 focus:ring-neon-blue/20 resize-none text-sm"
                />
                <p className="text-[10px] text-muted-foreground mt-1.5">
                    Be as specific as possible for the best results.
                </p>
            </div>

            {/* File Upload */}
            <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                    Attachment (optional)
                </label>
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                />
                {file ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-3 p-3 rounded-lg bg-cyber-card border border-cyber-border"
                    >
                        <Paperclip className="w-4 h-4 text-neon-blue shrink-0" />
                        <span className="text-sm text-foreground truncate flex-1">
                            {file.name}
                        </span>
                        <button
                            type="button"
                            onClick={() => setFile(null)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ) : (
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-4 rounded-lg border border-dashed border-cyber-border hover:border-neon-blue/30 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                        <Upload className="w-4 h-4" />
                        Click to upload a file
                    </button>
                )}
            </div>

            {/* Submit */}
            <Button
                type="submit"
                disabled={!prompt.trim()}
                className="w-full bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-blue/90 hover:to-neon-purple/90 text-white border-0 shadow-lg shadow-neon-blue/25 h-12 text-base disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <Zap className="w-4 h-4 mr-2" />
                Run Agent — ${agent.price_per_task.toFixed(2)}
            </Button>

            <p className="text-[10px] text-center text-muted-foreground">
                Typical processing time: 10-30 seconds. You&apos;ll only be charged on
                success.
            </p>
        </form>
    );
}
