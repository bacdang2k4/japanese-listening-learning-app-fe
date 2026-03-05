import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  LinearProgress,
  Chip,
  Grid,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  VolumeUp,
  NavigateNext,
  NavigateBefore,
  CheckCircle,
  Shuffle,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import LearnerLayout from '../../components/learner/LearnerLayout';
import { mockVocabularies, mockTopics } from '../../data/mockData';

const VocabularyLearningPage: React.FC = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);

  const topic = mockTopics.find(t => t.id === topicId);
  const vocabularies = mockVocabularies.filter(v => v.topicId === topicId);
  const currentVocab = vocabularies[currentIndex];

  const handleNext = () => {
    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowMeaning(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowMeaning(false);
    }
  };

  const handleMarkLearned = () => {
    if (!learnedWords.includes(currentVocab.id)) {
      setLearnedWords([...learnedWords, currentVocab.id]);
    }
  };

  const speakWord = (text: string | undefined) => {
    if (!text) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    window.speechSynthesis.speak(utterance);
  };

  const handleShuffle = () => {
    // Basic shuffle implementation
    setCurrentIndex(0);
    setShowMeaning(false);
  };

  const progress = ((currentIndex + 1) / vocabularies.length) * 100;

  return (
    <LearnerLayout>
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Breadcrumbs
          separator={<NavigateNext fontSize="small" sx={{ color: 'rgba(0,0,0,0.2)' }} />}
          sx={{ mb: 4 }}
        >
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate('/learn')}
          >
            Cấp độ
          </Link>
          <Link
            component="button"
            underline="hover"
            color="inherit"
            onClick={() => navigate(`/learn/level/${topic?.levelId}/topics`)}
          >
            Chủ đề
          </Link>
          <Typography sx={{ color: '#0D1E36', fontWeight: 700 }}>
            {topic?.name}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography variant="h3" fontWeight="900" sx={{ color: '#0D1E36', mb: 1.5, letterSpacing: '-0.02em' }}>
            {topic?.name}: Từ vựng
          </Typography>
          <Typography variant="h6" color="#44515E" sx={{ fontWeight: 600, mb: 3 }}>
            Học từ vựng qua âm thanh và hình ảnh
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
            <Chip
              label={`${vocabularies.length} từ vựng`}
              sx={{ borderRadius: 2, fontWeight: 700, backgroundColor: 'rgba(0,0,0,0.03)' }}
            />
            <Chip
              label={`Tiến trình: ${learnedWords.length}/${vocabularies.length}`}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                backgroundColor: '#C8F3D1',
                color: '#1B4025'
              }}
            />
          </Box>
        </Box>

        {/* Learning Area */}
        <Box sx={{ mb: 6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 700, color: '#44515E' }}>
              Từ {currentIndex + 1} / {vocabularies.length}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 12,
              borderRadius: 6,
              backgroundColor: 'rgba(0,0,0,0.03)',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#C9E4FF',
                borderRadius: 6
              }
            }}
          />
        </Box>

        {/* Vocabulary Card */}
        <Card sx={{
          mb: 5,
          minHeight: 480,
          borderRadius: 10,
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            {/* Word Section */}
            <Box sx={{ mb: 6 }}>
              <Typography
                variant="h1"
                fontWeight="900"
                sx={{
                  fontSize: { xs: '4rem', md: '7rem' },
                  mb: 2,
                  color: '#0D1E36',
                  letterSpacing: '-0.03em'
                }}
              >
                {currentVocab?.word}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                <Typography variant="h4" sx={{ fontWeight: 600, color: '#44515E' }}>
                  {currentVocab?.reading}
                </Typography>
                <IconButton
                  onClick={() => speakWord(currentVocab?.word)}
                  sx={{
                    backgroundColor: '#C9E4FF',
                    color: '#0D1E36',
                    p: 2,
                    '&:hover': { backgroundColor: '#A3D1FF' }
                  }}
                >
                  <VolumeUp sx={{ fontSize: 32 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Meaning Toggle */}
            {!showMeaning ? (
              <Button
                variant="contained"
                size="large"
                onClick={() => setShowMeaning(true)}
                sx={{
                  px: 6,
                  py: 2,
                  borderRadius: 4,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  backgroundColor: '#C9E4FF',
                  color: '#0D1E36',
                  '&:hover': { backgroundColor: '#A3D1FF' }
                }}
              >
                Hiện nghĩa
              </Button>
            ) : (
              <Box
                sx={{
                  p: 4,
                  backgroundColor: '#F2F9FF',
                  borderRadius: 6,
                  border: '1px solid rgba(201, 228, 255, 0.3)',
                }}
              >
                <Typography variant="h3" fontWeight="800" color="#0D1E36" gutterBottom>
                  {currentVocab?.meaning}
                </Typography>

                <Box sx={{ mt: 4, textAlign: 'left', borderTop: '1px solid rgba(0,0,0,0.05)', pt: 4 }}>
                  <Typography variant="overline" sx={{ fontWeight: 800, color: '#44515E', mb: 2, display: 'block' }}>
                    Ví dụ áp dụng:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#0D1E36' }}>
                      {currentVocab?.example}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => speakWord(currentVocab?.example)}
                      sx={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
                    >
                      <VolumeUp fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 500, color: '#44515E' }}>
                    {currentVocab?.exampleMeaning}
                  </Typography>
                </Box>

                <Button
                  variant="text"
                  onClick={() => setShowMeaning(false)}
                  sx={{ mt: 3, fontWeight: 700, color: '#44515E' }}
                >
                  Ẩn nghĩa
                </Button>
              </Box>
            )}

            {learnedWords.includes(currentVocab?.id) && (
              <Box sx={{ mt: 4 }}>
                <Chip
                  icon={<CheckCircle />}
                  label="Đã hoàn thành"
                  sx={{
                    backgroundColor: '#C8F3D1',
                    color: '#1B4025',
                    fontWeight: 700
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Navigation Controls */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid size={{ xs: 4 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<NavigateBefore />}
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              sx={{ py: 2, borderRadius: 4, fontWeight: 800, borderWidth: 2 }}
            >
              Câu trước
            </Button>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => setShowMeaning(!showMeaning)}
              sx={{
                py: 2,
                borderRadius: 4,
                fontWeight: 800,
                backgroundColor: '#C9E4FF',
                color: '#0D1E36',
                boxShadow: '0 10px 25px rgba(201, 228, 255, 0.4)'
              }}
            >
              {showMeaning ? 'Ẩn nghĩa' : 'Hiện nghĩa'}
            </Button>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Button
              variant="contained"
              fullWidth
              endIcon={<NavigateNext />}
              onClick={handleNext}
              disabled={currentIndex === vocabularies.length - 1}
              sx={{
                py: 2,
                borderRadius: 4,
                fontWeight: 800,
                backgroundColor: '#A3D1FF',
                color: 'white',
                boxShadow: '0 10px 25px rgba(163, 209, 255, 0.4)'
              }}
            >
              Câu tiếp
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="text"
            startIcon={<Shuffle />}
            onClick={handleShuffle}
            sx={{ fontWeight: 700, color: '#44515E' }}
          >
            Xáo trộn danh sách
          </Button>
        </Box>

        {/* Action Bar */}
        <Box sx={{
          mt: 8,
          p: 2,
          backgroundColor: 'rgba(201, 228, 255, 0.1)',
          borderRadius: 6,
          display: 'flex',
          gap: 3,
          justifyContent: 'center'
        }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/learn/topic/${topicId}/practice`)}
            sx={{ borderRadius: 3, fontWeight: 700, py: 1.5, px: 4 }}
          >
            Luyện tập nghe
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate(`/learn/topic/${topicId}/exam`)}
            sx={{
              borderRadius: 3,
              fontWeight: 700,
              py: 1.5,
              px: 4,
              backgroundColor: '#FBC8C8',
              color: '#421414',
              '&:hover': { backgroundColor: '#F9B1B1' }
            }}
          >
            Làm bài thi thử
          </Button>
        </Box>
      </Container>
    </LearnerLayout>
  );
};

export default VocabularyLearningPage;
