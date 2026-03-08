import React from 'react';
import { useNavigate } from 'react-router-dom';
import { School, CheckCircle2, Lock } from 'lucide-react';
import LearnerLayout from '../../components/learner/LearnerLayout';
import { mockLevels } from '../../data/mockData';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const LevelSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  // Mock progress data
  const levelProgress: Record<string, { completed: boolean; progress: number }> = {
    '1': { completed: true, progress: 100 },
    '2': { completed: false, progress: 60 },
    '3': { completed: false, progress: 0 },
    '4': { completed: false, progress: 0 },
    '5': { completed: false, progress: 0 },
  };

  // Use theme-consistent shades of the primary color instead of jarring colored badges
  const getLevelOpacity = (index: number) => {
    // Gradually darker tint to distinguish levels visually
    const opacities = [10, 15, 20, 30, 40];
    return opacities[index] || 10;
  };

  const isLevelUnlocked = (order: number) => {
    if (order === 1) return true;
    const prevLevel = mockLevels.find(l => l.order === order - 1);
    if (prevLevel) {
      return levelProgress[prevLevel.id]?.completed;
    }
    return false;
  };

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
          {mockLevels.map((level, index) => {
            const progress = levelProgress[level.id];
            const unlocked = isLevelUnlocked(level.order);
            const opacity = getLevelOpacity(index);

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
                  {/* Subtle top accent using primary color */}
                  <div className="h-1.5 w-full bg-primary" style={{ opacity: opacity / 100 + 0.4 }} />

                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-4xl font-extrabold tracking-tight text-primary">
                        {level.name}
                      </h3>
                      {progress?.completed ? (
                        <CheckCircle2 className="h-7 w-7 text-primary" />
                      ) : !unlocked ? (
                        <Lock className="h-7 w-7 text-muted-foreground" />
                      ) : null}
                    </div>

                    <p className="text-muted-foreground min-h-[48px] mb-6">
                      {level.description}
                    </p>

                    {unlocked && (
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground font-medium">Tiến độ</span>
                          <span className="font-bold">{progress?.progress || 0}%</span>
                        </div>
                        <Progress value={progress?.progress || 0} className="h-2" />
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 mt-auto pt-4">
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        4 chủ đề
                      </Badge>
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        20 từ vựng
                      </Badge>
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
