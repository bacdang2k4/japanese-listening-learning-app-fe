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
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import DataTable from '../components/common/DataTable';
import FormDialog from '../components/common/FormDialog';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { mockAudioTests, mockLevels } from '../data/mockData';
import { AudioTest } from '../types';

const AudioTestsPage: React.FC = () => {
  const [tests, setTests] = useState<AudioTest[]>(mockAudioTests);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<AudioTest | null>(null);
  const [formData, setFormData] = useState({
    levelId: '',
    name: '',
    audioUrl: '',
    passCondition: 60,
    duration: 30,
  });

  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = !filterLevel || test.levelId === filterLevel;
    return matchesSearch && matchesLevel;
  });

  const getLevelName = (levelId: string) => {
    const level = mockLevels.find((l) => l.id === levelId);
    return level?.name || 'N/A';
  };

  const handleOpenDialog = (test?: AudioTest) => {
    if (test) {
      setSelectedTest(test);
      setFormData({
        levelId: test.levelId,
        name: test.name,
        audioUrl: test.audioUrl,
        passCondition: test.passCondition,
        duration: test.duration,
      });
    } else {
      setSelectedTest(null);
      setFormData({ levelId: '', name: '', audioUrl: '', passCondition: 60, duration: 30 });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedTest(null);
    setFormData({ levelId: '', name: '', audioUrl: '', passCondition: 60, duration: 30 });
  };

  const handleSubmit = () => {
    if (selectedTest) {
      setTests(
        tests.map((t) =>
          t.id === selectedTest.id
            ? { ...t, ...formData, updatedAt: new Date() }
            : t
        )
      );
    } else {
      const newTest: AudioTest = {
        id: String(Date.now()),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTests([...tests, newTest]);
    }
    handleCloseDialog();
  };

  const handleDelete = () => {
    if (selectedTest) {
      setTests(tests.filter((t) => t.id !== selectedTest.id));
      setDeleteDialogOpen(false);
      setSelectedTest(null);
    }
  };

  const columns = [
    { id: 'name', label: 'Tên bài test', minWidth: 200 },
    {
      id: 'levelId',
      label: 'Cấp độ',
      minWidth: 80,
      format: (value: string) => (
        <Chip label={getLevelName(value)} size="small" color="primary" variant="outlined" />
      ),
    },
    {
      id: 'passCondition',
      label: 'Điểm liệt',
      minWidth: 100,
      format: (value: number) => `${value}%`,
    },
    {
      id: 'duration',
      label: 'Thời lượng',
      minWidth: 100,
      format: (value: number) => `${value} phút`,
    },
    {
      id: 'audioUrl',
      label: 'Audio',
      minWidth: 100,
      align: 'center' as const,
      format: (value: string) => (
        <Tooltip title="Nghe audio">
          <IconButton
            size="small"
            color="primary"
            onClick={() => window.open(value, '_blank')}
          >
            <PlayIcon />
          </IconButton>
        </Tooltip>
      ),
    },
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
      format: (_: any, row: AudioTest) => (
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
                setSelectedTest(row);
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
    <MainLayout title="Quản lý Bài kiểm tra">
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
          Thêm bài kiểm tra
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={filteredTests}
        searchPlaceholder="Tìm kiếm bài kiểm tra..."
        onSearch={setSearchQuery}
        searchValue={searchQuery}
      />

      <FormDialog
        open={dialogOpen}
        title={selectedTest ? 'Chỉnh sửa bài kiểm tra' : 'Thêm bài kiểm tra mới'}
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
                  {level.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Tên bài kiểm tra"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            required
            placeholder="VD: Bài nghe N5 - Số 1"
          />
          <TextField
            label="URL Audio"
            value={formData.audioUrl}
            onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
            fullWidth
            required
            placeholder="https://example.com/audio.mp3"
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Điểm liệt (%)"
              type="number"
              value={formData.passCondition}
              onChange={(e) => setFormData({ ...formData, passCondition: Number(e.target.value) })}
              fullWidth
              inputProps={{ min: 0, max: 100 }}
            />
            <TextField
              label="Thời lượng (phút)"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              fullWidth
              inputProps={{ min: 1 }}
            />
          </Box>
        </Box>
      </FormDialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa bài kiểm tra "${selectedTest?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </MainLayout>
  );
};

export default AudioTestsPage;
