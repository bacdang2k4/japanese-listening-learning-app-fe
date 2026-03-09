import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Chip,
  Avatar,
  LinearProgress,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import MainLayout from '../components/layout/MainLayout';
import DataTable from '../components/common/DataTable';
import { adminProfileApi, AdminProfileResponse } from '../services/api';

const ProfilesPage: React.FC = () => {
  const [profiles, setProfiles] = useState<AdminProfileResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page] = useState(0);
  const [totalLevels] = useState(5);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await adminProfileApi.getAll(page, 10, searchQuery || undefined);
      setProfiles(result.data.content);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách tiến độ học tập');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => { fetchProfiles(); }, [fetchProfiles]);

  const getStatusChip = (status: string) => {
    const config: Record<string, { label: string; color: 'info' | 'success' | 'error' }> = {
      LEARNING: { label: 'Đang học', color: 'info' },
      PASS: { label: 'Đã hoàn thành', color: 'success' },
      NOT_PASS: { label: 'Chưa đạt', color: 'error' },
    };
    const c = config[status] || { label: status, color: 'info' as const };
    return <Chip label={c.label} size="small" color={c.color} />;
  };

  const columns = [
    {
      id: 'avatar',
      label: '',
      minWidth: 50,
      format: (_: any, row: AdminProfileResponse) => (
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
      format: (value: string) => getStatusChip(value),
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          columns={columns}
          rows={profiles}
          searchPlaceholder="Tìm theo tên hoặc email..."
          onSearch={setSearchQuery}
          searchValue={searchQuery}
        />
      )}
    </MainLayout>
  );
};

export default ProfilesPage;
