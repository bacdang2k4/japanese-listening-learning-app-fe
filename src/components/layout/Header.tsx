import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Box,
  Badge,
  Tooltip,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          variant="h5"
          sx={{
            color: '#1a1a2e',
            fontWeight: 600,
          }}
        >
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Thông báo">
            <IconButton>
              <Badge badgeContent={3} color="error">
                <NotificationsIcon sx={{ color: '#666' }} />
              </Badge>
            </IconButton>
          </Tooltip>
          <Tooltip title="Cài đặt">
            <IconButton>
              <SettingsIcon sx={{ color: '#666' }} />
            </IconButton>
          </Tooltip>
          <Avatar
            sx={{
              ml: 2,
              bgcolor: '#1976d2',
              width: 40,
              height: 40,
            }}
          >
            A
          </Avatar>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
