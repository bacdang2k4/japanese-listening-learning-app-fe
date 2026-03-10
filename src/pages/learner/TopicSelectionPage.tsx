import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Play, ChevronRight, PenTool, Focus, Loader2 } from 'lucide-react';
import LearnerLayout from '../../components/learner/LearnerLayout';
import { learnerApi, TopicResponse, ProfileProgressResponse, TopicProgressItem } from '@/services/api';
import { getActiveProfileId } from '@/hooks/useActiveProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const TopicSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { levelId } = useParams<{ levelId: string }>();
  const profileId = getActiveProfileId();

  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [progress, setProgress] = useState<ProfileProgressResponse | null>(null);
  const [levelName, setLevelName] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!levelId || !profileId) return;
    setLoading(true);
    try {
      const [topicsRes, progressRes] = await Promise.all([
        learnerApi.getTopicsByLevel(Number(levelId)),
        learnerApi.getProfileProgress(profileId),
      ]);
      setTopics(topicsRes.data);
      setProgress(progressRes.data);

      const levelProgress = progressRes.data.levels.find(l => l.levelId === Number(levelId));
      setLevelName(levelProgress?.levelName || topicsRes.data[0]?.levelName || '');
    } catch (err) {
      console.error('Failed to load topics', err);
    } finally {
      setLoading(false);
    }
  }, [levelId, profileId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getTopicProgress = (topicId: number): TopicProgressItem | undefined => {
    if (!progress) return undefined;
    const levelProgress = progress.levels.find(l => l.levelId === Number(levelId));
    return levelProgress?.topics.find(t => t.topicId === topicId);
  };

  const computeTopicPct = (tp: TopicProgressItem | undefined): number => {
    if (!tp) return 0;
    if (tp.status === 'PASS') return 100;
    if (tp.testCount === 0) return 0;
    return Math.min(Math.round((tp.passedTestCount / Math.max(tp.testCount, 1)) * 100), 99);
  };

  const getLevelColor = (name: string) => {
    const n = name.toUpperCase();
    if (n.includes('N5')) return { primary: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-600' };
    if (n.includes('N4')) return { primary: '#0ea5e9', bg: 'bg-sky-50', text: 'text-sky-600' };
    if (n.includes('N3')) return { primary: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-600' };
    if (n.includes('N2')) return { primary: '#f97316', bg: 'bg-orange-50', text: 'text-orange-600' };
    if (n.includes('N1')) return { primary: '#f43f5e', bg: 'bg-rose-50', text: 'text-rose-600' };
    return { primary: '#6366f1', bg: 'bg-indigo-50', text: 'text-indigo-600' };
  };

  if (loading) {
    return (
      <LearnerLayout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-10 w-10 animate-spin text-slate-300" />
        </div>
      </LearnerLayout>
    );
  }

  const colors = getLevelColor(levelName);

  return (
    <LearnerLayout>
      <div className="max-w-6xl mx-auto py-8">
        <nav className="flex items-center text-xs font-bold text-slate-400 mb-8 px-4 uppercase tracking-widest">
          <Link to="/learn" className="hover:text-slate-800 transition-colors">Cấp độ</Link>
          <ChevronRight className="h-3 w-3 mx-2 opacity-50" />
          <span className="text-slate-800">{levelName}</span>
        </nav>

        <div className="max-w-6xl mx-auto py-12 px-4 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-[2rem] bg-slate-100 text-slate-600 mb-6 shadow-sm border-2 border-white">
            <BookOpen className="h-8 w-8" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4 text-slate-800 uppercase">
            {levelName}
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto font-bold opacity-80">
            Hãy chọn chủ đề bạn muốn rèn luyện hôm nay.
          </p>
        </div>

        {topics.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-xl rounded-[1.5rem] border border-dashed border-slate-200 mx-4">
            <p className="text-slate-400 font-bold">Chưa có chủ đề nào trong cấp độ này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 pb-20">
            {topics.map((topic, index) => {
              const tp = getTopicProgress(topic.id);
              const pct = computeTopicPct(tp);
              const isCompleted = tp?.status === 'PASS';

              // Varied cute palettes for diversity
              const palettes = [
                { primary: '#6366f1', shadow: 'shadow-indigo-500/20', bg: 'bg-indigo-50/50' },
                { primary: '#0ea5e9', shadow: 'shadow-sky-500/20', bg: 'bg-sky-50/50' },
                { primary: '#f43f5e', shadow: 'shadow-rose-500/20', bg: 'bg-rose-50/50' },
                { primary: '#10b981', shadow: 'shadow-emerald-500/20', bg: 'bg-emerald-50/50' },
                { primary: '#f59e0b', shadow: 'shadow-amber-500/20', bg: 'bg-amber-50/50' },
                { primary: '#8b5cf6', shadow: 'shadow-violet-500/20', bg: 'bg-violet-50/50' },
              ];
              const p = palettes[index % palettes.length];

              return (
                <div
                  key={topic.id}
                  className="animate-in fade-in slide-in-from-bottom-8 duration-600"
                  style={{ animationFillMode: 'both', animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <Card className="group h-full border border-slate-100/30 transition-all duration-300 rounded-[3rem] shadow-xl hover:-translate-y-1 hover:shadow-2xl bg-white/95 backdrop-blur-xl flex flex-col relative overflow-hidden">
                    <CardContent className="p-6 flex flex-col h-full relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <div className="space-y-1">
                          <div className="h-1 w-8 rounded-full mb-2.5" style={{ backgroundColor: p.primary }} />
                          <h3 className="text-2xl font-black tracking-tight text-slate-800 leading-tight">
                            {topic.topicName}
                          </h3>
                        </div>
                        {isCompleted ? (
                          <div className="bg-emerald-500 text-white rounded-[1.2rem] p-2.5 shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-[1.2rem] bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-100 transition-colors">
                            <div className="text-[10px] font-black" style={{ color: p.primary }}>#{index + 1}</div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 mb-8">
                        <div className="flex justify-between items-end">
                          <span className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">Tiến độ</span>
                          <span className="font-black text-xl" style={{ color: isCompleted ? '#10b981' : p.primary }}>
                            {pct}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100/50 rounded-full overflow-hidden shadow-inner p-0.5 border border-slate-100">
                          <div
                            className="h-full transition-all duration-1000 ease-out rounded-full shadow-sm"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: isCompleted ? '#10b981' : p.primary
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-8 pt-4 border-t border-slate-50">
                        {tp && (
                          <div className={`flex items-center px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest ${p.bg}`}>
                            <PenTool className="w-3.5 h-3.5 mr-2 opacity-50" style={{ color: p.primary }} />
                            <span style={{ color: p.primary }}>{tp.testCount} bài test</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-auto space-y-3">
                        <Button
                          className="w-full h-12 rounded-[1.2rem] text-xs font-black uppercase tracking-widest shadow-lg transition-all hover:scale-[1.02] active:scale-95"
                          style={{ backgroundColor: p.primary, boxShadow: `0 8px 20px -6px ${p.primary}60` }}
                          onClick={() => navigate(`/learn/topic/${topic.id}`)}
                        >
                          <Play className="w-4 h-4 mr-2 fill-white" />
                          Học kiến thức
                        </Button>
                        <div className="grid grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/learn/topic/${topic.id}/practice`)}
                            className="h-11 rounded-[1.2rem] border-slate-100 bg-white/50 hover:bg-white text-[9px] font-black uppercase tracking-widest text-slate-600 transition-all shadow-sm"
                          >
                            Luyện tập
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => navigate(`/learn/topic/${topic.id}/exam`)}
                            className="h-11 rounded-[1.2rem] bg-slate-100 hover:bg-slate-200 text-[9px] font-black uppercase tracking-widest text-slate-600 transition-all shadow-sm border border-slate-200/50"
                          >
                            <Focus className="w-3.5 h-3.5 mr-1.5" />
                            Thi thật
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </LearnerLayout>
  );
};

export default TopicSelectionPage;
