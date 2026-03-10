import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Headphones, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
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
        localStorage.setItem('learner', JSON.stringify({
          id: result.data.learnerId,
          profileId: result.data.profileId,
          username: result.data.username,
          firstName: result.data.firstName,
          lastName: result.data.lastName,
          avatarUrl: result.data.avatarUrl,
          role: result.data.role,
        }));

        navigate('/');
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-0 right-0 w-1/2 h-1/2 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse transition-colors duration-700 ${isAdmin ? 'bg-amber-500/20' : 'bg-primary/20'}`} />
        <div className={`absolute bottom-0 left-0 w-1/2 h-1/2 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-pulse delay-700 transition-colors duration-700 ${isAdmin ? 'bg-orange-500/20' : 'bg-secondary/20'}`} />
      </div>

      <Card className="w-full max-w-md relative z-10 border-none shadow-2xl bg-background/80 backdrop-blur-xl animate-in zoom-in-95 duration-500">
        <CardHeader className="space-y-4 text-center pb-8 pt-10">
          <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-2 transition-colors duration-300 ${isAdmin ? 'bg-amber-500/10 text-amber-600' : 'bg-primary/10 text-primary'}`}>
            {isAdmin ? <ShieldCheck className="w-8 h-8" /> : <Headphones className="w-8 h-8" />}
          </div>
          <div className="space-y-2">
            <CardTitle className={`text-3xl font-bold tracking-tight transition-colors duration-300 ${isAdmin ? 'text-amber-600' : 'text-primary'}`}>
              {isAdmin ? 'Admin Panel' : 'JPLearning'}
            </CardTitle>
            <CardDescription className="text-base">
              {isAdmin ? 'Đăng nhập quản trị hệ thống' : 'Ứng dụng luyện nghe tiếng Nhật'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="username">
                  Tên đăng nhập
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none" htmlFor="password">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="h-12 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <Button
              className={`w-full h-12 text-base font-medium transition-colors duration-300 ${isAdmin ? 'bg-amber-600 hover:bg-amber-700' : ''}`}
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Đang đăng nhập...
                </>
              ) : (
                isAdmin ? 'Đăng nhập Admin' : 'Đăng nhập'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4 pb-10">
          {!isAdmin && (
            <div className="text-sm text-center text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">
                Đăng ký ngay
              </Link>
            </div>
          )}
          <button
            type="button"
            onClick={toggleMode}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {isAdmin ? 'Đăng nhập với tư cách Học viên' : 'Đăng nhập với tư cách Quản trị viên'}
          </button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;
