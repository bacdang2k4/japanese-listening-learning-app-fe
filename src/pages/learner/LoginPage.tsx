import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Headphones, Eye, EyeOff, Loader2, ShieldCheck, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authApi, tokenStorage } from '@/services/api';

type LoginMode = 'learner' | 'admin';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<LoginMode>('learner');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleMode = () => {
    setMode(mode === 'learner' ? 'admin' : 'learner');
    setError('');
    setFormData({ username: '', password: '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'learner') {
        const result = await authApi.learnerLogin({
          username: formData.username,
          password: formData.password,
        });

        tokenStorage.setLearnerToken(result.data.accessToken);
        const profiles = result.data.profiles ?? [];
        const profileId = result.data.profileId;
        localStorage.setItem('learner', JSON.stringify({
          id: result.data.learnerId,
          profileId: profileId,
          username: result.data.username,
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          avatarUrl: result.data.avatarUrl,
          role: result.data.role,
        }));

        if (profiles.length === 0) {
          navigate('/learn/onboarding');
        } else {
          navigate('/learn/profiles');
        }
      } else {
        const result = await authApi.adminLogin({
          username: formData.username,
          password: formData.password,
        });

        tokenStorage.setAdminToken(result.data.accessToken);
        localStorage.setItem('admin', JSON.stringify({
          id: result.data.adminId,
          username: result.data.username,
          role: result.data.role,
        }));

        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.message || 'Tên đăng nhập hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = mode === 'admin';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dark navy-purple gradient background */}
      <div className="absolute inset-0 auth-gradient-bg" />

      {/* Subtle warm glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[15%] left-[20%] w-[400px] h-[400px] bg-purple-500/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-[10%] right-[15%] w-[350px] h-[350px] bg-indigo-400/6 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div className="w-full max-w-[400px] relative z-10 animate-scale-in">
        {/* Logo icon */}
        <div className="flex justify-center mb-8 animate-fade-in-up">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center animate-float ${
              isAdmin
                ? 'bg-amber-500/20 border border-amber-400/30'
                : 'bg-cyan-400/15 border border-cyan-400/25'
            }`}
          >
            {isAdmin ? (
              <ShieldCheck className="w-8 h-8 text-amber-400" />
            ) : (
              <Headphones className="w-8 h-8 text-cyan-400" />
            )}
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8 animate-fade-in-up animation-delay-100" style={{ opacity: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {isAdmin ? 'Admin Panel' : 'Welcome Back'}
          </h1>
          <p className="text-white/50 text-sm sm:text-base">
            {isAdmin
              ? 'Đăng nhập quản trị hệ thống'
              : 'Continue your Japanese listening journey'}
          </p>
        </div>

        {/* Social login (learner only, above form like ELSA) */}
        {!isAdmin && (
          <div className="space-y-3 mb-6 animate-fade-in-up animation-delay-200" style={{ opacity: 0 }}>
            <button
              type="button"
              className="auth-social-btn-dark w-full flex items-center justify-center gap-3 h-12 rounded-xl text-sm font-medium"
              title="Coming soon"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              className="auth-social-btn-dark w-full flex items-center justify-center gap-3 h-12 rounded-xl text-sm font-medium"
              title="Coming soon"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="white">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              Continue with Apple
            </button>
          </div>
        )}

        {/* OR Divider */}
        {!isAdmin && (
          <div className="flex items-center gap-4 mb-6 animate-fade-in-up animation-delay-200" style={{ opacity: 0 }}>
            <div className="flex-1 h-px bg-white/15" />
            <span className="text-sm text-white/40 font-medium tracking-wide">OR</span>
            <div className="flex-1 h-px bg-white/15" />
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-5 rounded-xl bg-red-500/15 border-red-500/30 text-red-300 animate-fade-in-up">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="animate-fade-in-up animation-delay-300" style={{ opacity: 0 }}>
            <input
              id="username"
              name="username"
              type="text"
              placeholder={isAdmin ? 'Tên đăng nhập' : 'Enter your username'}
              required
              value={formData.username}
              onChange={handleChange}
              className="auth-input-dark w-full h-13 h-[52px] px-4 rounded-xl text-base outline-none"
            />
          </div>

          {/* Password */}
          <div className="animate-fade-in-up animation-delay-300" style={{ opacity: 0 }}>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.password}
                onChange={handleChange}
                className="auth-input-dark w-full h-[52px] px-4 pr-12 rounded-xl text-base outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          {!isAdmin && (
            <div className="text-right animate-fade-in-up animation-delay-300" style={{ opacity: 0 }}>
              <button type="button" className="text-sm text-white/40 hover:text-white/70 transition-colors">
                Forgot password?
              </button>
            </div>
          )}

          {/* Submit Button */}
          <div className="animate-fade-in-up animation-delay-400 pt-1" style={{ opacity: 0 }}>
            <button
              type="submit"
              disabled={loading}
              className={`w-full h-[52px] rounded-xl text-white text-base font-semibold flex items-center justify-center gap-2 ${
                isAdmin
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg hover:shadow-amber-500/25 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200'
                  : 'auth-cta-btn'
              } disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isAdmin ? 'Đang đăng nhập...' : 'Logging in...'}
                </>
              ) : (
                isAdmin ? 'Đăng nhập Admin' : 'Log In'
              )}
            </button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="mt-8 space-y-3 text-center animate-fade-in-up animation-delay-500" style={{ opacity: 0 }}>
          {!isAdmin && (
            <p className="text-sm text-white/45">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
              >
                Sign Up
              </Link>
            </p>
          )}
          <button
            type="button"
            onClick={toggleMode}
            className="text-xs text-white/30 hover:text-white/55 transition-colors cursor-pointer"
          >
            {isAdmin ? 'Đăng nhập với tư cách Học viên' : 'Đăng nhập với tư cách Quản trị viên'}
          </button>
        </div>

        {/* Agreement text at bottom */}
        {!isAdmin && (
          <div className="mt-10 text-center animate-fade-in-up animation-delay-500" style={{ opacity: 0 }}>
            <p className="text-xs text-white/30 leading-relaxed">
              By using JPLearning, you agree to our{' '}
              <span className="text-white/50 cursor-pointer hover:underline">Terms & Conditions</span>
              {' '}and{' '}
              <span className="text-white/50 cursor-pointer hover:underline">Privacy Policy</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
