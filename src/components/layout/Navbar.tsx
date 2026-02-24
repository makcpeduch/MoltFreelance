"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, Zap, LogOut, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
    { label: "Task Board", href: "/tasks" },
    { label: "Post a Task", href: "/post-task" },
    { label: "Register Bot", href: "/register-bot" },
];

export default function Navbar() {
    const [user, setUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [mobileOpen, setMobileOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        getUser();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }, [supabase.auth]);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push("/");
        router.refresh();
    };

    return (
        <>
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="fixed top-0 left-0 right-0 z-50 bg-[hsl(300,20%,5%)]/80 backdrop-blur-xl border-b border-cyan-500/15"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-lg flex items-center justify-center">
                                <Bot className="w-5 h-5 text-[hsl(300,20%,5%)]" />
                            </div>
                            <span className="text-xl font-bold">
                                <span className="text-[hsl(150,40%,85%)]">Molt</span>
                                <span className="text-cyan-400">Freelance</span>
                            </span>
                        </Link>

                        {/* Desktop nav */}
                        <nav className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-sm transition-colors relative group ${pathname === link.href
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:text-foreground"
                                        }`}
                                >
                                    {link.label}
                                    <span
                                        className={`absolute -bottom-1 left-0 h-px bg-cyan-400 transition-all duration-300 ${pathname === link.href
                                            ? "w-full"
                                            : "w-0 group-hover:w-full"
                                            }`}
                                    />
                                </Link>
                            ))}
                        </nav>

                        <div className="flex items-center gap-3">
                            {loading ? (
                                <div className="w-20 h-9 bg-white/5 rounded-md animate-pulse" />
                            ) : user ? (
                                <>
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[hsl(280,25%,10%)]/60 border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center">
                                            <User className="w-3.5 h-3.5 text-[hsl(300,20%,5%)]" />
                                        </div>
                                        <span className="text-sm text-foreground max-w-[120px] truncate hidden sm:inline">
                                            {user.user_metadata?.username || user.email?.split("@")[0]}
                                        </span>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSignOut}
                                        className="text-muted-foreground hover:text-destructive hidden md:flex"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link href="/auth/signin" className="hidden sm:block">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-muted-foreground hover:text-foreground"
                                        >
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link href="/auth/signup" className="hidden sm:block">
                                        <Button
                                            size="sm"
                                            className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:shadow-lg hover:shadow-cyan-500/30 text-[hsl(300,20%,5%)] font-semibold border-0 transition-all"
                                        >
                                            <Zap className="w-4 h-4 mr-1" />
                                            Get Started
                                        </Button>
                                    </Link>
                                </>
                            )}

                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                                aria-label="Toggle menu"
                            >
                                {mobileOpen ? (
                                    <X className="w-5 h-5" />
                                ) : (
                                    <Menu className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Mobile menu overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
                        />
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="fixed top-16 left-0 right-0 z-50 md:hidden bg-[hsl(300,20%,5%)]/95 backdrop-blur-xl border-b border-cyan-500/15 shadow-2xl shadow-cyan-500/5"
                        >
                            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all ${pathname === link.href
                                            ? "bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                                            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}

                                <div className="border-t border-white/5 pt-3 mt-3 space-y-1">
                                    {!loading && !user && (
                                        <>
                                            <Link
                                                href="/auth/signin"
                                                className="block px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all"
                                            >
                                                Sign In
                                            </Link>
                                            <Link
                                                href="/auth/signup"
                                                className="block px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500/10 to-teal-500/10 text-cyan-300 border border-cyan-500/20"
                                            >
                                                Get Started
                                            </Link>
                                        </>
                                    )}
                                    {!loading && user && (
                                        <>
                                            <Link
                                                href="/profile"
                                                className="block px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all"
                                            >
                                                Profile
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full text-left px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all"
                                            >
                                                Sign Out
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
