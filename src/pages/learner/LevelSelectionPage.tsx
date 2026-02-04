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
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { School, CheckCircle, Lock } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LearnerLayout from '../../components/learner/LearnerLayout';
import { mockLevels } from '../../data/mockData';

const LevelSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  // Mock progress data
  const levelProgress: Record<string, { completed: boolean; progress: number }> = {
    '1': { completed: true, progress: 100 },
    '2': { completed: false, progress: 60 },
    '3': { completed: false, progress: 0 },
    '4': { completed: false, progress: 0 },
    '5': { completed: false, progress: 0 },
  };

  const getLevelColor = (levelName: string) => {
    const colors: Record<string, string> = {
      'N5': '#4caf50',
      'N4': '#2196f3',
      'N3': '#ff9800',
      'N2': '#9c27b0',
      'N1': '#f44336',
    };
    return colors[levelName] || '#757575';
  };

  const isLevelUnlocked = (order: number) => {
    if (order === 1) return true;
    const prevLevel = mockLevels.find(l => l.order === order - 1);
    if (prevLevel) {
      return levelProgress[prevLevel.id]?.completed;
    }
    return false;
  };

  return (
    <LearnerLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 5 }}>
          <School sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Chọn cấp độ học
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Hãy chọn cấp độ phù hợp với trình độ của bạn
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {mockLevels.map((level) => {
            const progress = levelProgress[level.id];
            const unlocked = isLevelUnlocked(level.order);

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={level.id}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    opacity: unlocked ? 1 : 0.6,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': unlocked ? {
                      transform: 'translateY(-8px)',
                      boxShadow: 6,
                    } : {},
                  }}
                >
                  <CardActionArea
                    onClick={() => unlocked && navigate(`/learn/level/${level.id}/topics`)}
                    disabled={!unlocked}
                    sx={{ height: '100%' }}
                  >
                    <Box
                      sx={{
                        height: 8,
                        backgroundColor: getLevelColor(level.name),
                      }}
                    />
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography
                          variant="h3"
                          fontWeight="bold"
                          sx={{ color: getLevelColor(level.name) }}
                        >
                          {level.name}
                        </Typography>
                        {progress?.completed ? (
                          <CheckCircle sx={{ color: 'success.main', fontSize: 32 }} />
                        ) : !unlocked ? (
                          <Lock sx={{ color: 'grey.500', fontSize: 32 }} />
                        ) : null}
                      </Box>

                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                        {level.description}
                      </Typography>

                      {unlocked && (
                        <>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              Tiến độ
                            </Typography>
                            <Typography variant="caption" fontWeight="bold">
                              {progress?.progress || 0}%
                            </Typography>
                          </Box>
                          <LinearProgress
                            variant="determinate"
                            value={progress?.progress || 0}
                            sx={{
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: 'grey.200',
                              '& .MuiLinearProgress-bar': {
                                backgroundColor: getLevelColor(level.name),
                                borderRadius: 4,
                              },
                            }}
                          />
                        </>
                      )}

                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Chip
                          size="small"
                          label={`${4} chủ đề`}
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={`${20} từ vựng`}
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>
    </LearnerLayout>
  );
};

export default LevelSelectionPage;
