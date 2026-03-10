import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, CheckCircle2, Lock, Loader2, Play, BookOpen } from 'lucide-react';
import LearnerLayout from '../../components/learner/LearnerLayout';
import { learnerApi, LevelResponse, ProfileProgressResponse, LevelProgressItem } from '@/services/api';
import { getActiveProfileId } from '@/hooks/useActiveProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const LevelSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const profileId = getActiveProfileId();

  const [levels, setLevels] = useState<LevelResponse[]>([]);
  const [progress, setProgress] = useState<ProfileProgressResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) {
      navigate('/learn/profiles', { replace: true });
      return;
    }
  }, [profileId, navigate]);

  const fetchData = useCallback(async () => {
    if (!profileId) return;
    setLoading(true);
    try {
      const [levelsRes, progressRes] = await Promise.all([
        learnerApi.getLevels(),
        learnerApi.getProfileProgress(profileId),
      ]);
      setLevels(levelsRes.data);
      setProgress(progressRes.data);
    } catch (err) {
      console.error('Failed to load data', err);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getLevelProgress = (levelId: number): LevelProgressItem | undefined => {
    return progress?.levels.find(l => l.levelId === levelId);
  };

  const isLevelUnlocked = (levelId: number): boolean => {
    if (!progress) return false;
    return progress.levels.some(l => l.levelId === levelId);
  };

  const computeProgress = (lp: LevelProgressItem | undefined): number => {
    if (!lp || !lp.topics.length) return 0;
    const passed = lp.topics.filter(t => t.status === 'PASS').length;
    return Math.round((passed / lp.topics.length) * 100);
  };

  const getLevelColor = (levelName: string) => {
    const name = levelName.toUpperCase();
    if (name.includes('N5')) return { primary: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-600', shadow: 'shadow-emerald-500/20' };
    if (name.includes('N4')) return { primary: '#0ea5e9', bg: 'bg-sky-50', text: 'text-sky-600', shadow: 'shadow-sky-500/20' };
    if (name.includes('N3')) return { primary: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-600', shadow: 'shadow-amber-500/20' };
    if (name.includes('N2')) return { primary: '#f97316', bg: 'bg-orange-50', text: 'text-orange-600', shadow: 'shadow-orange-500/20' };
    if (name.includes('N1')) return { primary: '#f43f5e', bg: 'bg-rose-50', text: 'text-rose-600', shadow: 'shadow-rose-500/20' };
    return { primary: '#6366f1', bg: 'bg-indigo-50', text: 'text-indigo-600', shadow: 'shadow-indigo-500/20' };
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

  return (
    <LearnerLayout>
      <div className="animate-in fade-in duration-700">
        <div className="max-w-6xl mx-auto py-12 px-4 text-center">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-[2rem] bg-slate-100 text-slate-600 mb-6 shadow-sm border-2 border-white">
            <School className="h-8 w-8" />
          </div>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter mb-4 text-slate-800 uppercase">Chọn cấp độ học</h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto font-bold opacity-80">
            Hãy chọn mục tiêu của bạn hôm nay để bắt đầu hành trình.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 pb-20 max-w-7xl mx-auto">
          {levels.map((level, index) => {
            const lp = getLevelProgress(level.id);
            const unlocked = isLevelUnlocked(level.id);
            const pct = computeProgress(lp);
            const isCompleted = lp?.status === 'PASS';
            const topicCount = lp?.topics?.length ?? 0;
            const colors = getLevelColor(level.levelName);

            return (
              <div
                key={level.id}
                className="animate-in fade-in slide-in-from-bottom-8 duration-500"
                style={{ animationFillMode: 'both', animationDelay: `${(index + 1) * 100}ms` }}
              >
                <Card
                  className={`group relative overflow-hidden h-full border border-slate-100/30 transition-all duration-300 rounded-[3rem] shadow-xl ${unlocked
                    ? 'cursor-pointer hover:-translate-y-1 hover:shadow-2xl bg-white/95 backdrop-blur-xl'
                    : 'opacity-60 grayscale-[50%] bg-slate-50/50 border-dashed border-2'
                    }`}
                  onClick={() => unlocked && navigate(`/learn/level/${level.id}/topics`)}
                >
                  <CardContent className="p-6 flex flex-col h-full relative z-10">
                    <div className="flex justify-between items-start mb-5">
                      <div className="space-y-1">
                        <div className="h-1 w-8 rounded-full mb-2.5" style={{ backgroundColor: colors.primary }} />
                        <h3 className={`text-4xl font-black tracking-tighter transition-colors duration-300 ${unlocked ? 'text-slate-800' : 'text-slate-400'}`}>
                          {level.levelName}
                        </h3>
                        <p className="text-slate-400 font-bold uppercase tracking-[0.15em] text-[8px]">Cấp độ tiếng Nhật</p>
                      </div>

                      <div className="flex flex-col items-end">
                        {isCompleted ? (
                          <div className="bg-emerald-500 text-white rounded-[1.2rem] p-2.5 shadow-lg shadow-emerald-500/20">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        ) : !unlocked ? (
                          <div className="bg-slate-200 text-slate-400 rounded-[1.2rem] p-2.5">
                            <Lock className="h-5 w-5" />
                          </div>
                        ) : (
                          <div className={`text-white rounded-[1.2rem] p-2.5 shadow-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                            style={{ backgroundColor: colors.primary, boxShadow: `0 8px 16px -4px ${colors.primary}60` }}>
                            <Play className="h-5 w-5 fill-current" />
                          </div>
                        )}
                      </div>
                    </div>

                    {unlocked && (
                      <div className="space-y-3 mb-5">
                        <div className="flex justify-between items-end">
                          <span className="text-slate-400 font-bold uppercase tracking-widest text-[8px]">Tiến độ</span>
                          <span className="font-black text-xl" style={{ color: isCompleted ? '#10b981' : colors.primary }}>
                            {pct}%
                          </span>
                        </div>
                        <div className="h-2 w-full bg-slate-100/50 rounded-full overflow-hidden shadow-inner p-0.5 border border-slate-100">
                          <div
                            className="h-full transition-all duration-1000 ease-out rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: isCompleted ? '#10b981' : colors.primary,
                            }}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-50">
                      {topicCount > 0 && (
                        <div className={`flex items-center px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${colors.bg} ${colors.text}`}>
                          <BookOpen className="w-3.5 h-3.5 mr-2" /> {topicCount} chủ đề
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </LearnerLayout>
  );
};

export default LevelSelectionPage;
