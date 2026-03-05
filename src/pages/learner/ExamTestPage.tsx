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
          <Card
            sx={{
              borderRadius: 10,
              boxShadow: '0 40px 100px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.03)'
            }}
          >
            <CardContent sx={{ p: 6, textAlign: 'center' }}>
              <Box sx={{
                width: 120,
                height: 120,
                borderRadius: '50%',
                bgcolor: '#FFF1F1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 32px'
              }}>
                <Warning sx={{ fontSize: 64, color: '#f44336' }} />
              </Box>

              <Typography variant="h3" fontWeight="900" sx={{ color: '#0D1E36', letterSpacing: '-0.02em', mb: 1 }}>
                SẴN SÀNG CHƯA?
              </Typography>
              <Typography variant="h5" color="#44515E" sx={{ mb: 5, fontWeight: 600 }}>
                Bạn sắp bước vào bài thi thật: {topic?.name}
              </Typography>

              <Box sx={{
                textAlign: 'left',
                bgcolor: '#f5f5f5',
                p: 4,
                borderRadius: 6,
                mb: 6,
                border: '1px solid rgba(0,0,0,0.03)'
              }}>
                <Typography variant="h6" fontWeight="800" sx={{ color: '#0D1E36', mb: 2 }}>
                  QUY ĐỊNH PHÒNG THI
                </Typography>
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                      <CheckCircle sx={{ color: '#4caf50' }} />
                      <Typography variant="body1" fontWeight={600}>Thời gian làm bài: 30 phút</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                      <CheckCircle sx={{ color: '#4caf50' }} />
                      <Typography variant="body1" fontWeight={600}>Mỗi audio chỉ phát 1 lần duy nhất</Typography>
                    </Box>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                      <CheckCircle sx={{ color: '#4caf50' }} />
                      <Typography variant="body1" fontWeight={600}>Cần đạt tối thiểu {passCondition}%</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                      <CheckCircle sx={{ color: '#4caf50' }} />
                      <Typography variant="body1" fontWeight={600}>Kết quả được tính vào học bạ</Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(-1)}
                  sx={{ py: 2, px: 6, borderRadius: 4, fontWeight: 800, borderWidth: 2 }}
                >
                  HỦY BỎ
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => setExamStarted(true)}
                  sx={{
                    py: 2,
                    px: 8,
                    borderRadius: 4,
                    fontWeight: 800,
                    backgroundColor: '#C9E4FF',
                    color: '#0D1E36',
                    boxShadow: '0 10px 30px rgba(201, 228, 255, 0.5)',
                    fontSize: '1.2rem'
                  }}
                >
                  BẮT ĐẦU THI
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 5 }}>
          <Box>
            <Chip
              label="CHẾ ĐỘ THI THẬT"
              sx={{
                mb: 1.5,
                fontWeight: 900,
                backgroundColor: '#FBE8C8',
                color: '#593E00',
                borderRadius: 2
              }}
            />
            <Typography variant="h4" fontWeight="900" sx={{ color: '#0D1E36' }}>
              {topic?.name}
            </Typography>
          </Box>
          <Card sx={{
            borderRadius: 5,
            background: timeRemaining < 300 ? '#f44336' : '#0D1E36',
            color: 'white',
            boxShadow: '0 10px 25px rgba(13, 30, 54, 0.3)'
          }}>
            <CardContent sx={{ py: 1.5, px: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Timer fontSize="large" />
              <Typography variant="h4" fontWeight="900">
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
        <Card sx={{ mb: 3, bgcolor: audioPlayed[currentQuestionIndex] ? 'grey.400' : '#C9E4FF', color: audioPlayed[currentQuestionIndex] ? 'white' : '#0D1E36' }}>
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
                  color: audioPlayed[currentQuestionIndex] ? 'grey.500' : '#0D1E36',
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
