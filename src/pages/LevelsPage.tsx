import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Chip,
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
import { mockLevels } from '../data/mockData';
import { Level } from '../types';

const LevelsPage: React.FC = () => {
  const [levels, setLevels] = useState<Level[]>(mockLevels);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', order: 1 });

  const filteredLevels = levels.filter(
    (level) =>
      level.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      level.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (level?: Level) => {
    if (level) {
      setSelectedLevel(level);
      setFormData({ name: level.name, description: level.description, order: level.order });
    } else {
      setSelectedLevel(null);
      setFormData({ name: '', description: '', order: levels.length + 1 });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedLevel(null);
    setFormData({ name: '', description: '', order: 1 });
  };

  const handleSubmit = () => {
    if (selectedLevel) {
      setLevels(
        levels.map((l) =>
          l.id === selectedLevel.id
            ? { ...l, ...formData, updatedAt: new Date() }
            : l
        )
      );
    } else {
      const newLevel: Level = {
        id: String(Date.now()),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setLevels([...levels, newLevel]);
    }
    handleCloseDialog();
  };

  const handleDelete = () => {
    if (selectedLevel) {
      setLevels(levels.filter((l) => l.id !== selectedLevel.id));
      setDeleteDialogOpen(false);
      setSelectedLevel(null);
    }
  };

  const columns = [
    { id: 'order', label: 'STT', minWidth: 60 },
    {
      id: 'name',
      label: 'Tên cấp độ',
      minWidth: 100,
      format: (value: string) => (
        <Chip
          label={value}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ color: '#0D1E36', borderColor: '#0D3B80', fontWeight: 600 }}
        />
      ),
    },
    { id: 'description', label: 'Mô tả', minWidth: 200 },
    {
      id: 'createdAt',
      label: 'Ngày tạo',
      minWidth: 120,
      format: (value: Date) => new Date(value).toLocaleDateString('vi-VN'),
    },
    {
      id: 'status',
      label: 'Trạng thái',
      minWidth: 100,
      format: () => <Chip label="Hoạt động" size="small" color="success" />,
    },
    {
      id: 'actions',
      label: 'Thao tác',
      minWidth: 100,
      align: 'center' as const,
      format: (_: any, row: Level) => (
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
                setSelectedLevel(row);
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
    <MainLayout title="Quản lý Cấp độ (Levels)">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Box />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Thêm cấp độ
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={filteredLevels}
        searchPlaceholder="Tìm kiếm cấp độ..."
        onSearch={setSearchQuery}
        searchValue={searchQuery}
      />

      <FormDialog
        open={dialogOpen}
        title={selectedLevel ? 'Chỉnh sửa cấp độ' : 'Thêm cấp độ mới'}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Tên cấp độ"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            fullWidth
            required
            placeholder="VD: N5, N4, N3..."
          />
          <TextField
            label="Mô tả"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            fullWidth
            multiline
            rows={3}
            placeholder="Mô tả về cấp độ này..."
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
        message={`Bạn có chắc chắn muốn xóa cấp độ "${selectedLevel?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </MainLayout>
  );
};

export default LevelsPage;
