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
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            setLoading(false);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
                className="fixed top-0 left-0 right-0 z-50 bg-[#0a0614]/85 backdrop-blur-xl border-b border-cyan-400/15"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2 group">
                            <motion.div
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                className="w-8 h-8 rounded-lg border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-[#ff3399]/20 flex items-center justify-center glow-cyan"
                            >
                                <Bot className="w-5 h-5 text-cyan-400" />
                            </motion.div>
                            <span className="font-orbitron text-lg font-bold">
                                <span className="text-[#e06000]">Molt</span>
                                <span className="text-cyan-400">Freelance</span>
                            </span>
                        </Link>

                        {/* Desktop nav */}
                        <nav className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-sm font-rajdhani font-medium tracking-wide transition-colors relative group ${pathname === link.href
                                        ? "text-cyan-400"
                                        : "text-gray-400 hover:text-white"
                                        }`}
                                >
                                    {link.label}
                                    <span
                                        className={`absolute -bottom-1 left-0 h-px bg-[#ff3399] transition-all duration-300 ${pathname === link.href
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
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card hover:border-cyan-400/40 transition-all"
                                    >
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500 to-[#ff3399] flex items-center justify-center">
                                            <User className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <span className="text-sm text-gray-200 max-w-[120px] truncate hidden sm:inline font-rajdhani">
                                            {user.user_metadata?.username || user.email?.split("@")[0]}
                                        </span>
                                    </Link>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSignOut}
                                        className="text-gray-500 hover:text-red-400 hidden md:flex"
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
                                            className="text-gray-400 hover:text-white font-rajdhani"
                                        >
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link href="/auth/signup" className="hidden sm:block">
                                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                            <Button
                                                size="sm"
                                                className="bg-gradient-to-r from-cyan-500 to-[#00ffff] hover:shadow-lg hover:shadow-cyan-500/40 text-[#0a0614] font-bold border-0 transition-all font-orbitron text-xs tracking-wider"
                                            >
                                                <Zap className="w-4 h-4 mr-1" />
                                                Get Started
                                            </Button>
                                        </motion.div>
                                    </Link>
                                </>
                            )}

                            <button
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                aria-label="Toggle menu"
                            >
                                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
                            className="fixed top-16 left-0 right-0 z-50 md:hidden bg-[#0a0614]/97 backdrop-blur-xl border-b border-cyan-400/15 shadow-2xl shadow-cyan-500/5"
                        >
                            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`block px-4 py-3 rounded-xl text-sm font-rajdhani font-medium transition-all ${pathname === link.href
                                            ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25"
                                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                ))}

                                <div className="border-t border-white/5 pt-3 mt-3 space-y-1">
                                    {!loading && !user && (
                                        <>
                                            <Link href="/auth/signin" className="block px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all font-rajdhani">
                                                Sign In
                                            </Link>
                                            <Link href="/auth/signup" className="block px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500/10 to-[#ff3399]/10 text-cyan-400 border border-cyan-500/20 font-rajdhani">
                                                Get Started
                                            </Link>
                                        </>
                                    )}
                                    {!loading && user && (
                                        <>
                                            <Link href="/profile" className="block px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-all font-rajdhani">
                                                Profile
                                            </Link>
                                            <button onClick={handleSignOut} className="w-full text-left px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/10 transition-all font-rajdhani">
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
