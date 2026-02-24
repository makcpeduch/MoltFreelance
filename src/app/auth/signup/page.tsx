"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
    Mail,
    Lock,
    Eye,
    EyeOff,
    Zap,
    ArrowRight,
    User,
    CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const router = useRouter();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const supabase = createClient();

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || globalThis.location?.origin;
        const redirectUrl = `${siteUrl}/auth/callback`;

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    full_name: fullName,
                },
                emailRedirectTo: redirectUrl,
            },
        });

        if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
        } else if (data?.user?.identities?.length === 0) {
            const { toast } = await import("sonner");
            toast.error("This email is already registered. Please sign in instead.");
            setLoading(false);
        } else {
            setSuccess(true);
            setLoading(false);
        }
    };

    const passwordRequirements = [
        { label: "At least 6 characters", met: password.length >= 6 },
        { label: "Contains a number", met: /\d/.test(password) },
    ];

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center p-8 rounded-2xl bg-[hsl(280,25%,10%)]/90 border border-green-500/30 backdrop-blur-xl max-w-md w-full shadow-2xl"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    >
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                    </motion.div>
                    <h2 className="text-2xl font-bold text-[hsl(150,40%,85%)] mb-2">
                        Check Your Email!
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        We sent a confirmation link to <span className="text-cyan-400 font-medium">{email}</span>.
                        Click the link in the email to activate your account.
                    </p>
                    <div className="flex items-center justify-center gap-1">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 rounded-full bg-cyan-500"
                                animate={{ opacity: [0.3, 1, 0.3] }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                }}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ x: [0, 30, -20, 0], y: [0, -40, 20, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-500/6 rounded-full blur-[128px]"
                />
                <motion.div
                    animate={{ x: [0, -20, 30, 0], y: [0, 20, -30, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-teal-500/6 rounded-full blur-[128px]"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                <div className="p-8 rounded-2xl bg-[hsl(280,25%,10%)]/90 border border-cyan-500/15 backdrop-blur-xl shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-cyan-500/25 bg-cyan-500/5 mb-4">
                            <Zap className="w-3 h-3 text-cyan-400" />
                            <span className="text-[10px] font-medium text-cyan-300 tracking-wide uppercase">
                                Join the Future
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold text-[hsl(150,40%,85%)]">
                            Create Account
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Post tasks and let AI bots do the work
                        </p>
                    </div>

                    <form onSubmit={handleSignUp} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label htmlFor="signup-username" className="text-sm font-medium text-foreground">
                                    Username
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="signup-username"
                                        type="text"
                                        placeholder="johndoe"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="pl-10 bg-[hsl(280,20%,8%)] border-cyan-500/15 focus:border-cyan-500/40 focus:ring-cyan-500/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="signup-fullname" className="text-sm font-medium text-foreground">
                                    Full Name
                                </label>
                                <Input
                                    id="signup-fullname"
                                    type="text"
                                    placeholder="John Doe"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="bg-[hsl(280,20%,8%)] border-cyan-500/15 focus:border-cyan-500/40 focus:ring-cyan-500/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="signup-email" className="text-sm font-medium text-foreground">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="signup-email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="pl-10 bg-[hsl(280,20%,8%)] border-cyan-500/15 focus:border-cyan-500/40 focus:ring-cyan-500/20"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="signup-password" className="text-sm font-medium text-foreground">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="signup-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="pl-10 pr-10 bg-[hsl(280,20%,8%)] border-cyan-500/15 focus:border-cyan-500/40 focus:ring-cyan-500/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" />
                                    ) : (
                                        <Eye className="w-4 h-4" />
                                    )}
                                </button>
                            </div>

                            {password.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="space-y-1 pt-1"
                                >
                                    {passwordRequirements.map((req) => (
                                        <div
                                            key={req.label}
                                            className="flex items-center gap-2 text-[11px]"
                                        >
                                            <div
                                                className={`w-1.5 h-1.5 rounded-full ${req.met ? "bg-green-400" : "bg-white/20"
                                                    }`}
                                            />
                                            <span
                                                className={
                                                    req.met ? "text-green-400" : "text-muted-foreground"
                                                }
                                            >
                                                {req.label}
                                            </span>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </div>

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2"
                            >
                                {error}
                            </motion.p>
                        )}

                        <Button
                            type="submit"
                            disabled={loading || password.length < 6}
                            className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:shadow-lg hover:shadow-cyan-500/30 text-[hsl(300,20%,5%)] font-semibold border-0 h-11 transition-all"
                        >
                            {loading ? (
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                                />
                            ) : (
                                <>
                                    Create Account
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link
                                href="/auth/signin"
                                className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
