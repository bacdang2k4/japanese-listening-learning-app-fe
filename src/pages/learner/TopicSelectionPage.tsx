import React from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  LinearProgress,
  Button,
  Breadcrumbs,
  Link,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { MenuBook, CheckCircle, PlayArrow, NavigateNext } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import LearnerLayout from '../../components/learner/LearnerLayout';
import { mockTopics, mockLevels, mockVocabularies } from '../../data/mockData';

const TopicSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { levelId } = useParams<{ levelId: string }>();

  const level = mockLevels.find(l => l.id === levelId);
  const topics = mockTopics.filter(t => t.levelId === levelId);

  // Mock progress data
  const topicProgress: Record<string, { completed: boolean; progress: number }> = {
    '1': { completed: true, progress: 100 },
    '2': { completed: true, progress: 100 },
    '3': { completed: false, progress: 45 },
    '4': { completed: false, progress: 0 },
  };

  const getVocabCount = (topicId: string) => {
    return mockVocabularies.filter(v => v.topicId === topicId).length;
  };

  return (
    <LearnerLayout>
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" sx={{ color: 'rgba(0,0,0,0.2)' }} />}
          sx={{
            mb: 4,
            '& .MuiBreadcrumbs-li': {
              fontSize: '0.9rem',
              fontWeight: 600,
            }
          }}
        >
          <Link
            component="button"
            underline="hover"
            color="#4D4459"
            onClick={() => navigate('/learn')}
          >
            Cấp độ
          </Link>
          <Typography sx={{ color: '#1A0B2E', fontWeight: 700 }}>
            {level?.name}
          </Typography>
        </Breadcrumbs>

        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <MenuBook sx={{ fontSize: 72, color: '#D9C8FB', mb: 2, opacity: 0.8 }} />
          <Typography variant="h3" fontWeight="900" sx={{ color: '#0D1E36', mb: 1.5, letterSpacing: '-0.02em' }}>
            {level?.name}: Chủ đề học tập
          </Typography>
          <Typography variant="h6" color="#44515E" sx={{ fontWeight: 600 }}>
            Hôm nay bạn muốn luyện nghe về chủ đề gì nào?
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {topics.map((topic, index) => {
            const progress = topicProgress[topic.id];
            const vocabCount = getVocabCount(topic.id);

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={topic.id}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 6,
                    border: '1px solid rgba(0, 0, 0, 0.03)',
                    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.03)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.06)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                      <Box>
                        <Chip
                          size="small"
                          label={`Chủ đề ${index + 1}`}
                          sx={{
                            mb: 1.5,
                            fontWeight: 700,
                            backgroundColor: '#D9C8FB',
                            color: '#2D1A4D',
                            borderRadius: 2
                          }}
                        />
                        <Typography variant="h4" fontWeight="800" sx={{ color: '#1A0B2E' }}>
                          {topic.name}
                        </Typography>
                      </Box>
                      {progress?.completed && (
                        <CheckCircle sx={{ color: '#4caf50', fontSize: 32 }} />
                      )}
                    </Box>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 4, minHeight: 48, fontWeight: 500, lineHeight: 1.6 }}>
                      {topic.description}
                    </Typography>

                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#4D4459' }}>
                          Tiến độ hoàn thành
                        </Typography>
                        <Typography variant="body2" fontWeight="800" color="primary">
                          {progress?.progress || 0}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={progress?.progress || 0}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          backgroundColor: 'rgba(0,0,0,0.03)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: '#D9C8FB',
                            borderRadius: 5
                          }
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1.5, mb: 4, flexWrap: 'wrap' }}>
                      <Chip size="medium" label={`${vocabCount} từ vựng`} sx={{ fontWeight: 600, borderRadius: 2 }} variant="outlined" />
                      <Chip size="medium" label="2 bài test" sx={{ fontWeight: 600, borderRadius: 2 }} variant="outlined" />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<PlayArrow />}
                        fullWidth
                        onClick={() => navigate(`/learn/topic/${topic.id}`)}
                        sx={{
                          py: 1.5,
                          borderRadius: 4,
                          fontWeight: 700,
                          boxShadow: '0 8px 20px rgba(217, 200, 251, 0.4)'
                        }}
                      >
                        Bắt đầu học
                      </Button>

                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="outlined"
                          size="medium"
                          fullWidth
                          onClick={() => navigate(`/learn/topic/${topic.id}/practice`)}
                          sx={{ borderRadius: 3, fontWeight: 600, py: 1 }}
                        >
                          Luyện tập
                        </Button>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/learn/topic/${topic.id}/vocab`);
                          }}
                          sx={{
                            borderRadius: 3,
                            fontWeight: 800,
                            backgroundColor: '#C9E4FF',
                            color: '#0D1E36',
                            '&:hover': { backgroundColor: '#A3D1FF' }
                          }}
                        >
                          HỌC TỪ VỰNG
                        </Button>
                        <Button
                          variant="outlined"
                          size="medium"
                          fullWidth
                          onClick={() => navigate(`/learn/topic/${topic.id}/exam`)}
                          sx={{
                            borderRadius: 3,
                            fontWeight: 600,
                            py: 1,
                            borderColor: '#FBC8C8',
                            color: '#D32F2F',
                            '&:hover': {
                              borderColor: '#FBC8C8',
                              backgroundColor: 'rgba(251, 200, 200, 0.1)'
                            }
                          }}
                        >
                          Thi thật
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </LearnerLayout>
  );
};

export default TopicSelectionPage;
