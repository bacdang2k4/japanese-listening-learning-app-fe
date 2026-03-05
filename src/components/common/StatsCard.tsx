import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  /**
   * Accepts either a theme palette key (e.g. 'primary', 'success')
   * or a hex color string like '#C9E4FF'.
   */
  color?: string;
  subtitle?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, subtitle }) => {
  return (
    <Card
      sx={{
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: (theme) => {
                const paletteKeys = ['primary', 'secondary', 'success', 'error', 'warning', 'info'];
                if (color && paletteKeys.includes(color)) {
                  // use theme palette with slight alpha for background
                  // @ts-ignore - dynamic access on palette
                  return alpha(theme.palette[color].main, 0.12);
                }
                if (color) {
                  // assume hex string like '#C9E4FF'
                  return `${color}15`;
                }
                return alpha(theme.palette.primary.main, 0.12);
              },
              color: (theme) => {
                const paletteKeys = ['primary', 'secondary', 'success', 'error', 'warning', 'info'];
                if (color && paletteKeys.includes(color)) {
                  // @ts-ignore
                  return theme.palette[color].main;
                }
                if (color) return color;
                return theme.palette.primary.main;
              },
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
