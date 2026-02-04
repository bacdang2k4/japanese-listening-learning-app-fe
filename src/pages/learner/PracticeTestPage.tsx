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
        <Box sx={{ mb: 3 }}>
          <Chip label="Chế độ luyện tập" color="info" sx={{ mb: 1 }} />
          <Typography variant="h5" fontWeight="bold">
            {topic?.name} - Luyện nghe
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Câu {currentQuestionIndex + 1} / {questions.length}
          </Typography>
        </Box>

        {/* Progress */}
        <LinearProgress
          variant="determinate"
          value={((currentQuestionIndex + 1) / questions.length) * 100}
          sx={{ height: 8, borderRadius: 4, mb: 3 }}
        />

        {/* Audio Player */}
        <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <VolumeUp sx={{ mr: 1 }} />
              <Typography fontWeight="bold">Phần nghe</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={handlePlayAudio}
                sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>

              <IconButton
                onClick={handleReplayAudio}
                sx={{ color: 'white' }}
              >
                <Replay />
              </IconButton>

              <Box sx={{ flexGrow: 1 }}>
                <Slider
                  value={audioProgress}
                  sx={{
                    color: 'white',
                    '& .MuiSlider-thumb': { bgcolor: 'white' },
                    '& .MuiSlider-track': { bgcolor: 'white' },
                    '& .MuiSlider-rail': { bgcolor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Box>

              <Typography variant="body2">
                {Math.floor(audioProgress * 0.3)}s / 30s
              </Typography>
            </Box>

            <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
              Bạn có thể nghe lại nhiều lần trong chế độ luyện tập
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
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>{option}</Typography>
                        {showStatus && isCorrect && (
                          <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                        )}
                        {showStatus && isSelected && !isCorrect && (
                          <Cancel sx={{ color: 'error.main', fontSize: 20 }} />
                        )}
                      </Box>
                    }
                    sx={{
                      mb: 1,
                      p: 1.5,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: showStatus
                        ? isCorrect
                          ? 'success.main'
                          : isSelected
                          ? 'error.main'
                          : 'grey.300'
                        : 'grey.300',
                      bgcolor: showStatus
                        ? isCorrect
                          ? 'success.light'
                          : isSelected
                          ? 'error.light'
                          : 'transparent'
                        : 'transparent',
                      '&:hover': {
                        bgcolor: showExplanation ? undefined : 'grey.50',
                      },
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<NavigateBefore />}
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Câu trước
          </Button>

          <Button
            variant="contained"
            endIcon={<NavigateNext />}
            onClick={handleNext}
            disabled={currentAnswer?.selectedAnswer === null}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Hoàn thành' : 'Câu tiếp'}
          </Button>
        </Box>

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
