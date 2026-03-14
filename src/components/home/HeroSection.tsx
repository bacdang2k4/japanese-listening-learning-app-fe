import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background gradients — ELSA indigo palette */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] opacity-25 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-elsa-indigo-400/30 via-transparent to-transparent" />
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-elsa-indigo-400/25 rounded-full blur-[140px]" />
                <div className="absolute top-12 right-1/4 w-[400px] h-[400px] bg-elsa-purple-400/20 rounded-full blur-[120px]" />
            </div>

            <div className="container relative mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-elsa-indigo-50 text-elsa-indigo-600 text-sm font-semibold mb-8 animate-fade-in-up border border-elsa-indigo-100">
                    <Sparkles className="h-4 w-4" />
                    <span>Master Japanese the modern way</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 animate-fade-in-up text-foreground">
                    Learn Japanese with <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-elsa-indigo-600 via-elsa-indigo-500 to-elsa-purple-500">
                        AI-Powered Tests
                    </span>
                </h1>

                <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12 animate-fade-in-up animation-delay-100 leading-relaxed">
                    Enhance your vocabulary, improve your listening skills with AI-generated audio tests, and track your progress efficiently.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-200">
                    <Link to="/register">
                        <Button size="lg" className="h-13 px-8 rounded-2xl text-base font-semibold group bg-gradient-to-r from-elsa-indigo-600 to-elsa-indigo-500 hover:from-elsa-indigo-700 hover:to-elsa-indigo-600 shadow-lg hover:shadow-xl hover:shadow-elsa-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5">
                            Start Learning Now
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    <Link to="/login">
                        <Button size="lg" variant="outline" className="h-13 px-8 rounded-2xl text-base font-medium border-elsa-indigo-200 text-elsa-indigo-600 hover:bg-elsa-indigo-50 hover:border-elsa-indigo-300 transition-all duration-200">
                            I already have an account
                        </Button>
                    </Link>
                </div>
            </div>
        </section>
    );
}
