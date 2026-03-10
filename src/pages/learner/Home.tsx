import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { tokenStorage } from "@/services/api";

export default function Home() {
    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = Boolean(tokenStorage.getLearnerToken());
        const hasShownInitialLogin = sessionStorage.getItem("initial_login_shown") === "1";

        if (!isLoggedIn && !hasShownInitialLogin) {
            sessionStorage.setItem("initial_login_shown", "1");
            navigate("/login");
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-indigo-50/20 relative overflow-x-hidden">
            <Navbar />

            {/* Immersive Global Background - From LearnerLayout */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-blue-100/40 via-purple-100/20 to-transparent" />
                <div
                    className="absolute bottom-0 left-0 right-0 h-full opacity-[0.2] mix-blend-multiply bg-cover bg-center grayscale shadow-inner"
                    style={{ backgroundImage: "url('/wp4780845-mount-fuji-reflection-wallpapers.jpg')" }}
                />

                {/* Decorative blobs */}
                <div className="absolute top-[-10%] right-[-5%] w-[45rem] h-[45rem] rounded-full bg-blue-400/15 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] left-[-5%] w-[35rem] h-[35rem] rounded-full bg-pink-400/15 blur-[120px] animate-pulse" style={{ animationDelay: '1.5s' }} />
                <div className="absolute top-[20%] left-[10%] w-[25rem] h-[25rem] rounded-full bg-teal-400/10 blur-[100px] animate-pulse" style={{ animationDelay: '2.5s' }} />
                <div className="absolute bottom-[-5%] right-[10%] w-[30rem] h-[30rem] rounded-full bg-amber-300/10 blur-[90px] animate-pulse" style={{ animationDelay: '4s' }} />
                <div className="absolute top-[40%] right-[20%] w-[20rem] h-[20rem] rounded-full bg-violet-400/10 blur-[80px] animate-pulse" style={{ animationDelay: '5s' }} />
            </div>

            <main className="relative z-10">
                <HeroSection />
                <FeaturesSection />
            </main>
        </div>
    );
}
