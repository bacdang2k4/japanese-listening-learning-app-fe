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

  const [phase, setPhase] = useState<Phase>('loading');
  const [tests, setTests] = useState<TestSummaryResponse[]>([]);
  const [selectedTest, setSelectedTest] = useState<TestSummaryResponse | null>(null);
  const [testInfo, setTestInfo] = useState<StartTestResponse | null>(null);
  const [questions, setQuestions] = useState<LearnerQuestionResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(30 * 60);
  const [error, setError] = useState('');

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioPlayed, setAudioPlayed] = useState<boolean[]>([]);

  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ score: number; isPassed: boolean } | null>(null);

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
      const startRes = await learnerApi.startTest(selectedTest.testId, { profileId, mode: 'EXAM' });
      setTestInfo(startRes.data);
      setTimeRemaining((startRes.data.duration || 30 * 60));

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

  // Timer
  useEffect(() => {
    if (phase !== 'in-progress') return;
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase]);

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

  const handleSubmit = async () => {
    if (!testInfo || !profileId) return;
    setConfirmSubmitOpen(false);
    setPhase('submitting');
    try {
      const payload: LearnerAnswerRequest[] = answers.map(a => ({
        questionId: a.questionId,
        selectedAnswerId: a.selectedAnswerId,
      }));
      const res = await learnerApi.submitTest(testInfo.resultId, { profileId, answers: payload });
      setSubmitResult({ score: res.data.score, isPassed: res.data.isPassed });
      setResultDialogOpen(true);
      setPhase('in-progress');
    } catch (err: any) {
      setError(err.message);
      setPhase('in-progress');
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
          <Card className="border-none shadow-3xl animate-in zoom-in-95 duration-500 overflow-hidden bg-white/80 backdrop-blur-2xl rounded-[3rem]">
            <div className="h-2 bg-amber-400 w-full" />
            <CardContent className="p-8 text-center pt-10">
              <div className="w-24 h-24 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-amber-100">
                <AlertTriangle className="w-12 h-12" />
              </div>
              <h1 className="text-3xl font-black mb-2 text-slate-700">Thi thật - {selectedTest.testName}</h1>
              <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mb-8">Bạn chuẩn bị bắt đầu bài thi chính thức</p>

              <Alert className="text-left bg-amber-50 text-amber-700 border border-amber-200 mb-8 rounded-[2.5rem] shadow-sm">
                <AlertTitle className="font-black flex items-center mb-2 text-amber-800 uppercase tracking-widest text-[11px]">
                  <AlertTriangle className="h-4 w-4 mr-3 text-amber-500" />
                  LƯU Ý QUAN TRỌNG
                </AlertTitle>
                <AlertDescription className="text-amber-700/80 font-bold">
                  <ul className="list-disc pl-5 space-y-2 mt-3 decoration-amber-100">
                    <li className="font-bold">Thời gian làm bài: {selectedTest.duration ? `${Math.floor(selectedTest.duration / 60)} phút` : '30 phút'}.</li>
                    <li className="font-bold underline">Mỗi phần nghe chỉ được phát 1 lần duy nhất.</li>
                    <li className="font-bold">Điểm tối thiểu để đỗ: {selectedTest.passCondition || 80}%.</li>
                    <li className="font-bold opacity-90">Kết quả sẽ được lưu vào lịch sử học tập.</li>
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

        <div className="sticky top-[72px] z-40 bg-white/95 backdrop-blur-md py-3 px-6 mt-2 mx-auto max-w-5xl animate-in slide-in-from-top-4 rounded-[2rem] shadow-xl border border-slate-100 mb-8">
          <div className="flex flex-row justify-between items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-0.5">
                <Badge className="bg-rose-50 text-rose-500 border border-rose-100 uppercase tracking-[0.1em] text-[8px] px-3 py-1.5 rounded-full font-black shadow-sm">THI THẬT</Badge>
                <h1 className="text-lg font-black text-slate-700 tracking-tighter truncate max-w-[200px] md:max-w-md">{testInfo?.testName}</h1>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 leading-none">Câu {currentQuestionIndex + 1} / {questions.length}</p>
            </div>
            <div className={`flex items-center gap-2.5 px-6 py-2.5 rounded-full font-black text-base tracking-tight shadow-sm border transition-all duration-500 ${isTimeLow ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse ring-4 ring-rose-50' : 'bg-white border-slate-100 text-slate-600'}`}>
              <TimerIcon className={`h-5 w-5 ${isTimeLow ? 'text-rose-500' : 'text-sky-400'}`} />
              <span className="font-mono">{formatTime(timeRemaining)}</span>
            </div>
          </div>
          <Progress value={((currentQuestionIndex + 1) / questions.length) * 100} className="h-1 mt-3 bg-slate-100" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-6">
            {testInfo?.audioUrl && (
              <Card className={`border-none shadow-3xl transition-all duration-700 rounded-[3.5rem] overflow-hidden relative group ${audioPlayed[currentQuestionIndex] ? 'bg-slate-50 shadow-slate-200/50' : 'bg-gradient-to-br from-sky-400 via-sky-500 to-indigo-500 text-white shadow-sky-400/20'}`}>
                {/* Decorative blob */}
                {!audioPlayed[currentQuestionIndex] && <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/20 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000" />}

                <CardContent className="p-8 relative z-10">
                  <div className="flex items-center gap-3 mb-6 opacity-90">
                    <div className={`w-8 h-8 rounded-[1rem] flex items-center justify-center shadow-inner ${audioPlayed[currentQuestionIndex] ? 'bg-white text-slate-400' : 'bg-white/20 text-white'}`}>
                      <Volume2 className="h-5 w-5" />
                    </div>
                    <span className="font-black text-[9px] uppercase tracking-[0.2em]">PHẦN NGHE</span>
                    {audioPlayed[currentQuestionIndex] && (
                      <Badge className="ml-auto bg-slate-900/10 text-slate-500 border-none px-4 py-1.5 text-[9px] font-black rounded-full">ĐÃ PHÁT</Badge>
                    )}
                  </div>
                  <div className={`flex items-center gap-5 p-6 rounded-[2.8rem] backdrop-blur-xl border-2 ${audioPlayed[currentQuestionIndex] ? 'bg-white/40 border-slate-200/50' : 'bg-white/10 border-white/20 shadow-2xl'}`}>
                    <Button
                      variant={audioPlayed[currentQuestionIndex] ? 'outline' : 'secondary'}
                      size="icon"
                      className={`h-16 w-16 rounded-full shrink-0 shadow-2xl transition-all duration-300 ${audioPlayed[currentQuestionIndex] ? 'border-slate-200 text-slate-300' : 'bg-white text-sky-500 hover:scale-110 active:scale-95'}`}
                      onClick={handlePlayAudio}
                      disabled={audioPlayed[currentQuestionIndex]}
                    >
                      {isPlaying ? <Pause className="h-8 w-8" /> : <Play className={`h-8 w-8 ml-1 ${audioPlayed[currentQuestionIndex] ? '' : ''}`} />}
                    </Button>
                    <div className="flex-grow mx-4">
                      <Slider value={[audioDuration ? (audioProgress / audioDuration) * 100 : 0]} max={100} disabled className={audioPlayed[currentQuestionIndex] ? 'opacity-30' : ''} />
                    </div>
                  </div>
                  {!audioPlayed[currentQuestionIndex] && (
                    <div className="bg-white/10 mt-6 py-2.5 px-6 rounded-full border border-white/10 flex items-center justify-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-300" />
                      <p className="text-white font-black text-[9px] uppercase tracking-widest">
                        Lưu ý: Chỉ được nghe duy nhất 1 lần.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="border-none shadow-3xl shadow-slate-200/50 rounded-[3.5rem] bg-white/90 backdrop-blur-2xl overflow-hidden ring-1 ring-black/5">
              <CardContent className="p-10 md:p-12">
                <h2 className="text-xl font-black mb-8 text-slate-700 leading-tight tracking-tight">
                  <span className="text-sky-500 mr-3 font-black bg-sky-50 px-4 py-1.5 rounded-xl border border-sky-100 shadow-sm inline-block mb-3">{currentQuestionIndex + 1}</span>
                  {currentQuestion?.content}
                </h2>
                <div className="space-y-4">
                  {currentQuestion?.answers.map(option => {
                    const isSelected = currentAnswer?.selectedAnswerId === option.answerId;
                    return (
                      <div
                        key={option.answerId}
                        className={`relative flex items-center p-6 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md ${isSelected ? 'border-indigo-500 bg-indigo-50 shadow-indigo-100/50' : 'border-slate-50 bg-white/70 hover:border-indigo-200 hover:bg-white'}`}
                        onClick={() => handleAnswerSelect(option.answerId)}
                      >
                        <div className="flex-grow flex items-center pr-10">
                          <span className={`text-base transition-colors duration-300 ${isSelected ? 'font-black text-sky-600' : 'font-bold text-slate-600'}`}>{option.content}</span>
                        </div>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${isSelected ? 'border-sky-400 bg-sky-400 scale-110 shadow-lg shadow-sky-400/20' : 'border-slate-200 bg-white'}`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center gap-4 lg:hidden mt-10 mb-12">
              <div className="flex gap-4">
                <Button variant="outline" size="lg" className="h-16 w-16 p-0 rounded-full border-2 bg-white/60 shadow-xl" onClick={handlePrevious} disabled={currentQuestionIndex === 0}><ChevronLeft className="h-6 w-6" /></Button>
                <Button variant="outline" size="lg" className="h-16 w-16 p-0 rounded-full border-2 bg-white/60 shadow-xl" onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1}><ChevronRight className="h-6 w-6" /></Button>
              </div>
              <Button size="lg" className="h-16 px-10 rounded-full font-black text-base tracking-widest shadow-2xl bg-rose-500 text-white hover:bg-rose-600 active:scale-95 transition-all" onClick={() => setConfirmSubmitOpen(true)}>NỘP BÀI</Button>
            </div>
          </div>

          <div className="hidden lg:block lg:col-span-4 sticky top-[160px]">
            <Card className="border-none shadow-3xl shadow-slate-200/50 rounded-[3rem] bg-white/80 backdrop-blur-xl border-2 border-white/60 overflow-hidden">
              <CardHeader className="pb-4 px-8 pt-8 border-b border-slate-100">
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex justify-between items-center">
                  <span>DANH SÁCH CÂU HỎI</span>
                  <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{answers.filter(a => a.selectedAnswerId !== null).length}/{questions.length}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-5 gap-3">
                  {questions.map((_, index) => {
                    const isAnswered = answers[index]?.selectedAnswerId !== null;
                    const isCurrent = currentQuestionIndex === index;
                    return (
                      <Button
                        key={index}
                        variant={isCurrent ? 'default' : isAnswered ? 'secondary' : 'outline'}
                        className={`h-11 w-full p-0 font-black rounded-2xl transition-all duration-300 ${isCurrent
                          ? 'bg-slate-900 text-white shadow-xl scale-110'
                          : isAnswered
                            ? 'bg-emerald-500 text-white border-none shadow-lg'
                            : 'bg-white text-slate-400 border-2 border-slate-100 hover:border-indigo-200 hover:text-indigo-600'
                          }`}
                        onClick={() => { setCurrentQuestionIndex(index); setAudioProgress(0); setIsPlaying(false); }}
                      >
                        {index + 1}
                      </Button>
                    );
                  })}
                </div>
                <div className="mt-10 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button variant="ghost" className="rounded-full font-black text-[10px] tracking-widest bg-slate-100 hover:bg-slate-200" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>TRƯỚC</Button>
                    <Button variant="ghost" className="rounded-full font-black text-[10px] tracking-widest bg-slate-100 hover:bg-slate-200" onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1}>TIẾP</Button>
                  </div>
                  <Button className="w-full text-xs font-black tracking-[0.2em] shadow-2xl h-14 rounded-full bg-rose-500 hover:bg-rose-600 text-white transition-all transform hover:scale-[1.02] active:scale-95" onClick={() => setConfirmSubmitOpen(true)}>
                    NỘP BÀI THI
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
            <div className="py-6">
              <div className="flex justify-between items-center mb-6 text-base font-black border-b border-slate-100 pb-5">
                <span className="text-slate-400 uppercase tracking-widest text-[10px]">Thời gian còn lại:</span>
                <span className="text-rose-600 text-2xl font-mono">{formatTime(timeRemaining)}</span>
              </div>
              {getUnansweredCount() > 0 ? (
                <Alert variant="destructive" className="bg-rose-600 text-white border-none rounded-[2rem] shadow-xl shadow-rose-500/20 py-6">
                  <AlertTriangle className="h-6 w-6 text-white" />
                  <AlertTitle className="font-black text-lg mb-1">CHƯA HOÀN THÀNH!</AlertTitle>
                  <AlertDescription className="font-bold opacity-90">Bạn còn <span className="text-white underline decoration-rose-300 decoration-2 underline-offset-4 font-black">{getUnansweredCount()} câu</span> chưa trả lời. Bạn vẫn muốn nộp bài?</AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-emerald-500 text-white border-none rounded-[2rem] shadow-xl shadow-emerald-500/20 py-6">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                  <AlertTitle className="font-black text-lg mb-1">TUYỆT VỜI!</AlertTitle>
                  <AlertDescription className="font-bold opacity-90">Bạn đã hoàn thành tất cả các câu hỏi. Sẵn sàng nộp bài?</AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" className="w-full h-11" onClick={() => setConfirmSubmitOpen(false)}>Quay lại làm tiếp</Button>
              <Button variant="destructive" className="w-full h-11" onClick={handleSubmit}>Xác nhận nộp bài</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Result */}
        <Dialog open={resultDialogOpen} onOpenChange={() => { }}>
          <DialogContent className="sm:max-w-md text-center p-8 [&>button]:hidden">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">Kết quả bài thi</DialogTitle>
              <DialogDescription className="text-base">Chủ đề: {testInfo?.testName}</DialogDescription>
            </DialogHeader>
            <div className="py-6">
              <div className={`text-5xl font-black tracking-tighter mb-4 ${(submitResult?.isPassed) ? 'text-emerald-400' : 'text-rose-400'}`}>
                {submitResult?.score ?? 0}%
              </div>
              <Badge className={`text-[10px] px-5 py-2 shadow-sm uppercase tracking-widest font-black ${submitResult?.isPassed ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                {submitResult?.isPassed ? 'HOÀN THÀNH (ĐẠT)' : 'CHƯA ĐẠT KẾT QUẢ'}
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
