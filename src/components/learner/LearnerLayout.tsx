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
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Headphones sx={{ fontSize: 40, color: 'primary.main' }} />
        <Typography variant="h6" fontWeight="bold" color="primary">
          日本語リスニング
        </Typography>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setDrawerOpen(false);
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon><Logout /></ListItemIcon>
            <ListItemText primary="Đăng xuất" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar>
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
            <Headphones sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
            <Typography variant="h6" fontWeight="bold" color="primary">
              日本語リスニング
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ ml: 4, display: 'flex', gap: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  startIcon={item.icon}
                  onClick={() => navigate(item.path)}
                  sx={{
                    color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                    fontWeight: location.pathname === item.path ? 'bold' : 'normal',
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>A</Avatar>
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
