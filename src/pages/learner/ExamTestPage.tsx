import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Volume2,
  Timer as TimerIcon,
  AlertTriangle,
  History,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import LearnerLayout from '../../components/learner/LearnerLayout';
import {
  learnerApi,
  TestSummaryResponse,
  StartTestResponse,
  LearnerQuestionResponse,
  LearnerAnswerRequest,
} from '@/services/api';
import { getActiveProfileId } from '@/hooks/useActiveProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useToast } from '@/components/ui/use-toast';

type Phase = 'loading' | 'select-test' | 'pre-exam' | 'in-progress' | 'submitting';

interface AnswerState {
  questionId: number;
  selectedAnswerId: number | null;
}

const ExamTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const profileId = getActiveProfileId();
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  const [phase, setPhase] = useState<Phase>('loading');
  const [tests, setTests] = useState<TestSummaryResponse[]>([]);
  const [selectedTest, setSelectedTest] = useState<TestSummaryResponse | null>(null);
  const [testInfo, setTestInfo] = useState<StartTestResponse | null>(null);
  const [questions, setQuestions] = useState<LearnerQuestionResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60);
  const [timeElapsed, setTimeElapsed] = useState(0); // Track elapsed seconds
  const [error, setError] = useState('');

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioPlayed, setAudioPlayed] = useState<boolean[]>([]);

  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ score: number; isPassed: boolean } | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const fetchTests = useCallback(async () => {
    if (!topicId) return;
    try {
      const res = await learnerApi.getTestsByTopic(Number(topicId));
      const items = res.data.content;
      setTests(items);
      if (items.length === 1) {
        setSelectedTest(items[0]);
        setPhase('pre-exam');
      } else if (items.length === 0) {
        setPhase('select-test');
      } else {
        setPhase('select-test');
      }
    } catch (err: any) {
      setError(err.message);
      setPhase('select-test');
    }
  }, [topicId]);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  const handleStartExam = async () => {
    if (!selectedTest || !profileId) return;
    setPhase('loading');
    try {
      const startRes = await learnerApi.startTest(selectedTest.testId, { profileId });
      setTestInfo(startRes.data);
      const duration = startRes.data.duration || 30 * 60; // Default 30 min
      setTimeRemaining(duration);
      setTimeElapsed(0); // Reset elapsed time

      const qRes = await learnerApi.getTestQuestions(selectedTest.testId, startRes.data.resultId);
      setQuestions(qRes.data);
      setAnswers(qRes.data.map(q => ({ questionId: q.questionId, selectedAnswerId: null })));
      setAudioPlayed(qRes.data.map(() => false));
      setPhase('in-progress');
    } catch (err: any) {
      setError(err.message);
      setPhase('pre-exam');
    }
  };

  // Timer with auto-submit when time expires
  useEffect(() => {
    if (phase !== 'in-progress') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-submit when time expires
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

  // Auto-submit on page unload/close
  useEffect(() => {
    if (phase !== 'in-progress') return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Send partial answers via Beacon API (fire-and-forget, works during unload)
      const payload = JSON.stringify({
        profileId: profileId,
        answers: answers.map(a => ({
          questionId: a.questionId,
          selectedAnswerId: a.selectedAnswerId,
        }))
      });

      // Use sendBeacon for reliable background send during page unload
      const url = `${import.meta.env.VITE_API_BASE_URL || '/api/v1'}/test-results/${testInfo.resultId}/submit`;
      const blob = new Blob([payload], { type: 'application/json' });
      const success = navigator.sendBeacon(url, blob);

      // Show warning to user about auto-save
      event.preventDefault();
      event.returnValue = 'Bài thi của bạn sẽ được tự động nộp nếu bạn thoát. Bạn có chắc muốn thoát?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [phase, profileId, answers, testInfo]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];
  const passCondition = selectedTest?.passCondition || testInfo?.passCondition || 80;

  const handleAnswerSelect = (answerId: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = { questionId: currentQuestion.questionId, selectedAnswerId: answerId };
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
    if (audioPlayed[currentQuestionIndex] || !audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    const newPlayed = [...audioPlayed];
    newPlayed[currentQuestionIndex] = true;
    setAudioPlayed(newPlayed);
  };

  const handleSubmit = async (isAutoSubmit = false) => {
    if (!testInfo || !profileId || hasSubmitted) return;

    // Prevent duplicate submissions
    setHasSubmitted(true);

    // If not auto-submit, show confirmation dialog
    if (!isAutoSubmit) {
      setConfirmSubmitOpen(false);
    }

    setPhase('submitting');
    try {
      const payload: LearnerAnswerRequest[] = answers.map(a => ({
        questionId: a.questionId,
        selectedAnswerId: a.selectedAnswerId,
      }));
      const res = await learnerApi.submitTest(testInfo.resultId, { profileId, answers: payload });
      setSubmitResult({ score: res.data.score, isPassed: res.data.isPassed });
      setResultDialogOpen(true);

      // Show success toast for manual submit
      if (!isAutoSubmit) {
        toast({
          title: "Nộp bài thành công",
          description: `Điểm của bạn: ${res.data.score}%`,
        });
      }
    } catch (err: any) {
      setError(err.message);
      setHasSubmitted(false); // Allow retry
      setPhase('in-progress'); // Return to in-progress so user can retry
    }
  };

  const getUnansweredCount = () => answers.filter(a => a.selectedAnswerId === null).length;

  // Loading / Submitting
  if (phase === 'loading' || phase === 'submitting') {
    return (
      <LearnerLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">{phase === 'submitting' ? 'Đang nộp bài...' : 'Đang tải...'}</p>
        </div>
      </LearnerLayout>
    );
  }

  // Test selection
  if (phase === 'select-test') {
    return (
      <LearnerLayout>
        <div className="max-w-2xl mx-auto py-12">
          {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>}
          <h1 className="text-3xl font-bold mb-8 text-center">Chọn bài thi</h1>
          {tests.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              Chưa có bài thi nào cho chủ đề này.
              <div className="mt-4"><Button variant="outline" onClick={() => navigate(-1)}>Quay lại</Button></div>
            </div>
          ) : (
            <div className="space-y-4">
              {tests.map(test => (
                <Card key={test.testId} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => { setSelectedTest(test); setPhase('pre-exam'); }}>
                  <CardContent className="p-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">{test.testName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {test.duration ? `${Math.floor(test.duration / 60)} phút` : 'N/A'} | Đỗ: {test.passCondition || 80}%
                      </p>
                    </div>
                    <Button variant="secondary"><Play className="w-4 h-4 mr-2" /> Chọn</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </LearnerLayout>
    );
  }

  // Pre-exam warning
  if (phase === 'pre-exam' && selectedTest) {
    return (
      <LearnerLayout>
        <div className="max-w-2xl mx-auto py-12">
          {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>}
          <Card className="border-none shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden">
            <div className="h-2 bg-warning/80 w-full" />
            <CardContent className="p-8 text-center pt-10">
              <AlertTriangle className="w-20 h-20 text-warning mx-auto mb-6" />
              <h1 className="text-3xl font-bold mb-2">Thi thật - {selectedTest.testName}</h1>
              <p className="text-muted-foreground mb-8">Bạn chuẩn bị bắt đầu bài thi chính thức</p>

              <Alert variant="warning" className="text-left bg-orange-50 border-orange-200 text-orange-900 mb-8">
                <AlertTitle className="font-bold flex items-center mb-2 text-orange-800">
                  <AlertTriangle className="h-4 w-4 mr-2" /> Lưu ý quan trọng
                </AlertTitle>
                <AlertDescription className="text-orange-900/90 text-sm">
                  <ul className="list-disc pl-5 space-y-1.5 mt-2 font-medium">
                    <li>Thời gian làm bài: {selectedTest.duration ? `${Math.floor(selectedTest.duration / 60)} phút` : '30 phút'}.</li>
                    <li>Mỗi phần nghe <span className="underline decoration-orange-400 font-bold">chỉ được phát 1 lần</span> duy nhất.</li>
                    <li>Điểm tối thiểu để đỗ: <span className="font-bold">{selectedTest.passCondition || 80}%</span>.</li>
                    <li>Kết quả sẽ được lưu vào lịch sử và ảnh hưởng đến tiến độ.</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="flex gap-4 justify-center">
                <Button variant="outline" size="lg" className="px-8 h-12 rounded-xl" onClick={() => navigate(-1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại
                </Button>
                <Button
                  size="lg"
                  className="px-10 h-12 rounded-xl bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20 font-bold text-base"
                  onClick={handleStartExam}
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

  // In-progress exam
  const isTimeLow = timeRemaining < 300;
  const totalDuration = testInfo?.duration || 30 * 60; // Only declare once
  const timeProgressPercent = totalDuration > 0 ? (timeElapsed / totalDuration) * 100 : 0;

  return (
    <LearnerLayout>
      <div className="max-w-4xl mx-auto py-6">
        {testInfo?.audioUrl && (
          <audio
            ref={audioRef}
            src={testInfo.audioUrl}
            onTimeUpdate={() => {
              if (audioRef.current) {
                setAudioProgress(audioRef.current.currentTime);
                setAudioDuration(audioRef.current.duration || 0);
              }
            }}
            onEnded={handleAudioEnded}
            onLoadedMetadata={() => { if (audioRef.current) setAudioDuration(audioRef.current.duration); }}
          />
        )}

        <div className="sticky top-[64px] z-40 bg-background/95 backdrop-blur-sm pt-4 pb-2 -mt-4 border-b mb-6 animate-in slide-in-from-top-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Badge variant="destructive" className="bg-orange-500 uppercase tracking-widest text-[10px] px-2 py-0.5">Thi thật</Badge>
                <h1 className="text-xl font-bold">{testInfo?.testName}</h1>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Câu {currentQuestionIndex + 1} / {questions.length}</span>
                <span>{formatTime(timeElapsed)} / {formatTime(totalDuration)}</span>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xl font-bold tracking-tight shadow-sm transition-colors ${isTimeLow ? 'bg-destructive text-destructive-foreground animate-pulse' : 'bg-primary text-primary-foreground'}`}>
              <TimerIcon className="h-5 w-5" />
              {formatTime(timeRemaining)}
            </div>
          </div>
          {/* Question progress bar */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-muted-foreground w-24">Tiến độ câu hỏi:</span>
            <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2 flex-1" />
          </div>
          {/* Time progress bar */}
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground w-24">Thời gian:</span>
            <Progress
              value={timeProgressPercent}
              className={`h-2 flex-1 ${isTimeLow ? '[&>div]:bg-destructive' : ''}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            {testInfo?.audioUrl && (
              <Card className={`border-none shadow-md transition-colors ${audioPlayed[currentQuestionIndex] ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4 opacity-90">
                    <Volume2 className="h-5 w-5" />
                    <span className="font-semibold tracking-wide">PHẦN NGHE</span>
                    {audioPlayed[currentQuestionIndex] && (
                      <Badge variant="outline" className="ml-auto bg-background/50 text-foreground border-border/50">Đã phát</Badge>
                    )}
                  </div>
                  <div className={`flex items-center gap-4 p-4 rounded-xl backdrop-blur-sm ${audioPlayed[currentQuestionIndex] ? 'bg-background/40' : 'bg-primary-foreground/10'}`}>
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
                      <Slider value={[audioDuration ? (audioProgress / audioDuration) * 100 : 0]} max={100} disabled className={audioPlayed[currentQuestionIndex] ? 'opacity-50' : ''} />
                    </div>
                  </div>
                  {!audioPlayed[currentQuestionIndex] && (
                    <p className="text-primary-foreground/80 text-sm mt-3 flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1.5 shrink-0" /> Lưu ý: Chỉ được nghe duy nhất 1 lần.
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="border-none shadow-md">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-xl font-bold mb-6 text-foreground leading-relaxed">
                  {currentQuestionIndex + 1}. {currentQuestion?.content}
                </h2>
                <div className="space-y-3">
                  {currentQuestion?.answers.map(option => {
                    const isSelected = currentAnswer?.selectedAnswerId === option.answerId;
                    return (
                      <div
                        key={option.answerId}
                        className={`relative flex items-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-muted bg-background hover:border-primary/50 hover:bg-muted/50'}`}
                        onClick={() => handleAnswerSelect(option.answerId)}
                      >
                        <div className="flex-grow flex items-center pr-8">
                          <span className={`${isSelected ? 'font-semibold text-primary' : 'font-medium'} text-lg`}>{option.content}</span>
                        </div>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/30'}`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-primary-foreground" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center gap-2 lg:hidden mt-6 mb-8">
              <div className="flex gap-2">
                <Button variant="outline" size="lg" className="h-14 px-4" onClick={handlePrevious} disabled={currentQuestionIndex === 0}><ChevronLeft className="h-5 w-5" /></Button>
                <Button variant="outline" size="lg" className="h-14 px-4" onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1}><ChevronRight className="h-5 w-5" /></Button>
              </div>
              <Button variant="destructive" size="lg" className="h-14 px-8 font-bold" onClick={() => setConfirmSubmitOpen(true)}>Nộp bài</Button>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-4 sticky top-[160px]">
            <Card className="border-none shadow-md">
              <CardHeader className="pb-3 px-5">
                <CardTitle className="text-sm uppercase tracking-wider text-muted-foreground flex justify-between items-center">
                  <span>Mục lục</span>
                  <span className="text-xs">{answers.filter(a => a.selectedAnswerId !== null).length}/{questions.length}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-5">
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, index) => {
                    const isAnswered = answers[index]?.selectedAnswerId !== null;
                    const isCurrent = currentQuestionIndex === index;
                    return (
                      <Button
                        key={index}
                        variant={isCurrent ? 'default' : isAnswered ? 'secondary' : 'outline'}
                        className={`h-10 w-full p-0 font-medium ${isAnswered && !isCurrent ? 'bg-primary/10 text-primary border-primary/20' : ''}`}
                        onClick={() => { setCurrentQuestionIndex(index); setAudioProgress(0); setIsPlaying(false); }}
                      >
                        {index + 1}
                      </Button>
                    );
                  })}
                </div>
                <div className="mt-6 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>Trước</Button>
                    <Button variant="outline" onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1}>Tiếp</Button>
                  </div>
                  <Button variant="destructive" className="w-full text-base font-bold shadow-md h-12" onClick={() => setConfirmSubmitOpen(true)}>
                    Nộp bài
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Confirm Submit */}
        <Dialog open={confirmSubmitOpen} onOpenChange={setConfirmSubmitOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">Xác nhận nộp bài</DialogTitle>
              <DialogDescription>Bạn có chắc chắn muốn nộp bài?</DialogDescription>
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
                  <AlertDescription>Bạn còn <span className="font-bold">{getUnansweredCount()}</span> câu chưa trả lời!</AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-green-50 text-green-900 border-green-200">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Tuyệt vời</AlertTitle>
                  <AlertDescription>Bạn đã trả lời tất cả các câu hỏi.</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" className="w-full h-11" onClick={() => setConfirmSubmitOpen(false)}>Quay lại làm tiếp</Button>
              <Button variant="destructive" className="w-full h-11" onClick={() => { setConfirmSubmitOpen(false); handleSubmit(false); }}>Xác nhận nộp bài</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Result */}
        <Dialog open={resultDialogOpen} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md text-center p-8 [&>button]:hidden">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">Kết quả bài thi</DialogTitle>
              <DialogDescription className="text-base">Chủ đề: {testInfo?.testName}</DialogDescription>
            </DialogHeader>
            <div className="py-8">
              <div className={`text-7xl font-black tracking-tighter mb-4 ${(submitResult?.isPassed) ? 'text-green-500' : 'text-red-500'}`}>
                {submitResult?.score ?? 0}%
              </div>
              <Badge className={`text-base px-6 py-2 shadow-sm ${submitResult?.isPassed ? 'bg-green-500' : 'bg-red-500'}`}>
                {submitResult?.isPassed ? 'TRÚNG TUYỂN (ĐẠT)' : 'TRƯỢT (CHƯA ĐẠT)'}
              </Badge>
              <div className="bg-muted/50 rounded-xl p-4 mt-8 text-sm">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-muted-foreground">Điểm tối thiểu:</span>
                  <span className="font-medium">{passCondition}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Điểm của bạn:</span>
                  <span className="font-bold">{submitResult?.score ?? 0}%</span>
                </div>
              </div>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-3">
              <Button variant="outline" className="w-full h-12 text-base" onClick={() => navigate('/learn/history')}>
                <History className="w-4 h-4 mr-2" /> Lịch sử học
              </Button>
              <Button className="w-full h-12 text-base bg-primary" onClick={() => navigate(-1)}>
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
