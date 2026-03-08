import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Volume2,
  Timer as TimerIcon,
  AlertTriangle,
  History,
  ArrowLeft,
} from 'lucide-react';
import LearnerLayout from '../../components/learner/LearnerLayout';
import { mockQuestions, mockAudioTests, mockTopics } from '../../data/mockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
        <div className="max-w-2xl mx-auto py-12">
          <Card className="border-none shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden">
            <div className="h-2 bg-warning/80 w-full" />
            <CardContent className="p-8 text-center pt-10">
              <AlertTriangle className="w-20 h-20 text-warning mx-auto mb-6" />

              <h1 className="text-3xl font-bold mb-2">Thi thật - {topic?.name}</h1>
              <p className="text-muted-foreground mb-8">Bạn chuẩn bị bắt đầu bài thi chính thức</p>

              <Alert variant="warning" className="text-left bg-orange-50 border-orange-200 text-orange-900 mb-8">
                <AlertTitle className="font-bold flex items-center mb-2 text-orange-800">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Lưu ý quan trọng
                </AlertTitle>
                <AlertDescription className="text-orange-900/90 text-sm">
                  <ul className="list-disc pl-5 space-y-1.5 mt-2 font-medium">
                    <li>Thời gian làm bài: 30 phút. Hết giờ hệ thống tự động nộp.</li>
                    <li>Mỗi phần nghe <span className="underline decoration-orange-400 font-bold">chỉ được phát 1 lần</span> duy nhất.</li>
                    <li>Điểm tối thiểu để đỗ: <span className="font-bold">{passCondition}%</span>.</li>
                    <li>Kết quả sẽ được lưu vào lịch sử học tập.</li>
                    <li>Không thể thoát hoặc làm lại giữa chừng.</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-muted/50 rounded-xl p-4 border text-center">
                  <div className="text-3xl font-bold text-primary mb-1">{questions.length}</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Câu hỏi</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 border text-center">
                  <div className="text-3xl font-bold text-primary mb-1">30</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Phút</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-4 border text-center">
                  <div className="text-3xl font-bold text-destructive mb-1">{passCondition}%</div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Điểm đỗ</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" size="lg" className="px-8 h-12 rounded-xl" onClick={() => navigate(-1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                </Button>
                <Button
                  size="lg"
                  className="px-10 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 font-bold text-base"
                  onClick={() => setExamStarted(true)}
                >
                  Bắt đầu thi
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </LearnerLayout>
    );
  }

  const isTimeLow = timeRemaining < 300; // Less than 5 minutes

  return (
    <LearnerLayout>
      <div className="max-w-4xl mx-auto py-6">

        {/* Exam Header */}
        <div className="sticky top-[64px] z-40 bg-background/95 backdrop-blur-sm pt-4 pb-2 -mt-4 border-b mb-6 animate-in slide-in-from-top-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Badge variant="destructive" className="bg-orange-500 uppercase tracking-widest text-[10px] px-2 py-0.5">
                  Thi thật
                </Badge>
                <h1 className="text-xl font-bold">
                  {topic?.name}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">
                Câu {currentQuestionIndex + 1} / {questions.length}
              </p>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xl font-bold tracking-tight shadow-sm transition-colors ${isTimeLow
                ? 'bg-destructive text-destructive-foreground animate-pulse'
                : 'bg-primary text-primary-foreground'
              }`}>
              <TimerIcon className="h-5 w-5" />
              {formatTime(timeRemaining)}
            </div>
          </div>
          <Progress
            value={((currentQuestionIndex + 1) / questions.length) * 100}
            className="h-1 mt-4"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Main Content Area */}
          <div className="lg:col-span-8 space-y-6">

            {/* Audio Player Card */}
            <Card className={`border-none shadow-md transition-colors ${audioPlayed[currentQuestionIndex] ? 'bg-muted' : 'bg-primary text-primary-foreground'
              }`}>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4 opacity-90">
                  <Volume2 className="h-5 w-5" />
                  <span className="font-semibold tracking-wide">PHẦN NGHE</span>
                  {audioPlayed[currentQuestionIndex] && (
                    <Badge variant="outline" className="ml-auto bg-background/50 text-foreground border-border/50">
                      Đã phát
                    </Badge>
                  )}
                </div>

                <div className={`flex items-center gap-4 p-4 rounded-xl backdrop-blur-sm ${audioPlayed[currentQuestionIndex] ? 'bg-background/40' : 'bg-primary-foreground/10'
                  }`}>
                  <Button
                    variant={audioPlayed[currentQuestionIndex] ? 'outline' : 'secondary'}
                    size="icon"
                    className="h-12 w-12 rounded-full shrink-0 shadow-sm"
                    onClick={handlePlayAudio}
                    disabled={audioPlayed[currentQuestionIndex]}
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className={`h-6 w-6 ml-1 ${audioPlayed[currentQuestionIndex] ? 'text-muted-foreground' : 'text-primary'}`} />}
                  </Button>

                  <div className="flex-grow mx-2">
                    <Slider
                      value={[audioProgress]}
                      max={100}
                      disabled
                      className={audioPlayed[currentQuestionIndex] ? 'opacity-50' : ''}
                    />
                  </div>
                </div>

                {!audioPlayed[currentQuestionIndex] && (
                  <p className="text-primary-foreground/80 text-sm mt-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-1.5 shrink-0" />
                    Lưu ý: Chỉ được nghe duy nhất 1 lần.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Question Card */}
            <Card className="border-none shadow-md">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6 text-foreground leading-relaxed">
                  {currentQuestionIndex + 1}. {currentQuestion?.content}
                </h2>

                <div className="space-y-3">
                  {currentQuestion?.options.map((option, index) => {
                    const isSelected = currentAnswer?.selectedAnswer === index;

                    return (
                      <div
                        key={index}
                        className={`relative flex items-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${isSelected
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-muted bg-background hover:border-primary/50 hover:bg-muted/50'
                          }`}
                        onClick={() => handleAnswerSelect(index)}
                      >
                        <div className="flex-grow flex items-center pr-8">
                          <span className={`${isSelected ? 'font-semibold text-primary' : 'font-medium'} text-lg`}>
                            {option}
                          </span>
                        </div>

                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'
                            }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Mobile/Tablet Submit & Nav */}
            <div className="flex justify-between items-center gap-2 lg:hidden mt-6 mb-8">
              <div className="flex gap-2">
                <Button variant="outline" size="lg" className="h-14 px-4" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" className="h-14 px-4" onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
              <Button variant="destructive" size="lg" className="h-14 px-8 font-bold" onClick={() => setConfirmSubmitOpen(true)}>
                Nộp bài
              </Button>
            </div>

          </div>

          {/* Sidebar Area (Desktop) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-[160px]">
            <Card className="border-none shadow-md">
              <CardHeader className="pb-3 px-5">
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex justify-between items-center">
                  <span>Mục lục</span>
                  <span className="text-xs">{answers.filter(a => a.selectedAnswer !== null).length}/{questions.length}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, index) => {
                    const isAnswered = answers[index].selectedAnswer !== null;
                    const isCurrent = currentQuestionIndex === index;

                    return (
                      <Button
                        key={index}
                        variant={isCurrent ? 'default' : isAnswered ? 'secondary' : 'outline'}
                        className={`h-10 w-full p-0 font-medium ${isAnswered && !isCurrent ? 'bg-primary/10 text-primary border-primary/20' : ''
                          }`}
                        onClick={() => {
                          setCurrentQuestionIndex(index);
                          setAudioProgress(0);
                          setIsPlaying(false);
                        }}
                      >
                        {index + 1}
                      </Button>
                    );
                  })}
                </div>

                {/* Desktop Action Buttons */}
                <div className="mt-6 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                      Trước
                    </Button>
                    <Button variant="outline" onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1}>
                      Tiếp
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    className="w-full text-base font-bold shadow-md h-12 hover:bg-red-600 transition-colors"
                    onClick={() => setConfirmSubmitOpen(true)}
                  >
                    Nộp bài
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>

        {/* Confirm Submit Dialog */}
        <Dialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Xác nhận nộp bài</DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn nộp bài thì lúc này?
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="flex justify-between items-center mb-4 text-sm font-medium border-b pb-4">
                <span className="text-muted-foreground">Thời gian còn lại:</span>
                <span className="text-foreground text-lg">{formatTime(timeRemaining)}</span>
              </div>

              {getUnansweredCount() > 0 ? (
                <Alert variant="destructive" className="bg-red-50 text-red-900 border-red-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Cảnh báo</AlertTitle>
                  <AlertDescription>
                    Bạn còn <span className="font-bold">{getUnansweredCount()}</span> câu chưa trả lời!
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-green-50 text-green-900 border-green-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Tuyệt vời</AlertTitle>
                  <AlertDescription>
                    Bạn đã trả lời tất cả các câu hỏi.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" className="w-full h-11" onClick={() => setConfirmSubmitOpen(false)}>Quay lại làm tiếp</Button>
              <Button variant="destructive" className="w-full h-11" onClick={handleSubmit}>
                Xác nhận nộp bài
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Result Dialog */}
        <Dialog open={resultDialogOpen} onOpenChange={() => { }}>
          <DialogContent className="sm:max-w-md text-center p-8 [&>button]:hidden">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">Kết quả bài thi</DialogTitle>
              <DialogDescription className="text-base">
                Chủ đề: {topic?.name}
              </DialogDescription>
            </DialogHeader>

            <div className="py-8">
              <div className={`text-7xl font-black tracking-tighter mb-4 ${calculateScore() >= passCondition ? 'text-green-500' : 'text-red-500'}`}>
                {calculateScore()}%
              </div>

              <div className="text-lg font-medium text-muted-foreground mb-6">
                {getCorrectCount()}/{questions.length} câu đúng
              </div>

              <Badge className={`text-base px-6 py-2 shadow-sm ${calculateScore() >= passCondition ? 'bg-green-500' : 'bg-red-500'}`}>
                {calculateScore() >= passCondition ? 'TRÚNG TUYỂN (ĐẠT)' : 'TRƯỢT (CHƯA ĐẠT)'}
              </Badge>

              <div className="bg-muted/50 rounded-xl p-4 mt-8 text-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Điểm tối thiểu:</span>
                  <span className="font-medium">{passCondition}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Điểm của bạn:</span>
                  <span className="font-bold">{calculateScore()}%</span>
                </div>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-3">
              <Button variant="outline" className="w-full h-12 text-base" onClick={() => navigate('/learn/history')}>
                <History className="w-4 h-4 mr-2" /> Lịch sử học
              </Button>
              <Button className="w-full h-12 text-base bg-primary" onClick={() => navigate(`/learn/level/${topic?.levelId}/topics`)}>
                Hoàn thành
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </LearnerLayout>
  );
};

export default ExamTestPage;
