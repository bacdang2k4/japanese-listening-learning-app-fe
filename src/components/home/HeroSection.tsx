import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background gradients */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] opacity-30 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-transparent to-transparent" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[128px] mix-blend-multiply" />
                <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-[128px] mix-blend-multiply" />
            </div>

            <div className="container relative mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in">
                    <Sparkles className="h-4 w-4" />
                    <span>Master Japanese the modern way</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 animate-fade-in-up">
                    Learn Japanese with <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                        AI-Powered Tests
                    </span>
                </h1>

                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in-up delay-100">
                    Enhance your vocabulary, improve your listening skills with AI-generated audio tests, and track your progress efficiently.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200">
                    <Link to="/register">
                        <Button size="lg" className="h-12 px-8 group">
                            Start Learning Now
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button size="lg" variant="outline" className="h-12 px-8">
                            I already have an account
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
