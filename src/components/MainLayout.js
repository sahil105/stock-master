import { useEffect, useState } from 'react';
import { AppBar, Box, Button, Chip, Menu, MenuItem, Stack, Toolbar } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import LogoMark from './LogoMark';
import { navSequence, operationsSubmenu, settingsSubmenu } from '../data/dashboardData';

function MainLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [activeMain, setActiveMain] = useState('Dashboard');
  const isOperationsActive = operationsSubmenu.some((item) => item.path === location.pathname);
  const isSettingsActive = settingsSubmenu.some((item) => item.path === location.pathname);

  useEffect(() => {
    const active = navSequence.find((entry) => entry.type === 'item' && entry.path === location.pathname);
    if (active) {
      setActiveMain(active.label);
    } else if (isOperationsActive) {
      setActiveMain('Operations');
    } else if (isSettingsActive) {
      setActiveMain('Settings');
    }
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

  return (
    <Box className="layout-root">
      <AppBar position="sticky" className="top-nav" elevation={0} color="transparent">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
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
            <Button variant="outlined" color="inherit">
              Notification
            </Button>
            <Button variant="contained" color="secondary">
              Logout
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>
      <Box className="main-panel">{children}</Box>
    </Box>
  );
}

export default MainLayout;

