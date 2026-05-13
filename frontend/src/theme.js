import { createTheme, alpha } from '@mui/material/styles';

export const getTheme = (mode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#1a73e8',
        light: '#4dabf5',
        dark: '#1557b0',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#00c853',
        light: '#5efc82',
        dark: '#009624',
      },
      error: {
        main: '#d32f2f',
      },
      warning: {
        main: '#f9a825',
      },
      success: {
        main: '#2e7d32',
      },
      info: {
        main: '#1a73e8',
      },
      background: {
        default: mode === 'dark' ? '#0a1929' : '#f8f9fa',
        paper: mode === 'dark' ? '#1e2a3a' : '#ffffff',
      },
      divider: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      text: {
        primary: mode === 'dark' ? '#e3e8ef' : '#202124',
        secondary: mode === 'dark' ? '#9aa5b4' : '#5f6368',
      },
      risk: {
        low: '#2e7d32',
        medium: '#f9a825',
        high: '#e65100',
        critical: '#c62828',
      },
    },
    typography: {
      fontFamily: '"Google Sans", "Roboto", "Helvetica Neue", "Arial", sans-serif',
      h1: { fontWeight: 400, fontSize: '2.5rem', letterSpacing: '-0.01em' },
      h2: { fontWeight: 400, fontSize: '2rem', letterSpacing: '-0.005em' },
      h3: { fontWeight: 400, fontSize: '1.75rem' },
      h4: { fontWeight: 500, fontSize: '1.5rem', letterSpacing: '0.005em' },
      h5: { fontWeight: 500, fontSize: '1.25rem' },
      h6: { fontWeight: 500, fontSize: '1.1rem' },
      subtitle1: { fontWeight: 500, fontSize: '1rem', letterSpacing: '0.009em' },
      subtitle2: { fontWeight: 500, fontSize: '0.875rem', letterSpacing: '0.007em' },
      body1: { fontWeight: 400, fontSize: '1rem', letterSpacing: '0.01em', lineHeight: 1.6 },
      body2: { fontWeight: 400, fontSize: '0.875rem', letterSpacing: '0.01em', lineHeight: 1.5 },
      button: { fontWeight: 500, fontSize: '0.875rem', letterSpacing: '0.02em', textTransform: 'none' },
      caption: { fontWeight: 400, fontSize: '0.75rem', letterSpacing: '0.025em' },
      overline: { fontWeight: 500, fontSize: '0.625rem', letterSpacing: '0.08em', textTransform: 'uppercase' },
    },
    shape: {
      borderRadius: 8,
    },
    shadows: [
      'none',
      '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
      '0 1px 2px 0 rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)',
      '0 1px 3px 0 rgba(60,64,67,0.3), 0 4px 8px 3px rgba(60,64,67,0.15)',
      '0 2px 3px 0 rgba(60,64,67,0.3), 0 6px 10px 4px rgba(60,64,67,0.15)',
      '0 4px 4px 0 rgba(60,64,67,0.3), 0 8px 12px 6px rgba(60,64,67,0.15)',
      ...Array(19).fill('0 4px 4px 0 rgba(60,64,67,0.3), 0 8px 12px 6px rgba(60,64,67,0.15)'),
    ],
    transitions: {
      duration: {
        shortest: 150,
        shorter: 200,
        short: 250,
        standard: 300,
        complex: 375,
        enteringScreen: 225,
        leavingScreen: 195,
      },
      easing: {
        easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
        easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
        sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarWidth: 'thin',
            '&::-webkit-scrollbar': { width: '8px' },
            '&::-webkit-scrollbar-thumb': {
              borderRadius: 4,
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            textTransform: 'none',
            fontWeight: 500,
            padding: '8px 24px',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          contained: ({ theme }) => ({
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
            },
          }),
          outlined: {
            borderWidth: '1px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 12,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none',
            transition: 'box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 2px 6px 2px rgba(60,64,67,0.15)',
            },
          }),
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: '1px solid',
            borderColor: 'rgba(0,0,0,0.08)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 8,
              transition: 'all 0.2s ease',
              '&.Mui-focused': {
                boxShadow: (theme) => `0 0 0 2px ${alpha('#1a73e8', 0.2)}`,
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            height: 6,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#f8f9fa',
            '& .MuiTableCell-head': {
              fontWeight: 600,
              color: theme.palette.text.secondary,
              fontSize: '0.75rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            },
          }),
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid',
            borderColor: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRadius: '0 16px 16px 0',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 8px',
            '&:hover': {
              backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            },
          },
        },
      },
    },
  });
