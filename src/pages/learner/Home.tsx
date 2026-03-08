import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";

export default function Home() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <main>
                <HeroSection />
                <FeaturesSection />
            </main>

            <footer className="py-12 border-t bg-muted/20">
                <div className="container mx-auto px-4 text-center text-muted-foreground">
                    <p>© {new Date().getFullYear()} JPLearning. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
