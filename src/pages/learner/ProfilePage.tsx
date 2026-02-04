import React, { useState } from 'react';
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
} from '@mui/icons-material';
import LearnerLayout from '../../components/learner/LearnerLayout';

const ProfilePage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    fullName: 'Nguyễn Văn A',
    username: 'nguyenvana',
    email: 'nguyen.van.a@email.com',
    createdAt: '15/01/2024',
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
    // Save to backend
  };

  return (
    <LearnerLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Hồ sơ cá nhân
        </Typography>

        <Grid container spacing={3}>
          {/* Profile Info Card */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 2,
                    fontSize: 48,
                    bgcolor: 'primary.main',
                  }}
                >
                  {profile.fullName.charAt(0)}
                </Avatar>

                {isEditing ? (
                  <Box sx={{ textAlign: 'left' }}>
                    <TextField
                      fullWidth
                      label="Họ và tên"
                      value={profile.fullName}
                      onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      label="Tên đăng nhập"
                      value={profile.username}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleSave}
                        fullWidth
                      >
                        Lưu
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={() => setIsEditing(false)}
                        fullWidth
                      >
                        Hủy
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                      {profile.fullName}
                    </Typography>
                    <Chip label="Đang học" color="primary" sx={{ mb: 2 }} />

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ textAlign: 'left' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Person sx={{ mr: 2, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Tên đăng nhập
                          </Typography>
                          <Typography>{profile.username}</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Email sx={{ mr: 2, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Email
                          </Typography>
                          <Typography>{profile.email}</Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CalendarToday sx={{ mr: 2, color: 'text.secondary' }} />
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Ngày tham gia
                          </Typography>
                          <Typography>{profile.createdAt}</Typography>
                        </Box>
                      </Box>
                    </Box>

                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => setIsEditing(true)}
                      sx={{ mt: 3 }}
                      fullWidth
                    >
                      Chỉnh sửa
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Stats Cards */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Card sx={{ bgcolor: 'primary.main', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <EmojiEvents sx={{ fontSize: 40, mr: 2 }} />
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {stats.totalScore}
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Tổng điểm
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <Card sx={{ bgcolor: 'success.main', color: 'white' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <School sx={{ fontSize: 40, mr: 2 }} />
                      <Box>
                        <Typography variant="h4" fontWeight="bold">
                          {stats.passRate}%
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: 0.9 }}>
                          Tỉ lệ đạt
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Tiến độ học tập
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <School sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography>Cấp độ hoàn thành</Typography>
                        </Box>
                        <Typography fontWeight="bold">
                          {stats.completedLevels}/{stats.totalLevels}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(stats.completedLevels / stats.totalLevels) * 100}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <MenuBook sx={{ mr: 1, color: 'secondary.main' }} />
                          <Typography>Chủ đề hoàn thành</Typography>
                        </Box>
                        <Typography fontWeight="bold">
                          {stats.completedTopics}/{stats.totalTopics}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={(stats.completedTopics / stats.totalTopics) * 100}
                        color="secondary"
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold" color="primary">
                            {stats.testsTaken}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Bài test đã làm
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Box sx={{ textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight="bold" color="success.main">
                            {Math.round(stats.testsTaken * stats.passRate / 100)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
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
