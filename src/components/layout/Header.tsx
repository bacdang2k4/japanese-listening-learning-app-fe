import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Badge,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Menu,
  MenuItem,
  ListItemButton,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  CheckCircle as SuccessIcon,
  Error as FailedIcon,
  SmartToy as AiIcon,
} from '@mui/icons-material';
import { adminAiTestApi, AiGenerationLogResponse } from '@/services/api';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const navigate = useNavigate();

  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null);
  const [avatarAnchor, setAvatarAnchor] = useState<HTMLElement | null>(null);
  const [logs, setLogs] = useState<AiGenerationLogResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const adminData = (() => {
    try {
      const raw = localStorage.getItem('admin');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  const adminName: string = adminData?.username || 'Admin';
  const adminInitial = adminName.charAt(0).toUpperCase();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAiTestApi.getLogs(0, 15);
      setLogs(res.data.content);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    adminAiTestApi.getLogs(0, 5).then(res => {
      setUnreadCount(res.data.content.length);
    }).catch(() => {});
  }, []);

  const handleNotifOpen = (e: React.MouseEvent<HTMLElement>) => {
    setNotifAnchor(e.currentTarget);
    fetchLogs();
    setUnreadCount(0);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin');
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #F8F7FF 0%, #F1F0FF 100%)',
        borderBottom: '1px solid rgba(99, 102, 241, 0.1)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '64px !important' }}>
        <Typography
          variant="h5"
          sx={{
            color: '#1E1B4B',
            fontWeight: 700,
            fontSize: '1.3rem',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <Tooltip title="AI Generation Logs">
            <IconButton
              onClick={handleNotifOpen}
              sx={{
                borderRadius: '12px',
                '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.08)' },
              }}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon sx={{ color: '#6366F1' }} />
              </Badge>
            </IconButton>
          </Tooltip>

          <Popover
            open={Boolean(notifAnchor)}
            anchorEl={notifAnchor}
            onClose={() => setNotifAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                sx: {
                  width: 400,
                  maxHeight: 480,
                  mt: 1,
                  borderRadius: '16px',
                  boxShadow: '0 4px 24px rgba(79, 70, 229, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.08)',
                },
              },
            }}
          >
            <Box sx={{ px: 2.5, py: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <AiIcon fontSize="small" sx={{ color: '#fff' }} />
              </Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#1E1B4B' }}>
                AI Generation Logs
              </Typography>
            </Box>
            <Divider sx={{ borderColor: 'rgba(99, 102, 241, 0.08)' }} />
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} sx={{ color: '#6366F1' }} />
              </Box>
            ) : logs.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Chưa có log nào
                </Typography>
              </Box>
            ) : (
              <List dense disablePadding sx={{ maxHeight: 380, overflow: 'auto' }}>
                {logs.map((log) => (
                  <ListItem
                    key={log.id}
                    disablePadding
                    sx={{ borderBottom: '1px solid rgba(99, 102, 241, 0.06)' }}
                  >
                    <ListItemButton
                      onClick={() => {
                        setNotifAnchor(null);
                        if (log.testId) {
                          navigate('/admin/audio-tests');
                        }
                      }}
                      sx={{
                        px: 2.5,
                        py: 1.5,
                        borderRadius: '8px',
                        mx: 0.5,
                        my: 0.25,
                        '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.04)' },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {log.status === 'SUCCESS' ? (
                          <SuccessIcon fontSize="small" sx={{ color: '#10B981' }} />
                        ) : (
                          <FailedIcon fontSize="small" sx={{ color: '#EF4444' }} />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight={500} noWrap sx={{ flex: 1 }}>
                              {log.testName || `Test #${log.testId || '?'}`}
                            </Typography>
                            <Chip
                              label={log.status}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                borderRadius: '6px',
                                backgroundColor: log.status === 'SUCCESS' ? '#ECFDF5' : '#FEF2F2',
                                color: log.status === 'SUCCESS' ? '#059669' : '#DC2626',
                              }}
                            />
                          </Box>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {log.model && `${log.model} · `}{formatTime(log.generatedAt)}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Popover>

          {/* Avatar & Dropdown */}
          <Tooltip title={adminName}>
            <IconButton
              onClick={(e) => setAvatarAnchor(e.currentTarget)}
              sx={{ ml: 0.5 }}
            >
              <Avatar
                sx={{
                  background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                  width: 38,
                  height: 38,
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)',
                }}
              >
                {adminInitial}
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={avatarAnchor}
            open={Boolean(avatarAnchor)}
            onClose={() => setAvatarAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            slotProps={{
              paper: {
                sx: {
                  width: 220,
                  mt: 1,
                  borderRadius: '16px',
                  boxShadow: '0 4px 24px rgba(79, 70, 229, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.08)',
                },
              },
            }}
          >
            <Box sx={{ px: 2.5, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#1E1B4B' }}>
                {adminName}
              </Typography>
              <Typography variant="caption" sx={{ color: '#6366F1' }}>
                Quản trị viên
              </Typography>
            </Box>
            <Divider sx={{ borderColor: 'rgba(99, 102, 241, 0.08)' }} />
            <MenuItem
              onClick={() => { setAvatarAnchor(null); }}
              sx={{
                borderRadius: '10px',
                mx: 1,
                my: 0.5,
                '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.06)' },
              }}
            >
              <ListItemIcon><PersonIcon fontSize="small" sx={{ color: '#6366F1' }} /></ListItemIcon>
              <ListItemText>Hồ sơ</ListItemText>
            </MenuItem>
            <Divider sx={{ borderColor: 'rgba(99, 102, 241, 0.08)' }} />
            <MenuItem
              onClick={() => { setAvatarAnchor(null); handleLogout(); }}
              sx={{
                borderRadius: '10px',
                mx: 1,
                my: 0.5,
                '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.06)' },
              }}
            >
              <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#EF4444' }} /></ListItemIcon>
              <ListItemText sx={{ '& .MuiTypography-root': { color: '#EF4444', fontWeight: 500 } }}>Đăng xuất</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
