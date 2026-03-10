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

        <div className="mb-10 text-center animate-in fade-in slide-in-from-top-4">
          <Badge className="mb-4 bg-sky-50 text-sky-600 border-sky-100 px-5 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-sm">
            CHẾ ĐỘ LUYỆN TẬP
          </Badge>
          <h1 className="text-4xl font-black tracking-tighter text-slate-700 mb-3">{testInfo?.testName || 'Luyện nghe'}</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">Câu {currentQuestionIndex + 1} / {questions.length}</p>
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-2 w-full max-w-sm mx-auto bg-slate-100 rounded-full overflow-hidden shadow-inner" />
        </div>

        {testInfo?.audioUrl && (
          <Card className="mb-8 bg-gradient-to-br from-sky-400 via-sky-500 to-indigo-500 text-white border-none shadow-3xl shadow-sky-400/20 animate-in zoom-in-95 duration-700 rounded-[3.5rem] overflow-hidden relative group">
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center gap-3 mb-4 opacity-90">
                <div className="w-8 h-8 bg-white/20 rounded-[1.2rem] flex items-center justify-center shadow-inner">
                  <Volume2 className="h-5 w-5" />
                </div>
                <span className="font-black text-[10px] uppercase tracking-[0.2em]">PHẦN NGHE</span>
              </div>
              <div className="flex items-center gap-4 bg-white/15 p-4 rounded-[2.5rem] backdrop-blur-xl border border-white/10 shadow-2xl">
                <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full shrink-0 shadow-2xl bg-white text-indigo-500 hover:bg-white hover:scale-110 active:scale-90 transition-all" onClick={handlePlayAudio}>
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 text-white hover:bg-white/20 rounded-full shrink-0 transition-transform active:rotate-[-45deg]" onClick={handleReplayAudio}>
                  <RotateCcw className="h-5 w-5" />
                </Button>
                <div className="flex-grow mx-2">
                  <Slider value={[audioDuration ? (audioProgress / audioDuration) * 100 : 0]} max={100} step={1} className="w-full" />
                </div>
                <div className="text-xs font-black font-mono min-w-[60px] text-right opacity-80 text-white/90">
                  {Math.floor(audioProgress)}s/{Math.floor(audioDuration)}s
                </div>
              </div>
              <p className="text-white/60 text-[9px] font-black uppercase tracking-[0.15em] mt-6 text-center bg-white/5 py-2 rounded-full border border-white/5">
                Bạn có thể nghe lại nhiều lần trong chế độ luyện tập
              </p>
            </CardContent>
          </Card>
        )}

        <div className="animate-in slide-in-from-bottom-8 duration-800">
          <Card className="mb-6 border-none shadow-3xl shadow-slate-200/50 rounded-[3.5rem] bg-white/90 backdrop-blur-2xl overflow-hidden ring-1 ring-black/5">
            <CardContent className="p-8 md:p-10">
              <h2 className="text-xl font-black mb-8 text-slate-800 leading-tight tracking-tight">
                <span className="text-indigo-500 mr-3 font-black bg-indigo-50 px-4 py-1.5 rounded-[1.2rem] shadow-inner inline-block mb-3">{currentQuestionIndex + 1}</span>
                {currentQuestion?.content}
              </h2>
              <div className="space-y-3">
                {currentQuestion?.answers.map(option => {
                  const isSelected = currentAnswer?.selectedAnswerId === option.answerId;
                  const isCorrect = option.isCorrect === true;
                  const showStatus = showExplanation && (isSelected || isCorrect);

                  let cls = 'relative flex items-center p-5 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md ';
                  if (showStatus) {
                    cls += isCorrect ? 'border-emerald-400 bg-emerald-50 text-white' : isSelected ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-100 bg-slate-50 opacity-60';
                  } else {
                    cls += isSelected ? 'border-indigo-500 bg-indigo-50 shadow-indigo-100/50' : 'border-slate-50 bg-white/70 hover:border-indigo-200 hover:bg-white';
                  }

                  return (
                    <div key={option.answerId} className={cls} onClick={() => handleAnswerSelect(option.answerId)}>
                      <div className="flex-grow flex items-center pr-10">
                        <span className={`font-black text-base ${showStatus && isCorrect ? 'text-white' : 'text-slate-700'}`}>{option.content}</span>
                      </div>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2">
                        {showStatus && isCorrect && <CheckCircle2 className="h-8 w-8 text-emerald-500 animate-in zoom-in" />}
                        {showStatus && isSelected && !isCorrect && <XCircle className="h-8 w-8 text-rose-500 animate-in zoom-in" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between items-center animate-in fade-in duration-1000">
          <Button variant="outline" size="lg" className="h-14 px-6 rounded-full font-black text-[9px] tracking-[0.2em] border-2 bg-white/60 hover:bg-white" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" /> CÂU TRƯỚC
          </Button>
          <Button size="lg" className="h-14 px-8 rounded-full font-black text-sm tracking-widest shadow-2xl bg-slate-900 text-white hover:scale-105 active:scale-95 transition-all" onClick={handleNext} disabled={!isAnswered}>
            {currentQuestionIndex === questions.length - 1 ? 'HOÀN THÀNH' : 'CÂU TIẾP'}
            {currentQuestionIndex !== questions.length - 1 && <ChevronRight className="ml-2 h-4 w-4" />}
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
              <div className={`text-7xl font-black tracking-tighter mb-4 ${calculateScore() >= 60 ? 'text-emerald-500' : 'text-rose-600'}`}>
                {calculateScore()}%
              </div>
              <div className="text-lg font-black text-slate-800 mb-6">
                {getCorrectCount()}/{questions.length} câu đúng
              </div>
              <Badge className={`text-base px-6 py-2 rounded-full font-black border-none shadow-lg ${calculateScore() >= 60 ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-rose-600 text-white shadow-rose-500/20'}`}>
                {calculateScore() >= 60 ? 'ĐẠT YÊU CẦU' : 'CHƯA ĐẠT'}
              </Badge>
              <p className="text-xs font-bold text-slate-400 mt-10 uppercase tracking-widest leading-relaxed">
                Đây là chế độ luyện tập,<br />kết quả không ảnh hưởng đến tiến độ.
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
