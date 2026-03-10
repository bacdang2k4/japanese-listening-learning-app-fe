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
        learnerApi.getTopicsByLevel(Number(levelId), profileId),
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
        <nav className="flex items-center text-sm font-medium text-muted-foreground mb-8">
          <Link to="/learn" className="hover:text-primary transition-colors">
            Cấp độ
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground">{levelName}</span>
        </nav>

        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-6 shadow-sm">
            <BookOpen className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
            Chọn chủ đề - <span className="text-primary">{levelName}</span>
          </h1>
        </div>

        {topics.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            Chưa có chủ đề nào trong cấp độ này.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic, index) => {
              const tp = getTopicProgress(topic.id);
              const pct = computeTopicPct(tp);
              const isCompleted = tp?.status === 'PASS';

              return (
                <div
                  key={topic.id}
                  className="animate-in fade-in slide-in-from-bottom-8 duration-700"
                  style={{ animationFillMode: 'both', animationDelay: `${(index + 1) * 100}ms` }}
                >
                  <Card className="h-full border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-background/80 flex flex-col">
                    <CardContent className="p-6 flex flex-col h-full">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <Badge variant="outline" className="mb-2 text-primary border-primary/30 bg-primary/5">
                            Chủ đề {index + 1}
                          </Badge>
                          <h3 className="text-2xl font-bold tracking-tight line-clamp-1">{topic.topicName}</h3>
                        </div>
                        {isCompleted && (
                          <div className="bg-green-500/10 text-green-500 rounded-full p-1 animate-in zoom-in">
                            <CheckCircle2 className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground font-medium">Tiến độ học</span>
                          <span className={`font-bold ${isCompleted ? 'text-green-500' : 'text-primary'}`}>
                            {pct}%
                          </span>
                        </div>
                        <Progress value={pct} className="h-2" />
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6">
                        {tp && (
                          <Badge variant="secondary" className="font-normal text-xs bg-muted">
                            <PenTool className="w-3 h-3 mr-1" /> {tp.testCount} bài test
                          </Badge>
                        )}
                      </div>

                      <div className="mt-auto space-y-3">
                        <Button
                          className="w-full h-11 group"
                          onClick={() => navigate(`/learn/topic/${topic.id}`)}
                        >
                          <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                          Học từ vựng
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/learn/topic/${topic.id}/practice`)}
                          className="w-full font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        >
                          <Focus className="w-4 h-4 mr-1.5" />
                          Luyện tập
                        </Button>
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
