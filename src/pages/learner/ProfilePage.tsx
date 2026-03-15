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
import { formatBackendDateTime } from '@/lib/dateUtils';
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
  const [profileName, setProfileName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const createAvatarInputRef = useRef<HTMLInputElement>(null);
  const [editingProfileId, setEditingProfileId] = useState<number | null>(null);
  const [editProfileName, setEditProfileName] = useState('');
  const [savingProfileName, setSavingProfileName] = useState(false);

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

  const handleCreateAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Kích thước ảnh không được vượt quá 5MB'); return; }
    if (!file.type.startsWith('image/')) { setError('Chỉ chấp nhận file ảnh'); return; }
    setError('');
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleRemoveCreateAvatar = () => {
    setAvatarFile(null);
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarPreview(null);
    if (createAvatarInputRef.current) createAvatarInputRef.current.value = '';
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
      let finalProfile = res.data;
      if (avatarFile) {
        try {
          const uploadRes = await learnerApi.uploadProfileAvatar(profileId, avatarFile);
          finalProfile = { ...res.data, avatarUrl: uploadRes.data?.avatarUrl ?? res.data.avatarUrl };
        } catch {
          // Không chặn flow
        }
      }
      setProfiles(prev => [...prev, finalProfile]);
      setCreateDialogOpen(false);
      setSelectedLevelId('');
      setProfileName('');
      handleRemoveCreateAvatar();
      showSuccess('Tạo hồ sơ học tập mới thành công!');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tạo profile');
    } finally {
      setCreating(false);
    }
  };

  const startEditProfileName = (profile: ProfileResponse) => {
    setEditingProfileId(profile.profileId);
    setEditProfileName(profile.name || '');
  };

  const cancelEditProfileName = () => {
    setEditingProfileId(null);
    setEditProfileName('');
  };

  const handleSaveProfileName = async () => {
    if (editingProfileId == null) return;
    setSavingProfileName(true);
    setError('');
    try {
      const res = await learnerApi.updateProfile(editingProfileId, { name: editProfileName.trim() || null });
      setProfiles(prev => prev.map(p => p.profileId === editingProfileId ? res.data : p));
      setEditingProfileId(null);
      setEditProfileName('');
      showSuccess('Cập nhật tên hồ sơ thành công!');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi cập nhật tên');
    } finally {
      setSavingProfileName(false);
    }
  };

  const formatDate = (value: unknown) => formatBackendDateTime(value);

  if (loading) {
    return (
      <LearnerLayout>
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-elsa-indigo-500" /></div>
      </LearnerLayout>
    );
  }

  return (
    <LearnerLayout>
      <div className="max-w-4xl mx-auto py-6">
        {error && <Alert variant="destructive" className="mb-6"><AlertDescription>{error}</AlertDescription></Alert>}
        {successMessage && (
          <Alert className="mb-6 bg-emerald-50 text-emerald-700 border-emerald-200 rounded-xl">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        {/* Account Header Section */}
        <Card className="border-none shadow-elsa-md overflow-hidden mb-8 rounded-2xl">
          <div className="h-32 bg-gradient-to-r from-elsa-indigo-600 via-elsa-indigo-500 to-elsa-purple-500 relative" />
          <CardContent className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-16">
              {/* Avatar with hover overlay */}
              <div
                className="relative group cursor-pointer shrink-0"
                onClick={handleAvatarClick}
              >
                <Avatar className="w-32 h-32 border-4 border-white shadow-xl rounded-3xl">
                  <AvatarImage src={account?.avatarUrl || ''} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-elsa-indigo-100 to-elsa-purple-100 text-elsa-indigo-600 text-4xl font-bold">
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
                  <Button variant="outline" size="sm" onClick={startEditing} className="gap-2 rounded-xl border-elsa-indigo-200 hover:bg-elsa-indigo-50">
                    <Pencil className="w-4 h-4" /> Chỉnh sửa
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSaveInfo} disabled={saving} className="gap-2 rounded-xl bg-gradient-to-r from-elsa-indigo-500 to-elsa-indigo-600">
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
          <Card className="border-none shadow-elsa-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User2 className="w-5 h-5 text-elsa-indigo-500" />
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
                    <div className="w-9 h-9 rounded-xl bg-elsa-indigo-50 flex items-center justify-center shrink-0">
                      <User2 className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Họ và tên</p>
                      <p className="font-medium">{account?.lastName} {account?.firstName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-elsa-indigo-50 flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium truncate">{account?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-elsa-indigo-50 flex items-center justify-center shrink-0">
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

          <Card className="border-none shadow-elsa-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
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
                <Badge className={account?.status === 'ACTIVE' ? 'bg-emerald-500 shadow-sm' : 'bg-red-500'}>
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
              <GraduationCap className="w-6 h-6 text-elsa-indigo-500" />
              Hồ sơ học tập
            </h2>
            <Button size="sm" onClick={() => setCreateDialogOpen(true)} className="gap-2 rounded-xl bg-gradient-to-r from-elsa-indigo-500 to-elsa-indigo-600 hover:from-elsa-indigo-600 hover:to-elsa-indigo-700">
              <Plus className="w-4 h-4" /> Tạo mới
            </Button>
          </div>

          {profiles.length === 0 ? (
            <Card className="border-2 border-dashed border-elsa-indigo-200 rounded-2xl">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-elsa-indigo-100 to-elsa-purple-100 flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-elsa-indigo-500" />
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
                    className={`border-none shadow-elsa-sm hover:shadow-elsa-md transition-all duration-200 hover:-translate-y-0.5 rounded-2xl
                      ${isActive ? 'ring-2 ring-elsa-indigo-400 bg-elsa-indigo-50/30' : ''}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          {profile.avatarUrl ? (
                            <img src={profile.avatarUrl} alt="" className="w-12 h-12 rounded-2xl object-cover border-2 border-elsa-indigo-100 shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-elsa-indigo-100 to-elsa-purple-100 flex items-center justify-center shrink-0">
                              <GraduationCap className="w-6 h-6 text-elsa-indigo-500" />
                            </div>
                          )}
                          <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl font-bold text-foreground">
                              {profile.name || profile.currentLevelName || 'N/A'}
                            </span>
                            {isActive && <Badge className="bg-elsa-indigo-500 text-xs px-1.5 py-0">Đang dùng</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {profile.name ? (profile.currentLevelName || 'N/A') : `Hồ sơ #${profile.profileId}`}
                          </p>
                          {editingProfileId === profile.profileId ? (
                            <div className="flex gap-2 mt-2 flex-wrap">
                              <Input
                                value={editProfileName}
                                onChange={(e) => setEditProfileName(e.target.value)}
                                placeholder="Tên hồ sơ"
                                className="h-9 text-sm flex-1 min-w-[120px]"
                              />
                              <Button size="sm" onClick={handleSaveProfileName} disabled={savingProfileName}>
                                {savingProfileName ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu'}
                              </Button>
                              <Button variant="ghost" size="sm" onClick={cancelEditProfileName} disabled={savingProfileName}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-1 text-xs text-muted-foreground hover:text-foreground -ml-1"
                              onClick={() => startEditProfileName(profile)}
                            >
                              <Pencil className="w-3 h-3 mr-1" /> Đổi tên
                            </Button>
                          )}
                          </div>
                        </div>
                        <Badge variant={profile.status === 'PASS' ? 'default' : 'secondary'}
                          className={profile.status === 'PASS' ? 'bg-emerald-500 shadow-sm' : 'bg-elsa-indigo-50 text-elsa-indigo-600 border border-elsa-indigo-200'}>
                          {profile.status === 'PASS' ? 'Hoàn thành' : 'Đang học'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-4">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Bắt đầu: {formatDate(profile.startDate)}</span>
                      </div>

                      <Button
                        className={`w-full gap-2 rounded-xl ${isActive ? 'bg-gradient-to-r from-elsa-indigo-500 to-elsa-indigo-600 hover:from-elsa-indigo-600 hover:to-elsa-indigo-700' : ''}`}
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
        <Dialog open={createDialogOpen} onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) {
            setProfileName('');
            handleRemoveCreateAvatar();
          }
        }}>
          <DialogContent className="sm:max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Tạo hồ sơ học tập mới</DialogTitle>
              <DialogDescription>
                Chọn cấp độ bắt đầu. Bạn sẽ tiến lên các cấp độ tiếp theo khi hoàn thành.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>Ảnh đại diện (tùy chọn)</Label>
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => createAvatarInputRef.current?.click()}
                    className="w-14 h-14 rounded-2xl border-2 border-dashed border-elsa-indigo-200 flex items-center justify-center cursor-pointer hover:border-elsa-indigo-400 hover:bg-elsa-indigo-50 transition-all shrink-0"
                  >
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <Camera className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Button type="button" variant="outline" size="sm" onClick={() => createAvatarInputRef.current?.click()}>
                      Chọn ảnh
                    </Button>
                    {avatarPreview && (
                      <Button type="button" variant="ghost" size="sm" className="ml-2" onClick={handleRemoveCreateAvatar}>
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">Bỏ qua nếu không muốn đặt</p>
                  </div>
                  <input
                    ref={createAvatarInputRef}
                    type="file"
                    className="hidden"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    onChange={handleCreateAvatarSelect}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tên hồ sơ (tùy chọn)</Label>
                <Input
                  placeholder="VD: Học N5, Ôn thi JLPT..."
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Cấp độ bắt đầu</Label>
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
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" className="w-full rounded-xl" onClick={() => setCreateDialogOpen(false)}>Hủy</Button>
              <Button className="w-full gap-2 rounded-xl bg-gradient-to-r from-elsa-indigo-500 to-elsa-indigo-600 hover:from-elsa-indigo-600 hover:to-elsa-indigo-700" onClick={handleCreateProfile} disabled={!selectedLevelId || creating}>
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
