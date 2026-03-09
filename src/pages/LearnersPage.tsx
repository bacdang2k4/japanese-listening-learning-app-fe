import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Lock as LockIcon,
  LockOpen as UnlockIcon,
} from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import DataTable from '../components/common/DataTable';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { adminLearnerApi, LearnerResponse } from '../services/api';

const LearnersPage: React.FC = () => {
  const [learners, setLearners] = useState<LearnerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'lock' | 'unlock';
    learner: LearnerResponse | null;
  }>({ open: false, type: 'lock', learner: null });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchLearners = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await adminLearnerApi.getAll(
        page, 10,
        searchQuery || undefined,
        statusFilter || undefined
      );
      setLearners(result.data.content);
    } catch (err: any) {
      setError(err.message || 'Không thể tải danh sách học viên');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, statusFilter]);

  useEffect(() => { fetchLearners(); }, [fetchLearners]);

  const handleAction = (type: 'lock' | 'unlock', learner: LearnerResponse) => {
    setConfirmDialog({ open: true, type, learner });
  };

  const handleConfirm = async () => {
    if (!confirmDialog.learner) return;
    setActionLoading(true);
    try {
      if (confirmDialog.type === 'lock') {
        await adminLearnerApi.lock(confirmDialog.learner.id);
      } else {
        await adminLearnerApi.unlock(confirmDialog.learner.id);
      }
      await fetchLearners();
    } catch (err: any) {
      setError(err.message || 'Thao tác thất bại');
    } finally {
      setActionLoading(false);
      setConfirmDialog({ open: false, type: 'lock', learner: null });
    }
  };

  const getStatusChip = (status: string) => {
    const config: Record<string, { label: string; color: 'success' | 'error' }> = {
      ACTIVE: { label: 'Hoạt động', color: 'success' },
      LOCKED: { label: 'Đã khóa', color: 'error' },
    };
    const c = config[status] || { label: status, color: 'success' as const };
    return <Chip label={c.label} size="small" color={c.color} />;
  };

  const columns = [
    {
      id: 'avatar',
      label: '',
      minWidth: 50,
      format: (_: any, row: LearnerResponse) => (
        <Avatar
          src={row.avatarUrl || undefined}
          sx={{ bgcolor: '#1976d2', width: 36, height: 36 }}
        >
          {row.firstName.charAt(0)}
        </Avatar>
      ),
    },
    {
      id: 'fullName',
      label: 'Họ tên',
      minWidth: 150,
      format: (_: any, row: LearnerResponse) => `${row.lastName} ${row.firstName}`,
    },
    { id: 'username', label: 'Username', minWidth: 120 },
    { id: 'email', label: 'Email', minWidth: 200 },
    {
      id: 'status',
      label: 'Trạng thái',
      minWidth: 100,
      format: (value: string) => getStatusChip(value),
    },
    {
      id: 'createdAt',
      label: 'Ngày đăng ký',
      minWidth: 120,
      format: (value: string) => new Date(value).toLocaleDateString('vi-VN'),
    },
    {
      id: 'actions',
      label: 'Thao tác',
      minWidth: 100,
      align: 'center' as const,
      format: (_: any, row: LearnerResponse) => (
        <Box>
          {row.status === 'ACTIVE' ? (
            <Tooltip title="Khóa tài khoản">
              <IconButton
                size="small"
                color="warning"
                onClick={() => handleAction('lock', row)}
              >
                <LockIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Mở khóa tài khoản">
              <IconButton
                size="small"
                color="success"
                onClick={() => handleAction('unlock', row)}
              >
                <UnlockIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const getDialogMessage = () => {
    const { type, learner } = confirmDialog;
    if (!learner) return '';
    const fullName = `${learner.lastName} ${learner.firstName}`;
    if (type === 'lock') {
      return `Bạn có chắc chắn muốn khóa tài khoản của "${fullName}"?`;
    }
    return `Bạn có chắc chắn muốn mở khóa tài khoản của "${fullName}"?`;
  };

  return (
    <MainLayout title="Quản lý Học viên">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Trạng thái</InputLabel>
          <Select
            value={statusFilter}
            label="Trạng thái"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="ACTIVE">Hoạt động</MenuItem>
            <MenuItem value="LOCKED">Đã khóa</MenuItem>
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
          rows={learners}
          searchPlaceholder="Tìm theo tên, email hoặc username..."
          onSearch={setSearchQuery}
          searchValue={searchQuery}
        />
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.type === 'lock' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        message={getDialogMessage()}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmDialog({ open: false, type: 'lock', learner: null })}
        confirmColor={confirmDialog.type === 'lock' ? 'warning' : 'success'}
        confirmLabel={confirmDialog.type === 'lock' ? 'Khóa' : 'Mở khóa'}
      />
    </MainLayout>
  );
};

export default LearnersPage;
