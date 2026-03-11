import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Loader2, GraduationCap, Calendar, CheckCircle2, BookOpen, Camera, X } from 'lucide-react';
import LearnerLayout from '../../components/learner/LearnerLayout';
import { learnerApi, LevelResponse, ProfileResponse } from '@/services/api';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const ProfileManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { setProfileId } = useActiveProfile();

  const [profiles, setProfiles] = useState<ProfileResponse[]>([]);
  const [levels, setLevels] = useState<LevelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState<string>('');
  const [profileName, setProfileName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [profilesRes, levelsRes] = await Promise.all([
        learnerApi.getMyProfiles(),
        learnerApi.getLevels(),
      ]);
      setProfiles(profilesRes.data);
      setLevels(levelsRes.data);
      // Chưa có profile → redirect đến onboarding
      if (profilesRes.data.length === 0) {
        navigate('/learn/onboarding', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSelectProfile = (profile: ProfileResponse) => {
    setProfileId(profile.profileId);
    navigate('/learn');
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Kích thước ảnh không được vượt quá 5MB'); return; }
    if (!file.type.startsWith('image/')) { setError('Chỉ chấp nhận file ảnh'); return; }
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
          // Không chặn flow
        }
      }
      setCreateDialogOpen(false);
      setProfileName('');
      handleRemoveAvatar();
      navigate('/learn');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo profile');
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(dateStr));
    } catch { return dateStr; }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASS':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle2 className="w-3 h-3 mr-1" /> Hoàn thành</Badge>;
      case 'LEARNING':
        return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600"><BookOpen className="w-3 h-3 mr-1" /> Đang học</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <LearnerLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </LearnerLayout>
    );
  }

  return (
    <LearnerLayout>
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-6">
            <GraduationCap className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Chọn hồ sơ học tập</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {profiles.length === 0
              ? 'Tạo hồ sơ học tập đầu tiên để bắt đầu hành trình chinh phục tiếng Nhật!'
              : 'Chọn hồ sơ để tiếp tục học hoặc tạo hồ sơ mới.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {profiles.map((profile, index) => (
            <div
              key={profile.profileId}
              className="animate-in fade-in slide-in-from-bottom-8 duration-700"
              style={{ animationFillMode: 'both', animationDelay: `${(index + 1) * 100}ms` }}
            >
              <Card className="h-full border shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-background">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-2xl font-bold text-primary mb-1">
                          {profile.name || profile.currentLevelName || 'N/A'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {profile.name ? (profile.currentLevelName || 'N/A') : `Hồ sơ #${profile.profileId}`}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(profile.status)}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                    <Calendar className="w-4 h-4" />
                    <span>Bắt đầu: {formatDate(profile.startDate)}</span>
                  </div>

                  <Button
                    className="w-full h-12 text-base font-semibold group"
                    onClick={() => handleSelectProfile(profile)}
                  >
                    <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                    Tiếp tục học
                  </Button>
                </CardContent>
              </Card>
            </div>
          ))}

          {/* Create new profile card */}
          <div
            className="animate-in fade-in slide-in-from-bottom-8 duration-700"
            style={{ animationFillMode: 'both', animationDelay: `${(profiles.length + 1) * 100}ms` }}
          >
            <Card
              className="h-full border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all duration-300 cursor-pointer hover:-translate-y-1 bg-primary/5"
              onClick={() => setCreateDialogOpen(true)}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Tạo hồ sơ mới</h3>
                <p className="text-sm text-muted-foreground">Bắt đầu từ một cấp độ mới</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Profile Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) {
            setProfileName('');
            handleRemoveAvatar();
          }
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Tạo hồ sơ học tập</DialogTitle>
              <DialogDescription>
                Chọn cấp độ bắt đầu cho hồ sơ mới. Bạn sẽ bắt đầu từ cấp độ này và tiến lên các cấp độ tiếp theo.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Ảnh đại diện (tùy chọn)</label>
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-14 h-14 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors shrink-0"
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-muted-foreground" />
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
                <label className="text-sm font-medium">Cấp độ bắt đầu</label>
                <Select value={selectedLevelId} onValueChange={setSelectedLevelId}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Chọn cấp độ..." />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map(level => (
                      <SelectItem key={level.id} value={String(level.id)}>
                        {level.levelName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" className="w-full" onClick={() => setCreateDialogOpen(false)}>
                Hủy
              </Button>
              <Button
                className="w-full"
                onClick={handleCreateProfile}
                disabled={!selectedLevelId || creating}
              >
                {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Tạo hồ sơ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </LearnerLayout>
  );
};

export default ProfileManagementPage;
