import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-[#F8F7FF] to-elsa-indigo-50/20">
            <Navbar />
            <main>
                <HeroSection />
                <FeaturesSection />
            </main>

            <footer className="py-12 border-t border-elsa-indigo-100/50 bg-white/50">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <p className="text-sm">© {new Date().getFullYear()} JPLearning. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
