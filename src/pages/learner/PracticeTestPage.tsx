import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  Slider,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  Replay,
  NavigateNext,
  NavigateBefore,
  CheckCircle,
  Cancel,
  VolumeUp,
  Timer,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import LearnerLayout from '../../components/learner/LearnerLayout';
import { mockQuestions, mockAudioTests, mockTopics } from '../../data/mockData';

interface Answer {
  questionId: string;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
}

const PracticeTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const audioRef = useRef<HTMLAudioElement>(null);

  const topic = mockTopics.find(t => t.id === topicId);
  const test = mockAudioTests[0]; // Get first test for demo
  const questions = mockQuestions.filter(q => q.testId === test?.id);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(
    questions.map(q => ({ questionId: q.id, selectedAnswer: null, isCorrect: null }))
  );
  const [showResult, setShowResult] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  useEffect(() => {
    // Simulate audio progress
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleAnswerSelect = (answerIndex: number) => {
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      isCorrect,
    };
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(false);
      setAudioProgress(0);
      setIsPlaying(false);
    } else {
      setResultDialogOpen(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowExplanation(answers[currentQuestionIndex - 1].selectedAnswer !== null);
    }
  };

  const handlePlayAudio = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReplayAudio = () => {
    setAudioProgress(0);
    setIsPlaying(true);
  };

  const calculateScore = () => {
    const correctCount = answers.filter(a => a.isCorrect === true).length;
    return Math.round((correctCount / questions.length) * 100);
  };

  const getCorrectCount = () => {
    return answers.filter(a => a.isCorrect === true).length;
  };

  return (
    <LearnerLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 5 }}>
          <Chip
            label="Chế độ luyện tập"
            sx={{
              mb: 2,
              fontWeight: 800,
              backgroundColor: '#C9E4FF',
              color: '#0D1E36',
              borderRadius: 2
            }}
          />
          <Typography variant="h4" fontWeight="900" sx={{ color: '#0D1E36', letterSpacing: '-0.02em' }}>
            {topic?.name}: Luyện nghe
          </Typography>
          <Typography variant="body1" sx={{ color: '#44515E', fontWeight: 600, mt: 0.5 }}>
            Câu hỏi hiện tại: {currentQuestionIndex + 1} / {questions.length}
          </Typography>
        </Box>

        {/* Progress */}
        <LinearProgress
          variant="determinate"
          value={((currentQuestionIndex + 1) / questions.length) * 100}
          sx={{ height: 8, borderRadius: 4, mb: 3 }}
        />

        {/* Audio Player */}
        <Card sx={{
          mb: 5,
          borderRadius: 6,
          background: 'linear-gradient(135deg, #C9E4FF 0%, #A3D1FF 100%)',
          color: 'white',
          boxShadow: '0 15px 40px rgba(163, 209, 255, 0.3)',
          border: 'none',
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <VolumeUp sx={{ mr: 1.5, fontSize: 28 }} />
              <Typography variant="h6" fontWeight="800">BẢN TIN AUDIO</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <IconButton
                onClick={handlePlayAudio}
                sx={{
                  bgcolor: 'white',
                  color: '#0D1E36',
                  width: 56,
                  height: 56,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                }}
              >
                {isPlaying ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
              </IconButton>

              <IconButton
                onClick={handleReplayAudio}
                sx={{ color: 'white', border: '2px solid rgba(255,255,255,0.3)' }}
              >
                <Replay />
              </IconButton>

              <Box sx={{ flexGrow: 1 }}>
                <Slider
                  value={audioProgress}
                  sx={{
                    color: 'white',
                    height: 8,
                    '& .MuiSlider-thumb': {
                      bgcolor: 'white',
                      boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                    },
                    '& .MuiSlider-track': { border: 'none' },
                    '& .MuiSlider-rail': { bgcolor: 'rgba(255,255,255,0.3)', opacity: 1 },
                  }}
                />
              </Box>

              <Typography variant="body2" sx={{ fontWeight: 800, minWidth: 60, textAlign: 'right' }}>
                {Math.floor(audioProgress * 0.3)}s / 30s
              </Typography>
            </Box>

            <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mt: 2, fontWeight: 600 }}>
              * Chế độ luyện tập: Nghe không giới hạn số lần
            </Typography>
          </CardContent>
        </Card>

        {/* Question */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Câu hỏi {currentQuestionIndex + 1}:
            </Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              {currentQuestion?.content}
            </Typography>

            <RadioGroup
              value={currentAnswer?.selectedAnswer ?? ''}
              onChange={(e) => handleAnswerSelect(Number(e.target.value))}
            >
              {currentQuestion?.options.map((option, index) => {
                const isSelected = currentAnswer?.selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctAnswer;
                const showStatus = showExplanation && (isSelected || isCorrect);

                return (
                  <FormControlLabel
                    key={index}
                    value={index}
                    disabled={showExplanation}
                    control={<Radio sx={{ color: '#D9C8FB', '&.Mui-checked': { color: '#2D1A4D' } }} />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 600, color: '#1A0B2E' }}>
                          {option}
                        </Typography>
                        {showStatus && isCorrect && (
                          <CheckCircle sx={{ color: '#4caf50', fontSize: 24 }} />
                        )}
                        {showStatus && isSelected && !isCorrect && (
                          <Cancel sx={{ color: '#FBC8C8', fontSize: 24 }} />
                        )}
                      </Box>
                    }
                    sx={{
                      mb: 2,
                      p: 2,
                      width: '100%',
                      mx: 0,
                      borderRadius: 4,
                      border: '2px solid',
                      transition: 'all 0.2s ease',
                      borderColor: showStatus
                        ? isCorrect
                          ? '#C8F3D1'
                          : isSelected
                            ? '#FBC8C8'
                            : 'rgba(0,0,0,0.05)'
                        : isSelected
                          ? '#D9C8FB'
                          : 'rgba(0,0,0,0.05)',
                      bgcolor: showStatus
                        ? isCorrect
                          ? '#E8FBF0'
                          : isSelected
                            ? '#FFF1F1'
                            : 'transparent'
                        : isSelected
                          ? '#F7F5FC'
                          : 'transparent',
                    }}
                  />
                );
              })}
            </RadioGroup>

            {/* Explanation */}
            {showExplanation && (
              <Box
                sx={{
                  mt: 3,
                  p: 2,
                  bgcolor: 'info.light',
                  borderRadius: 2,
                  borderLeft: '4px solid',
                  borderColor: 'info.main',
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Giải thích:
                </Typography>
                <Typography variant="body2">
                  {currentQuestion?.explanation}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <Grid container spacing={2} sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Grid size={{ xs: 6 }}>
            <Button
              variant="outlined"
              startIcon={<NavigateBefore />}
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              fullWidth
              sx={{ py: 1.5, borderRadius: 4, fontWeight: 700, borderWidth: 2 }}
            >
              Câu trước
            </Button>
          </Grid>

          <Grid size={{ xs: 6 }}>
            <Button
              variant="contained"
              endIcon={<NavigateNext />}
              onClick={handleNext}
              disabled={currentAnswer?.selectedAnswer === null}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: 4,
                fontWeight: 700,
                boxShadow: '0 8px 20px rgba(201, 228, 255, 0.4)'
              }}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Hoàn thành' : 'Câu tiếp'}
            </Button>
          </Grid>
        </Grid>

        {/* Result Dialog */}
        <Dialog open={resultDialogOpen} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography variant="h5" fontWeight="bold" textAlign="center">
              Kết quả luyện tập
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography
                variant="h1"
                fontWeight="bold"
                color={calculateScore() >= 60 ? 'success.main' : 'error.main'}
              >
                {calculateScore()}%
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {getCorrectCount()}/{questions.length} câu đúng
              </Typography>

              <Chip
                label={calculateScore() >= 60 ? 'Đạt yêu cầu' : 'Chưa đạt'}
                color={calculateScore() >= 60 ? 'success' : 'error'}
                sx={{ mt: 2 }}
              />

              <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                Đây là chế độ luyện tập, kết quả sẽ không được lưu vào hồ sơ.
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                setCurrentQuestionIndex(0);
                setAnswers(questions.map(q => ({ questionId: q.id, selectedAnswer: null, isCorrect: null })));
                setShowExplanation(false);
                setResultDialogOpen(false);
              }}
            >
              Làm lại
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LearnerLayout>
  );
};

export default PracticeTestPage;
