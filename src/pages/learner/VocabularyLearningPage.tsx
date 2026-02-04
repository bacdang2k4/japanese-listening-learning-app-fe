import React, { useState } from 'react';
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
  Breadcrumbs,
  Link,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  NavigateNext,
  NavigateBefore,
  VolumeUp,
  Visibility,
  VisibilityOff,
  CheckCircle,
  Shuffle,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import LearnerLayout from '../../components/learner/LearnerLayout';
import { mockVocabularies, mockTopics, mockLevels } from '../../data/mockData';

const VocabularyLearningPage: React.FC = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();

  const topic = mockTopics.find(t => t.id === topicId);
  const level = mockLevels.find(l => l.id === topic?.levelId);
  const vocabularies = mockVocabularies.filter(v => v.topicId === topicId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [learnedWords, setLearnedWords] = useState<string[]>([]);

  const currentVocab = vocabularies[currentIndex];
  const progress = ((currentIndex + 1) / vocabularies.length) * 100;

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
    handleNext();
  };

  const handleShuffle = () => {
    const randomIndex = Math.floor(Math.random() * vocabularies.length);
    setCurrentIndex(randomIndex);
    setShowMeaning(false);
  };

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <LearnerLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }}>
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
            onClick={() => navigate(`/learn/level/${level?.id}/topics`)}
          >
            {level?.name}
          </Link>
          <Typography color="text.primary">{topic?.name}</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {topic?.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Chip label={`${vocabularies.length} từ vựng`} />
            <Chip
              label={`Đã học: ${learnedWords.length}/${vocabularies.length}`}
              color="success"
              variant="outlined"
            />
          </Box>
        </Box>

        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              Từ {currentIndex + 1} / {vocabularies.length}
            </Typography>
            <Typography variant="body2">
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Vocabulary Card */}
        <Card sx={{ mb: 3, minHeight: 400 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            {/* Word */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h1"
                fontWeight="bold"
                sx={{ fontSize: { xs: '3rem', md: '5rem' }, mb: 1 }}
              >
                {currentVocab?.word}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                <Typography variant="h5" color="text.secondary">
                  {currentVocab?.reading}
                </Typography>
                <IconButton
                  onClick={() => speakWord(currentVocab?.word)}
                  color="primary"
                >
                  <VolumeUp />
                </IconButton>
              </Box>
            </Box>

            {/* Meaning Toggle */}
            <Button
              variant="outlined"
              size="large"
              startIcon={showMeaning ? <VisibilityOff /> : <Visibility />}
              onClick={() => setShowMeaning(!showMeaning)}
              sx={{ mb: 3 }}
            >
              {showMeaning ? 'Ẩn nghĩa' : 'Hiện nghĩa'}
            </Button>

            {/* Meaning & Example */}
            {showMeaning && (
              <Box
                sx={{
                  p: 3,
                  bgcolor: 'grey.100',
                  borderRadius: 2,
                  animation: 'fadeIn 0.3s ease',
                  '@keyframes fadeIn': {
                    from: { opacity: 0, transform: 'translateY(-10px)' },
                    to: { opacity: 1, transform: 'translateY(0)' },
                  },
                }}
              >
                <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                  {currentVocab?.meaning}
                </Typography>

                <Box sx={{ mt: 3, textAlign: 'left' }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Ví dụ:
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6">
                      {currentVocab?.example}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => speakWord(currentVocab?.example)}
                    >
                      <VolumeUp fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="body1" color="text.secondary">
                    {currentVocab?.exampleMeaning}
                  </Typography>
                </Box>
              </Box>
            )}

            {learnedWords.includes(currentVocab?.id) && (
              <Chip
                icon={<CheckCircle />}
                label="Đã học"
                color="success"
                sx={{ mt: 2 }}
              />
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Grid container spacing={2}>
          <Grid size={{ xs: 4 }}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<NavigateBefore />}
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              Trước
            </Button>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Button
              variant="contained"
              fullWidth
              color="success"
              startIcon={<CheckCircle />}
              onClick={handleMarkLearned}
            >
              Đã thuộc
            </Button>
          </Grid>
          <Grid size={{ xs: 4 }}>
            <Button
              variant="outlined"
              fullWidth
              endIcon={<NavigateNext />}
              onClick={handleNext}
              disabled={currentIndex === vocabularies.length - 1}
            >
              Tiếp
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="text"
            startIcon={<Shuffle />}
            onClick={handleShuffle}
          >
            Xáo trộn
          </Button>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => navigate(`/learn/topic/${topicId}/practice`)}
          >
            Luyện tập nghe
          </Button>
          <Button
            variant="contained"
            onClick={() => navigate(`/learn/topic/${topicId}/exam`)}
          >
            Thi thật
          </Button>
        </Box>
      </Container>
    </LearnerLayout>
  );
};

export default VocabularyLearningPage;
