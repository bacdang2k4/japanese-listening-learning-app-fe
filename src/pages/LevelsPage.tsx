import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  TextField,
  IconButton,
  Tooltip,
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
import { adminLevelApi, LevelResponse } from '../services/api';

const LevelsPage: React.FC = () => {
  const [levels, setLevels] = useState<LevelResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<LevelResponse | null>(null);
  const [formData, setFormData] = useState({ levelName: '' });
  const [submitting, setSubmitting] = useState(false);

  // Pagination state
  const [page, setPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);

  const getAdminId = (): number => {
    try {
      const admin = JSON.parse(localStorage.getItem('admin') || '{}');
      return admin.id || 1;
    } catch { return 1; }
  };

  const fetchLevels = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await adminLevelApi.getAll(page, pageSize);
      setLevels(result.data.content);
      setTotalElements(result.data.totalElements);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách cấp độ');
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchLevels();
  }, [fetchLevels]);

  const filteredLevels = levels.filter(
    (level) => level.levelName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (level?: LevelResponse) => {
    if (level) {
      setSelectedLevel(level);
      setFormData({ levelName: level.levelName });
    } else {
      setSelectedLevel(null);
      setFormData({ levelName: '' });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedLevel(null);
    setFormData({ levelName: '' });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const payload = { levelName: formData.levelName, adminId: getAdminId() };
      if (selectedLevel) {
        await adminLevelApi.update(selectedLevel.id, payload);
      } else {
        await adminLevelApi.create(payload);
      }
      handleCloseDialog();
      fetchLevels();
    } catch (err: any) {
      setError(err.message || 'Thao tác thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLevel) return;
    setSubmitting(true);
    try {
      await adminLevelApi.delete(selectedLevel.id);
      setDeleteDialogOpen(false);
      setSelectedLevel(null);
      fetchLevels();
    } catch (err: any) {
      setError(err.message || 'Xóa thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 60 },
    { id: 'levelName', label: 'Tên cấp độ', minWidth: 120 },
    { id: 'adminName', label: 'Người tạo', minWidth: 120 },
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
      format: (_: any, row: LevelResponse) => (
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
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DataTable
          columns={columns}
          rows={filteredLevels}
          searchPlaceholder="Tìm kiếm cấp độ..."
          onSearch={setSearchQuery}
          searchValue={searchQuery}
        />
      )}

      <FormDialog
        open={dialogOpen}
        title={selectedLevel ? 'Chỉnh sửa cấp độ' : 'Thêm cấp độ mới'}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Tên cấp độ"
            value={formData.levelName}
            onChange={(e) => setFormData({ ...formData, levelName: e.target.value })}
            fullWidth
            required
            placeholder="VD: N5, N4, N3..."
            disabled={submitting}
          />
        </Box>
      </FormDialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa cấp độ "${selectedLevel?.levelName}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </MainLayout>
  );
};

export default LevelsPage;
