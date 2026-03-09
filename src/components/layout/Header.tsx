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
      sx={{ backgroundColor: '#fff', borderBottom: '1px solid #e0e0e0' }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography variant="h5" sx={{ color: '#1a1a2e', fontWeight: 600 }}>
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* Notifications */}
          <Tooltip title="AI Generation Logs">
            <IconButton onClick={handleNotifOpen}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon sx={{ color: '#666' }} />
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
                sx: { width: 380, maxHeight: 480, mt: 1 },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
              <AiIcon fontSize="small" color="primary" />
              <Typography variant="subtitle1" fontWeight={600}>
                AI Generation Logs
              </Typography>
            </Box>
            <Divider />
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
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
                    sx={{ borderBottom: '1px solid #f0f0f0' }}
                  >
                    <ListItemButton
                      onClick={() => {
                        setNotifAnchor(null);
                        if (log.testId) {
                          navigate('/admin/audio-tests');
                        }
                      }}
                      sx={{ px: 2, py: 1.2 }}
                    >
                      <ListItemIcon sx={{ minWidth: 36 }}>
                        {log.status === 'SUCCESS' ? (
                          <SuccessIcon fontSize="small" color="success" />
                        ) : (
                          <FailedIcon fontSize="small" color="error" />
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
                              color={log.status === 'SUCCESS' ? 'success' : 'error'}
                              variant="outlined"
                              sx={{ height: 20, fontSize: '0.7rem' }}
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
            <IconButton onClick={(e) => setAvatarAnchor(e.currentTarget)} sx={{ ml: 1 }}>
              <Avatar sx={{ bgcolor: '#1976d2', width: 38, height: 38, fontSize: '1rem' }}>
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
                sx: { width: 200, mt: 1 },
              },
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="subtitle2" fontWeight={600}>{adminName}</Typography>
              <Typography variant="caption" color="text.secondary">Quản trị viên</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { setAvatarAnchor(null); }}>
              <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
              <ListItemText>Hồ sơ</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={() => { setAvatarAnchor(null); handleLogout(); }}>
              <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: '#ef5350' }} /></ListItemIcon>
              <ListItemText sx={{ '& .MuiTypography-root': { color: '#ef5350' } }}>Đăng xuất</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
