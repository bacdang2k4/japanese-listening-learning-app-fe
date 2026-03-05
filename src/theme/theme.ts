import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#C9E4FF', // Pastel Blue (matching HSL 210 90% 88%)
      light: '#E1F0FF',
      dark: '#A3D1FF',
      contrastText: '#0D1E36',
    },
    secondary: {
      main: '#D1F4F9', // Pastel Cyan (matching HSL 184 65% 91%)
      light: '#E7F9FB',
      dark: '#A6E9F2',
      contrastText: '#183B40',
    },
    background: {
      default: '#F2F9FF', // Very light pastel blue tint
      paper: '#ffffff',
    },
    text: {
      primary: '#0D1E36',
      secondary: '#44515E',
    },
    success: {
      main: '#C8F3D1', // Pastel Green
      contrastText: '#1B4025',
    },
    warning: {
      main: '#FBE8C8', // Pastel Yellow/Orange
      contrastText: '#423214',
    },
    error: {
      main: '#FBC8C8', // Pastel Red
      contrastText: '#421414',
    },
  },
  typography: {
    fontFamily: '"Outfit", "Inter", sans-serif', // More modern fonts
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 20, // Large Material 3 style radius
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 24, // Pill shape for buttons
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.03)',
          border: '1px solid rgba(0, 0, 0, 0.03)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#F2F9FF',
          '& .MuiTableCell-root': {
            fontWeight: 600,
            color: '#0D1E36',
          },
        },
      },
    },
  },
});

export default theme;
