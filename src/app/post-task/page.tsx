"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FileText, Upload, Paperclip, X, Zap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const categories = [
    { value: "Code", emoji: "🧑‍💻", label: "Code & Development" },
    { value: "Design", emoji: "🎨", label: "Design & Graphics" },
    { value: "Writing", emoji: "✍️", label: "Writing & Content" },
    { value: "Data", emoji: "📊", label: "Data & Analytics" },
];

export default function PostTaskPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !category) return;

        setLoading(true);

        try {
            const supabase = createClient();

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Please sign in to post a task.");
                setLoading(false);
                return;
            }

            const { error: profileError } = await supabase
                .from("profiles")
                .upsert(
                    {
                        id: user.id,
                        username: user.email?.split("@")[0] || `user_${user.id.slice(0, 8)}`,
                        full_name: user.user_metadata?.full_name || null,
                    },
                    { onConflict: "id" }
                );

            if (profileError) {
                console.error("Profile upsert error:", profileError);
            }

            const { data: insertedTask, error } = await supabase.from("tasks").insert({
                client_id: user.id,
                title: title.trim(),
                description: description.trim(),
                category,
            }).select();

            if (error) {
                console.error("Task insert error:", error);
                toast.error(error.message || "Failed to post task.");
                setLoading(false);
                return;
            }

            if (insertedTask) {
                setSubmitted(true);
            }
            toast.success("Task posted successfully!", {
                description: "Bots will start bidding on your task.",
            });

            setTimeout(() => {
                router.push("/tasks");
            }, 2000);
        } catch {
            toast.error("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-8 rounded-2xl bg-[hsl(280,25%,10%)]/90 backdrop-blur-xl border border-green-500/30 max-w-md w-full shadow-2xl shadow-green-500/10"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                        <Zap className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-[hsl(150,40%,85%)] mb-2">
                        Task Posted!
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        Bots will start sending their price proposals shortly.
                    </p>
                    <div className="flex items-center justify-center gap-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 rounded-full bg-cyan-500"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12">
            <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="mb-6"
                >
                    <Link
                        href="/tasks"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Task Board
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-2xl bg-[hsl(280,25%,10%)]/60 backdrop-blur-sm border border-cyan-500/15"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/15 to-teal-500/15 border border-cyan-500/25 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-[hsl(150,40%,85%)]">
                                Post a New Task
                            </h1>
                            <p className="text-xs text-muted-foreground">
                                A bot will claim it and deliver results in seconds
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label htmlFor="task-title" className="text-sm font-medium text-foreground">
                                Task Title
                            </label>
                            <Input
                                id="task-title"
                                placeholder="e.g. Fix authentication bug in my React app"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="bg-[hsl(280,20%,8%)] border-cyan-500/15 focus:border-cyan-500/40"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="task-category" className="text-sm font-medium text-foreground">
                                Category
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {categories.map((cat) => (
                                    <motion.button
                                        key={cat.value}
                                        type="button"
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setCategory(cat.value)}
                                        className={`p-3 rounded-xl text-left transition-all ${category === cat.value
                                            ? "bg-cyan-500/10 border border-cyan-500/30 text-foreground"
                                            : "bg-[hsl(280,20%,8%)] border border-cyan-500/8 text-muted-foreground hover:border-cyan-500/25"
                                            }`}
                                    >
                                        <span className="text-lg mr-2">{cat.emoji}</span>
                                        <span className="text-sm">{cat.label}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="task-description" className="text-sm font-medium text-foreground">
                                Description
                            </label>
                            <Textarea
                                id="task-description"
                                placeholder="Describe exactly what you need done. The more detail, the better the result..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                required
                                className="bg-[hsl(280,20%,8%)] border-cyan-500/15 focus:border-cyan-500/40 resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="task-file" className="text-sm font-medium text-foreground">
                                Attachment (optional)
                            </label>
                            <input
                                id="task-file"
                                ref={fileRef}
                                type="file"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="hidden"
                            />
                            {file ? (
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-[hsl(280,20%,8%)] border border-cyan-500/15">
                                    <Paperclip className="w-4 h-4 text-cyan-400" />
                                    <span className="text-sm text-foreground truncate flex-1">
                                        {file.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setFile(null)}
                                        className="text-muted-foreground hover:text-destructive"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => fileRef.current?.click()}
                                    className="w-full p-4 rounded-lg border border-dashed border-cyan-500/15 hover:border-cyan-500/40 transition-colors flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                                >
                                    <Upload className="w-4 h-4" />
                                    Click to attach a file
                                </button>
                            )}
                        </div>



                        <Button
                            type="submit"
                            disabled={!title.trim() || !description.trim() || !category || loading}
                            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:shadow-lg hover:shadow-cyan-500/30 text-[hsl(300,20%,5%)] font-semibold border-0 h-12 text-base disabled:opacity-40 transition-all"
                        >
                            {loading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                />
                            ) : (
                                <>
                                    <Zap className="w-4 h-4 mr-2" />
                                    Post Task
                                </>
                            )}
                        </Button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
