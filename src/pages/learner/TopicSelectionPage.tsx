import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Play, ChevronRight, PenTool, Focus } from 'lucide-react';
import LearnerLayout from '../../components/learner/LearnerLayout';
import { mockTopics, mockLevels, mockVocabularies } from '../../data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const TopicSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { levelId } = useParams<{ levelId: string }>();

  const level = mockLevels.find(l => l.id === levelId);
  const topics = mockTopics.filter(t => t.levelId === levelId);

  // Mock progress data
  const topicProgress: Record<string, { completed: boolean; progress: number }> = {
    '1': { completed: true, progress: 100 },
    '2': { completed: true, progress: 100 },
    '3': { completed: false, progress: 45 },
    '4': { completed: false, progress: 0 },
  };

  const getVocabCount = (topicId: string) => {
    return mockVocabularies.filter(v => v.topicId === topicId).length;
  };

  return (
    <LearnerLayout>
      <div className="max-w-6xl mx-auto py-8">

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center text-sm font-medium text-muted-foreground mb-8">
          <Link to="/learn" className="hover:text-primary transition-colors">
            Cấp độ
          </Link>
          <ChevronRight className="h-4 w-4 mx-2" />
          <span className="text-foreground">{level?.name}</span>
        </nav>

        {/* Header content */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-6 shadow-sm">
            <BookOpen className="h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
            Chọn chủ đề - <span className="text-primary">{level?.name}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {level?.description}
          </p>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, index) => {
            const progress = topicProgress[topic.id];
            const vocabCount = getVocabCount(topic.id);

            return (
              <div
                key={topic.id}
                className={`animate-in fade-in slide-in-from-bottom-8 duration-700`}
                style={{ animationFillMode: 'both', animationDelay: `${(index + 1) * 100}ms` }}
              >
                <Card className="h-full border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-background/80 flex flex-col">
                  <CardContent className="p-6 flex flex-col h-full">

                    {/* Topic Header: Number + Title + Status */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <Badge variant="outline" className="mb-2 text-primary border-primary/30 bg-primary/5">
                          Chủ đề {index + 1}
                        </Badge>
                        <h3 className="text-2xl font-bold tracking-tight line-clamp-1">{topic.name}</h3>
                      </div>
                      {progress?.completed && (
                        <div className="bg-green-500/10 text-green-500 rounded-full p-1 animate-in zoom-in">
                          <CheckCircle2 className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <p className="text-muted-foreground text-sm min-h-[40px] mb-6 line-clamp-2">
                      {topic.description}
                    </p>

                    {/* Progress Section */}
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground font-medium">Tiến độ học</span>
                        <span className={`font-bold ${progress?.completed ? 'text-green-500' : 'text-primary'}`}>
                          {progress?.progress || 0}%
                        </span>
                      </div>
                      <Progress
                        value={progress?.progress || 0}
                        className="h-2"
                      />
                    </div>

                    {/* Meta Info Badges */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      <Badge variant="secondary" className="font-normal text-xs bg-muted">
                        <BookOpen className="w-3 h-3 mr-1" /> {vocabCount} từ vựng
                      </Badge>
                      <Badge variant="secondary" className="font-normal text-xs bg-muted">
                        <PenTool className="w-3 h-3 mr-1" /> 2 bài test
                      </Badge>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto space-y-3">
                      <Button
                        className="w-full h-11 group"
                        onClick={() => navigate(`/learn/topic/${topic.id}`)}
                      >
                        <Play className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        Học từ vựng
                      </Button>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/learn/topic/${topic.id}/practice`)}
                          className="font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        >
                          Luyện tập
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => navigate(`/learn/topic/${topic.id}/exam`)}
                          className="font-medium bg-secondary/80 hover:bg-secondary text-secondary-foreground"
                        >
                          <Focus className="w-4 h-4 mr-1.5" />
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
      </div>
    </LearnerLayout>
  );
};

export default TopicSelectionPage;
