import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-elsa-indigo-100/50 shadow-sm">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2.5 text-xl font-bold group">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-elsa-indigo-500 to-elsa-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <BookOpen className="h-4.5 w-4.5 text-white" />
                    </div>
                    <span className="bg-gradient-to-r from-elsa-indigo-600 to-elsa-indigo-500 bg-clip-text text-transparent">
                        JPLearning
                    </span>
                </Link>
                <div className="hidden md:flex items-center gap-1">
                    <Link to="#features" className="px-4 py-2 rounded-xl text-sm font-medium text-foreground/70 hover:text-elsa-indigo-600 hover:bg-elsa-indigo-50 transition-all duration-200">
                        Features
                    </Link>
                    <Link to="#how-it-works" className="px-4 py-2 rounded-xl text-sm font-medium text-foreground/70 hover:text-elsa-indigo-600 hover:bg-elsa-indigo-50 transition-all duration-200">
                        How it works
                    </Link>
                    <Link to="/admin" className="px-4 py-2 rounded-xl text-sm font-medium text-foreground/70 hover:text-elsa-indigo-600 hover:bg-elsa-indigo-50 transition-all duration-200">
                        Admin
                    </Link>
                </div>
                <div className="flex items-center gap-3">
                    <Link to="/login">
                        <Button variant="ghost" className="text-sm font-medium rounded-xl hover:bg-elsa-indigo-50 hover:text-elsa-indigo-600">
                            Sign in
                        </Button>
                    </Link>
                    <Link to="/register">
                        <Button className="text-sm font-semibold rounded-xl bg-gradient-to-r from-elsa-indigo-600 to-elsa-indigo-500 hover:from-elsa-indigo-700 hover:to-elsa-indigo-600 shadow-md hover:shadow-lg hover:shadow-elsa-indigo-500/25 transition-all duration-200">
                            Get Started
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
