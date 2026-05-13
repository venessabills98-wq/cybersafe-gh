import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, Button, IconButton, Box,
  Drawer, List, ListItem, ListItemButton, ListItemText,
  useMediaQuery, useTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

const Navbar = ({ darkMode, onToggleTheme }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Community', path: '/community' },
    { label: 'Dashboard', path: '/dashboard' },
  ];

  return (
    <AppBar position="sticky" elevation={0} sx={{ backdropFilter: 'blur(8px)', backgroundColor: 'primary.main' }}>
      <Toolbar>
        <SecurityIcon sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{ flexGrow: 0, textDecoration: 'none', color: 'inherit', mr: 4 }}
        >
          CyberSafe GH
        </Typography>
        {isMobile ? (
          <>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
              <Box sx={{ width: 250, pt: 2 }}>
                <List>
                  {navItems.map((item) => (
                    <ListItem key={item.path} disablePadding>
                      <ListItemButton component={RouterLink} to={item.path} onClick={() => setDrawerOpen(false)}>
                        <ListItemText primary={item.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  <ListItem disablePadding>
                    <ListItemButton component={RouterLink} to="/admin/login" onClick={() => setDrawerOpen(false)}>
                      <ListItemText primary="Admin" />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Box>
            </Drawer>
          </>
        ) : (
          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Button key={item.path} color="inherit" component={RouterLink} to={item.path}>
                {item.label}
              </Button>
            ))}
          </Box>
        )}
        <IconButton color="inherit" component={RouterLink} to="/admin/login" sx={{ mr: 0.5 }}>
          <AdminPanelSettingsIcon />
        </IconButton>
        <IconButton color="inherit" onClick={onToggleTheme}>
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
