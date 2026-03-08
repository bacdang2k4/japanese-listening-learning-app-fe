import React, { useState } from 'react';
import {
  Box,
  Chip,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
} from '@mui/material';
import MainLayout from '../components/layout/MainLayout';
import DataTable from '../components/common/DataTable';
import { mockLearners, mockTestResults, mockAudioTests, mockLevels } from '../data/mockData';
import { TestResult } from '../types';

const TestResultsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<string>('');
  const [filterResult, setFilterResult] = useState<string>('');

  const enrichedResults = mockTestResults.map((result) => {
    const learner = mockLearners.find((l) => l.id === result.learnerId);
    const test = mockAudioTests.find((t) => t.id === result.testId);
    const level = mockLevels.find((l) => l.id === test?.levelId);
    return {
      ...result,
      learnerName: learner?.fullName || 'N/A',
      learnerEmail: learner?.email || 'N/A',
      testName: test?.name || 'N/A',
      levelName: level?.name || 'N/A',
    };
  });

  const filteredResults = enrichedResults.filter((result) => {
    const matchesSearch =
      result.learnerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.testName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMode = !filterMode || result.mode === filterMode;
    const matchesResult =
      !filterResult ||
      (filterResult === 'passed' && result.passed) ||
      (filterResult === 'failed' && !result.passed);
    return matchesSearch && matchesMode && matchesResult;
  });

  const columns = [
    {
      id: 'avatar',
      label: '',
      minWidth: 50,
      format: (_: any, row: any) => (
        <Avatar sx={{ bgcolor: row.passed ? '#4caf50' : '#f44336', width: 36, height: 36 }}>
          {row.learnerName.charAt(0)}
        </Avatar>
      ),
    },
    { id: 'learnerName', label: 'Học viên', minWidth: 150 },
    {
      id: 'levelName',
      label: 'Level',
      minWidth: 80,
      format: (value: string) => (
        <Chip label={value} size="small" color="primary" variant="outlined" />
      ),
    },
    { id: 'testName', label: 'Bài test', minWidth: 180 },
    {
      id: 'mode',
      label: 'Chế độ',
      minWidth: 100,
      format: (value: TestResult['mode']) => (
        <Chip
          label={value === 'Practice' ? 'Luyện tập' : 'Thi thật'}
          size="small"
          color={value === 'Practice' ? 'default' : 'warning'}
        />
      ),
    },
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
      id: 'passed',
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
      format: (value: Date) =>
        new Date(value).toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
    },
  ];

  return (
    <MainLayout title="Kết quả Kiểm tra">
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Chế độ thi</InputLabel>
          <Select
            value={filterMode}
            label="Chế độ thi"
            onChange={(e) => setFilterMode(e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="Practice">Luyện tập</MenuItem>
            <MenuItem value="Exam">Thi thật</MenuItem>
          </Select>
        </FormControl>
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

      <DataTable
        columns={columns}
        rows={filteredResults}
        searchPlaceholder="Tìm theo tên học viên hoặc bài test..."
        onSearch={setSearchQuery}
        searchValue={searchQuery}
      />
    </MainLayout>
  );
};

export default TestResultsPage;
