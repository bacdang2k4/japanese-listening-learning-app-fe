import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ChevronRight,
  Loader2,
  Sparkles,
  Languages,
} from 'lucide-react';
import LearnerLayout from '../../components/learner/LearnerLayout';
import {
  learnerApi,
  LevelResponse,
  TopicResponse,
} from '@/services/api';
import { getActiveProfileId } from '@/hooks/useActiveProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const VocabularyPage: React.FC = () => {
  const navigate = useNavigate();
  const profileId = getActiveProfileId();

  const [levels, setLevels] = useState<LevelResponse[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [topicsLoading, setTopicsLoading] = useState(false);

  useEffect(() => {
    if (!profileId) {
      navigate('/learn/profiles', { replace: true });
      return;
    }
  }, [profileId, navigate]);

  const fetchLevels = useCallback(async () => {
    setLoading(true);
    try {
      const res = await learnerApi.getLevels();
      setLevels(res.data);
      if (res.data.length > 0) {
        setSelectedLevelId(res.data[0].id);
      }
    } catch (err) {
      console.error('Failed to load levels', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLevels(); }, [fetchLevels]);

  const fetchTopics = useCallback(async () => {
    if (!selectedLevelId) return;
    setTopicsLoading(true);
    try {
      const res = await learnerApi.getTopicsByLevel(selectedLevelId, profileId);
      setTopics(res.data);
    } catch (err) {
      console.error('Failed to load topics', err);
    } finally {
      setTopicsLoading(false);
    }
  }, [selectedLevelId, profileId]);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);

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
        {/* Header Section */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
              <Languages className="w-4 h-4 text-white" />
            </div>
            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 font-semibold">
              Kho từ vựng
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1 text-foreground">
            Học từ vựng
          </h1>
          <p className="text-muted-foreground">
            Chọn chủ đề để bắt đầu học từ vựng tiếng Nhật
          </p>
        </div>

        {/* Level Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {levels.map((level) => (
            <Button
              key={level.id}
              variant={selectedLevelId === level.id ? 'default' : 'outline'}
              className={`rounded-xl shrink-0 transition-all ${
                selectedLevelId === level.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md shadow-emerald-500/20 border-none'
                  : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
              }`}
              onClick={() => setSelectedLevelId(level.id)}
            >
              {level.levelName}
            </Button>
          ))}
        </div>

        {/* Topic Grid */}
        {topicsLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-10 w-10 text-emerald-400" />
            </div>
            <p className="text-lg font-medium">Chưa có chủ đề nào trong cấp độ này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((topic, index) => (
              <Card
                key={topic.id}
                className="overflow-hidden border-none shadow-elsa-sm hover:shadow-elsa-md transition-all duration-300 rounded-2xl cursor-pointer group hover:-translate-y-0.5"
                style={{ animationDelay: `${index * 80}ms` }}
                onClick={() => navigate(`/learn/topic/${topic.id}`)}
              >
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate text-base">
                      {topic.topicName}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {topic.levelName} • Đơn vị {topic.topicOrder}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-emerald-500 transition-colors shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </LearnerLayout>
  );
};

export default VocabularyPage;
