import React, { useState } from 'react';
import {
  Box,
  Chip,
  Avatar,
  LinearProgress,
  Typography,
} from '@mui/material';
import MainLayout from '../components/layout/MainLayout';
import DataTable from '../components/common/DataTable';
import { mockLearners, mockProfiles, mockLevels } from '../data/mockData';
import { LearnerProfile } from '../types';

const ProfilesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const enrichedProfiles = mockProfiles.map((profile) => {
    const learner = mockLearners.find((l) => l.id === profile.learnerId);
    return {
      ...profile,
      learnerName: learner?.fullName || 'N/A',
      learnerEmail: learner?.email || 'N/A',
    };
  });

  const filteredProfiles = enrichedProfiles.filter(
    (profile) =>
      profile.learnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      profile.learnerEmail.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusChip = (status: LearnerProfile['status']) => {
    const config = {
      Learning: { label: 'Đang học', color: 'info' as const },
      Pass: { label: 'Đã hoàn thành', color: 'success' as const },
      'Not Pass': { label: 'Chưa đạt', color: 'error' as const },
    };
    return <Chip label={config[status].label} size="small" color={config[status].color} />;
  };

  const totalLevels = mockLevels.length;

  const columns = [
    {
      id: 'avatar',
      label: '',
      minWidth: 50,
      format: (_: any, row: any) => (
        <Avatar sx={{ bgcolor: '#1976d2', width: 36, height: 36 }}>
          {row.learnerName.charAt(0)}
        </Avatar>
      ),
    },
    { id: 'learnerName', label: 'Học viên', minWidth: 150 },
    { id: 'learnerEmail', label: 'Email', minWidth: 200 },
    {
      id: 'status',
      label: 'Trạng thái',
      minWidth: 120,
      format: (value: LearnerProfile['status']) => getStatusChip(value),
    },
    {
      id: 'completedLevels',
      label: 'Tiến độ Level',
      minWidth: 180,
      format: (value: number) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={(value / totalLevels) * 100}
            sx={{ flex: 1, height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" sx={{ minWidth: 40 }}>
            {value}/{totalLevels}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'completedTopics',
      label: 'Chủ đề hoàn thành',
      minWidth: 140,
      format: (value: number) => (
        <Chip label={`${value} chủ đề`} size="small" variant="outlined" />
      ),
    },
    {
      id: 'totalScore',
      label: 'Tổng điểm',
      minWidth: 100,
      format: (value: number) => (
        <Typography fontWeight={600} color="primary">
          {value.toLocaleString()}
        </Typography>
      ),
    },
  ];

  return (
    <MainLayout title="Tiến độ Học tập">
      <DataTable
        columns={columns}
        rows={filteredProfiles}
        searchPlaceholder="Tìm theo tên hoặc email..."
        onSearch={setSearchQuery}
        searchValue={searchQuery}
      />
    </MainLayout>
  );
};

export default ProfilesPage;
