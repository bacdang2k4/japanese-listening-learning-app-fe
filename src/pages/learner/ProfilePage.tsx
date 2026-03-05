import React, { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Divider,
  Chip,
  LinearProgress,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Person,
  Email,
  CalendarToday,
  EmojiEvents,
  School,
  MenuBook,
  Edit,
  Save,
  Cancel,
  PhotoCamera,
} from '@mui/icons-material';
import LearnerLayout from '../../components/learner/LearnerLayout';

const ProfilePage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: 'Nguyễn Văn A',
    username: 'nguyenvana',
    email: 'nguyen.van.a@email.com',
    createdAt: '15/01/2024',
    avatarUrl: '',
  });

  const stats = {
    completedLevels: 1,
    totalLevels: 5,
    completedTopics: 4,
    totalTopics: 20,
    totalScore: 850,
    testsTaken: 12,
    passRate: 85,
  };

  const handleSave = () => {
    setIsEditing(false);
    // Save to backend logic here
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <LearnerLayout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Typography variant="h3" fontWeight="900" sx={{ color: '#0D1E36', mb: 4, letterSpacing: '-0.02em' }}>
          Hồ sơ cá nhân
        </Typography>

        <Grid container spacing={4}>
          {/* Profile Info Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{
              height: '100%',
              borderRadius: 8,
              boxShadow: '0 20px 60px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.02)'
            }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ position: 'relative', width: 160, height: 160, mx: 'auto', mb: 3 }}>
                  <Avatar
                    src={profile.avatarUrl}
                    sx={{
                      width: '100%',
                      height: '100%',
                      fontSize: 64,
                      fontWeight: 900,
                      bgcolor: '#C9E4FF',
                      color: '#0D1E36',
                      boxShadow: '0 15px 35px rgba(201, 228, 255, 0.4)',
                      border: '4px solid white'
                    }}
                  >
                    {!profile.avatarUrl && profile.fullName.charAt(0)}
                  </Avatar>
                  <IconButton
                    onClick={handleAvatarClick}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      bgcolor: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      '&:hover': { bgcolor: '#F2F9FF' },
                      border: '2px solid white'
                    }}
                  >
                    <PhotoCamera sx={{ color: '#0D1E36' }} />
                  </IconButton>
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Box>

                {isEditing ? (
                  <Box sx={{ textAlign: 'left', mt: 4 }}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      variant="outlined"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                    <TextField
                      fullWidth
                      label="Tên đăng nhập"
                      variant="outlined"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      sx={{ mb: 3, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                    />
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        fullWidth
                        sx={{ borderRadius: 3, py: 1.5, fontWeight: 700, bgcolor: '#C9E4FF', color: '#0D1E36', '&:hover': { bgcolor: '#A3D1FF' } }}
                      >
                        Lưu
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={() => setIsEditing(false)}
                        fullWidth
                        sx={{ borderRadius: 3, py: 1.5, fontWeight: 700 }}
                      >
                        Hủy
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Typography variant="h4" fontWeight="900" sx={{ color: '#0D1E36', mb: 1, letterSpacing: '-0.02em' }}>
                      {profile.fullName}
                    </Typography>
                    <Chip
                      label="HỌC VIÊN CHĂM CHỈ"
                      sx={{
                        mb: 4,
                        fontWeight: 800,
                        bgcolor: '#F2F9FF',
                        color: '#0D1E36',
                        borderRadius: 2,
                        px: 1
                      }}
                    />

                    <Divider sx={{ my: 3, opacity: 0.6 }} />

                    <Box sx={{ textAlign: 'left' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2, mr: 2 }}>
                          <Person sx={{ color: '#44515E' }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#44515E', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.2 }}>
                            Tên đăng nhập
                          </Typography>
                          <Typography fontWeight="700" color="#0D1E36">{profile.username}</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2, mr: 2 }}>
                          <Email sx={{ color: '#44515E' }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#44515E', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.2 }}>
                            Email
                          </Typography>
                          <Typography fontWeight="700" color="#0D1E36">{profile.email}</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                        <Box sx={{ p: 1, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 2, mr: 2 }}>
                          <CalendarToday sx={{ color: '#44515E' }} />
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#44515E', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.65rem', display: 'block', mb: 0.2 }}>
                            Ngày tham gia
                          </Typography>
                          <Typography fontWeight="700" color="#0D1E36">{profile.createdAt}</Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => setIsEditing(true)}
                      fullWidth
                      sx={{ borderRadius: 4, py: 1.5, fontWeight: 700, borderWidth: 2 }}
                    >
                      Chỉnh sửa hồ sơ
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Stats Cards */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card sx={{
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #C9E4FF 0%, #A3D1FF 100%)',
                  color: 'white',
                  boxShadow: '0 20px 40px rgba(163, 209, 255, 0.4)',
                  border: 'none',
                  p: 1
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ bgcolor: 'rgba(255,255,255,0.2)', p: 2, borderRadius: 5, mr: 2.5 }}>
                        <EmojiEvents sx={{ fontSize: 40, display: 'block' }} />
                      </Box>
                      <Box>
                        <Typography variant="h3" fontWeight="900" sx={{ lineHeight: 1 }}>
                          {stats.totalScore}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 800, opacity: 0.9, mt: 0.5 }}>
                          Tổng điểm
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Card sx={{
                  borderRadius: 8,
                  background: 'linear-gradient(135deg, #C8F3D1 0%, #A5E6B5 100%)',
                  color: '#1B4025',
                  boxShadow: '0 20px 40px rgba(165, 230, 181, 0.4)',
                  border: 'none',
                  p: 1
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ bgcolor: 'rgba(0,0,0,0.05)', p: 2, borderRadius: 5, mr: 2.5 }}>
                        <School sx={{ fontSize: 40, display: 'block' }} />
                      </Box>
                      <Box>
                        <Typography variant="h3" fontWeight="900" sx={{ lineHeight: 1 }}>
                          {stats.passRate}%
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 800, opacity: 0.8, mt: 0.5 }}>
                          Tỉ lệ đạt
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Card sx={{ borderRadius: 8, boxShadow: '0 20px 60px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.02)' }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" fontWeight="900" sx={{ color: '#0D1E36', mb: 4 }}>
                      Tiến độ học tập
                    </Typography>

                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <School sx={{ mr: 1.5, color: '#A3D1FF' }} />
                          <Typography sx={{ fontWeight: 700, color: '#44515E' }}>Cấp độ hoàn thành</Typography>
                        </Box>
                        <Typography fontWeight="900" color="#0D1E36">
                          {stats.completedLevels}/{stats.totalLevels}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(stats.completedLevels / stats.totalLevels) * 100}
                        sx={{
                          height: 12,
                          borderRadius: 6,
                          bgcolor: 'rgba(0,0,0,0.03)',
                          '& .MuiLinearProgress-bar': { bgcolor: '#C9E4FF', borderRadius: 6 }
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MenuBook sx={{ mr: 1.5, color: '#FBE8C8' }} />
                          <Typography sx={{ fontWeight: 700, color: '#44515E' }}>Chủ đề hoàn thành</Typography>
                        </Box>
                        <Typography fontWeight="900" color="#0D1E36">
                          {stats.completedTopics}/{stats.totalTopics}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(stats.completedTopics / stats.totalTopics) * 100}
                        sx={{
                          height: 12,
                          borderRadius: 6,
                          bgcolor: 'rgba(0,0,0,0.03)',
                          '& .MuiLinearProgress-bar': { bgcolor: '#FBE8C8', borderRadius: 6 }
                        }}
                      />
                    </Box>

                    <Divider sx={{ my: 4, opacity: 0.6 }} />

                    <Grid container spacing={4}>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#F2F9FF', borderRadius: 6 }}>
                          <Typography variant="h3" fontWeight="900" sx={{ color: '#0D1E36' }}>
                            {stats.testsTaken}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#44515E', fontWeight: 700, mt: 1 }}>
                            Bài test đã làm
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#E8FBF0', borderRadius: 6 }}>
                          <Typography variant="h3" fontWeight="900" sx={{ color: '#1B4025' }}>
                            {Math.round(stats.testsTaken * stats.passRate / 100)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#1B4025', fontWeight: 700, mt: 1 }}>
                            Bài test đạt
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </LearnerLayout>
  );
};

export default ProfilePage;
