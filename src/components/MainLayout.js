import { useEffect, useState } from 'react';
import { 
  AppBar, 
  Avatar, 
  Box, 
  Button, 
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu, 
  MenuItem, 
  Stack, 
  Toolbar,
  Typography
} from '@mui/material';
import { ExitToApp, Menu as MenuIcon, NotificationsOutlined, Person } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import LogoMark from './LogoMark';
import { navSequence, operationsSubmenu, settingsSubmenu } from '../data/dashboardData';
import { getUser, logout } from '../services/auth';

function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const [activeMain, setActiveMain] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isOperationsActive = operationsSubmenu.some((item) => item.path === location.pathname);
  const isSettingsActive = settingsSubmenu.some((item) => item.path === location.pathname);

  useEffect(() => {
    const active = navSequence.find((entry) => entry.type === 'item' && entry.path === location.pathname);
    if (active) {
      setActiveMain(active.label);
    } else if (location.pathname === '/notifications') {
      setActiveMain('Notifications');
    } else if (isOperationsActive) {
      setActiveMain('Operations');
    } else if (isSettingsActive) {
      setActiveMain('Settings');
    }
    // Load user data
    const userData = getUser();
    setUser(userData);
  }, [location.pathname, isOperationsActive, isSettingsActive]);

  const handleOperationsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleOperationsClose = () => {
    setAnchorEl(null);
  };

  const handleOperationSelect = (path) => {
    setActiveMain('Operations');
    navigate(path);
    handleOperationsClose();
  };

  const handleSettingsClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleSettingsSelect = (path) => {
    setActiveMain('Settings');
    navigate(path);
    handleSettingsClose();
  };

  const handleProfileSelect = (action) => {
    setSidebarOpen(false);
    if (action === 'profile') {
      navigate('/profile');
    } else if (action === 'logout') {
      logout();
    }
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getUserName = () => {
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'User';
  };

  const drawerWidth = 260;

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box className="layout-root" sx={{ display: 'flex' }}>
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={handleSidebarClose}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#ffffff',
            borderRight: '1px solid rgba(15, 23, 42, 0.08)',
            boxShadow: '2px 0 8px rgba(15, 23, 42, 0.08)',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(15, 23, 42, 0.08)' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar
              sx={{
                bgcolor: 'secondary.main',
                color: 'white',
                width: 48,
                height: 48,
                fontSize: '1rem',
                fontWeight: 600,
              }}
            >
              {getUserInitials()}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {getUserName()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || 'user@example.com'}
              </Typography>
            </Box>
          </Stack>
        </Box>
        <List sx={{ pt: 1 }}>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleProfileSelect('profile')}
              sx={{
                py: 1.5,
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 122, 24, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Person sx={{ color: 'text.primary' }} />
              </ListItemIcon>
              <ListItemText primary="My Profile" />
            </ListItemButton>
          </ListItem>
          <Divider />
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => handleProfileSelect('logout')}
              sx={{
                py: 1.5,
                px: 2,
                color: 'error.main',
                '&:hover': {
                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <ExitToApp sx={{ color: 'error.main' }} />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <AppBar position="sticky" className="top-nav" elevation={0} color="transparent">
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleSidebarToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
              <LogoMark label="StockMaster" />
              {/* <Chip color="secondary" size="small" label="Live" /> */}
            </Stack>
          <Stack direction="row" spacing={1} className="nav-links">
            {navSequence.map((entry) => {
              if (entry.type === 'operations') {
                return (
                  <div key="operations">
                    <Button
                      color={activeMain === 'Operations' ? 'secondary' : 'inherit'}
                      variant={activeMain === 'Operations' ? 'contained' : 'text'}
                      onClick={handleOperationsClick}
                      aria-controls="operations-menu"
                      aria-haspopup="true"
                    >
                      Operations
                    </Button>
                    <Menu
                      id="operations-menu"
                      anchorEl={anchorEl}
                      open={Boolean(anchorEl)}
                      onClose={handleOperationsClose}
                      elevation={6}
                    >
                      {operationsSubmenu.map((item) => (
                        <MenuItem key={item.label} onClick={() => handleOperationSelect(item.path)}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  </div>
                );
              }

              if (entry.type === 'settings') {
                return (
                  <div key="settings">
                    <Button
                      color={activeMain === 'Settings' ? 'secondary' : 'inherit'}
                      variant={activeMain === 'Settings' ? 'contained' : 'text'}
                      onClick={handleSettingsClick}
                      aria-controls="settings-menu"
                      aria-haspopup="true"
                    >
                      Setting
                    </Button>
                    <Menu
                      id="settings-menu"
                      anchorEl={settingsAnchorEl}
                      open={Boolean(settingsAnchorEl)}
                      onClose={handleSettingsClose}
                      elevation={6}
                    >
                      {settingsSubmenu.map((item) => (
                        <MenuItem key={item.label} onClick={() => handleSettingsSelect(item.path)}>
                          {item.label}
                        </MenuItem>
                      ))}
                    </Menu>
                  </div>
                );
              }

              return (
                <Button
                  key={entry.label}
                  color={activeMain === entry.label ? 'secondary' : 'inherit'}
                  variant={activeMain === entry.label ? 'contained' : 'text'}
                  onClick={() => {
                    setActiveMain(entry.label);
                    navigate(entry.path);
                  }}
                >
                  {entry.label}
                </Button>
              );
            })}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconButton
              color="inherit"
              onClick={() => {
                navigate('/notifications');
                if (location.pathname === '/notifications') {
                  setActiveMain('Notifications');
                }
              }}
              sx={{
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <NotificationsOutlined />
            </IconButton>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box className="main-panel" sx={{ ml: 0 }}>{children}</Box>
      </Box>
    </Box>
  );
}

export default MainLayout;

