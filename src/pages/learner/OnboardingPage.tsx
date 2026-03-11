import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Loader2, BookOpen, Camera, X } from 'lucide-react';
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

/**
 * Onboarding cho learner chưa có profile.
 * Hiển thị onboarding và form tạo profile đầu tiên.
 */
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

  const fetchLevels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await learnerApi.getLevels();
      setLevels(res.data);
      if (res.data.length > 0 && !selectedLevelId) {
        setSelectedLevelId(String(res.data[0].id));
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải cấp độ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLevels(); }, [fetchLevels]);

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/20 rounded-full blur-[120px] mix-blend-multiply opacity-70" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-secondary/20 rounded-full blur-[120px] mix-blend-multiply opacity-70" />
      </div>

      <Card className="w-full max-w-md relative z-10 border-none shadow-2xl bg-background/80 backdrop-blur-xl">
        <CardHeader className="space-y-4 text-center pb-8 pt-10">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-2">
            <GraduationCap className="h-10 w-10" />
          </div>
          <CardTitle className="text-3xl font-bold">Chào mừng đến với JPLearning</CardTitle>
          <CardDescription className="text-base">
            Tạo hồ sơ học tập đầu tiên để bắt đầu hành trình chinh phục tiếng Nhật.
            Học theo thứ tự, pass bài quiz để mở bài tiếp theo!
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Ảnh đại diện (tùy chọn)</label>
            <div className="flex items-center gap-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-16 h-16 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
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
            <label className="text-sm font-medium">Tên hồ sơ (tùy chọn)</label>
            <Input
              placeholder="VD: Học N5, Ôn thi JLPT..."
              className="h-12"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Chọn cấp độ bắt đầu</label>
            <Select value={selectedLevelId} onValueChange={setSelectedLevelId}>
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Chọn cấp độ..." />
              </SelectTrigger>
              <SelectContent>
                {levels.map(level => (
                  <SelectItem key={level.id} value={String(level.id)}>
                    <span className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {level.levelName}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            className="w-full h-12 text-base font-semibold"
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
