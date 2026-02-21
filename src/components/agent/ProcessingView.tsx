"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Download, Loader2, Cpu, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Agent } from "@/lib/types";
import dynamic from "next/dynamic";

const MatrixRain = dynamic(() => import("@/components/ui/MatrixRain"), {
    ssr: false,
});

const terminalMessages = [
    "Initializing AI agent...",
    "Loading neural network weights...",
    "Connecting to inference engine...",
    "Analyzing input parameters...",
    "Processing task with GPT-4 architecture...",
    "Validating task requirements...",
    "Allocating compute resources...",
    "Starting primary analysis...",
    "Running semantic decomposition...",
    "Executing subtask pipeline...",
    "Applying domain-specific rules...",
    "Cross-referencing knowledge base...",
    "Optimizing output quality...",
    "Running validation checks...",
    "Finalizing output artifacts...",
    "Compiling deliverables...",
    "Task completed successfully ✓",
];

interface ProcessingViewProps {
    agent: Agent;
    prompt: string;
    onComplete: () => void;
    onReset: () => void;
}

export default function ProcessingView({
    agent,
    prompt,
    onComplete,
    onReset,
}: ProcessingViewProps) {
    const [progress, setProgress] = useState(0);
    const [currentMessages, setCurrentMessages] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    const [currentPhase, setCurrentPhase] = useState(0);

    const addMessage = useCallback((msg: string) => {
        setCurrentMessages((prev) => [...prev, msg]);
    }, []);

    useEffect(() => {
        let msgIndex = 0;
        const totalDuration = 12000;
        const interval = totalDuration / terminalMessages.length;

        const timer = setInterval(() => {
            if (msgIndex < terminalMessages.length) {
                addMessage(terminalMessages[msgIndex]);
                setProgress(((msgIndex + 1) / terminalMessages.length) * 100);
                setCurrentPhase(
                    Math.floor((msgIndex / terminalMessages.length) * 4)
                );
                msgIndex++;
            } else {
                clearInterval(timer);
                setIsComplete(true);
                onComplete();
            }
        }, interval);

        return () => clearInterval(timer);
    }, [addMessage, onComplete]);

    const phases = ["Initializing", "Analyzing", "Processing", "Finalizing"];

    return (
        <div className="relative space-y-6">
            <div className="absolute -inset-4 -z-10 rounded-3xl overflow-hidden opacity-40">
                <MatrixRain
                    fontSize={14}
                    color="#00d4aa"
                    characters="01"
                    fadeOpacity={0.05}
                    speed={1.5}
                />
            </div>

            {/* Agent header */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(280,25%,10%)]/90 backdrop-blur-xl border border-cyan-500/20">
                <motion.div
                    animate={!isComplete ? { rotate: 360 } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 flex items-center justify-center shrink-0 shadow-lg shadow-cyan-500/30"
                >
                    {isComplete ? (
                        <CheckCircle className="w-7 h-7 text-[hsl(300,20%,5%)]" />
                    ) : (
                        <Cpu className="w-7 h-7 text-[hsl(300,20%,5%)]" />
                    )}
                </motion.div>
                <div>
                    <h2 className="text-lg font-bold text-[hsl(150,40%,85%)]">{agent.name}</h2>
                    <p className={isComplete ? "text-green-400 text-sm" : "text-cyan-300 text-sm"}>
                        {isComplete ? "Task completed!" : "Processing your task..."}
                    </p>
                </div>
            </div>

            {/* Phase indicator */}
            <div className="flex items-center justify-center gap-2">
                {phases.map((phase, i) => (
                    <div key={phase} className="flex items-center gap-2">
                        <motion.div
                            className={`w-2 h-2 rounded-full ${i <= currentPhase
                                ? isComplete
                                    ? "bg-green-500"
                                    : "bg-cyan-500"
                                : "bg-white/10"
                                }`}
                            animate={
                                i === currentPhase && !isComplete
                                    ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }
                                    : {}
                            }
                            transition={{ duration: 1, repeat: Infinity }}
                        />
                        <span
                            className={`text-xs ${i <= currentPhase
                                ? isComplete
                                    ? "text-green-400"
                                    : "text-foreground"
                                : "text-muted-foreground/40"
                                }`}
                        >
                            {phase}
                        </span>
                        {i < phases.length - 1 && (
                            <div
                                className={`w-8 h-px ${i < currentPhase
                                    ? isComplete
                                        ? "bg-green-500/50"
                                        : "bg-cyan-500/50"
                                    : "bg-white/5"
                                    }`}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-cyan-300">Progress</span>
                    <span className="font-mono text-cyan-400">{Math.round(progress)}%</span>
                </div>
                <div className="relative h-3 bg-[hsl(280,20%,8%)] rounded-full overflow-hidden">
                    <motion.div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                            background: isComplete
                                ? "#22c55e"
                                : "linear-gradient(90deg, #00d4aa, #14b8a6)",
                        }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                    {!isComplete && (
                        <motion.div
                            className="absolute inset-y-0 w-20 rounded-full"
                            style={{
                                background:
                                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                            }}
                            animate={{ left: ["-20%", "120%"] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                    )}
                </div>
            </div>

            {/* Terminal output */}
            <div className="rounded-xl bg-[hsl(280,25%,10%)]/90 backdrop-blur-xl border border-cyan-500/20 overflow-hidden shadow-2xl shadow-cyan-500/5">
                <div className="flex items-center gap-1.5 px-4 py-2.5 bg-white/[0.02] border-b border-white/5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                    <span className="text-[10px] text-muted-foreground ml-2 font-mono">
                        bot-runtime — {agent.slug}
                    </span>
                </div>
                <div className="p-4 h-64 overflow-y-auto font-mono text-sm space-y-2 scrollbar-thin">
                    <AnimatePresence>
                        {currentMessages.map((msg, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-2"
                            >
                                <ChevronRight className="w-4 h-4 text-cyan-500 shrink-0" />
                                <span
                                    className={
                                        msg.includes("✓")
                                            ? "text-green-400"
                                            : "text-cyan-300/80"
                                    }
                                >
                                    {msg}
                                </span>
                                {i === currentMessages.length - 1 && !isComplete && (
                                    <Loader2 className="w-3 h-3 text-cyan-400 animate-spin shrink-0" />
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            {/* Completed state */}
            <AnimatePresence>
                {isComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="p-6 rounded-xl bg-[hsl(280,25%,10%)]/90 backdrop-blur-xl border border-green-500/30 shadow-2xl shadow-green-500/10"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            >
                                <CheckCircle className="w-8 h-8 text-green-400" />
                            </motion.div>
                            <div>
                                <h3 className="font-semibold text-[hsl(150,40%,85%)] text-lg">
                                    Task Completed!
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    Processed in 12.3 seconds by {agent.name}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 rounded-lg bg-[hsl(280,20%,8%)] border border-white/5 mb-4">
                            <p className="text-sm text-cyan-300 font-mono leading-relaxed">
                                Your task has been processed by {agent.name}. The bot analyzed
                                your input, applied domain-specific processing, and generated
                                optimized output artifacts ready for download.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Button className="bg-green-600 hover:bg-green-700 text-white border-0 shadow-lg shadow-green-500/20">
                                <Download className="w-4 h-4 mr-2" />
                                Download Results
                            </Button>
                            <Button
                                variant="outline"
                                className="border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/10"
                                onClick={onReset}
                            >
                                Post Another Task
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
