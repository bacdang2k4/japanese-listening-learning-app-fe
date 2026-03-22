import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewDetailsIcon,
  AutoAwesome as AiIcon,
} from '@mui/icons-material';
import Backdrop from '@mui/material/Backdrop';
import MainLayout from '../components/layout/MainLayout';
import { formatBackendDateTime } from '../lib/dateUtils';
import DataTable from '../components/common/DataTable';
import FormDialog from '../components/common/FormDialog';
import {
  adminAudioTestApi,
  adminTopicApi,
  adminAiTestApi,
  AudioTestResponse,
  TopicResponse,
} from '../services/api';

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  DRAFT: 'default',
  PUBLISHED: 'success',
  PENDING_REVIEW: 'warning',
  REJECTED: 'error',
};

const statusLabels: Record<string, string> = {
  DRAFT: 'Nháp',
  PUBLISHED: 'Đã xuất bản',
  PENDING_REVIEW: 'Chờ duyệt',
  REJECTED: 'Đã từ chối',
};

const AudioTestsPage: React.FC = () => {
  const [tests, setTests] = useState<AudioTestResponse[]>([]);
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [topicsLoading, setTopicsLoading] = useState(true);
  const [topicsError, setTopicsError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<AudioTestResponse | null>(null);
  const [formData, setFormData] = useState({
    testName: '',
    topicId: '',
    transcript: '',
    audioUrl: '',
    duration: 60,
    passCondition: 70,
  });
  const [submitting, setSubmitting] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiFormData, setAiFormData] = useState({
    testName: '',
    topicId: '',
    difficulty: 'MEDIUM',
    questionCount: 5,
    duration: 10,
  });
  const [page] = useState(0);
  const navigate = useNavigate();

  const fetchTopics = useCallback(async () => {
    setTopicsLoading(true);
    setTopicsError('');
    try {
      const result = await adminTopicApi.getAll(0, 100);
      setTopics(result.data.content);
    } catch (err: any) {
      setTopicsError(err.message || 'Không thể tải danh sách chủ đề');
      console.error('Failed to fetch topics:', err);
    } finally {
      setTopicsLoading(false);
    }
  }, []);

  const fetchTests = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await adminAudioTestApi.getAll(
        page, 10, undefined,
        filterStatus || undefined,
        searchQuery || undefined
      );
      setTests(result.data.content);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách bài test');
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus, searchQuery]);

  useEffect(() => { fetchTopics(); }, [fetchTopics]);
  useEffect(() => { fetchTests(); }, [fetchTests]);

  const handleOpenDialog = (test?: AudioTestResponse) => {
    if (test) {
      setSelectedTest(test);
      setFormData({
        testName: test.testName,
        topicId: String(test.topicId),
        transcript: test.transcript || '',
        audioUrl: test.audioUrl || '',
        duration: test.duration,
        passCondition: test.passCondition || 70,
      });
    } else {
      setSelectedTest(null);
      setFormData({ testName: '', topicId: '', transcript: '', audioUrl: '', duration: 60, passCondition: 70 });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTest(null);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        testName: formData.testName,
        topicId: Number(formData.topicId),
        transcript: formData.transcript || undefined,
        audioUrl: formData.audioUrl || undefined,
        duration: formData.duration,
        passCondition: formData.passCondition,
      };
      if (selectedTest) {
        await adminAudioTestApi.update(selectedTest.testId, payload);
      } else {
        await adminAudioTestApi.create(payload);
      }
      handleCloseDialog();
      fetchTests();
    } catch (err: any) {
      setError(err.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAiGenerate = async () => {
    setSubmitting(true);
    try {
      await adminAiTestApi.generate({
        testName: aiFormData.testName,
        topicId: Number(aiFormData.topicId),
        difficulty: aiFormData.difficulty,
        questionCount: aiFormData.questionCount,
        duration: aiFormData.duration,
      });
      setAiDialogOpen(false);
      fetchTests();
    } catch (err: any) {
      setError(err.message || 'Tạo bài test AI thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { id: 'testId', label: 'ID', minWidth: 60 },
    { id: 'testName', label: 'Tên bài test', minWidth: 200 },
    {
      id: 'topicName',
      label: 'Chủ đề',
      minWidth: 150,
      format: (value: string) => (
        <Chip label={value || 'N/A'} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      id: 'status',
      label: 'Trạng thái',
      minWidth: 120,
      format: (value: string) => (
        <Chip
          label={statusLabels[value] || value}
          size="small"
          color={statusColors[value] || 'default'}
        />
      ),
    },
    { id: 'createdAt', label: 'Ngày tạo', minWidth: 150, format: (value: any) => formatBackendDateTime(value) },
    {
      id: 'actions',
      label: 'Chi tiết',
      minWidth: 100,
      align: 'center' as const,
      format: (_: any, row: AudioTestResponse) => (
        <Tooltip title="Xem chi tiết và chỉnh sửa">
          <IconButton
            size="small"
            color="primary"
            onClick={() => navigate(`/admin/audio-tests/${row.testId}`)}
          >
            <ViewDetailsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      ),
    },
  ];

  return (
    <MainLayout title="Quản lý Bài Test Nghe">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={filterStatus}
            label="Trạng thái"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="DRAFT">Nháp</MenuItem>
            <MenuItem value="PENDING_REVIEW">Chờ duyệt</MenuItem>
            <MenuItem value="PUBLISHED">Đã xuất bản</MenuItem>
            <MenuItem value="REJECTED">Đã từ chối</MenuItem>
          </Select>
        </FormControl>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AiIcon />}
            color="secondary"
            onClick={() => setAiDialogOpen(true)}
          >
            Tạo bằng AI
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Thêm bài test
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          columns={columns}
          rows={tests}
          searchPlaceholder="Tìm kiếm bài test..."
          onSearch={setSearchQuery}
          searchValue={searchQuery}
        />
      )}

      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 999, flexDirection: 'column', gap: 2 }}
        open={submitting && aiDialogOpen}
      >
        <CircularProgress color="inherit" />
        <Typography>AI đang khởi tạo nội dung và âm thanh, vui lòng chờ trong giây lát...</Typography>
      </Backdrop>

      <FormDialog
        open={dialogOpen}
        title={selectedTest ? 'Chỉnh sửa bài test' : 'Thêm bài test mới'}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Tên bài test"
            value={formData.testName}
            onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
            fullWidth required disabled={submitting}
          />
          <FormControl fullWidth required disabled={submitting || topicsLoading}>
            <InputLabel>Chủ đề</InputLabel>
            <Select
              value={formData.topicId}
              label="Chủ đề"
              onChange={(e) => setFormData({ ...formData, topicId: e.target.value })}
            >
              {topicsError ? (
                <MenuItem value="" disabled>{topicsError}</MenuItem>
              ) : topics.map((t) => (
                <MenuItem key={t.id} value={String(t.id)}>{t.topicName} ({t.levelName})</MenuItem>
              ))}
            </Select>
            {topicsLoading && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Đang tải chủ đề...
              </Typography>
            )}
            {topicsError && !topicsLoading && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {topicsError}
              </Typography>
            )}
          </FormControl>
          <TextField
            label="Transcript"
            value={formData.transcript}
            onChange={(e) => setFormData({ ...formData, transcript: e.target.value })}
            fullWidth multiline rows={3} disabled={submitting}
          />
          <TextField
            label="Audio URL"
            value={formData.audioUrl}
            onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
            fullWidth disabled={submitting}
            placeholder="https://s3.amazonaws.com/..."
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Thời lượng (phút)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              fullWidth inputProps={{ min: 1 }} disabled={submitting}
            />
            <TextField
              label="Điểm đạt (%)"
              type="number"
              value={formData.passCondition}
              onChange={(e) => setFormData({ ...formData, passCondition: Number(e.target.value) })}
              fullWidth inputProps={{ min: 0, max: 100 }} disabled={submitting}
            />
          </Box>
        </Box>
      </FormDialog>

      <FormDialog
        open={aiDialogOpen}
        title="Tạo bài test bằng AI (AWS Poly + OpenAI)"
        onClose={() => setAiDialogOpen(false)}
        onSubmit={handleAiGenerate}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            AI sẽ tự động tạo Transcript, Câu hỏi và chuyển đổi sang Audio bằng giọng đọc tự nhiên.
          </Typography>
          <TextField
            label="Tên bài test"
            value={aiFormData.testName}
            onChange={(e) => setAiFormData({ ...aiFormData, testName: e.target.value })}
            fullWidth required disabled={submitting}
            placeholder="VD: Hội thoại đi chợ"
          />
          <FormControl fullWidth required disabled={submitting || topicsLoading}>
            <InputLabel>Chủ đề</InputLabel>
            <Select
              value={aiFormData.topicId}
              label="Chủ đề"
              onChange={(e) => setAiFormData({ ...aiFormData, topicId: e.target.value })}
            >
              {topicsError ? (
                <MenuItem value="" disabled>{topicsError}</MenuItem>
              ) : topics.map((t) => (
                <MenuItem key={t.id} value={String(t.id)}>{t.topicName} ({t.levelName})</MenuItem>
              ))}
            </Select>
            {topicsLoading && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Đang tải chủ đề...
              </Typography>
            )}
            {topicsError && !topicsLoading && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                {topicsError}
              </Typography>
            )}
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Mức độ</InputLabel>
            <Select
              value={aiFormData.difficulty}
              label="Mức độ"
              onChange={(e) => setAiFormData({ ...aiFormData, difficulty: e.target.value })}
              disabled={submitting}
            >
              <MenuItem value="EASY">Dễ</MenuItem>
              <MenuItem value="MEDIUM">Trung bình</MenuItem>
              <MenuItem value="HARD">Khó</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Số câu hỏi"
              type="number"
              value={aiFormData.questionCount}
              onChange={(e) => setAiFormData({ ...aiFormData, questionCount: Number(e.target.value) })}
              fullWidth inputProps={{ min: 1, max: 10 }} disabled={submitting}
            />
            <TextField
              label="Độ dài (giây)"
              type="number"
              value={aiFormData.duration}
              onChange={(e) => setAiFormData({ ...aiFormData, duration: Number(e.target.value) })}
              fullWidth inputProps={{ min: 10, max: 180 }} disabled={submitting}
            />
          </Box>
        </Box>
      </FormDialog>
    </MainLayout>
  );
};

export default AudioTestsPage;
