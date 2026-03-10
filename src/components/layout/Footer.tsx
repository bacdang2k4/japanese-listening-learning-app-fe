import { Link } from "react-router-dom";
import { Mail, MapPin, Phone, Facebook, Twitter, Instagram, Headphones } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative text-slate-600 pt-10 pb-6 overflow-hidden z-50 mt-auto bg-white/60 backdrop-blur-md border-t border-white/40">

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-12 mb-8">
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                <Headphones className="w-5 h-5" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-slate-800 uppercase">Nihongo</span>
            </div>

            <p className="text-slate-600/90 text-xs max-w-sm leading-relaxed font-semibold">
              Nền tảng luyện nghe tiếng Nhật đột phá bởi AI. Chinh phục JLPT hiệu quả và cá nhân hóa.
            </p>

            <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-600">
              <div className="flex items-center gap-2 hover:text-indigo-600 transition-colors cursor-pointer group">
                <Mail className="h-3.5 w-3.5 text-indigo-400" />
                <span>hello@nihongo.edu.vn</span>
              </div>
              <div className="flex items-center gap-2 hover:text-sky-600 transition-colors cursor-pointer group">
                <Phone className="h-3.5 w-3.5 text-sky-400" />
                <span>+84 987 654 321</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 grid gap-6 sm:grid-cols-3 pt-2">
            <div>
              <h3 className="text-slate-800 font-black tracking-widest uppercase text-[10px] mb-4">Khám phá</h3>
              <div className="space-y-2.5 text-xs font-bold text-slate-600">
                <Link className="hover:text-indigo-600 transition-colors block" to="/">Trang chủ</Link>
                <Link className="hover:text-sky-600 transition-colors block" to="/learn">Bài học</Link>
                <Link className="hover:text-rose-600 transition-colors block" to="/learn/vocabulary">Từ vựng</Link>
              </div>
            </div>

            <div>
              <h3 className="text-slate-800 font-black tracking-widest uppercase text-[10px] mb-4">Tài khoản</h3>
              <div className="space-y-2.5 text-xs font-bold text-slate-500">
                <Link className="hover:text-indigo-600 transition-colors block" to="/learn/profile">Hồ sơ cá nhân</Link>
                <Link className="hover:text-amber-500 transition-colors block" to="/register">Đăng ký mới</Link>
              </div>
            </div>

            <div>
              <h3 className="text-slate-800 font-black tracking-widest uppercase text-[10px] mb-4">Liên kết</h3>
              <div className="flex gap-3 mt-1">
                <a href="#" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-[#1877f2] hover:text-white transition-all shadow-sm">
                  <Facebook className="w-4 h-4 fill-current" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-[#1da1f2] hover:text-white transition-all shadow-sm">
                  <Twitter className="w-4 h-4 fill-current" />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-gradient-to-tr hover:from-amber-500 hover:to-rose-500 hover:text-white transition-all shadow-sm">
                  <Instagram className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-bold text-slate-500">
            © {new Date().getFullYear()} NIHONGO App. Phát triển bởi Nihongo Team.
          </p>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500">
            <span className="hover:text-slate-600 cursor-pointer transition-colors">Điều khoản</span>
            <span className="hover:text-slate-600 cursor-pointer transition-colors">Bảo mật</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
