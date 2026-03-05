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
      'N5': '#D1F4F9', // Pastel Cyan
      'N4': '#C9E4FF', // Pastel Blue
      'N3': '#FBE8C8', // Pastel Yellow
      'N2': '#FBC8C8', // Pastel Red
      'N1': '#C8F3D1', // Pastel Green
    };
    return colors[levelName] || '#E0E0E0';
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
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <School sx={{ fontSize: 72, color: 'primary.main', mb: 2, opacity: 0.8 }} />
          <Typography variant="h3" fontWeight="800" gutterBottom sx={{ color: '#1A0B2E', letterSpacing: '-0.03em' }}>
            Chọn cấp độ học
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
            Hãy chọn trình độ phù hợp để bắt đầu hành trình chinh phục tiếng Nhật của bạn
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {mockLevels.map((level) => {
            const progress = levelProgress[level.id];
            const unlocked = isLevelUnlocked(level.order);
            const levelColor = getLevelColor(level.name);

            return (
              <Grid item xs={12} sm={6} md={4} key={level.id}>
                <Card
                  sx={{
                    height: '100%',
                    position: 'relative',
                    borderRadius: 6,
                    overflow: 'hidden',
                    opacity: unlocked ? 1 : 0.7,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '1px solid rgba(0, 0, 0, 0.03)',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
                    '&:hover': unlocked ? {
                      transform: 'translateY(-12px)',
                      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.08)',
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
                        height: 12,
                        backgroundColor: levelColor,
                      }}
                    />
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                        <Typography
                          variant="h2"
                          fontWeight="800"
                          sx={{
                            color: '#1A0B2E',
                            fontSize: '3rem',
                            position: 'relative',
                            '&::after': {
                              content: '""',
                              position: 'absolute',
                              bottom: 0,
                              left: 0,
                              width: '100%',
                              height: '4px',
                              backgroundColor: levelColor,
                              borderRadius: '2px',
                            }
                          }}
                        >
                          {level.name}
                        </Typography>
                        {progress?.completed ? (
                          <CheckCircle sx={{ color: '#4caf50', fontSize: 40 }} />
                        ) : !unlocked ? (
                          <Lock sx={{ color: 'grey.300', fontSize: 40 }} />
                        ) : null}
                      </Box>

                      <Typography variant="body1" color="text.secondary" sx={{ mb: 4, minHeight: 48, fontWeight: 500, lineHeight: 1.6 }}>
                        {level.description}
                      </Typography>

                      {unlocked && (
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
                                backgroundColor: levelColor,
                                borderRadius: 5,
                              },
                            }}
                          />
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                        <Chip
                          size="medium"
                          label={`${4} chủ đề`}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            backgroundColor: 'rgba(0,0,0,0.03)',
                            border: 'none'
                          }}
                        />
                        <Chip
                          size="medium"
                          label={`${20} từ vựng`}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            backgroundColor: 'rgba(0,0,0,0.03)',
                            border: 'none'
                          }}
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
