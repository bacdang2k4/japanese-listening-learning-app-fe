import React from 'react';
import { Box, Card, CardContent, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip } from '@mui/material';
import {
  School as SchoolIcon,
  Topic as TopicIcon,
  Translate as TranslateIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import StatsCard from '../components/common/StatsCard';
import { mockLevels, mockTopics, mockVocabularies, mockLearners, mockTestResults } from '../data/mockData';

const Dashboard: React.FC = () => {
  const recentResults = mockTestResults.slice(0, 5);

  return (
    <MainLayout title="Dashboard">
      {/* Stats Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 3, mb: 3 }}>
        <StatsCard
          title="Cấp độ"
          value={mockLevels.length}
          icon={<SchoolIcon sx={{ fontSize: 28 }} />}
          color="#1976d2"
          subtitle="N5 - N1"
        />
        <StatsCard
          title="Chủ đề"
          value={mockTopics.length}
          icon={<TopicIcon sx={{ fontSize: 28 }} />}
          color="#4caf50"
          subtitle="Đang hoạt động"
        />
        <StatsCard
          title="Từ vựng"
          value={mockVocabularies.length}
          icon={<TranslateIcon sx={{ fontSize: 28 }} />}
          color="#ff9800"
          subtitle="Tổng số từ"
        />
        <StatsCard
          title="Học viên"
          value={mockLearners.filter((l) => l.status === 'active').length}
          icon={<PeopleIcon sx={{ fontSize: 28 }} />}
          color="#9c27b0"
          subtitle="Đang hoạt động"
        />
      </Box>

      {/* Two columns layout */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {/* Recent Activity */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUpIcon sx={{ color: '#1976d2', mr: 1 }} />
              <Typography variant="h6" fontWeight={600}>
                Kết quả thi gần đây
              </Typography>
            </Box>
            <List>
              {recentResults.map((result) => {
                const learner = mockLearners.find((l) => l.id === result.learnerId);
                return (
                  <ListItem key={result.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: result.passed ? '#4caf50' : '#f44336' }}>
                        {learner?.fullName.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={learner?.fullName}
                      secondary={`${result.mode} - ${result.score} điểm`}
                    />
                    <Chip
                      label={result.passed ? 'Đạt' : 'Không đạt'}
                      size="small"
                      color={result.passed ? 'success' : 'error'}
                    />
                  </ListItem>
                );
              })}
            </List>
          </CardContent>
        </Card>

        {/* Level Progress */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CheckCircleIcon sx={{ color: '#4caf50', mr: 1 }} />
              <Typography variant="h6" fontWeight={600}>
                Thống kê theo Level
              </Typography>
            </Box>
            <List>
              {mockLevels.map((level) => {
                const topicCount = mockTopics.filter((t) => t.levelId === level.id).length;
                const vocabCount = mockVocabularies.filter((v) => {
                  const topic = mockTopics.find((t) => t.id === v.topicId);
                  return topic?.levelId === level.id;
                }).length;
                return (
                  <ListItem key={level.id} divider>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: '#1976d2' }}>{level.name}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={level.name}
                      secondary={level.description}
                    />
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" color="text.secondary">
                        {topicCount} chủ đề
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {vocabCount} từ vựng
                      </Typography>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          </CardContent>
        </Card>
      </Box>
    </MainLayout>
  );
};

export default Dashboard;
