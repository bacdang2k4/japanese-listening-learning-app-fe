import { BookOpen, Headphones, Trophy, TrendingUp, CheckCircle2 } from "lucide-react";

const features = [
    {
        title: "Từ vựng theo chủ đề",
        description: "Học theo ngân hàng từ vựng đã được phân loại theo cấp độ từ N5 đến N1.",
        icon: BookOpen,
        color: "text-blue-600",
        border: "border-blue-200 hover:border-blue-300",
        bgIcon: "bg-blue-100",
        shadow: "hover:shadow-blue-500/20"
    },
    {
        title: "Bài nghe tạo bởi AI",
        description: "Luyện tập linh hoạt không giới hạn với các đoạn audio và câu hỏi được AI tạo mới liên tục.",
        icon: Headphones,
        color: "text-violet-600",
        border: "border-violet-200 hover:border-violet-300",
        bgIcon: "bg-violet-100",
        shadow: "hover:shadow-violet-500/20"
    },
    {
        title: "Theo dõi tiến độ",
        description: "Công cụ phân tích chuẩn xác giúp bạn nhận ra ngay điểm mạnh, điểm yếu theo từng kỹ năng.",
        icon: TrendingUp,
        color: "text-emerald-600",
        border: "border-emerald-200 hover:border-emerald-300",
        bgIcon: "bg-emerald-100",
        shadow: "hover:shadow-emerald-500/20"
    },
    {
        title: "Chinh phục mục tiêu",
        description: "Thiết lập mốc thời gian, thu thập huy hiệu và duy trì chuỗi tiến độ học tập mỗi ngày.",
        icon: Trophy,
        color: "text-amber-600",
        border: "border-amber-200 hover:border-amber-300",
        bgIcon: "bg-amber-100",
        shadow: "hover:shadow-amber-500/20"
    },
];

const steps = [
    { title: "Chọn cấp độ mục tiêu", desc: "Bắt đầu từ N5 hoặc chọn theo đúng kỳ vọng chứng chỉ JLPT của bạn.", color: "text-sky-700", bgIcon: "bg-sky-100", border: "border-sky-200" },
    { title: "Học theo chủ đề", desc: "Phân loại chủ điểm ngữ pháp và từ vựng sát với thực tế đề thi.", color: "text-teal-700", bgIcon: "bg-teal-100", border: "border-teal-200" },
    { title: "Làm bài rèn phản xạ", desc: "Trả lời câu hỏi trắc nghiệm dưới áp lực đếm ngược thời gian.", color: "text-violet-700", bgIcon: "bg-violet-100", border: "border-violet-200" },
    { title: "Nhận kết quả phân tích", desc: "Xem giải thích chi tiết đáp án và hệ thống tự động ghi nhận điểm yếu.", color: "text-rose-700", bgIcon: "bg-rose-100", border: "border-rose-200" },
];

export function FeaturesSection() {
    return (
        <section className="bg-transparent">
            <div id="features" className="py-24 relative overflow-hidden bg-slate-50/90 backdrop-blur-md">
                <div className="container mx-auto px-6 relative z-10 max-w-7xl">
                    <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in-up">
                        <div className="inline-flex justify-center items-center px-5 py-2 rounded-full bg-slate-100/80 mb-6 border border-slate-200 shadow-sm">
                            <span className="text-xs font-black text-slate-700 tracking-widest uppercase">Tính năng nổi bật</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black mb-6 text-slate-800 tracking-tight leading-tight">
                            Hệ sinh thái học tập <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-sky-500">Toàn diện</span>
                        </h2>
                        <p className="text-lg md:text-xl text-slate-500 font-medium leading-relaxed">
                            JPLearning tích hợp những công nghệ tiên tiến nhất để mang đến trải nghiệm luyện nghe tiếng Nhật mượt mà, trực quan và cá nhân hóa.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <div key={index} className={`group relative bg-white rounded-[2rem] p-8 shadow-sm border ${feature.border} ${feature.shadow} transition-all duration-300 hover:-translate-y-2 hover:shadow-xl animate-fade-in-up`} style={{ animationDelay: `${index * 150}ms` }}>
                                {/* Decorative subtle background */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 rounded-bl-[100px] -z-10 group-hover:scale-110 transition-transform duration-500"></div>

                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm border ${feature.bgIcon} ${feature.color} group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                                    <feature.icon className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-800">{feature.title}</h3>
                                <p className="text-[15px] text-slate-500 leading-relaxed font-medium">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div id="how-it-works" className="py-24 bg-slate-50/95 backdrop-blur-md relative">
                <div className="container mx-auto px-6 max-w-7xl">
                    <div className="flex flex-col lg:flex-row gap-16 items-center">
                        <div className="lg:w-1/3 text-left space-y-6">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wide uppercase shadow-sm">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Lộ trình siêu tốc</span>
                            </div>
                            <h3 className="text-4xl md:text-5xl font-black text-slate-800 leading-[1.15] tracking-tight">Biến mục tiêu <br />thành hiện thực</h3>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed">
                                Chỉ với 4 bước đơn giản, luyện tập mỗi ngày cùng Nihongo sẽ giúp bạn biến kỹ năng nghe hiểu tiếng Nhật trở thành phản xạ tự nhiên.
                            </p>
                            <div className="w-24 h-1.5 bg-gradient-to-r from-indigo-500 to-sky-500 rounded-full mt-6"></div>
                        </div>

                        <div className="lg:w-2/3 grid sm:grid-cols-2 gap-4 md:gap-6">
                            {steps.map((step, index) => (
                                <div key={index} className={`bg-white rounded-[1.5rem] p-8 border hover:border-slate-300 shadow-sm hover:shadow-lg hover:shadow-slate-200 transition-all duration-300 relative group overflow-hidden`}>
                                    {/* Subtly colored corner decoration */}
                                    <div className={`absolute top-0 right-0 w-24 h-24 ${step.bgIcon} opacity-40 rounded-bl-full -z-10 group-hover:scale-125 transition-transform duration-500`}></div>

                                    {/* Huge faint number in background */}
                                    <div className="absolute -right-4 -bottom-4 text-[120px] leading-none font-black opacity-[0.03] group-hover:opacity-[0.05] transition-opacity duration-300 group-hover:scale-110 group-hover:-translate-x-2 transform pointer-events-none select-none">
                                        {index + 1}
                                    </div>

                                    <div className={`w-12 h-12 rounded-full ${step.bgIcon} ${step.color} flex items-center justify-center font-black text-xl mb-6 border ${step.border} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                        {index + 1}
                                    </div>
                                    <h4 className="text-xl font-bold mb-3 text-slate-800 relative z-10">{step.title}</h4>
                                    <p className="text-[15px] text-slate-500 leading-relaxed font-medium relative z-10">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
