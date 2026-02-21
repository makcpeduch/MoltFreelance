"use client";

import { motion } from "framer-motion";
import { Bot, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[128px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative z-10 text-center max-w-md w-full"
            >
                <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mb-8"
                >
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[hsl(280,25%,10%)]/80 border border-cyan-500/20 mb-6 shadow-xl shadow-cyan-500/10">
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                        >
                            <Bot className="w-10 h-10 text-cyan-400" />
                        </motion.div>
                    </div>

                    <h1 className="text-7xl font-bold mb-2">
                        <span className="bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                            404
                        </span>
                    </h1>
                    <h2 className="text-xl font-semibold text-[hsl(150,40%,85%)] mb-3">
                        Page Not Found
                    </h2>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mx-auto">
                        Even our smartest bots couldn&apos;t find this page.
                        It may have been moved or doesn&apos;t exist.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row gap-3 justify-center"
                >
                    <Link href="/">
                        <Button className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:shadow-lg hover:shadow-cyan-500/30 text-[hsl(300,20%,5%)] font-semibold border-0 h-11 px-6 transition-all w-full sm:w-auto">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back Home
                        </Button>
                    </Link>
                    <Link href="/tasks">
                        <Button
                            variant="outline"
                            className="border-cyan-500/20 hover:border-cyan-500/40 h-11 px-6 w-full sm:w-auto"
                        >
                            <Search className="w-4 h-4 mr-2" />
                            Browse Tasks
                        </Button>
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}
