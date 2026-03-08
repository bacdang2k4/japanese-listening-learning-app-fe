import React, { useState, useRef } from 'react';
import {
  User,
  Mail,
  Calendar,
  Trophy,
  GraduationCap,
  BookOpen,
  Edit2,
  Save,
  X,
  Camera,
  Trash2,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import LearnerLayout from '../../components/learner/LearnerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingAvatar, setIsDeletingAvatar] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Read learner from localstorage (mock auth)
  let initialProfile = {
    id: '1',
    firstName: 'Nguyễn Văn',
    lastName: 'A',
    email: 'nguyen.van.a@email.com',
    createdAt: '15/01/2024',
    avatarUrl: ''
  };

  try {
    const stored = localStorage.getItem('learner');
    if (stored) {
      const parsed = JSON.parse(stored);
      initialProfile = { ...initialProfile, ...parsed };
    }
  } catch (e) {
    console.error(e);
  }

  const [profile, setProfile] = useState(initialProfile);

  const stats = {
    completedLevels: 1,
    totalLevels: 5,
    completedTopics: 4,
    totalTopics: 20,
    totalScore: 850,
    testsTaken: 12,
    passRate: 85,
  };

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Prepare for backend integration
    localStorage.setItem('learner', JSON.stringify(profile));
    showSuccess('Cập nhật thông tin thành công!');
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Backend API call context: POST /api/v1/learners/me/avatar
      // Since we don't have real auth token in this demo, we mock the success or call if running backend.
      // Uncomment to connect to real backend if token is available
      /*
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/learners/me/avatar', {
         method: 'POST',
         headers: {
            'Authorization': `Bearer ${token}`
         },
         body: formData
      });
      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();
      */

      // Fake network delay
      await new Promise(r => setTimeout(r, 1500));

      // Mock successful avatar URL update via ObjectURL for UI immediately
      const objectUrl = URL.createObjectURL(file);
      const updatedProfile = { ...profile, avatarUrl: objectUrl };
      setProfile(updatedProfile);
      localStorage.setItem('learner', JSON.stringify(updatedProfile));

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
      // Backend API call context: DELETE /api/v1/learners/me/avatar
      /*
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8080/api/v1/learners/me/avatar', {
         method: 'DELETE',
         headers: {
            'Authorization': `Bearer ${token}`
         }
      });
      if (!response.ok) throw new Error('Delete failed');
      */

      await new Promise(r => setTimeout(r, 1000));

      const updatedProfile = { ...profile, avatarUrl: '' };
      setProfile(updatedProfile);
      localStorage.setItem('learner', JSON.stringify(updatedProfile));

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

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Left Column: Profile Card */}
          <div className="md:col-span-4">
            <Card className="border-none shadow-md overflow-hidden animate-in slide-in-from-left-4">
              <div className="h-24 bg-gradient-to-r from-primary to-primary/60" />
              <CardContent className="px-6 pb-6 pt-0 relative">

                {/* Avatar Section */}
                <div className="flex justify-center -mt-12 mb-4 relative z-10 group">
                  <div className="relative">
                    <Avatar className="w-28 h-28 border-4 border-background shadow-sm">
                      <AvatarImage src={profile.avatarUrl} alt={profile.firstName} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                        {profile.firstName?.charAt(0) || 'L'}
                      </AvatarFallback>
                    </Avatar>

                    {/* Hover Overlay for Upload */}
                    <label
                      className={`absolute inset-0 rounded-full cursor-pointer flex flex-col items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity ${isUploading ? 'opacity-100 bg-black/60' : ''}`}
                    >
                      {isUploading ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          <Camera className="w-6 h-6 mb-1" />
                          <span className="text-[10px] font-medium">Đổi ảnh</span>
                        </>
                      )}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleAvatarSelect}
                        disabled={isUploading || isDeletingAvatar}
                        ref={fileInputRef}
                      />
                    </label>
                  </div>
                </div>

                {profile.avatarUrl && (
                  <div className="flex justify-center mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 text-xs font-semibold"
                      onClick={handleDeleteAvatar}
                      disabled={isDeletingAvatar || isUploading}
                    >
                      {isDeletingAvatar ? <Loader2 className="w-3 h-3 mr-1.5 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1.5" />}
                      Xóa ảnh hiện tại
                    </Button>
                  </div>
                )}

                <div className="text-center mb-6">
                  {!isEditing && (
                    <>
                      <h2 className="text-xl font-bold truncate">{profile.lastName} {profile.firstName}</h2>
                      <Badge variant="secondary" className="mt-2 bg-primary/10 text-primary font-medium">
                        Thành viên Học viên
                      </Badge>
                    </>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Họ</label>
                      <Input
                        value={profile.lastName}
                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-muted-foreground uppercase">Tên</label>
                      <Input
                        value={profile.firstName}
                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" className="w-full flex-1" onClick={() => setIsEditing(false)}>
                        <X className="w-4 h-4 mr-2" /> Hủy
                      </Button>
                      <Button className="w-full flex-1" onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" /> Lưu
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="font-medium truncate">{profile.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ngày tham gia</p>
                        <p className="font-medium">{profile.createdAt}</p>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-4 border-dashed font-medium"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" /> Chỉnh sửa hồ sơ
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Stats */}
          <div className="md:col-span-8 space-y-6">

            {/* Top Score Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="bg-primary border-none text-primary-foreground shadow-md animate-in slide-in-from-right-4">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-primary-foreground/10 rounded-2xl">
                    <Trophy className="w-10 h-10" />
                  </div>
                  <div>
                    <div className="text-4xl font-black">{stats.totalScore}</div>
                    <div className="text-primary-foreground/80 font-medium">Tổng điểm tích lũy</div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-500 border-none text-white shadow-md animate-in slide-in-from-right-4 delay-100" style={{ animationFillMode: 'both' }}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <GraduationCap className="w-10 h-10" />
                  </div>
                  <div>
                    <div className="text-4xl font-black">{stats.passRate}%</div>
                    <div className="text-white/80 font-medium">Tỉ lệ thi đạt</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Progress Card */}
            <Card className="border-none shadow-md animate-in slide-in-from-bottom-8 delay-200" style={{ animationFillMode: 'both' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl">Tiến độ học tập</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      <span>Tiến độ cấp độ</span>
                    </div>
                    <span>{stats.completedLevels}/{stats.totalLevels}</span>
                  </div>
                  <Progress value={(stats.completedLevels / stats.totalLevels) * 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-secondary-foreground" />
                      <span>Chủ đề hoàn thành</span>
                    </div>
                    <span>{stats.completedTopics}/{stats.totalTopics}</span>
                  </div>
                  <Progress value={(stats.completedTopics / stats.totalTopics) * 100} className="h-2 bg-secondary/20" indicatorColor="bg-secondary-foreground" />
                </div>

              </CardContent>
            </Card>

            {/* Test Activity Card */}
            <Card className="border-none shadow-md bg-muted/30">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 text-foreground/80">Hoạt động thi sát hạch</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background rounded-xl p-4 border text-center shadow-sm">
                    <div className="text-3xl font-black text-primary mb-1">{stats.testsTaken}</div>
                    <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Bài thi đã làm</div>
                  </div>
                  <div className="bg-background rounded-xl p-4 border text-center shadow-sm">
                    <div className="text-3xl font-black text-green-500 mb-1">{Math.round(stats.testsTaken * stats.passRate / 100)}</div>
                    <div className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">Bài thi đạt</div>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </div>
    </LearnerLayout>
  );
};

export default ProfilePage;
