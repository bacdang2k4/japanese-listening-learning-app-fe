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
} from 'lucide-react';
import LearnerLayout from '../../components/learner/LearnerLayout';
import { learnerApi, ProfileProgressResponse } from '@/services/api';
import { getActiveProfileId } from '@/hooks/useActiveProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ProfilePage: React.FC = () => {
  const profileId = getActiveProfileId();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ProfileProgressResponse | null>(null);

  let learnerInfo = { firstName: '', lastName: '', email: '', createdAt: '', avatarUrl: '' };
  try {
    const stored = localStorage.getItem('learner');
    if (stored) learnerInfo = { ...learnerInfo, ...JSON.parse(stored) };
  } catch { /* ignore */ }

  const [avatarUrl, setAvatarUrl] = useState(learnerInfo.avatarUrl || '');

  const fetchProgress = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const res = await learnerApi.getProfileProgress(profileId);
      setProgress(res.data);
    } catch (err) {
      console.error('Failed to load profile progress', err);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => { fetchProgress(); }, [fetchProgress]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const totalLevels = progress?.levels.length ?? 0;
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
    try {
      const res = await learnerApi.uploadAvatar(file);
      const newUrl = res.data || URL.createObjectURL(file);
      setAvatarUrl(newUrl);
      const stored = localStorage.getItem('learner');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.avatarUrl = newUrl;
        localStorage.setItem('learner', JSON.stringify(parsed));
      }
      showSuccess('Tải lên ảnh đại diện thành công!');
    } catch (err: any) {
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
      <div className="max-w-5xl mx-auto py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Hồ sơ cá nhân</h1>

        {error && <Alert variant="destructive" className="mb-6"><AlertDescription>{error}</AlertDescription></Alert>}
        {successMessage && (
          <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-4">
            <Card className="border-none shadow-md overflow-hidden animate-in slide-in-from-left-4">
              <div className="h-24 bg-gradient-to-r from-primary to-primary/60" />
              <CardContent className="px-6 pb-6 pt-0 relative">
                <div className="flex justify-center -mt-12 mb-4 relative z-10 group">
                  <div className="relative">
                    <Avatar className="w-28 h-28 border-4 border-background shadow-sm">
                      <AvatarImage src={avatarUrl} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                        {learnerInfo.firstName?.charAt(0) || 'L'}
                      </AvatarFallback>
                    </Avatar>
                    <label className={`absolute inset-0 rounded-full cursor-pointer flex flex-col items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity ${isUploading ? 'opacity-100 bg-black/60' : ''}`}>
                      {isUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Camera className="w-6 h-6 mb-1" /><span className="text-[10px] font-medium">Đổi ảnh</span></>}
                      <input type="file" className="hidden" accept="image/png,image/jpeg,image/jpg" onChange={handleAvatarSelect} disabled={isUploading || isDeletingAvatar} ref={fileInputRef} />
                    </label>
                  </div>
                </div>

                {avatarUrl && (
                  <div className="flex justify-center mb-4">
                    <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 text-xs font-semibold" onClick={handleDeleteAvatar} disabled={isDeletingAvatar || isUploading}>
                      {isDeletingAvatar ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1.5" />} Xóa ảnh hiện tại
                    </Button>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold truncate">{learnerInfo.lastName} {learnerInfo.firstName}</h2>
                  <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary font-medium">Học viên</Badge>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0"><Mail className="w-4 h-4 text-muted-foreground" /></div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium truncate">{learnerInfo.email}</p>
                    </div>
                  </div>
                  {learnerInfo.createdAt && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0"><Calendar className="w-4 h-4 text-muted-foreground" /></div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ngày tham gia</p>
                        <p className="font-medium">{learnerInfo.createdAt}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="md:col-span-8 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="bg-primary border-none text-primary-foreground shadow-md animate-in slide-in-from-right-4">
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="p-3 bg-primary-foreground/10 rounded-2xl"><Trophy className="w-10 h-10" /></div>
                      <div>
                        <div className="text-4xl font-black">{passedTests}</div>
                        <div className="text-primary-foreground/80 font-medium">Bài thi đạt</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-500 border-none text-white shadow-md animate-in slide-in-from-right-4 delay-100" style={{ animationFillMode: 'both' }}>
                    <CardContent className="p-6 flex items-center gap-4">
                      <div className="p-3 bg-white/10 rounded-2xl"><GraduationCap className="w-10 h-10" /></div>
                      <div>
                        <div className="text-4xl font-black">{passRate}%</div>
                        <div className="text-white/80 font-medium">Tỉ lệ thi đạt</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-none shadow-md animate-in slide-in-from-bottom-8 delay-200" style={{ animationFillMode: 'both' }}>
                  <CardHeader className="pb-2"><CardTitle className="text-xl">Tiến độ học tập</CardTitle></CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <div className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-primary" /><span>Tiến độ cấp độ</span></div>
                        <span>{completedLevels}/{totalLevels}</span>
                      </div>
                      <Progress value={totalLevels ? (completedLevels / totalLevels) * 100 : 0} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm font-medium">
                        <div className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-secondary-foreground" /><span>Chủ đề hoàn thành</span></div>
                        <span>{completedTopics}/{totalTopics}</span>
                      </div>
                      <Progress value={totalTopics ? (completedTopics / totalTopics) * 100 : 0} className="h-2" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-md bg-muted/30">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-4 text-foreground/80">Hoạt động thi sát hạch</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background rounded-xl p-4 border text-center shadow-sm">
                        <div className="text-3xl font-black text-primary mb-1">{totalTests}</div>
                        <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Bài thi đã làm</div>
                      </div>
                      <div className="bg-background rounded-xl p-4 border text-center shadow-sm">
                        <div className="text-3xl font-black text-green-500 mb-1">{passedTests}</div>
                        <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Bài thi đạt</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </LearnerLayout>
  );
};

export default ProfilePage;
