import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Headphones, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authApi } from '@/services/api';

const getPasswordStrength = (password: string): { level: number; label: string; color: string } => {
  if (!password) return { level: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-400' };
  if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-orange-400' };
  if (score <= 3) return { level: 3, label: 'Good', color: 'bg-yellow-400' };
  if (score <= 4) return { level: 4, label: 'Strong', color: 'bg-emerald-400' };
  return { level: 5, label: 'Very Strong', color: 'bg-green-500' };
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(formData.password), [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    try {
      await authApi.learnerRegister({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });

      setSuccess('Đăng ký thành công! Đang chuyển hướng đến trang đăng nhập...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dark navy-purple gradient background */}
      <div className="absolute inset-0 auth-gradient-bg" />

      {/* Subtle warm glow blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[15%] w-[350px] h-[350px] bg-purple-500/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-[15%] left-[20%] w-[400px] h-[400px] bg-indigo-400/6 rounded-full blur-[100px]" />
      </div>

      {/* Content */}
      <div className="w-full max-w-[420px] relative z-10 my-4 animate-scale-in">
        {/* Logo icon */}
        <div className="flex justify-center mb-6 animate-fade-in-up">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center animate-float bg-cyan-400/15 border border-cyan-400/25">
            <Headphones className="w-7 h-7 text-cyan-400" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-7 animate-fade-in-up animation-delay-100" style={{ opacity: 0 }}>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Create your account
          </h1>
          <p className="text-white/50 text-sm sm:text-base">
            Start improving your Japanese listening today
          </p>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-5 rounded-xl bg-red-500/15 border-red-500/30 text-red-300 animate-fade-in-up">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-5 rounded-xl bg-emerald-500/15 border-emerald-500/30 text-emerald-300 animate-fade-in-up">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="animate-fade-in-up animation-delay-200" style={{ opacity: 0 }}>
            <input
              id="username"
              name="username"
              placeholder="Choose a username"
              required
              value={formData.username}
              onChange={handleChange}
              className="auth-input-dark w-full h-[50px] px-4 rounded-xl text-base outline-none"
            />
          </div>

          {/* First Name + Last Name */}
          <div className="grid grid-cols-2 gap-3 animate-fade-in-up animation-delay-200" style={{ opacity: 0 }}>
            <input
              id="firstName"
              name="firstName"
              placeholder="First name"
              required
              value={formData.firstName}
              onChange={handleChange}
              className="auth-input-dark w-full h-[50px] px-4 rounded-xl text-base outline-none"
            />
            <input
              id="lastName"
              name="lastName"
              placeholder="Last name"
              required
              value={formData.lastName}
              onChange={handleChange}
              className="auth-input-dark w-full h-[50px] px-4 rounded-xl text-base outline-none"
            />
          </div>

          {/* Email */}
          <div className="animate-fade-in-up animation-delay-300" style={{ opacity: 0 }}>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Email address"
              required
              value={formData.email}
              onChange={handleChange}
              className="auth-input-dark w-full h-[50px] px-4 rounded-xl text-base outline-none"
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
                className="auth-input-dark w-full h-[50px] px-4 pr-12 rounded-xl text-base outline-none"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="pt-2 px-0.5">
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        i <= passwordStrength.level ? passwordStrength.color : 'bg-white/10'
                      }`}
                    />
                  ))}
                </div>
                <p className={`text-xs mt-1 font-medium ${
                  passwordStrength.level <= 1 ? 'text-red-400'
                  : passwordStrength.level <= 2 ? 'text-orange-400'
                  : passwordStrength.level <= 3 ? 'text-yellow-400'
                  : 'text-emerald-400'
                }`}>
                  {passwordStrength.label}
                </p>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="animate-fade-in-up animation-delay-400" style={{ opacity: 0 }}>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="auth-input-dark w-full h-[50px] px-4 pr-12 rounded-xl text-base outline-none"
                placeholder="Confirm password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="animate-fade-in-up animation-delay-400 pt-2" style={{ opacity: 0 }}>
            <button
              type="submit"
              disabled={loading}
              className="auth-cta-btn w-full h-[52px] rounded-xl text-white text-base font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        {/* Footer Link */}
        <div className="mt-7 text-center animate-fade-in-up animation-delay-500" style={{ opacity: 0 }}>
          <p className="text-sm text-white/45">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              Log In
            </Link>
          </p>
        </div>

        {/* Agreement text */}
        <div className="mt-8 text-center animate-fade-in-up animation-delay-500" style={{ opacity: 0 }}>
          <p className="text-xs text-white/30 leading-relaxed">
            By creating an account, you agree to our{' '}
            <span className="text-white/50 cursor-pointer hover:underline">Terms & Conditions</span>
            {' '}and{' '}
            <span className="text-white/50 cursor-pointer hover:underline">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
