import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Play,
  Mic,
  FileText,
  Loader2,
  Info,
  Sparkles,
} from 'lucide-react';
import LearnerLayout from '../../components/learner/LearnerLayout';
import {
  learnerApi,
  TopicResponse,
  ProfileProgressResponse,
  TopicProgressItem,
  TestSummaryResponse,
} from '@/services/api';
import { getActiveProfileId } from '@/hooks/useActiveProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type LessonType = 'vocabulary' | 'practice';

interface LessonItem {
  id: string;
  title: string;
  type: LessonType;
  typeLabel: string;
  testId?: number;
  isCompleted?: boolean;
  isNext?: boolean;
}

const RoadmapPage: React.FC = () => {
  const navigate = useNavigate();
  const profileId = getActiveProfileId();

  const [progress, setProgress] = useState<ProfileProgressResponse | null>(null);
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [topicTests, setTopicTests] = useState<Record<number, TestSummaryResponse[]>>({});
  const [loading, setLoading] = useState(true);

  const learnerInfo = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('learner');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  }, []);

  const displayName = learnerInfo?.firstName || learnerInfo?.lastName || 'Bạn';

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
      const [progressRes, levelsRes] = await Promise.all([
        learnerApi.getProfileProgress(profileId),
        learnerApi.getLevels(),
      ]);
      setProgress(progressRes.data);

      const currentLevel = progressRes.data.levels.find(
        (l) => l.status === 'LEARNING' || l.status === 'PASS'
      ) || progressRes.data.levels[0];

      if (currentLevel) {
        const topicsRes = await learnerApi.getTopicsByLevel(currentLevel.levelId, profileId);
        setTopics(topicsRes.data);

        const testsMap: Record<number, TestSummaryResponse[]> = {};
        for (const topic of topicsRes.data) {
          try {
            const testsRes = await learnerApi.getTestsByTopic(topic.id);
            testsMap[topic.id] = testsRes.data.content || [];
          } catch {
            testsMap[topic.id] = [];
          }
        }
        setTopicTests(testsMap);
      }
    } catch (err) {
      console.error('Failed to load roadmap', err);
    } finally {
      setLoading(false);
    }
  }, [profileId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getTopicProgress = (topicId: number): TopicProgressItem | undefined => {
    if (!progress) return undefined;
    return progress.levels.flatMap((l) => l.topics).find((t) => t.topicId === topicId);
  };

  const getLessonsForTopic = (topic: TopicResponse): LessonItem[] => {
    const tp = getTopicProgress(topic.id);
    const isUnlocked = topic.isUnlocked !== false;
    const tests = topicTests[topic.id] || [];
    const isTopicPassed = tp?.status === 'PASS';
    const nextIndex = !isUnlocked
      ? -1
      : (isTopicPassed ? -1 : (tp?.passedTestCount ?? 0));

    const lessons: LessonItem[] = [
      {
        id: `vocab-${topic.id}`,
        title: `Bài học 1 - Học từ vựng: ${topic.topicName}`,
        type: 'vocabulary',
        typeLabel: 'Từ vựng',
        isCompleted: nextIndex > 0,
        isNext: nextIndex === 0,
      },
    ];

    tests.forEach((test, idx) => {
      const lessonIdx = idx + 1;
      lessons.push({
        id: `test-${test.testId}`,
        title: `Bài học ${idx + 2} - Luyện tập: ${test.testName}`,
        type: 'practice',
        typeLabel: 'Luyện tập',
        testId: test.testId,
        isCompleted: isTopicPassed || nextIndex > lessonIdx,
        isNext: nextIndex === lessonIdx,
      });
    });

    return lessons;
  };

  const getTopicLessonCount = (topic: TopicResponse): { passed: number; total: number } => {
    const lessons = getLessonsForTopic(topic);
    const tp = getTopicProgress(topic.id);
    const total = lessons.length;
    const passed = tp?.status === 'PASS' ? total : (tp?.passedTestCount ?? 0);
    return { passed, total };
  };

  const handleStartLesson = (topic: TopicResponse, lesson: LessonItem) => {
    if (lesson.type === 'vocabulary') {
      navigate(`/learn/topic/${topic.id}`);
    } else if (lesson.testId) {
      navigate(`/learn/topic/${topic.id}/practice`);
    }
  };

  const currentLevel = progress?.levels.find((l) => l.status === 'LEARNING' || l.status === 'PASS')
    || progress?.levels[0];
  const totalTopics = progress?.levels.reduce((sum, l) => sum + l.topics.length, 0) ?? 0;

  if (loading) {
    return (
      <LearnerLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-elsa-indigo-500" />
        </div>
      </LearnerLayout>
    );
  }

  return (
    <LearnerLayout>
      <div className="max-w-4xl mx-auto py-6">
        {/* Header Section with gradient accent */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-elsa-indigo-500 to-elsa-purple-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <Badge variant="outline" className="text-elsa-indigo-600 border-elsa-indigo-200 bg-elsa-indigo-50 font-semibold">
              {currentLevel?.levelName || 'N5'}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 text-foreground">
            Lộ trình học tập của {displayName}
          </h1>
          <p className="text-muted-foreground">
            {totalTopics} Đơn vị học tập
          </p>
        </div>

        {topics.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="w-20 h-20 rounded-3xl bg-elsa-indigo-50 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-10 w-10 text-elsa-indigo-400" />
            </div>
            <p className="text-lg font-medium">Chưa có nội dung học trong cấp độ này.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {topics.map((topic, unitIndex) => {
              const { passed, total } = getTopicLessonCount(topic);
              const lessons = getLessonsForTopic(topic);
              const progressPercent = total > 0 ? (passed / total) * 100 : 0;

              return (
                <Card
                  key={topic.id}
                  className="overflow-hidden border-none shadow-elsa-sm hover:shadow-elsa-md transition-all duration-300 rounded-2xl"
                  style={{ animationDelay: `${unitIndex * 100}ms` }}
                >
                  {/* Topic Header */}
                  <div className="p-6 pb-4">
                    <div className="flex items-center gap-2.5 mb-2">
                      <Badge className="bg-gradient-to-r from-elsa-indigo-500 to-elsa-indigo-600 text-white font-semibold px-3 py-1 rounded-lg">
                        Đơn vị {unitIndex + 1}
                      </Badge>
                      <span className="text-sm text-muted-foreground font-medium">
                        {passed}/{total} Bài học
                      </span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight text-foreground">{topic.topicName}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Học từ vựng và luyện tập theo chủ đề
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <Progress
                        value={progressPercent}
                        className="h-2 flex-1 max-w-[200px]"
                      />
                      <span className="text-xs font-bold text-elsa-indigo-600">{Math.round(progressPercent)}%</span>
                    </div>
                  </div>

                  {/* Lessons List */}
                  <div className="border-t border-elsa-indigo-50 bg-gradient-to-b from-elsa-indigo-50/30 to-transparent px-6 pb-5 pt-3">
                    <div className="space-y-2">
                      {lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className={`flex items-center gap-4 p-3.5 rounded-xl transition-all duration-200 ${
                            lesson.isNext
                              ? 'bg-white shadow-elsa-sm border border-elsa-indigo-100/80'
                              : 'bg-white/60 hover:bg-white/80'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                            lesson.isCompleted
                              ? 'bg-emerald-100'
                              : lesson.isNext
                                ? 'bg-gradient-to-br from-elsa-indigo-500 to-elsa-indigo-600'
                                : 'bg-elsa-indigo-50'
                          }`}>
                            {lesson.isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                            ) : lesson.type === 'vocabulary' ? (
                              <FileText className={`h-5 w-5 ${lesson.isNext ? 'text-white' : 'text-elsa-indigo-500'}`} />
                            ) : (
                              <Mic className={`h-5 w-5 ${lesson.isNext ? 'text-white' : 'text-elsa-indigo-500'}`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate text-foreground">{lesson.title}</p>
                            <p className="text-xs text-muted-foreground">{lesson.typeLabel}</p>
                          </div>
                          {lesson.isCompleted && (
                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-200 font-medium" variant="outline">
                              Hoàn thành
                            </Badge>
                          )}
                          {lesson.isNext && (
                            <Button
                              size="sm"
                              className="rounded-xl bg-gradient-to-r from-elsa-indigo-500 to-elsa-indigo-600 hover:from-elsa-indigo-600 hover:to-elsa-indigo-700 shadow-md hover:shadow-lg transition-all"
                              onClick={() => handleStartLesson(topic, lesson)}
                            >
                              <Play className="h-4 w-4 mr-1" />
                              Bắt đầu
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </LearnerLayout>
  );
};

export default RoadmapPage;
