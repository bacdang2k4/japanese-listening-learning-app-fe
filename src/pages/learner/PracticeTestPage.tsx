import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Volume2,
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
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type Phase = 'loading' | 'in-progress' | 'submitting';

interface AnswerState {
  questionId: number;
  selectedAnswerId: number | null;
  isCorrect: boolean | null;
}

const PracticeTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const [searchParams] = useSearchParams();
  const testIdFromUrl = searchParams.get('testId');
  const profileId = getActiveProfileId();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [phase, setPhase] = useState<Phase>('loading');
  const [tests, setTests] = useState<TestSummaryResponse[]>([]);
  const [passedTestCount, setPassedTestCount] = useState(0);
  const [testInfo, setTestInfo] = useState<StartTestResponse | null>(null);
  const [questions, setQuestions] = useState<LearnerQuestionResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [error, setError] = useState('');
  const [submitResult, setSubmitResult] = useState<{ score: number; isPassed: boolean } | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const fetchTests = useCallback(async () => {
    if (!topicId) return;
    try {
      const topicIdNum = Number(topicId);
      const [testsRes, progressRes] = await Promise.all([
        learnerApi.getTestsByTopic(topicIdNum),
        profileId ? learnerApi.getProfileProgress(profileId) : Promise.resolve({ data: null }),
      ]);
      const items = testsRes.data.content;
      setTests(items);

      let passed = 0;
      if (progressRes?.data?.levels) {
        const topicProgress = progressRes.data.levels
          .flatMap((l) => l.topics)
          .find((t) => t.topicId === topicIdNum);
        passed = topicProgress?.passedTestCount ?? 0;
      }
      setPassedTestCount(passed);

      let targetTestId: number | null = null;
      if (testIdFromUrl) {
        const id = parseInt(testIdFromUrl, 10);
        if (!isNaN(id) && items.some((t) => t.testId === id)) targetTestId = id;
      }
      if (targetTestId === null && items.length === 1) targetTestId = items[0].testId;
      if (targetTestId === null && items.length > 1) {
        const nextIdx = Math.min(passed, items.length - 1);
        targetTestId = items[nextIdx].testId;
      }

      if (targetTestId !== null) {
        await startTest(targetTestId);
      } else {
        setError('Chưa có bài test nào cho chủ đề này.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [topicId, profileId, testIdFromUrl]);

  useEffect(() => { fetchTests(); }, [fetchTests]);

  const startTest = async (testId: number) => {
    if (!profileId) return;
    setPhase('loading');
    try {
      const startRes = await learnerApi.startTest(testId, { profileId });
      setTestInfo(startRes.data);

      const qRes = await learnerApi.getTestQuestions(testId, startRes.data.resultId);
      setQuestions(qRes.data);
      setAnswers(qRes.data.map(q => ({ questionId: q.questionId, selectedAnswerId: null, isCorrect: null })));
      setPhase('in-progress');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestionIndex];

  const handleAnswerSelect = (answerId: number) => {
    if (showExplanation) return;
    const selectedOption = currentQuestion.answers.find(a => a.answerId === answerId);
    const isCorrect = selectedOption?.isCorrect === true;
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = { questionId: currentQuestion.questionId, selectedAnswerId: answerId, isCorrect };
    setAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowExplanation(answers[currentQuestionIndex + 1]?.selectedAnswerId !== null);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setShowExplanation(answers[currentQuestionIndex - 1]?.selectedAnswerId !== null);
    }
  };

  const handleSubmit = async () => {
    if (!testInfo || !profileId) return;
    setPhase('submitting');
    try {
      const answerPayload: LearnerAnswerRequest[] = answers.map(a => ({
        questionId: a.questionId,
        selectedAnswerId: a.selectedAnswerId,
      }));
      const res = await learnerApi.submitTest(testInfo.resultId, { profileId, answers: answerPayload });
      setSubmitResult({ score: res.data.score, isPassed: res.data.isPassed });
      setResultDialogOpen(true);
      setPhase('in-progress');
    } catch (err: any) {
      setError(err.message);
      setPhase('in-progress');
    }
  };

  const handlePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleReplayAudio = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const calculateScore = () => {
    const correct = answers.filter(a => a.isCorrect === true).length;
    return questions.length === 0 ? 0 : Math.round((correct / questions.length) * 100);
  };

  const getCorrectCount = () => answers.filter(a => a.isCorrect === true).length;

  if (error && !testInfo) {
    return (
      <LearnerLayout>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-200">{error}</div>
          <Button variant="outline" onClick={() => navigate('/learn')}>Quay lại lộ trình</Button>
        </div>
      </LearnerLayout>
    );
  }

  if (phase === 'loading' || phase === 'submitting') {
    return (
      <LearnerLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-elsa-indigo-500" />
          <p className="text-muted-foreground">{phase === 'submitting' ? 'Đang nộp bài...' : 'Đang tải...'}</p>
        </div>
      </LearnerLayout>
    );
  }

  const isAnswered = currentAnswer?.selectedAnswerId !== null;

  return (
    <LearnerLayout>
      <div className="max-w-3xl mx-auto py-8">
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
            onEnded={() => setIsPlaying(false)}
            onLoadedMetadata={() => { if (audioRef.current) setAudioDuration(audioRef.current.duration); }}
          />
        )}

        <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4">
          <Badge variant="outline" className="mb-4 bg-elsa-indigo-50 text-elsa-indigo-600 border-elsa-indigo-200 px-4 py-1 text-sm font-semibold">
            Chế độ luyện tập
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{testInfo?.testName || 'Luyện nghe'}</h1>
          <p className="text-muted-foreground font-medium">Câu {currentQuestionIndex + 1} / {questions.length}</p>
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2 w-full max-w-md mx-auto mt-6" />
        </div>

        {testInfo?.audioUrl && (
          <Card className="mb-6 bg-gradient-to-br from-elsa-indigo-600 via-elsa-indigo-500 to-elsa-purple-500 text-white border-none shadow-xl shadow-elsa-indigo-500/20 animate-in zoom-in-95 duration-500 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4 opacity-90">
                <Volume2 className="h-5 w-5" />
                <span className="font-semibold tracking-wide">PHẦN NGHE</span>
              </div>
              <div className="flex items-center gap-4 bg-primary-foreground/10 p-4 rounded-xl backdrop-blur-sm">
                <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full shrink-0 shadow-sm" onClick={handlePlayAudio}>
                  {isPlaying ? <Pause className="h-6 w-6 text-primary" /> : <Play className="h-6 w-6 text-primary ml-1" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-primary-foreground hover:bg-primary-foreground/20 rounded-full shrink-0" onClick={handleReplayAudio}>
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <div className="flex-grow mx-2">
                  <Slider value={[audioDuration ? (audioProgress / audioDuration) * 100 : 0]} max={100} step={1} className="w-full" />
                </div>
                <div className="text-sm font-medium font-mono min-w-[60px] text-right">
                  {Math.floor(audioProgress)}s/{Math.floor(audioDuration)}s
                </div>
              </div>
              <p className="text-primary-foreground/70 text-sm mt-4 text-center">
                Bạn có thể nghe lại nhiều lần trong chế độ luyện tập
              </p>
            </CardContent>
          </Card>
        )}

        <div className="animate-in slide-in-from-bottom-8 duration-700">
          <Card className="mb-6 border-none shadow-elsa-md rounded-2xl">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 text-foreground leading-relaxed">
                {currentQuestionIndex + 1}. {currentQuestion?.content}
              </h2>
              <div className="space-y-3">
                {currentQuestion?.answers.map(option => {
                  const isSelected = currentAnswer?.selectedAnswerId === option.answerId;
                  const isCorrect = option.isCorrect === true;
                  const showStatus = showExplanation && (isSelected || isCorrect);

                  let cls = 'relative flex items-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ';
                  if (showStatus) {
                    cls += isCorrect ? 'border-green-500 bg-green-500/10' : isSelected ? 'border-red-500 bg-red-500/10' : '';
                  } else {
                    cls += isSelected ? 'border-primary bg-primary/5' : 'border-muted bg-background hover:border-primary/50 hover:bg-muted/50';
                  }

                  return (
                    <div key={option.answerId} className={cls} onClick={() => handleAnswerSelect(option.answerId)}>
                      <div className="flex-grow flex items-center pr-8">
                        <span className="font-medium text-lg text-foreground">{option.content}</span>
                      </div>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {showStatus && isCorrect && <CheckCircle2 className="h-6 w-6 text-green-500 animate-in zoom-in" />}
                        {showStatus && isSelected && !isCorrect && <XCircle className="h-6 w-6 text-red-500 animate-in zoom-in" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center animate-in fade-in">
          <Button variant="outline" size="lg" className="h-14 px-6 rounded-xl border-elsa-indigo-200 hover:bg-elsa-indigo-50" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
            <ChevronLeft className="mr-2 h-5 w-5" /> Câu trước
          </Button>
          <Button size="lg" className="h-14 px-8 rounded-xl font-bold shadow-md bg-gradient-to-r from-elsa-indigo-500 to-elsa-indigo-600 hover:from-elsa-indigo-600 hover:to-elsa-indigo-700" onClick={handleNext} disabled={!isAnswered}>
            {currentQuestionIndex === questions.length - 1 ? 'Hoàn thành' : 'Câu tiếp'}
            {currentQuestionIndex !== questions.length - 1 && <ChevronRight className="ml-2 h-5 w-5" />}
          </Button>
        </div>

        <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
          <DialogContent className="sm:max-w-md text-center p-8 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">Kết quả luyện tập</DialogTitle>
              <DialogDescription className="text-base">
                Bạn đã hoàn thành bài luyện tập
              </DialogDescription>
            </DialogHeader>
            <div className="py-8">
              <div className={`text-7xl font-black tracking-tighter mb-4 ${submitResult?.isPassed ? 'text-green-500' : 'text-red-500'}`}>
                {submitResult?.score}%
              </div>
              <div className="text-lg font-medium text-muted-foreground mb-6">
                {getCorrectCount()}/{questions.length} câu đúng
              </div>
              <Badge className={`text-base px-4 py-1.5 shadow-sm ${submitResult?.isPassed ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}>
                {submitResult?.isPassed ? 'Đạt yêu cầu' : 'Chưa đạt'}
              </Badge>
              <p className="text-sm text-muted-foreground mt-8">
                Đây là chế độ luyện tập, kết quả sẽ không ảnh hưởng đến tiến độ.
              </p>
            </div>
            <DialogFooter>
              <Button className="w-full h-12 text-base rounded-xl bg-gradient-to-r from-elsa-indigo-500 to-elsa-indigo-600 hover:from-elsa-indigo-600 hover:to-elsa-indigo-700" onClick={() => navigate('/learn')}>
                Quay lại lộ trình
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </LearnerLayout>
  );
};

export default PracticeTestPage;
