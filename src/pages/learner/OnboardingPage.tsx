import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Loader2, BookOpen, Camera, X, Sparkles } from 'lucide-react';
import { learnerApi, LevelResponse } from '@/services/api';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { setProfileId } = useActiveProfile();
  const [levels, setLevels] = useState<LevelResponse[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string>('');
  const [profileName, setProfileName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [profilesRes, levelsRes] = await Promise.all([
        learnerApi.getMyProfiles(),
        learnerApi.getLevels(),
      ]);
      if (profilesRes.data.length > 0) {
        navigate('/learn/profiles', { replace: true });
        return;
      }
      setLevels(levelsRes.data);
      if (levelsRes.data.length > 0 && !selectedLevelId) {
        setSelectedLevelId(String(levelsRes.data[0].id));
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Chỉ chấp nhận file ảnh');
      return;
    }
    setError('');
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateProfile = async () => {
    if (!selectedLevelId) return;
    setCreating(true);
    setError('');
    try {
      const res = await learnerApi.createProfile({
        levelId: Number(selectedLevelId),
        name: profileName.trim() || undefined,
      });
      const profileId = res.data.profileId;
      setProfileId(profileId);
      if (avatarFile) {
        try {
          await learnerApi.uploadProfileAvatar(profileId, avatarFile);
        } catch {
          // Không chặn flow nếu upload avatar lỗi
        }
      }
      navigate('/learn');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo hồ sơ');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F8F7FF] via-[#F3F1FF] to-[#EEF2FF]">
        <Loader2 className="h-10 w-10 animate-spin text-elsa-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#F8F7FF] via-[#F3F1FF] to-[#EEF2FF]">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-elsa-indigo-300/15 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-elsa-purple-300/10 rounded-full blur-[150px]" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-none shadow-elsa-lg bg-white/90 backdrop-blur-xl rounded-3xl">
        <CardHeader className="space-y-4 text-center pb-8 pt-10">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-elsa-indigo-500 to-elsa-purple-500 flex items-center justify-center mb-2 shadow-lg shadow-elsa-indigo-500/25">
            <GraduationCap className="h-10 w-10 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-elsa-indigo-50 text-elsa-indigo-600 text-xs font-semibold mb-3 border border-elsa-indigo-100">
              <Sparkles className="w-3 h-3" />
              Chào mừng
            </div>
            <CardTitle className="text-3xl font-bold text-foreground">Chào mừng đến với JPLearning</CardTitle>
          </div>
          <CardDescription className="text-base leading-relaxed">
            Tạo hồ sơ học tập đầu tiên để bắt đầu hành trình chinh phục tiếng Nhật.
            Học theo thứ tự, pass bài quiz để mở bài tiếp theo!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 pb-8">
          {error && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Ảnh đại diện (tùy chọn)</label>
            <div className="flex items-center gap-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-2xl border-2 border-dashed border-elsa-indigo-200 flex items-center justify-center cursor-pointer hover:border-elsa-indigo-400 hover:bg-elsa-indigo-50 transition-all duration-200"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-elsa-indigo-400" />
                )}
              </div>
              <div className="flex-1">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="rounded-xl border-elsa-indigo-200 hover:bg-elsa-indigo-50">
                  Chọn ảnh
                </Button>
                {avatarPreview && (
                  <Button type="button" variant="ghost" size="sm" className="ml-2" onClick={handleRemoveAvatar}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
                <p className="text-xs text-muted-foreground mt-1">Bỏ qua nếu không muốn đặt</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleAvatarSelect}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Tên hồ sơ (tùy chọn)</label>
            <Input
              placeholder="VD: Học N5, Ôn thi JLPT..."
              className="h-12 rounded-xl border-elsa-indigo-100 focus:border-elsa-indigo-300"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Chọn cấp độ bắt đầu</label>
            <Select value={selectedLevelId} onValueChange={setSelectedLevelId}>
              <SelectTrigger className="h-12 rounded-xl border-elsa-indigo-100">
                <SelectValue placeholder="Chọn cấp độ..." />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {levels.map(level => (
                  <SelectItem key={level.id} value={String(level.id)} className="rounded-lg">
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-elsa-indigo-500" />
                      {level.levelName}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-elsa-indigo-600 to-elsa-indigo-500 hover:from-elsa-indigo-700 hover:to-elsa-indigo-600 shadow-lg hover:shadow-xl hover:shadow-elsa-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5"
            onClick={handleCreateProfile}
            disabled={!selectedLevelId || creating}
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang tạo...
              </>
            ) : (
                <>Bắt đầu học</>
              )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPage;
