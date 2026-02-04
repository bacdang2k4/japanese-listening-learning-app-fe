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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate('/learn')}
          >
            Cấp độ
          </Link>
          <Typography color="text.primary" fontWeight="bold">
            {level?.name}
          </Typography>
        </Breadcrumbs>

        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <MenuBook sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Chọn chủ đề - {level?.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {level?.description}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {topics.map((topic, index) => {
            const progress = topicProgress[topic.id];
            const vocabCount = getVocabCount(topic.id);

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={topic.id}>
                <Card
                  sx={{
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Chip
                          size="small"
                          label={`Chủ đề ${index + 1}`}
                          color="primary"
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="h5" fontWeight="bold">
                          {topic.name}
                        </Typography>
                      </Box>
                      {progress?.completed && (
                        <CheckCircle sx={{ color: 'success.main', fontSize: 28 }} />
                      )}
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                      {topic.description}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Tiến độ học
                      </Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {progress?.progress || 0}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress?.progress || 0}
                      sx={{ height: 6, borderRadius: 3, mb: 2 }}
                    />

                    <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                      <Chip size="small" label={`${vocabCount} từ vựng`} variant="outlined" />
                      <Chip size="small" label="2 bài test" variant="outlined" />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        startIcon={<PlayArrow />}
                        fullWidth
                        onClick={() => navigate(`/learn/topic/${topic.id}`)}
                      >
                        Học từ vựng
                      </Button>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        onClick={() => navigate(`/learn/topic/${topic.id}/practice`)}
                      >
                        Luyện tập
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        color="secondary"
                        onClick={() => navigate(`/learn/topic/${topic.id}/exam`)}
                      >
                        Thi thật
                      </Button>
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
