import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  User,
  Mail,
  Calendar,
  Trophy,
  GraduationCap,
  BookOpen,
  Camera,
  Trash2,
  Loader2,
  CheckCircle2,
  ChevronRight,
  PenTool,
  AlertTriangle,
  SwitchCamera,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LearnerLayout from '../../components/learner/LearnerLayout';
import { learnerApi, ProfileProgressResponse, LevelResponse, tokenStorage } from '@/services/api';
import { getActiveProfileId } from '@/hooks/useActiveProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const profileId = getActiveProfileId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ProfileProgressResponse | null>(null);
  const [allLevels, setAllLevels] = useState<LevelResponse[]>([]);

  let learnerInfo = { firstName: '', lastName: '', email: '', createdAt: '', avatarUrl: '' };
  try {
    const stored = localStorage.getItem('learner');
    if (stored) learnerInfo = { ...learnerInfo, ...JSON.parse(stored) };
  } catch { /* ignore */ }

  const [avatarUrl, setAvatarUrl] = useState(learnerInfo.avatarUrl || '');

  const getInitials = () => {
    const first = learnerInfo.firstName?.[0] || '';
    const last = learnerInfo.lastName?.[0] || '';
    return (last + first).toUpperCase() || 'JP';
  };

  const fetchProgress = useCallback(async () => {
    setLoading(true);
    try {
      const [levelsRes, progressRes] = await Promise.all([
        learnerApi.getLevels(),
        profileId ? learnerApi.getProfileProgress(profileId) : Promise.resolve({ data: null })
      ]);

      if (levelsRes.data) setAllLevels(levelsRes.data);
      if (progressRes.data) setProgress(progressRes.data);
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const totalLevels = allLevels.length || (progress?.levels.length ?? 0);
  const completedLevels = progress?.levels.filter(l => l.status === 'PASS').length ?? 0;
  const totalTopics = progress?.levels.reduce((sum, l) => sum + l.topics.length, 0) ?? 0;
  const completedTopics = progress?.levels.reduce((sum, l) => sum + l.topics.filter(t => t.status === 'PASS').length, 0) ?? 0;
  const totalTests = progress?.levels.reduce((sum, l) => sum + l.topics.reduce((s, t) => s + t.testCount, 0), 0) ?? 0;
  const passedTests = progress?.levels.reduce((sum, l) => sum + l.topics.reduce((s, t) => s + t.passedTestCount, 0), 0) ?? 0;
  const passRate = totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Kích thước ảnh không được vượt quá 5MB'); return; }
    setIsUploading(true);
    setError('');
    const localPreviewUrl = URL.createObjectURL(file);
    try {
      const res = await learnerApi.uploadAvatar(file);
      setAvatarUrl(localPreviewUrl);
      const serverUrl = res.data || localPreviewUrl;
      const stored = localStorage.getItem('learner');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.avatarUrl = serverUrl;
        localStorage.setItem('learner', JSON.stringify(parsed));
      }
      showSuccess('Tải lên ảnh đại diện thành công!');
    } catch (err: any) {
      URL.revokeObjectURL(localPreviewUrl);
      setError(err.message || 'Có lỗi xảy ra khi tải ảnh lên');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    setIsDeletingAvatar(true);
    setError('');
    try {
      await learnerApi.deleteAvatar();
      setAvatarUrl('');
      const stored = localStorage.getItem('learner');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.avatarUrl = '';
        localStorage.setItem('learner', JSON.stringify(parsed));
      }
      showSuccess('Đã xóa ảnh đại diện!');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xóa ảnh');
    } finally {
      setIsDeletingAvatar(false);
    }
  };

  return (
    <LearnerLayout>
      <div className="max-w-5xl mx-auto pt-4 pb-12 px-4 relative z-10">
        {/* Header Breadcrumbs */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/learn')}
            className="rounded-full bg-white/40 backdrop-blur-md border border-white/40 text-slate-700 hover:text-primary gap-2 font-black px-5"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            CHỌN CẤP ĐỘ HỌC
          </Button>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 bg-rose-50 text-rose-600 border border-rose-200 rounded-[2rem] animate-in slide-in-from-top-4 shadow-xl shadow-rose-500/5">
            <AlertTriangle className="h-5 w-5 text-rose-500" />
            <AlertDescription className="font-black ml-2">{error}</AlertDescription>
          </Alert>
        )}
        {successMessage && (
          <Alert className="mb-6 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-[2rem] animate-in slide-in-from-top-4 shadow-xl shadow-emerald-500/5">
            <CheckCircle2 className="h-5 w-5 fill-emerald-500 text-white" />
            <AlertDescription className="font-black ml-2">{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Hero Banner Card */}
        <Card className="border-none shadow-2xl shadow-slate-200/40 rounded-[4rem] overflow-hidden mb-12 bg-white/80 backdrop-blur-2xl border border-white/60">
          <div className="h-32 sm:h-40 bg-gradient-to-r from-sky-100 via-rose-100 to-amber-100 relative opacity-80" />
          <CardContent className="px-10 pb-10 pt-0 relative flex flex-col md:flex-row items-center md:items-end justify-between gap-8 -mt-16 sm:-mt-20">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
              <div className="relative group">
                <Avatar className="w-28 h-28 sm:w-36 sm:h-36 border-8 border-white shadow-xl bg-white ring-4 ring-sky-50">
                  <AvatarImage src={avatarUrl} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-sky-50 to-rose-50 text-sky-400 text-3xl font-black">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <label className={`absolute bottom-2 right-2 p-2.5 rounded-full cursor-pointer bg-white border border-slate-100 text-sky-400 shadow-lg hover:scale-110 active:scale-90 transition-all ${isUploading ? 'animate-pulse' : ''}`}>
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-5 h-5" />}
                  <input type="file" className="hidden" accept="image/png,image/jpeg,image/jpg" onChange={handleAvatarSelect} disabled={isUploading || isDeletingAvatar} ref={fileInputRef} />
                </label>
              </div>

              <div className="text-center md:text-left mb-2">
                <h1 className="text-3xl font-black text-slate-700 tracking-tighter mb-2 leading-none">
                  {learnerInfo.lastName} {learnerInfo.firstName}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <Badge className="bg-sky-50 text-sky-600 border border-sky-100/50 shadow-sm px-4 py-1.5 font-black text-[9px] uppercase tracking-widest rounded-full">Pro Learner</Badge>
                  <Badge className="bg-rose-50 text-rose-500 border border-rose-100/50 shadow-sm px-4 py-1.5 font-black text-[9px] uppercase tracking-widest rounded-full">Level Up</Badge>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mb-2">
              {[
                { val: totalLevels, label: 'CẤP ĐỘ', bg: 'bg-sky-50', text: 'text-sky-600', border: 'border-sky-100' },
                { val: completedLevels, label: 'ĐÃ XONG', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
                { val: totalTopics, label: 'CHỦ ĐỀ', bg: 'bg-rose-50', text: 'text-rose-500', border: 'border-rose-100' }
              ].map((stat, i) => (
                <div key={i} className={`flex flex-col items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-[2rem] ${stat.bg} ${stat.text} border ${stat.border} shadow-sm p-2 transition-transform hover:scale-105 cursor-default`}>
                  <span className="text-2xl sm:text-3xl font-black leading-none">{stat.val}</span>
                  <span className="text-[9px] font-black opacity-80 uppercase tracking-tighter mt-1">{stat.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
          {avatarUrl && (
            <div className="px-12 pb-8 flex justify-between items-center -mt-4">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full h-10 px-6 text-[11px] font-black text-slate-400 gap-2 hover:bg-rose-50 hover:text-rose-500 transition-all border border-slate-100"
                onClick={handleDeleteAvatar}
                disabled={isDeletingAvatar || isUploading}
              >
                {isDeletingAvatar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                XÓA ẢNH HIỆN TẠI
              </Button>
              <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest">Image: PNG/JPG (MAX 5MB)</span>
            </div>
          )}
        </Card>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left Column: Progress */}
          <div className="lg:col-span-2 space-y-10">
            <Card className="border border-sky-100 shadow-xl rounded-[3rem] bg-white/90 backdrop-blur-xl p-8 overflow-hidden relative group">
              <div className="absolute top-[-20%] right-[-10%] w-60 h-60 bg-sky-50 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-2xl flex items-center justify-center border border-sky-100 shadow-sm">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black tracking-tight text-slate-700">TIẾN ĐỘ TỔNG QUÁT</h3>
                      <p className="text-[10px] font-black opacity-60 uppercase tracking-widest text-slate-400">Mastering Japanese Step by Step</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black leading-none text-sky-500">{passRate}%</div>
                    <div className="text-[9px] font-black opacity-60 uppercase tracking-widest mt-1 text-slate-400">HOÀN TẤT</div>
                  </div>
                </div>
                <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden p-1 shadow-inner border border-slate-100">
                  <div
                    className="h-full bg-gradient-to-r from-sky-300 via-indigo-300 to-purple-300 rounded-full transition-all duration-1500 ease-out shadow-sm"
                    style={{ width: `${passRate}%` }}
                  />
                </div>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-white/50 rounded-[1.5rem] p-4 border border-slate-100">
                    <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-1 text-slate-400">Cấp độ</p>
                    <p className="text-lg font-black text-slate-600">{completedLevels} / {totalLevels}</p>
                  </div>
                  <div className="bg-white/50 rounded-[1.5rem] p-4 border border-slate-100">
                    <p className="text-[9px] font-black opacity-60 uppercase tracking-widest mb-1 text-slate-400">Chủ đề</p>
                    <p className="text-lg font-black text-slate-600">{completedTopics} / {totalTopics}</p>
                  </div>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white/80 backdrop-blur-xl border-2 border-white/60 p-8">
                <CardHeader className="p-0 mb-8 border-b border-slate-100 pb-6 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                      <User className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-2xl font-black text-slate-800">CÁ NHÂN</CardTitle>
                  </div>
                  <Button variant="ghost" className="rounded-2xl w-12 h-12 p-0 bg-slate-50 text-slate-400 hover:text-primary hover:bg-blue-50">
                    <PenTool className="w-6 h-6" />
                  </Button>
                </CardHeader>
                <div className="space-y-8">
                  {[
                    { label: 'TÊN ĐĂNG NHẬP', val: learnerInfo.firstName },
                    { label: 'HỌ VÀ TÊN', val: `${learnerInfo.lastName} ${learnerInfo.firstName}` },
                    { label: 'EMAIL', val: learnerInfo.email, className: 'truncate max-w-[200px]' },
                    { label: 'VAI TRÒ', val: 'HỌC VIÊN', accent: 'text-indigo-600' }
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{item.label}</span>
                      <p className={`text-base font-black text-slate-700 ${item.accent || ''} ${item.className || ''}`}>{item.val || '---'}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white/80 backdrop-blur-xl border-2 border-white/60 p-8">
                <CardHeader className="p-0 mb-8 border-b border-slate-100 pb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                      <Trophy className="w-7 h-7" />
                    </div>
                    <CardTitle className="text-2xl font-black text-slate-800">DANH HIỆU</CardTitle>
                  </div>
                </CardHeader>
                <div className="space-y-6">
                  {(allLevels.length > 0 ? allLevels : (progress?.levels || [])).slice(0, 3).map((level: any) => {
                    const levelId = level.id || level.levelId;
                    const levelName = level.levelName || level.name || `LEVEL ${level.levelOrder || ''}`;
                    const lp = progress?.levels.find(p => p.levelId === levelId);
                    const status = lp?.status || 'LOCKED';

                    return (
                      <div
                        key={levelId}
                        className={`group p-5 rounded-[2.5rem] border-2 transition-all duration-300 hover:scale-105 ${status === 'PASS'
                          ? 'bg-emerald-500 border-emerald-600/20 text-white shadow-xl shadow-emerald-500/30'
                          : status === 'IN_PROGRESS'
                            ? 'bg-indigo-600 border-indigo-700/20 text-white shadow-xl shadow-indigo-500/30'
                            : 'bg-slate-100 border-slate-200/50 grayscale opacity-60'
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-black text-lg tracking-tight leading-tight">{levelName}</h4>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mt-0.5">
                              {status === 'PASS' ? 'MASTERED' : status === 'IN_PROGRESS' ? 'CURRENT' : 'LOCKED'}
                            </p>
                          </div>
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-xl ${status === 'PASS' ? 'bg-white text-emerald-600' : 'bg-white text-indigo-600'
                            }`}>
                            <GraduationCap className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </div>
          </div>

          {/* Right Column: Small Stats & Badges */}
          <div className="space-y-10">
            <Card className="border border-amber-100 shadow-xl rounded-[3rem] bg-white/90 backdrop-blur-xl p-8 relative overflow-hidden">
              <div className="absolute top-[-20%] left-[-10%] w-32 h-32 bg-amber-50 rounded-full blur-2xl" />
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-[1.5rem] flex items-center justify-center mb-6 border border-amber-100 shadow-sm">
                  <Trophy className="w-8 h-8" />
                </div>
                <h2 className="text-4xl font-black leading-none mb-2 text-slate-700">{passedTests}</h2>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-60 text-slate-400">BÀI THI THÀNH CÔNG</p>
                <div className="w-full h-px bg-slate-100 my-6" />
                <div className="text-2xl font-black mb-1 text-slate-600">{totalTests}</div>
                <p className="text-[9px] font-black uppercase tracking-widest opacity-40 text-slate-400">TỔNG SỐ BÀI LÀM</p>
              </div>
            </Card>

            <Card className="border-none shadow-2xl rounded-[3.5rem] bg-white/80 backdrop-blur-xl border-2 border-white/60 p-8">
              <h3 className="text-xl font-black text-slate-800 mb-6 text-center">THIẾT LẬP NHANH</h3>
              <div className="space-y-4">
                <Button
                  className="w-full h-14 rounded-full bg-slate-900 hover:bg-indigo-600 transition-all font-black tracking-widest gap-3 shadow-xl hover:shadow-indigo-500/20"
                  onClick={() => navigate('/learn/profiles')}
                >
                  <SwitchCamera className="w-5 h-5" />
                  ĐỔI HỒ SƠ
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-14 rounded-full border-2 border-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all font-black tracking-widest gap-3 shadow-sm"
                  onClick={() => {
                    localStorage.removeItem('learner');
                    localStorage.removeItem('activeProfileId');
                    tokenStorage.removeLearnerToken();
                    navigate('/login');
                  }}
                >
                  <LogOut className="w-5 h-5" />
                  ĐĂNG XUẤT
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </LearnerLayout>
  );
};

export default ProfilePage;
