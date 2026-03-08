import React, { useState, useEffect, useRef } from 'react';
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
} from 'lucide-react';
import LearnerLayout from '../../components/learner/LearnerLayout';
import { mockQuestions, mockAudioTests, mockTopics } from '../../data/mockData';
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

interface Answer {
  questionId: string;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
}

const PracticeTestPage: React.FC = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();

  // Real implementation would use these:
  // const audioRef = useRef<HTMLAudioElement>(null);

  const topic = mockTopics.find(t => t.id === topicId);
  const test = mockAudioTests[0]; // Get first test for demo
  const questions = mockQuestions.filter(q => q.testId === test?.id);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>(
    questions.map(q => ({ questionId: q.id, selectedAnswer: null, isCorrect: null }))
  );

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
    if (showExplanation) return; // Prevent changing answer after selected in practice

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
      setShowExplanation(answers[currentQuestionIndex + 1]?.selectedAnswer !== null);
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

  if (!questions.length) {
    return (
      <LearnerLayout>
        <div className="text-center py-20">Không có câu hỏi nào.</div>
      </LearnerLayout>
    );
  }

  const isCompleted = currentAnswer?.selectedAnswer !== null;

  return (
    <LearnerLayout>
      <div className="max-w-3xl mx-auto py-8">

        {/* Header */}
        <div className="mb-8 text-center animate-in fade-in slide-in-from-top-4">
          <Badge variant="outline" className="mb-4 bg-primary/5 text-primary border-primary/20 px-4 py-1 text-sm font-medium">
            Chế độ luyện tập
          </Badge>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            {topic?.name} - Luyện nghe
          </h1>
          <p className="text-muted-foreground font-medium">
            Câu {currentQuestionIndex + 1} / {questions.length}
          </p>
          <Progress
            value={((currentQuestionIndex + 1) / questions.length) * 100}
            className="h-2 w-full max-w-md mx-auto mt-6"
          />
        </div>

        {/* Audio Player Card */}
        <Card className="mb-6 bg-primary text-primary-foreground border-none shadow-xl animate-in zoom-in-95 duration-500">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4 opacity-90">
              <Volume2 className="h-5 w-5" />
              <span className="font-semibold tracking-wide">PHẦN NGHE</span>
            </div>

            <div className="flex items-center gap-4 bg-primary-foreground/10 p-4 rounded-xl backdrop-blur-sm">
              <Button
                variant="secondary"
                size="icon"
                className="h-12 w-12 rounded-full shrink-0 shadow-sm hover:scale-105 transition-transform"
                onClick={handlePlayAudio}
              >
                {isPlaying ? <Pause className="h-6 w-6 text-primary" /> : <Play className="h-6 w-6 text-primary ml-1" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-primary-foreground hover:bg-primary-foreground/20 rounded-full shrink-0"
                onClick={handleReplayAudio}
                title="Nghe lại"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>

              <div className="flex-grow mx-2">
                <Slider
                  value={[audioProgress]}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="text-sm font-medium font-mono min-w-[60px] text-right">
                {Math.floor(audioProgress * 0.3)}s/30s
              </div>
            </div>

            <p className="text-primary-foreground/70 text-sm mt-4 text-center">
              Bạn có thể nghe lại nhiều lần trong chế độ luyện tập
            </p>
          </CardContent>
        </Card>

        {/* Question Card */}
        <div className="animate-in slide-in-from-bottom-8 duration-700">
          <Card className="mb-6 border-none shadow-lg">
            <CardContent className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-6 text-foreground leading-relaxed">
                {currentQuestionIndex + 1}. {currentQuestion?.content}
              </h2>

              <div className="space-y-3">
                {currentQuestion?.options.map((option, index) => {
                  const isSelected = currentAnswer?.selectedAnswer === index;
                  const isCorrect = index === currentQuestion.correctAnswer;
                  const showStatus = showExplanation && (isSelected || isCorrect);

                  let optionClasses = "relative flex items-center p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ";

                  if (showStatus) {
                    if (isCorrect) {
                      optionClasses += "border-green-500 bg-green-500/10";
                    } else if (isSelected) {
                      optionClasses += "border-red-500 bg-red-500/10";
                    }
                  } else {
                    optionClasses += isSelected
                      ? "border-primary bg-primary/5"
                      : "border-muted bg-background hover:border-primary/50 hover:bg-muted/50";
                  }

                  return (
                    <div
                      key={index}
                      className={optionClasses}
                      onClick={() => handleAnswerSelect(index)}
                    >
                      <div className="flex-grow flex items-center pr-8">
                        <span className="font-medium text-lg text-foreground">{option}</span>
                      </div>

                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {showStatus && isCorrect && <CheckCircle2 className="h-6 w-6 text-green-500 animate-in zoom-in" />}
                        {showStatus && isSelected && !isCorrect && <XCircle className="h-6 w-6 text-red-500 animate-in zoom-in" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Explanation Section */}
              {showExplanation && (
                <div className="mt-8 p-5 bg-blue-50/50 border border-blue-100 rounded-xl animate-in fade-in slide-in-from-top-4">
                  <h3 className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-2">
                    Giải thích
                  </h3>
                  <p className="text-blue-900 leading-relaxed">
                    {currentQuestion?.explanation}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Bottom Navigation */}
        <div className="flex justify-between items-center animate-in fade-in">
          <Button
            variant="outline"
            size="lg"
            className="h-14 px-6 rounded-xl"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            <ChevronLeft className="mr-2 h-5 w-5" /> Câu trước
          </Button>

          <Button
            size="lg"
            className="h-14 px-8 rounded-xl font-bold shadow-md"
            onClick={handleNext}
            disabled={!isCompleted}
          >
            {currentQuestionIndex === questions.length - 1 ? 'Hoàn thành' : 'Câu tiếp'}
            {currentQuestionIndex !== questions.length - 1 && <ChevronRight className="ml-2 h-5 w-5" />}
          </Button>
        </div>

        {/* Results Dialog */}
        <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
          <DialogContent className="sm:max-w-md text-center p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold mb-2">Kết quả luyện tập</DialogTitle>
              <DialogDescription className="text-base">
                Bạn đã hoàn thành bài luyện tập chủ đề {topic?.name}
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
                Đây là chế độ luyện tập, kết quả sẽ không được lưu vào hồ sơ.
              </p>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-3">
              <Button variant="outline" className="w-full h-12 text-base" onClick={() => navigate(-1)}>
                Quay lại
              </Button>
              <Button
                className="w-full h-12 text-base"
                onClick={() => {
                  setCurrentQuestionIndex(0);
                  setAnswers(questions.map(q => ({ questionId: q.id, selectedAnswer: null, isCorrect: null })));
                  setShowExplanation(false);
                  setResultDialogOpen(false);
                }}
              >
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
