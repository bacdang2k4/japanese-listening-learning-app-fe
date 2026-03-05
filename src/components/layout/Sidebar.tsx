import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse, Typography, Divider } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Dashboard as DashboardIcon, School as SchoolIcon, Topic as TopicIcon, Translate as TranslateIcon, Headphones as HeadphonesIcon, Quiz as QuizIcon, People as PeopleIcon, Assessment as AssessmentIcon, ExpandLess, ExpandMore, MenuBook as MenuBookIcon } from '@mui/icons-material';
const drawerWidth = 280;
interface MenuItem {
  title: string;
  path?: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}
const menuItems: MenuItem[] = [{
  title: 'Dashboard',
  path: '/',
  icon: <DashboardIcon />
}, {
  title: 'Quản lý Nội dung',
  icon: <MenuBookIcon />,
  children: [{
    title: 'Cấp độ (Levels)',
    path: '/levels',
    icon: <SchoolIcon />
  }, {
    title: 'Chủ đề (Topics)',
    path: '/topics',
    icon: <TopicIcon />
  }, {
    title: 'Từ vựng',
    path: '/vocabularies',
    icon: <TranslateIcon />
  }, {
    title: 'Bài kiểm tra',
    path: '/audio-tests',
    icon: <HeadphonesIcon />
  }, {
    title: 'Câu hỏi',
    path: '/questions',
    icon: <QuizIcon />
  }]
}, {
  title: 'Quản lý Người dùng',
  icon: <PeopleIcon />,
  children: [{
    title: 'Danh sách học viên',
    path: '/learners',
    icon: <PeopleIcon />
  }, {
    title: 'Tiến độ học tập',
    path: '/profiles',
    icon: <AssessmentIcon />
  }, {
    title: 'Kết quả thi',
    path: '/test-results',
    icon: <AssessmentIcon />
  }]
}];
const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [openMenus, setOpenMenus] = useState<{
    [key: string]: boolean;
  }>({
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
      return <Box key={item.title}>
        <ListItem disablePadding>
          <ListItemButton onClick={() => handleToggle(item.title)} sx={{
            px: 2,
            py: 1.5,
            borderRadius: 3,
            mb: 0.5,
            '&:hover': {
              backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12)
            }
          }}>
            <ListItemIcon sx={{
              color: '#4D4459',
              minWidth: 40
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.title} sx={{
              '& .MuiTypography-root': {
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#1A0B2E'
              }
            }} />
            {openMenus[item.title] ? <ExpandLess sx={{
              color: 'rgba(255, 255, 255, 0.7)'
            }} /> : <ExpandMore sx={{
              color: 'rgba(255, 255, 255, 0.7)'
            }} />}
          </ListItemButton>
        </ListItem>
        <Collapse in={openMenus[item.title]} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </List>
        </Collapse>
      </Box>;
    }
    return <ListItem key={item.title} disablePadding>
          <ListItemButton onClick={() => item.path && handleNavigate(item.path)} sx={{
        px: 2,
        py: 1.2,
        borderRadius: 3,
        mb: 0.5,
        backgroundColor: (theme) => isActive(item.path) ? alpha(theme.palette.primary.main, 0.18) : 'transparent',
        '&:hover': {
          backgroundColor: (theme) => isActive(item.path) ? alpha(theme.palette.primary.main, 0.18) : alpha(theme.palette.primary.main, 0.06)
        }
      }}>
        <ListItemIcon sx={{
          color: (theme) => isActive(item.path) ? theme.palette.primary.dark : '#4D4459',
          minWidth: 40
        }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText primary={item.title} sx={{
          '& .MuiTypography-root': {
            fontSize: '0.875rem',
            fontWeight: isActive(item.path) ? 700 : 500,
            color: (theme) => isActive(item.path) ? theme.palette.primary.dark : '#4D4459'
          }
        }} />
      </ListItemButton>
    </ListItem>;
  };
  return <Drawer variant="permanent" sx={{
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
      width: drawerWidth,
      boxSizing: 'border-box',
      backgroundColor: (theme) => theme.palette.background.default,
      borderRight: '1px solid rgba(0, 0, 0, 0.05)',
    }
  }}>
    <Box sx={{
      p: 3,
      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08)
    }}>
      <Typography variant="h5" sx={{
        color: '#1A0B2E',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>Luyện Nghe<SchoolIcon sx={{
        color: (theme) => theme.palette.primary.main,
        fontSize: 32
      }} />
      </Typography>
      <Typography variant="body2" sx={{
        color: '#4D4459',
        mt: 0.5,
        fontWeight: 500
      }}>
        Hệ thống quản lý
      </Typography>
    </Box>
    <Divider sx={{
      borderColor: 'rgba(0, 0, 0, 0.05)'
    }} />
    <List sx={{
      pt: 2,
      px: 1.5
    }}>
      {menuItems.map(item => renderMenuItem(item))}
    </List>
  </Drawer>;
};
export default Sidebar;