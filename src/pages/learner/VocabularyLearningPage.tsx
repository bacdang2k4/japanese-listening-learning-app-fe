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
  Play,
  Focus,
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
      <div className="max-w-4xl mx-auto py-8 relative z-10 px-4">
        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center text-xs font-bold text-slate-400 mb-10 px-0 uppercase tracking-widest">
          <Link to="/learn" className="hover:text-slate-800 transition-colors">TRANG CHỦ</Link>
          <ChevronRight className="h-3 w-3 mx-2 opacity-50" />
          <span className="text-slate-800">TỪ VỰNG</span>
        </nav>

        <div className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-10 animate-in fade-in slide-in-from-top-6 duration-700 bg-white/70 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/80 shadow-2xl shadow-indigo-200/20 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-sky-200/20 rounded-full blur-3xl opacity-60" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-pink-200/20 rounded-full blur-3xl opacity-60" />

          <div className="space-y-5 relative z-10 text-left">
            <h1 className="text-4xl font-black tracking-tighter text-slate-700 uppercase leading-none">Học từ vựng</h1>
            <div className="flex flex-wrap gap-2.5 items-center">
              <Badge className="bg-sky-100 text-sky-600 border border-sky-200/50 px-5 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-sm">
                {vocabularies.length} TỪ VỰNG
              </Badge>
              <Badge className="bg-white text-slate-400 border border-slate-100 px-5 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-sm">
                ĐÃ THUỘC: {learnedWords.length}/{vocabularies.length}
              </Badge>
              <Badge className="bg-emerald-100 text-emerald-600 border border-emerald-200/50 px-5 py-2 rounded-full font-black text-[9px] uppercase tracking-widest shadow-sm">
                {Math.round(progress)}% HOÀN TẤT
              </Badge>
            </div>
          </div>

          <div className="w-full lg:w-80 space-y-3 relative z-10">
            <div className="flex justify-between items-end px-1">
              <span className="text-slate-400 font-black uppercase tracking-[0.2em] text-[8px] opacity-70">Tiến trình học</span>
              <span className="text-sky-500 font-black text-3xl tracking-tighter leading-none">{Math.round(progress)}%</span>
            </div>
            <div className="h-3 w-full bg-white/50 rounded-full overflow-hidden shadow-inner p-1 border border-white/80">
              <div
                className="h-full bg-gradient-to-r from-sky-300 via-indigo-300 to-purple-300 rounded-full transition-all duration-1000 shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        <Card className={`mb-10 min-h-[480px] border border-white/80 shadow-3xl shadow-slate-200/20 transition-all duration-700 rounded-[3.5rem] overflow-hidden ${showMeaning ? 'bg-sky-50/20' : 'bg-white/80'} backdrop-blur-2xl relative`}>
          {/* Decorative background for card */}
          <div className={`absolute inset-0 opacity-[0.01] pointer-events-none transition-opacity duration-1000 ${showMeaning ? 'opacity-[0.02]' : 'opacity-[0.01]'}`}>
            <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1528642463366-83ca48e22709?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center grayscale" />
          </div>

          <CardContent className="p-10 md:p-14 flex flex-col items-center justify-center text-center h-full min-h-[480px] relative z-10">
            <div className="absolute top-10 right-10">
              {currentVocab && learnedWords.includes(currentVocab.id) && (
                <div className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-emerald-50/80 text-emerald-600 text-[10px] font-black shadow-sm border border-emerald-100/50 animate-in fade-in zoom-in duration-500 backdrop-blur-md">
                  <CheckCircle2 className="w-4 h-4" /> ĐÃ THUỘC
                </div>
              )}
            </div>

            <div className="mb-10 space-y-6">
              <h2 className="text-6xl md:text-7xl font-black text-slate-700 tracking-tighter drop-shadow-sm leading-none">
                {currentVocab?.word}
              </h2>
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-4 bg-white/40 px-6 py-2.5 rounded-[1.5rem] border border-white/80 shadow-sm backdrop-blur-md">
                  <span className="text-2xl text-slate-600 font-extrabold tracking-tight">{currentVocab?.kana}</span>
                  {currentVocab?.romaji && (
                    <span className="text-lg text-slate-300 font-bold uppercase tracking-[0.2em] opacity-80">({currentVocab.romaji})</span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-16 w-16 bg-sky-400 text-white hover:bg-sky-500 shadow-xl shadow-sky-400/20 active:scale-90 transition-all border-4 border-white"
                  onClick={() => currentVocab && speakWord(currentVocab.word)}
                >
                  <Volume2 className="h-8 w-8" />
                </Button>
              </div>
            </div>

            <Button
              variant="outline"
              className={`mb-12 h-14 rounded-full px-12 shadow-sm text-[10px] font-black tracking-[0.2em] uppercase transition-all duration-500 hover:scale-105 active:scale-95 border-2 ${showMeaning ? 'bg-slate-50 border-slate-100 text-slate-400' : 'bg-white border-sky-100 text-sky-500 hover:border-sky-200'
                }`}
              onClick={() => setShowMeaning(!showMeaning)}
            >
              {showMeaning ? (
                <><EyeOff className="mr-3 h-5 w-5" /> ẨN NGHĨA</>
              ) : (
                <><Eye className="mr-3 h-5 w-5" /> XEM NGHĨA</>
              )}
            </Button>

            <div className={`w-full max-w-2xl transition-all duration-700 ease-[cubic-bezier(0.87,0,0.13,1)] overflow-hidden ${showMeaning ? 'opacity-100 max-h-[500px]' : 'opacity-0 max-h-0'}`}>
              <div className="bg-white/100 rounded-[2.5rem] p-8 shadow-2xl shadow-sky-900/5 border border-white">
                <h3 className="text-3xl font-black text-slate-700 mb-6 tracking-tight leading-tight">
                  {currentVocab?.meaning}
                </h3>

                {currentVocab?.exampleSentence && (
                  <div className="text-left bg-sky-50/20 rounded-[2rem] p-8 border border-sky-100/30">
                    <div className="text-[9px] font-black uppercase tracking-[0.3em] text-sky-400/80 mb-4">VÍ DỤ SỬ DỤNG</div>
                    <div className="flex items-start justify-between gap-8">
                      <p className="text-xl font-bold leading-relaxed text-slate-600">{currentVocab.exampleSentence}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-12 w-12 bg-white text-sky-400 shadow-xl rounded-2xl hover:bg-white hover:scale-110 active:scale-95 transition-all border border-sky-50"
                        onClick={() => currentVocab && speakWord(currentVocab.exampleSentence || '')}
                      >
                        <Volume2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative z-10">
          <Button
            className="h-16 text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.8rem] bg-white text-slate-400 border-none shadow-xl hover:bg-white hover:text-slate-600 hover:-translate-x-1 active:scale-95 transition-all disabled:opacity-30 disabled:translate-x-0"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="mr-3 h-5 w-5" /> TRƯỚC
          </Button>
          <Button
            className="h-16 text-sm font-black uppercase tracking-widest rounded-[1.8rem] bg-emerald-400 hover:bg-emerald-500 text-white shadow-2xl shadow-emerald-400/20 active:scale-95 transition-all group"
            onClick={handleMarkLearned}
          >
            <CheckCircle2 className="mr-3 h-5 w-5 fill-white text-emerald-400 group-hover:scale-110 transition-transform" />
            ĐÃ THUỘC
          </Button>
          <Button
            className="h-16 text-[10px] font-black uppercase tracking-[0.2em] rounded-[1.8rem] bg-sky-450 text-white border-none shadow-xl shadow-sky-400/20 bg-sky-500 hover:bg-sky-600 hover:translate-x-1 active:scale-95 transition-all disabled:bg-white disabled:text-slate-400 disabled:shadow-xl disabled:translate-x-0 disabled:opacity-30"
            onClick={handleNext}
            disabled={currentIndex === vocabularies.length - 1}
          >
            TIẾP THEO <ChevronRight className="ml-3 h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-t border-slate-100 pt-10">
          <Button variant="ghost" className="text-slate-400 font-bold text-[10px] uppercase tracking-widest h-10 hover:bg-slate-50" onClick={handleShuffle}>
            <Shuffle className="mr-2 h-4 w-4" /> Xáo trộn thứ tự
          </Button>
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => navigate(`/learn/topic/${topicId}/practice`)}
              className="font-black text-[10px] uppercase tracking-widest h-11 rounded-xl px-6 bg-white/50 border-slate-200 shadow-sm hover:bg-white transition-all"
            >
              LUYỆN TẬP
            </Button>
            <Button
              onClick={() => navigate(`/learn/topic/${topicId}/exam`)}
              className="font-black text-[10px] uppercase tracking-widest h-11 rounded-xl px-6 bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-all hover:scale-105"
            >
              <Focus className="w-4 h-4 mr-2" /> THI THỬ
            </Button>
          </div>
        </div>
      </div>
    </LearnerLayout>
  );
};

export default VocabularyLearningPage;
