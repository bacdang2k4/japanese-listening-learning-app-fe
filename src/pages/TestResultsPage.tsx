import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import MainLayout from '../components/layout/MainLayout';
import { formatBackendDateTime } from '../lib/dateUtils';
import DataTable from '../components/common/DataTable';
import { adminTestResultApi, AdminTestResultResponse } from '../services/api';

const TestResultsPage: React.FC = () => {
  const [results, setResults] = useState<AdminTestResultResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterResult, setFilterResult] = useState<string>('');
  const [page] = useState(0);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const passed = filterResult === 'passed' ? true : filterResult === 'failed' ? false : undefined;
      const result = await adminTestResultApi.getAll(
        page, 10,
        searchQuery || undefined,
        passed,
      );
      setResults(result.data.content);
    } catch (err: any) {
      setError(err.message || 'Không thể tải kết quả kiểm tra');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, filterResult]);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const columns = [
    {
      id: 'avatar',
      label: '',
      minWidth: 50,
      format: (_: any, row: AdminTestResultResponse) => (
        <Avatar sx={{ bgcolor: row.isPassed ? '#4caf50' : '#f44336', width: 36, height: 36 }}>
          {row.learnerName.charAt(0)}
        </Avatar>
      ),
    },
    { id: 'learnerName', label: 'Học viên', minWidth: 150 },
    {
      id: 'levelName',
      label: 'Level',
      minWidth: 80,
      format: (value: string | null) => (
        value ? <Chip label={value} size="small" color="primary" variant="outlined" /> : '—'
      ),
    },
    { id: 'testName', label: 'Bài test', minWidth: 180 },
    {
      id: 'score',
      label: 'Điểm',
      minWidth: 80,
      format: (value: number) => (
        <Typography fontWeight={600} color={value >= 60 ? 'success.main' : 'error.main'}>
          {value}%
        </Typography>
      ),
    },
    {
      id: 'isPassed',
      label: 'Kết quả',
      minWidth: 100,
      format: (value: boolean) => (
        <Chip
          label={value ? 'Đạt' : 'Không đạt'}
          size="small"
          color={value ? 'success' : 'error'}
        />
      ),
    },
    {
      id: 'completedAt',
      label: 'Thời gian',
      minWidth: 140,
      format: (value: string | null) => (value ? formatBackendDateTime(value) : '—'),
    },
  ];

  return (
    <MainLayout title="Kết quả Kiểm tra">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Kết quả</InputLabel>
          <Select
            value={filterResult}
            label="Kết quả"
            onChange={(e) => setFilterResult(e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="passed">Đạt</MenuItem>
            <MenuItem value="failed">Không đạt</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          columns={columns}
          rows={results}
          searchPlaceholder="Tìm theo tên học viên hoặc bài test..."
          onSearch={setSearchQuery}
          searchValue={searchQuery}
        />
      )}
    </MainLayout>
  );
};

export default TestResultsPage;
