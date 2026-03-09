import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

type Phase = 'loading' | 'select-test' | 'in-progress' | 'submitting';

interface AnswerState {
  questionId: number;
  selectedAnswerId: number | null;
  isCorrect: boolean | null;
}

const PracticeTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();
  const profileId = getActiveProfileId();
  const audioRef = useRef<HTMLAudioElement>(null);

  const [phase, setPhase] = useState<Phase>('loading');
  const [tests, setTests] = useState<TestSummaryResponse[]>([]);
  const [testInfo, setTestInfo] = useState<StartTestResponse | null>(null);
  const [questions, setQuestions] = useState<LearnerQuestionResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [error, setError] = useState('');

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const fetchTests = useCallback(async () => {
    if (!topicId) return;
    try {
      const res = await learnerApi.getTestsByTopic(Number(topicId));
      const items = res.data.content;
      setTests(items);
      if (items.length === 1) {
        await startTest(items[0].testId);
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

  const startTest = async (testId: number) => {
    if (!profileId) return;
    setPhase('loading');
    try {
      const startRes = await learnerApi.startTest(testId, { profileId, mode: 'PRACTICE' });
      setTestInfo(startRes.data);

      const qRes = await learnerApi.getTestQuestions(testId, startRes.data.resultId);
      setQuestions(qRes.data);
      setAnswers(qRes.data.map(q => ({ questionId: q.questionId, selectedAnswerId: null, isCorrect: null })));
      setPhase('in-progress');
    } catch (err: any) {
      setError(err.message);
      setPhase('select-test');
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
      await learnerApi.submitTest(testInfo.resultId, { profileId, answers: answerPayload });
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

  if (phase === 'select-test') {
    return (
      <LearnerLayout>
        <div className="max-w-2xl mx-auto py-12">
          {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200">{error}</div>}
          <h1 className="text-3xl font-bold mb-8 text-center">Chọn bài luyện tập</h1>
          {tests.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              Chưa có bài test nào cho chủ đề này.
              <div className="mt-4">
                <Button variant="outline" onClick={() => navigate(-1)}>Quay lại</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {tests.map(test => (
                <Card key={test.testId} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => startTest(test.testId)}>
                  <CardContent className="p-6 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">{test.testName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {test.duration ? `${test.duration}s` : 'N/A'} | Đỗ: {test.passCondition || 80}%
                      </p>
                    </div>
                    <Button><Play className="w-4 h-4 mr-2" /> Bắt đầu</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
          <Badge variant="outline" className="mb-4 bg-primary/5 text-primary border-primary/20 px-4 py-1 text-sm font-medium">
            Chế độ luyện tập
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight mb-2">{testInfo?.testName || 'Luyện nghe'}</h1>
          <p className="text-muted-foreground font-medium">Câu {currentQuestionIndex + 1} / {questions.length}</p>
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2 w-full max-w-md mx-auto mt-6" />
        </div>

        {testInfo?.audioUrl && (
          <Card className="mb-6 bg-primary text-primary-foreground border-none shadow-xl animate-in zoom-in-95 duration-500">
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
          <Card className="mb-6 border-none shadow-lg">
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
          <Button variant="outline" size="lg" className="h-14 px-6 rounded-xl" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
            <ChevronLeft className="mr-2 h-5 w-5" /> Câu trước
          </Button>
          <Button size="lg" className="h-14 px-8 rounded-xl font-bold shadow-md" onClick={handleNext} disabled={!isAnswered}>
            {currentQuestionIndex === questions.length - 1 ? 'Hoàn thành' : 'Câu tiếp'}
            {currentQuestionIndex !== questions.length - 1 && <ChevronRight className="ml-2 h-5 w-5" />}
          </Button>
        </div>

        <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
          <DialogContent className="sm:max-w-md text-center p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">Kết quả luyện tập</DialogTitle>
              <DialogDescription className="text-base">
                Bạn đã hoàn thành bài luyện tập
              </DialogDescription>
            </DialogHeader>
            <div className="py-8">
              <div className={`text-7xl font-black tracking-tighter mb-4 ${calculateScore() >= 60 ? 'text-green-500' : 'text-red-500'}`}>
                {calculateScore()}%
              </div>
              <div className="text-lg font-medium text-muted-foreground mb-6">
                {getCorrectCount()}/{questions.length} câu đúng
              </div>
              <Badge className={`text-base px-4 py-1.5 ${calculateScore() >= 60 ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}>
                {calculateScore() >= 60 ? 'Đạt yêu cầu' : 'Chưa đạt'}
              </Badge>
              <p className="text-sm text-muted-foreground mt-8">
                Đây là chế độ luyện tập, kết quả sẽ không ảnh hưởng đến tiến độ.
              </p>
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-3">
              <Button variant="outline" className="w-full h-12 text-base" onClick={() => navigate(-1)}>Quay lại</Button>
              <Button className="w-full h-12 text-base" onClick={() => { setResultDialogOpen(false); fetchTests(); setCurrentQuestionIndex(0); setShowExplanation(false); }}>
                <RotateCcw className="w-4 h-4 mr-2" /> Làm lại
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </LearnerLayout>
  );
};

export default PracticeTestPage;
