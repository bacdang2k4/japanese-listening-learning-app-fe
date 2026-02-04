import React, { useState, useEffect } from 'react';
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
  IconButton,
  Slider,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  PlayArrow,
  Pause,
  NavigateNext,
  NavigateBefore,
  CheckCircle,
  Cancel,
  VolumeUp,
  Timer,
  Warning,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import LearnerLayout from '../../components/learner/LearnerLayout';
import { mockQuestions, mockAudioTests, mockTopics } from '../../data/mockData';

interface Answer {
  questionId: string;
  selectedAnswer: number | null;
}

const ExamTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();

  const topic = mockTopics.find(t => t.id === topicId);
  const test = mockAudioTests[0];
  const questions = mockQuestions.filter(q => q.testId === test?.id);
  const passCondition = test?.passCondition || 60;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(
    questions.map(q => ({ questionId: q.id, selectedAnswer: null }))
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioPlayed, setAudioPlayed] = useState<boolean[]>(questions.map(() => false));
  const [timeRemaining, setTimeRemaining] = useState(30 * 60); // 30 minutes
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [examStarted, setExamStarted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  // Timer
  useEffect(() => {
    if (!examStarted) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setResultDialogOpen(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStarted]);

  // Audio simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            const newAudioPlayed = [...audioPlayed];
            newAudioPlayed[currentQuestionIndex] = true;
            setAudioPlayed(newAudioPlayed);
            return 100;
          }
          return prev + 2;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentQuestionIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
    };
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setAudioProgress(0);
      setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setAudioProgress(0);
      setIsPlaying(false);
    }
  };

  const handlePlayAudio = () => {
    if (audioPlayed[currentQuestionIndex]) return; // Can only play once in exam mode
    setIsPlaying(!isPlaying);
  };

  const handleSubmit = () => {
    setConfirmSubmitOpen(false);
    setResultDialogOpen(true);
  };

  const calculateScore = () => {
    const correctCount = answers.filter((answer, index) => {
      return answer.selectedAnswer === questions[index]?.correctAnswer;
    }).length;
    return Math.round((correctCount / questions.length) * 100);
  };

  const getCorrectCount = () => {
    return answers.filter((answer, index) => {
      return answer.selectedAnswer === questions[index]?.correctAnswer;
    }).length;
  };

  const getUnansweredCount = () => {
    return answers.filter(a => a.selectedAnswer === null).length;
  };

  if (!examStarted) {
    return (
      <LearnerLayout>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Card>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Warning sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                Thi thật - {topic?.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Bạn chuẩn bị bắt đầu bài thi chính thức
              </Typography>

              <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Lưu ý quan trọng:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  <li>Thời gian làm bài: 30 phút</li>
                  <li>Mỗi phần nghe chỉ được phát 1 lần</li>
                  <li>Điểm liệt: {passCondition}%</li>
                  <li>Kết quả sẽ được lưu vào hồ sơ của bạn</li>
                  <li>Không thể thoát giữa chừng</li>
                </ul>
              </Alert>

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 4 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h4" fontWeight="bold" color="primary">
                        {questions.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Câu hỏi
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h4" fontWeight="bold" color="primary">
                        30
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Phút
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid size={{ xs: 4 }}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h4" fontWeight="bold" color="primary">
                        {passCondition}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Điểm liệt
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button variant="outlined" onClick={() => navigate(-1)}>
                  Quay lại
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setExamStarted(true)}
                >
                  Bắt đầu thi
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </LearnerLayout>
    );
  }

  return (
    <LearnerLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header with Timer */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Chip label="Chế độ thi thật" color="warning" sx={{ mb: 1 }} />
            <Typography variant="h5" fontWeight="bold">
              {topic?.name}
            </Typography>
          </Box>
          <Card sx={{ bgcolor: timeRemaining < 300 ? 'error.main' : 'primary.main', color: 'white' }}>
            <CardContent sx={{ py: 1, px: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timer />
              <Typography variant="h5" fontWeight="bold">
                {formatTime(timeRemaining)}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Progress */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">
              Câu {currentQuestionIndex + 1} / {questions.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Đã trả lời: {answers.filter(a => a.selectedAnswer !== null).length}/{questions.length}
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={((currentQuestionIndex + 1) / questions.length) * 100}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>

        {/* Audio Player */}
        <Card sx={{ mb: 3, bgcolor: audioPlayed[currentQuestionIndex] ? 'grey.400' : 'primary.main', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <VolumeUp sx={{ mr: 1 }} />
              <Typography fontWeight="bold">Phần nghe</Typography>
              {audioPlayed[currentQuestionIndex] && (
                <Chip label="Đã phát" size="small" sx={{ ml: 2, bgcolor: 'rgba(255,255,255,0.3)' }} />
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={handlePlayAudio}
                disabled={audioPlayed[currentQuestionIndex]}
                sx={{ 
                  bgcolor: 'white', 
                  color: audioPlayed[currentQuestionIndex] ? 'grey.500' : 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                  '&:disabled': { bgcolor: 'grey.300' }
                }}
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>

              <Box sx={{ flexGrow: 1 }}>
                <Slider
                  value={audioProgress}
                  disabled
                  sx={{
                    color: 'white',
                    '& .MuiSlider-thumb': { display: 'none' },
                    '& .MuiSlider-track': { bgcolor: 'white' },
                    '& .MuiSlider-rail': { bgcolor: 'rgba(255,255,255,0.3)' },
                  }}
                />
              </Box>
            </Box>

            {!audioPlayed[currentQuestionIndex] && (
              <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mt: 1 }}>
                Lưu ý: Bạn chỉ có thể nghe 1 lần trong chế độ thi thật
              </Typography>
            )}
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
              {currentQuestion?.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index}
                  control={<Radio />}
                  label={option}
                  sx={{
                    mb: 1,
                    p: 1.5,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: currentAnswer?.selectedAnswer === index ? 'primary.main' : 'grey.300',
                    bgcolor: currentAnswer?.selectedAnswer === index ? 'primary.light' : 'transparent',
                    '&:hover': { bgcolor: 'grey.50' },
                  }}
                />
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Question Navigator */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Danh sách câu hỏi:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {questions.map((_, index) => (
                <Button
                  key={index}
                  variant={currentQuestionIndex === index ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => {
                    setCurrentQuestionIndex(index);
                    setAudioProgress(0);
                    setIsPlaying(false);
                  }}
                  sx={{
                    minWidth: 40,
                    bgcolor: answers[index].selectedAnswer !== null && currentQuestionIndex !== index
                      ? 'success.light'
                      : undefined,
                    borderColor: answers[index].selectedAnswer !== null ? 'success.main' : undefined,
                  }}
                >
                  {index + 1}
                </Button>
              ))}
            </Box>
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
            color="error"
            onClick={() => setConfirmSubmitOpen(true)}
          >
            Nộp bài
          </Button>

          <Button
            variant="contained"
            endIcon={<NavigateNext />}
            onClick={handleNext}
            disabled={currentQuestionIndex === questions.length - 1}
          >
            Câu tiếp
          </Button>
        </Box>

        {/* Confirm Submit Dialog */}
        <Dialog open={confirmSubmitOpen} onClose={() => setConfirmSubmitOpen(false)}>
          <DialogTitle>Xác nhận nộp bài</DialogTitle>
          <DialogContent>
            <Typography>
              Bạn có chắc chắn muốn nộp bài?
            </Typography>
            {getUnansweredCount() > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                Bạn còn {getUnansweredCount()} câu chưa trả lời!
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmSubmitOpen(false)}>Hủy</Button>
            <Button variant="contained" color="error" onClick={handleSubmit}>
              Nộp bài
            </Button>
          </DialogActions>
        </Dialog>

        {/* Result Dialog */}
        <Dialog open={resultDialogOpen} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography variant="h5" fontWeight="bold" textAlign="center">
              Kết quả bài thi
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Typography
                variant="h1"
                fontWeight="bold"
                color={calculateScore() >= passCondition ? 'success.main' : 'error.main'}
              >
                {calculateScore()}%
              </Typography>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {getCorrectCount()}/{questions.length} câu đúng
              </Typography>

              <Chip
                icon={calculateScore() >= passCondition ? <CheckCircle /> : <Cancel />}
                label={calculateScore() >= passCondition ? 'ĐẠT' : 'CHƯA ĐẠT'}
                color={calculateScore() >= passCondition ? 'success' : 'error'}
                sx={{ mt: 2, fontSize: '1.2rem', py: 2, px: 1 }}
              />

              <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                Điểm liệt: {passCondition}% | Điểm của bạn: {calculateScore()}%
              </Typography>
            </Box>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
            <Button variant="outlined" onClick={() => navigate('/learn/history')}>
              Xem lịch sử
            </Button>
            <Button variant="contained" onClick={() => navigate(-1)}>
              Quay lại
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LearnerLayout>
  );
};

export default ExamTestPage;
