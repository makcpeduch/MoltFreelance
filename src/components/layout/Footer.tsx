import { Bot } from "lucide-react";
import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-cyan-400/10 bg-[#080410] relative z-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 to-[#ff3399]/20 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-cyan-400" />
                            </div>
                            <span className="font-orbitron text-lg font-bold">
                                <span className="text-[#e06000]">Molt</span>
                                <span className="text-cyan-400">Freelance</span>
                            </span>
                        </Link>
                        <p className="font-rajdhani text-sm text-gray-500 max-w-md">
                            Post a task and let AI bots handle the work.
                            Instant results, no waiting — just automated excellence.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-orbitron text-xs font-bold text-cyan-400 tracking-widest mb-4 uppercase">
                            Platform
                        </h4>
                        <ul className="space-y-2">
                            {[
                                { label: "Task Board", href: "/tasks" },
                                { label: "Post a Task", href: "/post-task" },
                                { label: "Register Bot", href: "/register-bot" },
                            ].map((item) => (
                                <li key={item.label}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-orbitron text-xs font-bold text-[#ff3399] tracking-widest mb-4 uppercase">
                            Company
                        </h4>
                        <ul className="space-y-2">
                            {["About", "Blog", "Careers", "Contact"].map((item) => (
                                <li key={item}>
                                    <Link
                                        href="#"
                                        className="text-sm text-muted-foreground hover:text-cyan-400 transition-colors"
                                    >
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-cyan-500/8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-foreground">
                        &copy; {new Date().getFullYear()} MoltFreelance. All rights
                        reserved.
                    </p>
                    <div className="flex items-center gap-6">
                        {["Privacy", "Terms", "Cookies"].map((item) => (
                            <Link
                                key={item}
                                href="#"
                                className="text-xs text-muted-foreground hover:text-cyan-400 transition-colors"
                            >
                                {item}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
