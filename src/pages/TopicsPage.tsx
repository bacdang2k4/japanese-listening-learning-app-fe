import React, { useState } from 'react';
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
import { mockTopics, mockLevels } from '../data/mockData';
import { Topic } from '../types';

const TopicsPage: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>(mockTopics);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [formData, setFormData] = useState({ levelId: '', name: '', description: '', order: 1 });

  const filteredTopics = topics.filter((topic) => {
    const matchesSearch =
      topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = !filterLevel || topic.levelId === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const getLevelName = (levelId: string) => {
    const level = mockLevels.find((l) => l.id === levelId);
    return level?.name || 'N/A';
  };

  const handleOpenDialog = (topic?: Topic) => {
    if (topic) {
      setSelectedTopic(topic);
      setFormData({
        levelId: topic.levelId,
        name: topic.name,
        description: topic.description,
        order: topic.order,
      });
    } else {
      setSelectedTopic(null);
      setFormData({ levelId: '', name: '', description: '', order: topics.length + 1 });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTopic(null);
    setFormData({ levelId: '', name: '', description: '', order: 1 });
  };

  const handleSubmit = () => {
    if (selectedTopic) {
      setTopics(
        topics.map((t) =>
          t.id === selectedTopic.id
            ? { ...t, ...formData, updatedAt: new Date() }
            : t
        )
      );
    } else {
      const newTopic: Topic = {
        id: String(Date.now()),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTopics([...topics, newTopic]);
    }
    handleCloseDialog();
  };

  const handleDelete = () => {
    if (selectedTopic) {
      setTopics(topics.filter((t) => t.id !== selectedTopic.id));
      setDeleteDialogOpen(false);
      setSelectedTopic(null);
    }
  };

  const columns = [
    { id: 'order', label: 'STT', minWidth: 60 },
    {
      id: 'levelId',
      label: 'Cấp độ',
      minWidth: 80,
      format: (value: string) => (
        <Chip label={getLevelName(value)} size="small" color="primary" variant="outlined" />
      ),
    },
    { id: 'name', label: 'Tên chủ đề', minWidth: 150 },
    { id: 'description', label: 'Mô tả', minWidth: 250 },
    {
      id: 'createdAt',
      label: 'Ngày tạo',
      minWidth: 120,
      format: (value: Date) => new Date(value).toLocaleDateString('vi-VN'),
    },
    {
      id: 'actions',
      label: 'Thao tác',
      minWidth: 100,
      align: 'center' as const,
      format: (_: any, row: Topic) => (
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
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Lọc theo Level</InputLabel>
          <Select
            value={filterLevel}
            label="Lọc theo Level"
            onChange={(e) => setFilterLevel(e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {mockLevels.map((level) => (
              <MenuItem key={level.id} value={level.id}>
                {level.name}
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

      <DataTable
        columns={columns}
        rows={filteredTopics}
        searchPlaceholder="Tìm kiếm chủ đề..."
        onSearch={setSearchQuery}
        searchValue={searchQuery}
      />

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
            >
              {mockLevels.map((level) => (
                <MenuItem key={level.id} value={level.id}>
                  {level.name} - {level.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Tên chủ đề"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            required
            placeholder="VD: Gia đình, Số đếm..."
          />
          <TextField
            label="Mô tả"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
            placeholder="Mô tả về chủ đề này..."
          />
          <TextField
            label="Thứ tự"
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
            fullWidth
            inputProps={{ min: 1 }}
          />
        </Box>
      </FormDialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa chủ đề "${selectedTopic?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </MainLayout>
  );
};

export default TopicsPage;
