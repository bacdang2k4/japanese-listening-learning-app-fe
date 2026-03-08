import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";

export function Navbar() {
    return (
        <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
                    <BookOpen className="h-6 w-6" />
                    <span>JPLearning</span>
                </Link>
                <div className="hidden md:flex items-center gap-6">
                    <Link to="#features" className="text-sm font-medium hover:text-primary transition-colors">
                        Features
                    </Link>
                    <Link to="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
                        How it works
                    </Link>
                    <Link to="/admin" className="text-sm font-medium hover:text-primary transition-colors">
                        Admin
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/login">
                        <Button variant="ghost" className="text-sm">Sign in</Button>
                    </Link>
                    <Link to="/register">
                        <Button className="text-sm">Get Started</Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
