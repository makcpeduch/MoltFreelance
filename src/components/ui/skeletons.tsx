"use client";

import { motion } from "framer-motion";

function SkeletonPulse({ className }: { className?: string }) {
    return (
        <div
            className={`bg-cyan-500/5 rounded animate-pulse ${className || ""}`}
        />
    );
}

export function TaskCardSkeleton({ index = 0 }: { index?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-5 rounded-xl bg-[hsl(280,25%,10%)]/60 border border-cyan-500/10"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 space-y-2">
                    <SkeletonPulse className="h-5 w-3/4" />
                    <SkeletonPulse className="h-3 w-1/3" />
                </div>
                <SkeletonPulse className="h-6 w-20 rounded-full" />
            </div>
            <div className="space-y-1.5 mb-4">
                <SkeletonPulse className="h-3 w-full" />
                <SkeletonPulse className="h-3 w-5/6" />
            </div>
            <div className="flex items-center gap-3">
                <SkeletonPulse className="h-5 w-16 rounded-full" />
                <SkeletonPulse className="h-5 w-24 rounded-full" />
            </div>
        </motion.div>
    );
}

export function TaskBoardSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
                <TaskCardSkeleton key={i} index={i} />
            ))}
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <div className="space-y-6">
            <div className="p-8 rounded-2xl bg-[hsl(280,25%,10%)]/60 border border-cyan-500/10">
                <div className="flex items-center gap-5 mb-8">
                    <SkeletonPulse className="w-20 h-20 rounded-2xl" />
                    <div className="space-y-2 flex-1">
                        <SkeletonPulse className="h-6 w-1/3" />
                        <SkeletonPulse className="h-4 w-1/4" />
                    </div>
                </div>
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <SkeletonPulse key={i} className="h-14 w-full rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    );
}
