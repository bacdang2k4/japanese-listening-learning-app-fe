import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, CheckCircle2, Lock, Loader2 } from 'lucide-react';
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

  const getLevelOpacity = (index: number) => {
    const opacities = [10, 15, 20, 30, 40];
    return opacities[index] || 10;
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

  return (
    <LearnerLayout>
      <div className="max-w-6xl mx-auto py-8">
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-6">
            <School className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4">Chọn cấp độ học</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hãy chọn cấp độ phù hợp với trình độ của bạn để bắt đầu hành trình chinh phục tiếng Nhật.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level, index) => {
            const lp = getLevelProgress(level.id);
            const unlocked = isLevelUnlocked(level.id);
            const pct = computeProgress(lp);
            const isCompleted = lp?.status === 'PASS';
            const opacity = getLevelOpacity(index);
            const topicCount = lp?.topics.length ?? 0;

            return (
              <div
                key={level.id}
                className="animate-in fade-in slide-in-from-bottom-8 duration-700"
                style={{ animationFillMode: 'both', animationDelay: `${(index + 1) * 100}ms` }}
              >
                <Card
                  className={`relative overflow-hidden h-full border transition-all duration-300 shadow-sm ${unlocked
                    ? 'cursor-pointer hover:-translate-y-2 hover:shadow-xl bg-background'
                    : 'opacity-60 grayscale-[50%] bg-muted/50'
                    }`}
                  onClick={() => unlocked && navigate(`/learn/level/${level.id}/topics`)}
                >
                  <div className="h-1.5 w-full bg-primary" style={{ opacity: opacity / 100 + 0.4 }} />

                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-4xl font-extrabold tracking-tight text-primary">
                        {level.levelName}
                      </h3>
                      {isCompleted ? (
                        <CheckCircle2 className="h-7 w-7 text-primary" />
                      ) : !unlocked ? (
                        <Lock className="h-7 w-7 text-muted-foreground" />
                      ) : null}
                    </div>

                    {unlocked && (
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground font-medium">Tiến độ</span>
                          <span className="font-bold">{pct}%</span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-auto pt-4">
                      {topicCount > 0 && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                          {topicCount} chủ đề
                        </Badge>
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
