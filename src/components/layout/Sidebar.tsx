import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse, Typography, Divider } from '@mui/material';
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
            pl: level * 2 + 2,
            py: 1.5,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)'
            }
          }}>
              <ListItemIcon sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              minWidth: 40
            }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.title} sx={{
              '& .MuiTypography-root': {
                fontSize: '0.95rem',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.9)'
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
        pl: level * 2 + 2,
        py: 1.2,
        backgroundColor: isActive(item.path) ? 'rgba(25, 118, 210, 0.3)' : 'transparent',
        borderLeft: isActive(item.path) ? '3px solid #42a5f5' : '3px solid transparent',
        '&:hover': {
          backgroundColor: isActive(item.path) ? 'rgba(25, 118, 210, 0.4)' : 'rgba(255, 255, 255, 0.08)'
        }
      }}>
          <ListItemIcon sx={{
          color: isActive(item.path) ? '#42a5f5' : 'rgba(255, 255, 255, 0.7)',
          minWidth: 40
        }}>
            {item.icon}
          </ListItemIcon>
          <ListItemText primary={item.title} sx={{
          '& .MuiTypography-root': {
            fontSize: '0.9rem',
            fontWeight: isActive(item.path) ? 600 : 400,
            color: isActive(item.path) ? '#fff' : 'rgba(255, 255, 255, 0.8)'
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
      backgroundColor: '#1a1a2e',
      borderRight: 'none'
    }
  }}>
      <Box sx={{
      p: 3,
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
    }}>
        <Typography variant="h5" sx={{
        color: '#fff',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>Luyện Nghe Tiếng Nhật<SchoolIcon sx={{
          color: '#42a5f5',
          fontSize: 32
        }} />
          日本語学習
        </Typography>
        <Typography variant="body2" sx={{
        color: 'rgba(255, 255, 255, 0.5)',
        mt: 0.5
      }}>
          Hệ thống quản lý
        </Typography>
      </Box>
      <Divider sx={{
      borderColor: 'rgba(255, 255, 255, 0.1)'
    }} />
      <List sx={{
      pt: 2
    }}>
        {menuItems.map(item => renderMenuItem(item))}
      </List>
    </Drawer>;
};
export default Sidebar;