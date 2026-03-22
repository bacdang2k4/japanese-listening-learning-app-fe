import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as TimeIcon,
  Person as PersonIcon,
  MenuBook as BookIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import { adminTestResultApi, AdminTestDetailResponse } from '../services/api';
import { formatBackendDateTime } from '../lib/dateUtils';

const AdminTestDetailPage: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [detail, setDetail] = useState<AdminTestDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetail = useCallback(async () => {
    if (!resultId) return;
    setLoading(true);
    setError('');
    try {
      const res = await adminTestResultApi.getById(Number(resultId));
      setDetail(res.data);
    } catch (err: any) {
      setError(err.message || 'Không thể tải chi tiết bài thi');
    } finally {
      setLoading(false);
    }
  }, [resultId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const handleBack = () => {
    // If we came from a filtered list, preserve the filter (e.g., learnerName)
    const state = location.state as { fromList?: boolean; learnerName?: string } | null;
    if (state?.fromList && state.learnerName) {
      navigate(`/admin/test-results?learnerName=${encodeURIComponent(state.learnerName)}`);
    } else {
      navigate('/admin/test-results');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins} phút ${secs} giây`;
  };

  if (loading) {
    return (
      <MainLayout title="Chi tiết Bài thi">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Chi tiết Bài thi">
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} variant="outlined">
          Quay lại danh sách
        </Button>
      </MainLayout>
    );
  }

  if (!detail) {
    return (
      <MainLayout title="Chi tiết Bài thi">
        <Alert severity="info">Không tìm thấy dữ liệu bài thi.</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} variant="outlined" sx={{ mt: 2 }}>
          Quay lại danh sách
        </Button>
      </MainLayout>
    );
  }

  const totalQuestions = detail.questionResults.length;
  const correctCount = detail.questionResults.filter(q => q.isCorrect).length;

  // Group questions by correctness for visual separation (optional)
  // We'll show all questions sequentially but with color coding

  return (
    <MainLayout title="Chi tiết Bài thi">
      {/* Header / Navigation */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
          size="small"
          sx={{ mb: 2 }}
        >
          Quay lại danh sách kết quả
        </Button>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h4" component="h1" fontWeight={700} color="text.primary">
              {detail.testName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Chip
                icon={<BookIcon />}
                label={detail.levelName || 'Unknown Level'}
                size="small"
                variant="outlined"
              />
              {detail.topicName && (
                <Chip
                  label={detail.topicName}
                  size="small"
                  color="primary"
                  variant="filled"
                />
              )}
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Typography variant="body2" color="text.secondary">
              {formatBackendDateTime(detail.completedAt)}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Learner Info Card */}
      <Card sx={{ mb: 3, borderRadius: 3, boxShadow: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, fontSize: 24 }}>
                {detail.learnerName.charAt(0)}
              </Avatar>
            </Grid>
            <Grid item xs>
              <Typography variant="h6" fontWeight={600}>
                {detail.learnerName}
              </Typography>
              {detail.learnerEmail && (
                <Typography variant="body2" color="text.secondary">
                  {detail.learnerEmail}
                </Typography>
              )}
            </Grid>
            <Grid item sx={{ textAlign: 'right' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Chip
                  icon={detail.isPassed ? <CheckCircleIcon /> : <CancelIcon />}
                  label={detail.isPassed ? 'Đạt' : 'Không đạt'}
                  color={detail.isPassed ? 'success' : 'error'}
                  size="medium"
                  sx={{ fontWeight: 600, px: 1.5 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Mã kết quả: #{detail.resultId}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Score Summary Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2, bgcolor: detail.isPassed ? 'success.light' : 'error.light' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h2" fontWeight={800} color={detail.isPassed ? 'success.main' : 'error.main'}>
                {detail.score}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Điểm số
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {correctCount}/{totalQuestions}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Câu đúng
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(correctCount / totalQuestions) * 100}
                color={correctCount / totalQuestions >= 0.5 ? 'success' : 'error'}
                sx={{ mt: 2, height: 8, borderRadius: 4 }}
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <TimeIcon color="action" />
                <Typography variant="h5" fontWeight={600}>
                  {formatTime(detail.totalTime)}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Thời gian làm bài
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', borderRadius: 3, boxShadow: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h4" fontWeight={700} color="text.primary">
                {totalQuestions}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Tổng số câu
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Question Details */}
      <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 3, borderRadius: '12px 12px 0 0' }}>
            <Typography variant="h6" fontWeight={600}>
              Chi tiết câu trả lời
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Xem lại từng câu trả lời của học viên
            </Typography>
          </Box>

          {detail.questionResults.length === 0 ? (
            <Box sx={{ p: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">Không có dữ liệu câu trả lời.</Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {detail.questionResults.map((qr, index) => {
                const isCorrect = qr.isCorrect;
                const bgColor = isCorrect ? 'success.light' : 'error.light';
                const borderColor = isCorrect ? 'success.main' : 'error.main';
                const icon = isCorrect ? <CheckCircleIcon fontSize="small" /> : <CancelIcon fontSize="small" />;
                const iconColor = isCorrect ? 'success.main' : 'error.main';

                return (
                  <React.Fragment key={qr.questionId}>
                    <ListItem
                      alignItems="flex-start"
                      sx={{
                        py: 3,
                        px: 4,
                        borderBottom: '1px solid',
                        borderBottomColor: 'divider',
                        bgcolor: index % 2 === 0 ? 'background.paper' : 'grey.50',
                        '&:last-child': { borderBottom: 0 },
                      }}
                    >
                      <ListItemIcon sx={{ mt: 0.5 }}>
                        <Avatar
                          sx={{
                            bgcolor: bgColor,
                            color: iconColor,
                            width: 40,
                            height: 40,
                            fontSize: 18,
                          }}
                        >
                          {index + 1}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              Câu {index + 1}
                            </Typography>
                            <Chip
                              icon={icon}
                              label={isCorrect ? 'Đúng' : 'Sai'}
                              size="small"
                              color={isCorrect ? 'success' : 'error'}
                              sx={{ height: 24, '& .MuiChip-icon': { fontSize: 16 } }}
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body1" sx={{ mb: 2, fontWeight: 500 }}>
                              {qr.questionContent}
                            </Typography>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Paper
                                  variant="outlined"
                                  sx={{
                                    p: 2,
                                    bgcolor: 'background.paper',
                                    borderColor: isCorrect ? 'success.main' : 'error.main',
                                  }}
                                >
                                  <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                    Câu trả lời của học viên
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    color={isCorrect ? 'success.main' : 'error.main'}
                                  >
                                    {qr.selectedAnswer || '(Không trả lời)'}
                                  </Typography>
                                </Paper>
                              </Grid>
                              {!isCorrect && (
                                <Grid item xs={12} md={6}>
                                  <Paper
                                    variant="outlined"
                                    sx={{
                                      p: 2,
                                      bgcolor: 'background.paper',
                                      borderColor: 'success.main',
                                    }}
                                  >
                                    <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                      Đáp án đúng
                                    </Typography>
                                    <Typography variant="body2" fontWeight={600} color="success.main">
                                      {qr.correctAnswer}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              )}
                            </Grid>
                          </Box>
                        }
                      />
                      <Tooltip title={isCorrect ? 'Câu trả lời đúng' : 'Câu trả lời sai'}>
                        <Box
                          sx={{
                            ml: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '50%',
                            bgcolor: isCorrect ? 'success.main' : 'error.main',
                            color: 'white',
                          }}
                        >
                          {icon}
                        </Box>
                      </Tooltip>
                    </ListItem>
                    {index < totalQuestions - 1 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Footer navigation */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          variant="outlined"
        >
          Quay lại danh sách
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            startIcon={<BookIcon />}
            onClick={() => navigate(`/learn`)}
          >
            Xem Lộ trình học
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default AdminTestDetailPage;
