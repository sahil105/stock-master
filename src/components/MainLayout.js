import { useEffect, useState } from 'react';
import { 
  AppBar, 
  Avatar, 
  Box, 
  Button, 
  Chip, 
  Divider,
  IconButton,
  Menu, 
  MenuItem, 
  Stack, 
  Toolbar,
  Typography
} from '@mui/material';
import { AccountCircle, ExitToApp, Person } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import LogoMark from './LogoMark';
import { navSequence, operationsSubmenu, settingsSubmenu } from '../data/dashboardData';
import { getUser, logout } from '../services/auth';

function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const [activeMain, setActiveMain] = useState('Dashboard');
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

  const handleProfileClick = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const handleProfileSelect = (action) => {
    handleProfileClose();
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

  return (
    <Box className="layout-root">
      <AppBar position="sticky" className="top-nav" elevation={0} color="transparent">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box>
              <IconButton
                onClick={handleProfileClick}
                aria-controls="profile-menu"
                aria-haspopup="true"
                sx={{
                  bgcolor: 'secondary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'secondary.dark',
                  },
                  width: 40,
                  height: 40,
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  {getUserInitials()}
                </Avatar>
              </IconButton>
              <Menu
                id="profile-menu"
                anchorEl={profileAnchorEl}
                open={Boolean(profileAnchorEl)}
                onClose={handleProfileClose}
                elevation={6}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    '& .MuiMenuItem-root': {
                      px: 2,
                      py: 1.5,
                    },
                  },
                }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {getUserName()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.email || 'user@example.com'}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => handleProfileSelect('profile')}>
                  <Person sx={{ mr: 1.5, fontSize: 20 }} />
                  My Profile
                </MenuItem>
                <Divider />
                <MenuItem 
                  onClick={() => handleProfileSelect('logout')}
                  sx={{ color: 'error.main' }}
                >
                  <ExitToApp sx={{ mr: 1.5, fontSize: 20 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
            <LogoMark label="StockMaster" />
            <Chip color="secondary" size="small" label="Live" />
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
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                navigate('/notifications');
                if (location.pathname === '/notifications') {
                  setActiveMain('Notifications');
                }
              }}
            >
              Notification
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box className="main-panel">{children}</Box>
    </Box>
  );
}

export default MainLayout;

