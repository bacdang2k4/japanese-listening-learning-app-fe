import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse, Typography, Divider } from '@mui/material';
import { Dashboard as DashboardIcon, School as SchoolIcon, Topic as TopicIcon, Translate as TranslateIcon, Headphones as HeadphonesIcon, People as PeopleIcon, Assessment as AssessmentIcon, ExpandLess, ExpandMore, MenuBook as MenuBookIcon, LibraryBooks as LibraryBooksIcon } from '@mui/icons-material';

const drawerWidth = 280;

interface MenuItem {
  title: string;
  path?: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [{
  title: 'Dashboard',
  path: '/admin',
  icon: <DashboardIcon />
}, {
  title: 'Quản lý Nội dung',
  icon: <MenuBookIcon />,
  children: [{
    title: 'Cấp độ (Levels)',
    path: '/admin/levels',
    icon: <SchoolIcon />
  }, {
    title: 'Chủ đề (Topics)',
    path: '/admin/topics',
    icon: <TopicIcon />
  }, {
    title: 'Từ vựng',
    path: '/admin/vocabularies',
    icon: <TranslateIcon />
  }, {
    title: 'Ngân hàng từ vựng',
    path: '/admin/vocab-banks',
    icon: <LibraryBooksIcon />
  }, {
    title: 'Bài kiểm tra',
    path: '/admin/audio-tests',
    icon: <HeadphonesIcon />
  }]
}, {
  title: 'Quản lý Người dùng',
  icon: <PeopleIcon />,
  children: [{
    title: 'Danh sách học viên',
    path: '/admin/learners',
    icon: <PeopleIcon />
  }, {
    title: 'Tiến độ học tập',
    path: '/admin/profiles',
    icon: <AssessmentIcon />
  }, {
    title: 'Kết quả thi',
    path: '/admin/test-results',
    icon: <AssessmentIcon />
  }]
}];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    'Quản lý Nội dung': true,
    'Quản lý Người dùng': true
  });

  const handleToggle = (title: string) => {
    setOpenMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path;
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    if (hasChildren) {
      return (
        <Box key={item.title}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleToggle(item.title)}
              sx={{
                pl: level * 2 + 2.5,
                py: 1.5,
                borderRadius: '12px',
                mx: 1,
                mb: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(99, 102, 241, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{
                color: 'rgba(255, 255, 255, 0.6)',
                minWidth: 40,
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                sx={{
                  '& .MuiTypography-root': {
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    color: 'rgba(255, 255, 255, 0.85)',
                    letterSpacing: '0.01em',
                  },
                }}
              />
              {openMenus[item.title]
                ? <ExpandLess sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
                : <ExpandMore sx={{ color: 'rgba(255, 255, 255, 0.5)' }} />
              }
            </ListItemButton>
          </ListItem>
          <Collapse in={openMenus[item.title]} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children!.map(child => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        </Box>
      );
    }

    return (
      <ListItem key={item.title} disablePadding>
        <ListItemButton
          onClick={() => item.path && handleNavigate(item.path)}
          sx={{
            pl: level * 2 + 2.5,
            py: 1.2,
            borderRadius: '12px',
            mx: 1,
            mb: 0.3,
            backgroundColor: isActive(item.path) ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            borderLeft: isActive(item.path) ? '3px solid #818CF8' : '3px solid transparent',
            '&:hover': {
              backgroundColor: isActive(item.path) ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.08)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <ListItemIcon sx={{
            color: isActive(item.path) ? '#A5B4FC' : 'rgba(255, 255, 255, 0.55)',
            minWidth: 40,
            transition: 'color 0.2s ease',
          }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.title}
            sx={{
              '& .MuiTypography-root': {
                fontSize: '0.875rem',
                fontWeight: isActive(item.path) ? 600 : 400,
                color: isActive(item.path) ? '#E0E7FF' : 'rgba(255, 255, 255, 0.7)',
                transition: 'all 0.2s ease',
              },
            }}
          />
        </ListItemButton>
      </ListItem>
    );
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          background: 'linear-gradient(180deg, #1E1B4B 0%, #262160 40%, #1E1545 100%)',
          borderRight: '1px solid rgba(99, 102, 241, 0.1)',
        },
      }}
    >
      <Box sx={{
        p: 2.5,
        borderBottom: '1px solid rgba(99, 102, 241, 0.12)',
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Box sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <SchoolIcon sx={{ color: '#fff', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{
              color: '#fff',
              fontWeight: 700,
              fontSize: '1.05rem',
              lineHeight: 1.3,
            }}>
              JPLearning
            </Typography>
            <Typography variant="caption" sx={{
              color: 'rgba(165, 180, 252, 0.6)',
              fontSize: '0.7rem',
              letterSpacing: '0.05em',
            }}>
              Admin Panel
            </Typography>
          </Box>
        </Box>
      </Box>
      <Divider sx={{ borderColor: 'rgba(99, 102, 241, 0.1)' }} />
      <List sx={{ pt: 1.5, px: 0.5 }}>
        {menuItems.map(item => renderMenuItem(item))}
      </List>
    </Drawer>
  );
};

export default Sidebar;