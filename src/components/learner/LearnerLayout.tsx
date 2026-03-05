import React, { useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Headphones,
  School,
  Person,
  History,
  Logout,
  Home,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface LearnerLayoutProps {
  children: React.ReactNode;
}

const LearnerLayout: React.FC<LearnerLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const menuItems = [
    { text: 'Trang chủ', icon: <Home />, path: '/learn' },
    { text: 'Chọn cấp độ', icon: <School />, path: '/learn' },
    { text: 'Hồ sơ', icon: <Person />, path: '/learn/profile' },
    { text: 'Lịch sử', icon: <History />, path: '/learn/history' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('learner');
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ width: 280, backgroundColor: '#F2F9FF', height: '100%' }}>
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Headphones sx={{ fontSize: 48, color: '#C9E4FF', mb: 1 }} />
        <Typography variant="h5" fontWeight="800" color="#0D1E36">
          NIHONGO
        </Typography>
      </Box>
      <Divider sx={{ opacity: 0.1 }} />
      <List sx={{ px: 2, py: 2 }}>
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                selected={active}
                onClick={() => {
                  navigate(item.path);
                  setDrawerOpen(false);
                }}
                sx={{
                  borderRadius: 4,
                  py: 1.5,
                  backgroundColor: active ? '#C9E4FF !important' : 'transparent',
                  '& .MuiListItemIcon-root': {
                    color: active ? '#0D1E36' : '#44515E',
                  },
                  '& .MuiListItemText-primary': {
                    fontWeight: active ? 700 : 600,
                    color: active ? '#0D1E36' : '#44515E',
                  }
                }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ opacity: 0.1 }} />
      <List sx={{ px: 2, py: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 4,
              py: 1.5,
              '&:hover': { backgroundColor: 'rgba(251, 200, 200, 0.2)' }
            }}
          >
            <ListItemIcon><Logout sx={{ color: '#FBC8C8' }} /></ListItemIcon>
            <ListItemText primary="Đăng xuất" sx={{ '& .MuiListItemText-primary': { color: '#D32F2F', fontWeight: 600 } }} />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F2F9FF' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          color: '#0D1E36'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box
            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            onClick={() => navigate('/learn')}
          >
            <Headphones sx={{ fontSize: 36, color: '#C9E4FF', mr: 1.5 }} />
            <Typography variant="h5" fontWeight="800" sx={{ color: '#0D1E36', letterSpacing: '-0.02em' }}>
              NIHONGO
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ ml: 4, display: 'flex', gap: 1 }}>
              {menuItems.map((item) => {
                const active = location.pathname === item.path;
                return (
                  <Button
                    key={item.text}
                    startIcon={item.icon}
                    onClick={() => navigate(item.path)}
                    sx={{
                      px: 2,
                      py: 1,
                      borderRadius: 3,
                      color: active ? '#0D1E36' : '#44515E',
                      backgroundColor: active ? '#C9E4FF' : 'transparent',
                      fontWeight: active ? 700 : 600,
                      '&:hover': {
                        backgroundColor: active ? '#C9E4FF' : 'rgba(201, 228, 255, 0.1)',
                      }
                    }}
                  >
                    {item.text}
                  </Button>
                );
              })}
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5 }}>
            <Avatar
              sx={{
                bgcolor: '#C9E4FF',
                color: '#0D1E36',
                fontWeight: 700,
                width: 44,
                height: 44,
                border: '2px solid #fff',
                boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
              }}
            >
              A
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            <MenuItem onClick={() => { navigate('/learn/profile'); setAnchorEl(null); }}>
              <ListItemIcon><Person fontSize="small" /></ListItemIcon>
              Hồ sơ
            </MenuItem>
            <MenuItem onClick={() => { navigate('/learn/history'); setAnchorEl(null); }}>
              <ListItemIcon><History fontSize="small" /></ListItemIcon>
              Lịch sử
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
              Đăng xuất
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawer}
      </Drawer>

      <Box component="main">
        {children}
      </Box>
    </Box>
  );
};

export default LearnerLayout;
