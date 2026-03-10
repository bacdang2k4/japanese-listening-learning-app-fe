import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import DataTable from '../components/common/DataTable';
import FormDialog from '../components/common/FormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { adminTopicApi, adminLevelApi, TopicResponse, LevelResponse } from '../services/api';

const TopicsPage: React.FC = () => {
  const [topics, setTopics] = useState<TopicResponse[]>([]);
  const [levels, setLevels] = useState<LevelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState<number | ''>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicResponse | null>(null);
  const [formData, setFormData] = useState({ topicName: '', levelId: '' as string, topicOrder: '0' });
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(0);

  const fetchLevels = useCallback(async () => {
    try {
      const result = await adminLevelApi.getAll(0, 100);
      setLevels(result.data.content);
    } catch { /* silent — filter will just be empty */ }
  }, []);

  const fetchTopics = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await adminTopicApi.getAll(
        page, 10,
        filterLevel || undefined,
        searchQuery || undefined
      );
      setTopics(result.data.content);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách chủ đề');
    } finally {
      setLoading(false);
    }
  }, [page, filterLevel, searchQuery]);

  useEffect(() => { fetchLevels(); }, [fetchLevels]);
  useEffect(() => { fetchTopics(); }, [fetchTopics]);

  const handleOpenDialog = (topic?: TopicResponse) => {
    if (topic) {
      setSelectedTopic(topic);
      setFormData({ topicName: topic.topicName, levelId: String(topic.levelId), topicOrder: String(topic.topicOrder || 0) });
    } else {
      setSelectedTopic(null);
      setFormData({ topicName: '', levelId: '', topicOrder: '0' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTopic(null);
    setFormData({ topicName: '', levelId: '', topicOrder: '0' });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = {
        topicName: formData.topicName,
        levelId: Number(formData.levelId),
        topicOrder: Number(formData.topicOrder)
      };
      if (selectedTopic) {
        await adminTopicApi.update(selectedTopic.id, payload);
      } else {
        await adminTopicApi.create(payload);
      }
      handleCloseDialog();
      fetchTopics();
    } catch (err: any) {
      setError(err.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedTopic) return;
    setSubmitting(true);
    try {
      await adminTopicApi.delete(selectedTopic.id);
      setDeleteDialogOpen(false);
      setSelectedTopic(null);
      fetchTopics();
    } catch (err: any) {
      setError(err.message || 'Xóa thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 60 },
    {
      id: 'levelName',
      label: 'Cấp độ',
      minWidth: 80,
      format: (value: string) => (
        <Chip label={value || 'N/A'} size="small" color="primary" variant="outlined" />
      ),
    },
    { id: 'topicOrder', label: 'Thứ tự', minWidth: 80, align: 'center' as const },
    { id: 'topicName', label: 'Tên chủ đề', minWidth: 150 },
    {
      id: 'createdAt',
      label: 'Ngày tạo',
      minWidth: 150,
    },
    {
      id: 'actions',
      label: 'Thao tác',
      minWidth: 100,
      align: 'center' as const,
      format: (_: any, row: TopicResponse) => (
        <Box>
          <Tooltip title="Chỉnh sửa">
            <IconButton size="small" onClick={() => handleOpenDialog(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Xóa">
            <IconButton
              size="small"
              color="error"
              onClick={() => {
                setSelectedTopic(row);
                setDeleteDialogOpen(true);
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <MainLayout title="Quản lý Chủ đề (Topics)">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Lọc theo Level</InputLabel>
          <Select
            value={filterLevel}
            label="Lọc theo Level"
            onChange={(e) => setFilterLevel(e.target.value as number | '')}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {levels.map((level) => (
              <MenuItem key={level.id} value={level.id}>
                {level.levelName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm chủ đề
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          columns={columns}
          rows={topics}
          searchPlaceholder="Tìm kiếm chủ đề..."
          onSearch={setSearchQuery}
          searchValue={searchQuery}
        />
      )}

      <FormDialog
        open={dialogOpen}
        title={selectedTopic ? 'Chỉnh sửa chủ đề' : 'Thêm chủ đề mới'}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth required>
            <InputLabel>Cấp độ</InputLabel>
            <Select
              value={formData.levelId}
              label="Cấp độ"
              onChange={(e) => setFormData({ ...formData, levelId: e.target.value })}
              disabled={submitting}
            >
              {levels.map((level) => (
                <MenuItem key={level.id} value={String(level.id)}>
                  {level.levelName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Tên chủ đề"
            value={formData.topicName}
            onChange={(e) => setFormData({ ...formData, topicName: e.target.value })}
            fullWidth
            required
            placeholder="VD: Gia đình, Số đếm..."
            disabled={submitting}
          />
          <TextField
            label="Thứ tự (topicOrder)"
            type="number"
            value={formData.topicOrder}
            onChange={(e) => setFormData({ ...formData, topicOrder: e.target.value })}
            fullWidth
            required
            disabled={submitting}
            helperText="Thứ tự hiển thị và học (1, 2, 3...)"
          />
        </Box>
      </FormDialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa chủ đề "${selectedTopic?.topicName}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </MainLayout>
  );
};

export default TopicsPage;
