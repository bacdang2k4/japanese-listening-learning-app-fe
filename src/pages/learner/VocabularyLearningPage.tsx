import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Volume2,
  Eye,
  EyeOff,
  CheckCircle2,
  Shuffle,
  Loader2,
} from 'lucide-react';
import LearnerLayout from '../../components/learner/LearnerLayout';
import { learnerApi, VocabularyResponse } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const VocabularyLearningPage: React.FC = () => {
  const navigate = useNavigate();
  const { topicId } = useParams<{ topicId: string }>();

  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [learnedWords, setLearnedWords] = useState<number[]>([]);

  const fetchVocabularies = useCallback(async () => {
    if (!topicId) return;
    setLoading(true);
    try {
      const res = await learnerApi.getVocabulariesByTopic(Number(topicId));
      setVocabularies(res.data);
    } catch (err) {
      console.error('Failed to load vocabularies', err);
    } finally {
      setLoading(false);
    }
  }, [topicId]);

  useEffect(() => { fetchVocabularies(); }, [fetchVocabularies]);

  const currentVocab = vocabularies[currentIndex];
  const progress = vocabularies.length ? ((currentIndex + 1) / vocabularies.length) * 100 : 0;

  const handleNext = () => {
    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowMeaning(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowMeaning(false);
    }
  };

  const handleMarkLearned = () => {
    if (currentVocab && !learnedWords.includes(currentVocab.id)) {
      setLearnedWords([...learnedWords, currentVocab.id]);
    }
    handleNext();
  };

  const handleShuffle = () => {
    const randomIndex = Math.floor(Math.random() * vocabularies.length);
    setCurrentIndex(randomIndex);
    setShowMeaning(false);
  };

  const speakWord = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      speechSynthesis.speak(utterance);
    }
  };

  if (loading) {
    return (
      <LearnerLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </LearnerLayout>
    );
  }

  if (!vocabularies.length) {
    return (
      <LearnerLayout>
        <div className="text-center py-20 text-muted-foreground">
          Không có từ vựng nào trong chủ đề này.
        </div>
      </LearnerLayout>
    );
  }

  return (
    <LearnerLayout>
      <div className="max-w-4xl mx-auto py-8">
        <nav className="flex items-center text-sm font-medium text-muted-foreground mb-8">
          <Link to="/learn/vocabulary" className="hover:text-elsa-indigo-600 transition-colors">Từ vựng</Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground font-semibold">Học từ vựng</span>
        </nav>

        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-top-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Học từ vựng</h1>
            <div className="flex gap-2 items-center">
              <Badge variant="secondary" className="bg-elsa-indigo-50 text-elsa-indigo-600 border border-elsa-indigo-200">
                {vocabularies.length} từ vựng
              </Badge>
              <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                Đã thuộc: {learnedWords.length}/{vocabularies.length}
              </Badge>
            </div>
          </div>

          <div className="w-full md:w-48 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground font-medium">Từ {currentIndex + 1}/{vocabularies.length}</span>
              <span className="text-elsa-indigo-600 font-bold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="relative animate-in zoom-in-95 duration-500">
          <Card className={`mb-6 min-h-[400px] border-none shadow-elsa-lg transition-all duration-500 rounded-3xl ${showMeaning ? 'bg-elsa-indigo-50/50' : 'bg-white'}`}>
            <CardContent className="p-8 md:p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
              <div className="absolute top-6 right-6">
                {currentVocab && learnedWords.includes(currentVocab.id) && (
                  <Badge className="bg-emerald-500 hover:bg-emerald-600 shadow-sm">
                    <CheckCircle2 className="w-3 h-3 mr-1" /> Đã thuộc
                  </Badge>
                )}
              </div>

              <div className="mb-10 space-y-4">
                <h2 className="text-6xl md:text-8xl font-black bg-gradient-to-r from-elsa-indigo-600 to-elsa-purple-500 bg-clip-text text-transparent tracking-tight">
                  {currentVocab?.word}
                </h2>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl text-muted-foreground font-medium">
                    {currentVocab?.kana}
                  </span>
                  {currentVocab?.romaji && (
                    <span className="text-lg text-muted-foreground/60">({currentVocab.romaji})</span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-12 w-12 text-elsa-indigo-500 hover:bg-elsa-indigo-50 hover:text-elsa-indigo-600 transition-colors"
                    onClick={() => currentVocab && speakWord(currentVocab.word)}
                  >
                    <Volume2 className="h-6 w-6" />
                  </Button>
                </div>
              </div>

              <Button
                variant={showMeaning ? 'outline' : 'default'}
                size="lg"
                className="mb-8 h-12 rounded-full px-8 shadow-md bg-gradient-to-r from-elsa-indigo-500 to-elsa-indigo-600 hover:from-elsa-indigo-600 hover:to-elsa-indigo-700 border-none text-white"
                onClick={() => setShowMeaning(!showMeaning)}
              >
                {showMeaning ? (
                  <><EyeOff className="mr-2 h-5 w-5" /> Ẩn nghĩa</>
                ) : (
                  <><Eye className="mr-2 h-5 w-5" /> Xem nghĩa</>
                )}
              </Button>

              <div className={`w-full max-w-2xl transition-all duration-500 overflow-hidden ${showMeaning ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'}`}>
                <div className="bg-white border border-elsa-indigo-100 rounded-2xl p-6 shadow-elsa-sm">
                  <h3 className="text-3xl font-bold text-foreground mb-6">
                    {currentVocab?.meaning}
                  </h3>

                  {currentVocab?.exampleSentence && (
                    <div className="text-left bg-elsa-indigo-50/50 rounded-xl p-4 border border-elsa-indigo-100/50">
                      <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Ví dụ</div>
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <p className="text-lg font-medium leading-relaxed">{currentVocab.exampleSentence}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0 h-8 w-8 text-elsa-indigo-500 hover:bg-elsa-indigo-50"
                          onClick={() => currentVocab && speakWord(currentVocab.exampleSentence || '')}
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-3 md:gap-6 mb-8 animate-in slide-in-from-bottom-4">
          <Button variant="outline" className="h-14 md:text-lg rounded-xl border-elsa-indigo-200 hover:bg-elsa-indigo-50" onClick={handlePrevious} disabled={currentIndex === 0}>
            <ChevronLeft className="mr-1 h-5 w-5 hidden md:block" /> Trước
          </Button>
          <Button
            variant="default"
            className="h-14 md:text-lg rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md shadow-emerald-500/20 border-none"
            onClick={handleMarkLearned}
          >
            <CheckCircle2 className="mr-2 h-5 w-5" /> Đã thuộc
          </Button>
          <Button variant="outline" className="h-14 md:text-lg rounded-xl border-elsa-indigo-200 hover:bg-elsa-indigo-50" onClick={handleNext} disabled={currentIndex === vocabularies.length - 1}>
            Tiếp <ChevronRight className="ml-1 h-5 w-5 hidden md:block" />
          </Button>
        </div>

        <div className="flex justify-center items-center border-t border-elsa-indigo-100 pt-8">
          <Button variant="ghost" className="text-muted-foreground hover:text-elsa-indigo-600 hover:bg-elsa-indigo-50" onClick={() => navigate('/learn/vocabulary')}>
            ← Quay lại danh sách chủ đề
          </Button>
        </div>
      </div>
    </LearnerLayout>
  );
};

export default VocabularyLearningPage;
