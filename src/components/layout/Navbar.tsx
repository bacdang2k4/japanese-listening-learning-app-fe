import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Headphones, Home, School, BookOpen, History } from "lucide-react";
import { tokenStorage } from "@/services/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const isLoggedIn = Boolean(tokenStorage.getLearnerToken());
    const learner = (() => {
        try {
            const raw = localStorage.getItem("learner");
            return raw ? (JSON.parse(raw) as { firstName?: string; lastName?: string; username?: string; avatarUrl?: string | null }) : null;
        } catch {
            return null;
        }
    })();

    const initials = (() => {
        const first = learner?.firstName?.trim();
        const last = learner?.lastName?.trim();
        if (first && last) return (last[0] + first[0]).toUpperCase();
        const u = learner?.username?.trim();
        if (u) return u.slice(0, 2).toUpperCase();
        return "U";
    })();

    const currentPath = location.pathname;
    const navItems = isLoggedIn
        ? [
            { text: "TRANG CHỦ", path: "/" },
            { text: "BÀI HỌC", path: "/learn" },
            { text: "TỪ VỰNG", path: "/learn/vocabulary" },
            { text: "THI THỬ", path: "/learn/mock-test" },
        ]
        : [
            { text: "Features", path: "#features" },
            { text: "How it works", path: "#how-it-works" },
            { text: "Admin", path: "/admin" },
        ];

    const isNavActive = (path: string) => {
        if (path === "#features" || path === "#how-it-works") return false;
        if (path === "/") return currentPath === "/";
        if (path === "/learn") {
            return (
                currentPath === "/learn" ||
                currentPath.startsWith("/learn/level/") ||
                currentPath.startsWith("/learn/topic/")
            );
        }
        return currentPath.startsWith(path);
    };

    return (
        <nav className="sticky top-0 z-50 w-full bg-white/70 backdrop-blur-2xl border-b border-white/40 shadow-sm">
            <div className="container mx-auto px-4 h-16 grid grid-cols-5 items-center">
                <div className="flex justify-start">
                    <div
                        className="flex items-center gap-2 cursor-pointer group"
                        onClick={() => navigate("/")}
                    >
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                            <Headphones className="w-6 h-6" />
                        </div>
                        <span className="font-black text-xl hidden lg:block text-slate-800 tracking-tighter uppercase">NIHONGO</span>
                    </div>
                </div>

                <div className="hidden md:block" />

                <div className="flex justify-center">
                    <div className="hidden md:flex items-center gap-10">
                        {navItems.map((item) => {
                            const active = isNavActive(item.path);
                            const icon =
                                item.text === "TRANG CHỦ" ? Home :
                                    item.text === "BÀI HỌC" ? School :
                                        item.text === "TỪ VỰNG" ? BookOpen :
                                            item.text === "THI THỬ" ? History : null;
                            return (
                                <button
                                    key={item.text}
                                    className={`text-xs font-black tracking-widest transition-colors hover:text-primary whitespace-nowrap ${active ? "text-primary" : "text-muted-foreground"}`}
                                    onClick={() => {
                                        if (item.path.startsWith("#")) {
                                            window.location.hash = item.path;
                                            return;
                                        }
                                        navigate(item.path);
                                    }}
                                >
                                    {icon ? <span className="sr-only">{item.text}</span> : null}
                                    {item.text}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="hidden md:block" />

                <div className="flex items-center justify-end gap-4">
                    {isLoggedIn ? (
                        <>
                            <Link to="/learn/profile" className="flex items-center">
                                <Avatar className="h-9 w-9 border border-primary/20">
                                    <AvatarImage src={learner?.avatarUrl || ""} alt="User avatar" />
                                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
                                </Avatar>
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <Button variant="ghost" className="text-sm">Sign in</Button>
                            </Link>
                            <Link to="/register">
                                <Button className="text-sm">Get Started</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
