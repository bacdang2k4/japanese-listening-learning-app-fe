import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import MainLayout from '../components/layout/MainLayout';
import DataTable from '../components/common/DataTable';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { mockLearners } from '../data/mockData';
import { Learner } from '../types';

const LearnersPage: React.FC = () => {
  const [learners, setLearners] = useState<Learner[]>(mockLearners);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'lock' | 'unlock' | 'delete';
    learner: Learner | null;
  }>({ open: false, type: 'lock', learner: null });

  const filteredLearners = learners.filter(
    (learner) =>
      learner.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      learner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      learner.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAction = (type: 'lock' | 'unlock' | 'delete', learner: Learner) => {
    setConfirmDialog({ open: true, type, learner });
  };

  const handleConfirm = () => {
    if (!confirmDialog.learner) return;

    if (confirmDialog.type === 'delete') {
      setLearners(learners.filter((l) => l.id !== confirmDialog.learner!.id));
    } else {
      setLearners(
        learners.map((l) =>
          l.id === confirmDialog.learner!.id
            ? { ...l, status: confirmDialog.type === 'lock' ? 'locked' : 'active' }
            : l
        )
      );
    }
    setConfirmDialog({ open: false, type: 'lock', learner: null });
  };

  const getStatusChip = (status: Learner['status']) => {
    const config = {
      active: { label: 'Hoạt động', color: 'success' as const },
      locked: { label: 'Đã khóa', color: 'error' as const },
      deleted: { label: 'Đã xóa', color: 'default' as const },
    };
    return <Chip label={config[status].label} size="small" color={config[status].color} />;
  };

  const columns = [
    {
      id: 'avatar',
      label: '',
      minWidth: 50,
      format: (_: any, row: Learner) => (
        <Avatar sx={{ bgcolor: '#1976d2', width: 36, height: 36 }}>
          {row.fullName.charAt(0)}
        </Avatar>
      ),
    },
    { id: 'fullName', label: 'Họ tên', minWidth: 150 },
    { id: 'username', label: 'Username', minWidth: 120 },
    { id: 'email', label: 'Email', minWidth: 200 },
    {
      id: 'status',
      label: 'Trạng thái',
      minWidth: 100,
      format: (value: Learner['status']) => getStatusChip(value),
    },
    {
      id: 'createdAt',
      label: 'Ngày đăng ký',
      minWidth: 120,
      format: (value: Date) => new Date(value).toLocaleDateString('vi-VN'),
    },
    {
      id: 'lastLogin',
      label: 'Đăng nhập gần đây',
      minWidth: 140,
      format: (value: Date) => new Date(value).toLocaleDateString('vi-VN'),
    },
    {
      id: 'actions',
      label: 'Thao tác',
      minWidth: 120,
      align: 'center' as const,
      format: (_: any, row: Learner) => (
        <Box>
          <Tooltip title="Xem chi tiết">
            <IconButton size="small" color="primary">
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {row.status === 'active' ? (
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
          <Tooltip title="Xóa tài khoản">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleAction('delete', row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  const getDialogMessage = () => {
    const { type, learner } = confirmDialog;
    if (!learner) return '';
    switch (type) {
      case 'lock':
        return `Bạn có chắc chắn muốn khóa tài khoản của "${learner.fullName}"?`;
      case 'unlock':
        return `Bạn có chắc chắn muốn mở khóa tài khoản của "${learner.fullName}"?`;
      case 'delete':
        return `Bạn có chắc chắn muốn xóa tài khoản của "${learner.fullName}"? Hành động này không thể hoàn tác.`;
    }
  };

  return (
    <MainLayout title="Quản lý Học viên">
      <DataTable
        columns={columns}
        rows={filteredLearners}
        searchPlaceholder="Tìm theo tên, email hoặc username..."
        onSearch={setSearchQuery}
        searchValue={searchQuery}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={
          confirmDialog.type === 'lock'
            ? 'Khóa tài khoản'
            : confirmDialog.type === 'unlock'
            ? 'Mở khóa tài khoản'
            : 'Xóa tài khoản'
        }
        message={getDialogMessage()}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmDialog({ open: false, type: 'lock', learner: null })}
        confirmColor={confirmDialog.type === 'delete' ? 'error' : 'primary'}
        confirmLabel={
          confirmDialog.type === 'lock'
            ? 'Khóa'
            : confirmDialog.type === 'unlock'
            ? 'Mở khóa'
            : 'Xóa'
        }
      />
    </MainLayout>
  );
};

export default LearnersPage;
