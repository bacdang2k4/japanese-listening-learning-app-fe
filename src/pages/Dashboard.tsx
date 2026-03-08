import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, CircularProgress } from '@mui/material';
import {
  School as SchoolIcon,
  Topic as TopicIcon,
  Headphones as HeadphonesIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import StatsCard from '../components/common/StatsCard';
import { adminLevelApi, adminTopicApi, adminAudioTestApi, LevelResponse, TopicResponse } from '../services/api';

const Dashboard: React.FC = () => {
  const [levelCount, setLevelCount] = useState(0);
  const [topicCount, setTopicCount] = useState(0);
  const [testCount, setTestCount] = useState(0);
  const [levels, setLevels] = useState<LevelResponse[]>([]);
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [levelRes, topicRes, testRes] = await Promise.all([
          adminLevelApi.getAll(0, 100),
          adminTopicApi.getAll(0, 100),
          adminAudioTestApi.getAll(0, 1),
        ]);
        setLevels(levelRes.data.content);
        setTopics(topicRes.data.content);
        setLevelCount(levelRes.data.totalElements);
        setTopicCount(topicRes.data.totalElements);
        setTestCount(testRes.data.totalElements);
      } catch { /* silent — show 0 */ }
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <MainLayout title="Dashboard">
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Stats Cards */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }, gap: 3, mb: 3 }}>
            <StatsCard
              title="Cấp độ"
              value={levelCount}
              icon={<SchoolIcon sx={{ fontSize: 28 }} />}
              color="#1976d2"
              subtitle="Tổng số level"
            />
            <StatsCard
              title="Chủ đề"
              value={topicCount}
              icon={<TopicIcon sx={{ fontSize: 28 }} />}
              color="#4caf50"
              subtitle="Tổng số topic"
            />
            <StatsCard
              title="Bài test"
              value={testCount}
              icon={<HeadphonesIcon sx={{ fontSize: 28 }} />}
              color="#ff9800"
              subtitle="Tổng số audio test"
            />
          </Box>

          {/* Level Stats */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircleIcon sx={{ color: '#4caf50', mr: 1 }} />
                <Typography variant="h6" fontWeight={600}>
                  Thống kê theo Level
                </Typography>
              </Box>
              <List>
                {levels.length === 0 ? (
                  <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography color="text.secondary">Chưa có dữ liệu thống kê level</Typography>
                  </Box>
                ) : (
                  levels.map((level) => {
                    const topicCountForLevel = topics.filter(t => t.levelId === level.id).length;
                    return (
                      <ListItem key={level.id} divider>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: '#1976d2' }}>{level.levelName.charAt(0)}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={level.levelName}
                          secondary={`Người tạo: ${level.adminName || 'N/A'}`}
                        />
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography variant="body2" color="text.secondary">
                            {topicCountForLevel} chủ đề
                          </Typography>
                        </Box>
                      </ListItem>
                    );
                  })
                )}
              </List>
            </CardContent>
          </Card>
        </>
      )}
    </MainLayout>
  );
};

export default Dashboard;
