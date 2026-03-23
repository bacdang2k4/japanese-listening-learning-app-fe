import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider, Typography } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  Topic as TopicIcon,
  Translate as TranslateIcon,
  Headphones as HeadphonesIcon,
  People as PeopleIcon,
  Assessment as AssessmentIcon,
  MenuBook as MenuBookIcon,
  LibraryBooks as LibraryBooksIcon
} from '@mui/icons-material';

const drawerWidth = 280;

interface MenuItem {
  title: string;
  path: string;
  icon: React.ReactNode;
}

// Flat navigation structure with priority ordering
// Most frequently used/admin-critical items at the top
const menuItems: MenuItem[] = [
  // Priority 1: Dashboard (always first)
  {
    title: 'Dashboard',
    path: '/admin',
    icon: <DashboardIcon />
  },
  // Priority 2: User Management (most critical for admin)
  {
    title: 'Danh sách học viên',
    path: '/admin/learners',
    icon: <PeopleIcon />
  },
  {
    title: 'Kết quả thi',
    path: '/admin/test-results',
    icon: <AssessmentIcon />
  },
  {
    title: 'Tiến độ học tập',
    path: '/admin/profiles',
    icon: <AssessmentIcon />
  },
  {
    title: 'Bài kiểm tra',
    path: '/admin/audio-tests',
    icon: <HeadphonesIcon />
  }, 
  {
    title: 'Từ vựng',
    path: '/admin/vocabularies',
    icon: <TranslateIcon />
  },
  {
    title: 'Ngân hàng từ vựng',
    path: '/admin/vocab-banks',
    icon: <LibraryBooksIcon />
  },
  // Separator
  // Priority 3: Content Management (important but less frequent)
  {
    title: 'Cấp độ',
    path: '/admin/levels',
    icon: <SchoolIcon />
  },
  {
    title: 'Chủ đề',
    path: '/admin/topics',
    icon: <TopicIcon />
  }
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
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
      <List sx={{ pt: 1.5, px: 1 }}>
        {menuItems.map((item, index) => {
          // Add visual separator between User Management and Content Management sections
          const isSectionBreak = index === 3; // After Test Results

          return (
            <React.Fragment key={item.path}>
              {isSectionBreak && (
                <Divider sx={{
                  my: 1.5,
                  borderColor: 'rgba(99, 102, 241, 0.15)',
                  mx: 2
                }} />
              )}
              <ListItem disablePadding>
                <ListItemButton
                  onClick={() => handleNavigate(item.path)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    borderRadius: '10px',
                    mb: 0.5,
                    backgroundColor: isActive(item.path) ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    borderLeft: isActive(item.path) ? '3px solid #818CF8' : '3px solid transparent',
                    '&:hover': {
                      backgroundColor: isActive(item.path) ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.08)',
                      borderLeft: isActive(item.path) ? '3px solid #818CF8' : '3px solid rgba(99, 102, 241, 0.3)',
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
            </React.Fragment>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar;