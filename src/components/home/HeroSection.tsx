import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, LayoutList, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { tokenStorage } from "@/services/api";

export function HeroSection() {
    const isLoggedIn = Boolean(tokenStorage.getLearnerToken());

    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden bg-transparent">
            {/* Ambient Animated Gradients */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 blur-[120px] animate-pulse" />
                <div className="absolute top-[20%] -right-[10%] w-[40%] h-[60%] rounded-full bg-gradient-to-tl from-sky-400/10 to-blue-500/10 blur-[120px] animate-pulse delay-700" />
                <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[40%] rounded-full bg-gradient-to-t from-emerald-200/10 to-teal-300/10 blur-[120px] animate-pulse delay-1000" />
            </div>

            <div className="container relative z-10 mx-auto px-4 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm border border-slate-200/60 text-indigo-600 text-[13px] font-bold tracking-wide mb-8 animate-fade-in-up">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500">
                        Nền tảng luyện thi JLPT đột phá
                    </span>
                </div>

                <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-8 text-slate-900 animate-fade-in-up leading-[1.1] md:leading-[1.15] delay-75">
                    Chinh phục tiếng Nhật <br className="hidden md:block" />
                    theo phong cách <span className="relative inline-block mt-2 md:mt-0">
                        <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500 px-1">
                            Hoàn Toàn Mới
                        </span>
                        <div className="absolute -bottom-1 left-0 w-full h-3 bg-indigo-100/60 -z-10 rounded-full"></div>
                    </span>
                </h1>

                <p className="text-base md:text-lg lg:text-xl text-slate-500/90 max-w-3xl mx-auto mb-12 animate-fade-in-up delay-150 font-medium leading-relaxed md:leading-loose tracking-tight whitespace-normal">
                    Luyện nghe chuyên sâu từ <span className="text-slate-900 font-bold">N5 đến N1</span>. Trải nghiệm các bài kiểm tra do <span className="text-indigo-600 font-bold">AI sinh ra tự động</span>, không nhàm chán và theo dõi tiến độ một cách khoa học.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-200">
                    <Link to={isLoggedIn ? "/learn" : "/register"} className="w-full sm:w-auto">
                        <Button size="lg" className="w-full h-14 px-8 text-[15px] font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 rounded-xl group transition-all">
                            Bắt đầu học miễn phí
                            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </Link>
                    {isLoggedIn ? (
                        <Link to="/learn/profile" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="w-full h-14 px-8 text-[15px] font-bold rounded-xl border-slate-200 bg-white/80 hover:bg-white shadow-sm hover:shadow transition-all group text-slate-700">
                                <LayoutList className="mr-2 h-5 w-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                                Theo dõi tiến độ
                            </Button>
                        </Link>
                    ) : (
                        <Link to="/login" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="w-full h-14 px-8 text-[15px] font-bold rounded-xl border-slate-200 bg-white/80 hover:bg-white shadow-sm hover:shadow transition-all group text-slate-700">
                                <PlayCircle className="mr-2 h-5 w-5 text-sky-500 group-hover:scale-110 transition-transform" />
                                Tôi đã có tài khoản
                            </Button>
                        </Link>
                    )}
                </div>


            </div>
        </section>
    );
}
