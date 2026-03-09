import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Calendar,
  Camera,
  Loader2,
  CheckCircle2,
  Pencil,
  Save,
  X,
  GraduationCap,
  Play,
  Plus,
  BookOpen,
  ShieldCheck,
  User2,
} from 'lucide-react';
import LearnerLayout from '../../components/learner/LearnerLayout';
import {
  learnerApi,
  LearnerAccountResponse,
  ProfileResponse,
  LevelResponse,
} from '@/services/api';
import { useActiveProfile } from '@/hooks/useActiveProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { profileId: activeProfileId, setProfileId } = useActiveProfile();

  const [account, setAccount] = useState<LearnerAccountResponse | null>(null);
  const [profiles, setProfiles] = useState<ProfileResponse[]>([]);
  const [levels, setLevels] = useState<LevelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', email: '' });
  const [saving, setSaving] = useState(false);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [accountRes, profilesRes, levelsRes] = await Promise.all([
        learnerApi.getMyAccount(),
        learnerApi.getMyProfiles(),
        learnerApi.getLevels(),
      ]);
      setAccount(accountRes.data);
      setProfiles(profilesRes.data);
      setLevels(levelsRes.data);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Kích thước ảnh không được vượt quá 5MB'); return; }
    setIsUploading(true);
    setError('');
    try {
      const res = await learnerApi.uploadAvatar(file);
      const newUrl = res.data || URL.createObjectURL(file);
      setAccount(prev => prev ? { ...prev, avatarUrl: newUrl } : prev);
      const stored = localStorage.getItem('learner');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.avatarUrl = newUrl;
        localStorage.setItem('learner', JSON.stringify(parsed));
      }
      showSuccess('Cập nhật ảnh đại diện thành công!');
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi tải ảnh lên');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startEditing = () => {
    if (!account) return;
    setEditForm({ firstName: account.firstName, lastName: account.lastName, email: account.email });
    setEditing(true);
  };

  const cancelEditing = () => { setEditing(false); setError(''); };

  const handleSaveInfo = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await learnerApi.updateMyInfo(editForm);
      setAccount(res.data);
      const stored = localStorage.getItem('learner');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.firstName = res.data.firstName;
        parsed.lastName = res.data.lastName;
        parsed.email = res.data.email;
        localStorage.setItem('learner', JSON.stringify(parsed));
      }
      setEditing(false);
      showSuccess('Cập nhật thông tin thành công!');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật thông tin');
    } finally {
      setSaving(false);
    }
  };

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
      setProfiles(prev => [...prev, res.data]);
      setCreateDialogOpen(false);
      setSelectedLevelId('');
      showSuccess('Tạo hồ sơ học tập mới thành công!');
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

  if (loading) {
    return (
      <LearnerLayout>
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      </LearnerLayout>
    );
  }

  return (
    <LearnerLayout>
      <div className="max-w-4xl mx-auto py-6">
        {error && <Alert variant="destructive" className="mb-6"><AlertDescription>{error}</AlertDescription></Alert>}
        {successMessage && (
          <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Account Header Section */}
        <Card className="border-none shadow-lg overflow-hidden mb-8">
          <div className="h-32 bg-gradient-to-r from-primary via-primary/80 to-primary/50 relative" />
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16">
              {/* Avatar with hover overlay */}
              <div
                className="relative group cursor-pointer shrink-0"
                onClick={handleAvatarClick}
              >
                <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                  <AvatarImage src={account?.avatarUrl || ''} className="object-cover" />
                  <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">
                    {account?.firstName?.charAt(0) || 'L'}
                  </AvatarFallback>
                </Avatar>
                <div className={`absolute inset-0 rounded-full flex flex-col items-center justify-center transition-all duration-200
                  ${isUploading ? 'bg-black/60 opacity-100' : 'bg-black/0 group-hover:bg-black/50 opacity-0 group-hover:opacity-100'}`}>
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-white mb-1" />
                      <span className="text-white text-xs font-medium">Đổi ảnh</span>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleAvatarSelect}
                  disabled={isUploading}
                />
              </div>

              {/* Name & Info */}
              <div className="flex-1 text-center sm:text-left pb-1">
                <h1 className="text-2xl font-bold">{account?.lastName} {account?.firstName}</h1>
                <p className="text-muted-foreground">@{account?.username}</p>
              </div>

              {/* Edit Button */}
              <div className="shrink-0">
                {!editing ? (
                  <Button variant="outline" size="sm" onClick={startEditing} className="gap-2">
                    <Pencil className="w-4 h-4" /> Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveInfo} disabled={saving} className="gap-2">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Lưu
                    </Button>
                    <Button variant="ghost" size="sm" onClick={cancelEditing} disabled={saving}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User2 className="w-5 h-5 text-primary" />
                Thông tin tài khoản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName">Họ</Label>
                      <Input id="lastName" value={editForm.lastName} onChange={e => setEditForm(p => ({ ...p, lastName: e.target.value }))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName">Tên</Label>
                      <Input id="firstName" value={editForm.firstName} onChange={e => setEditForm(p => ({ ...p, firstName: e.target.value }))} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <User2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Họ và tên</p>
                      <p className="font-medium">{account?.lastName} {account?.firstName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium truncate">{account?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ngày tham gia</p>
                      <p className="font-medium">{account?.createdAt ? formatDate(account.createdAt) : '—'}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                Bảo mật & trạng thái
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tên đăng nhập</span>
                <Badge variant="secondary" className="font-mono">{account?.username}</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Trạng thái</span>
                <Badge className={account?.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}>
                  {account?.status === 'ACTIVE' ? 'Hoạt động' : account?.status}
                </Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Số hồ sơ học tập</span>
                <Badge variant="outline">{profiles.length}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Profiles Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-primary" />
              Hồ sơ học tập
            </h2>
            <Button size="sm" onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Tạo mới
            </Button>
          </div>

          {profiles.length === 0 ? (
            <Card className="border-2 border-dashed border-muted-foreground/20">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Chưa có hồ sơ học tập</h3>
                <p className="text-muted-foreground mb-4 max-w-sm">Tạo hồ sơ học tập đầu tiên để bắt đầu hành trình chinh phục tiếng Nhật!</p>
                <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" /> Tạo hồ sơ đầu tiên
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((profile) => {
                const isActive = activeProfileId === profile.profileId;
                return (
                  <Card
                    key={profile.profileId}
                    className={`border shadow-md hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5
                      ${isActive ? 'ring-2 ring-primary border-primary/50' : ''}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl font-bold text-primary">{profile.currentLevelName || 'N/A'}</span>
                            {isActive && <Badge className="bg-primary text-xs px-1.5 py-0">Đang dùng</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">Hồ sơ #{profile.profileId}</p>
                        </div>
                        <Badge variant={profile.status === 'PASS' ? 'default' : 'secondary'}
                          className={profile.status === 'PASS' ? 'bg-green-500' : 'bg-blue-500/10 text-blue-600'}>
                          {profile.status === 'PASS' ? 'Hoàn thành' : 'Đang học'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Bắt đầu: {formatDate(profile.startDate)}</span>
                      </div>

                      <Button
                        className="w-full gap-2"
                        size="sm"
                        variant={isActive ? 'default' : 'outline'}
                        onClick={() => handleSelectProfile(profile)}
                      >
                        <Play className="w-3.5 h-3.5" />
                        {isActive ? 'Tiếp tục học' : 'Chọn hồ sơ này'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Create Profile Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Tạo hồ sơ học tập mới</DialogTitle>
              <DialogDescription>
                Chọn cấp độ bắt đầu. Bạn sẽ tiến lên các cấp độ tiếp theo khi hoàn thành.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label className="mb-2 block">Cấp độ bắt đầu</Label>
              <Select value={selectedLevelId} onValueChange={setSelectedLevelId}>
                <SelectTrigger className="h-11">
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
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" className="w-full" onClick={() => setCreateDialogOpen(false)}>Hủy</Button>
              <Button className="w-full gap-2" onClick={handleCreateProfile} disabled={!selectedLevelId || creating}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Tạo hồ sơ
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </LearnerLayout>
  );
};

export default ProfilePage;
