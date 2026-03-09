import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Play, Loader2, GraduationCap, Calendar, CheckCircle2, BookOpen } from 'lucide-react';
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
  const [error, setError] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [profilesRes, levelsRes] = await Promise.all([
        learnerApi.getMyProfiles(),
        learnerApi.getLevels(),
      ]);
      setProfiles(profilesRes.data);
      setLevels(levelsRes.data);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSelectProfile = (profile: ProfileResponse) => {
    setProfileId(profile.profileId);
    navigate('/learn');
  };

  const handleCreateProfile = async () => {
    if (!selectedLevelId) return;
    setCreating(true);
    setError('');
    try {
      const res = await learnerApi.createProfile({ levelId: Number(selectedLevelId) });
      setProfileId(res.data.profileId);
      setCreateDialogOpen(false);
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
                    <div>
                      <h3 className="text-2xl font-bold text-primary mb-1">
                        {profile.currentLevelName || 'N/A'}
                      </h3>
                      <p className="text-sm text-muted-foreground">Hồ sơ #{profile.profileId}</p>
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
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Tạo hồ sơ học tập</DialogTitle>
              <DialogDescription>
                Chọn cấp độ bắt đầu cho hồ sơ mới. Bạn sẽ bắt đầu từ cấp độ này và tiến lên các cấp độ tiếp theo.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
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
