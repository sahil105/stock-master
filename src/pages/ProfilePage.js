import { useState, useEffect } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
  Divider,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import MainLayout from '../components/MainLayout';
import { getUser } from '../services/auth';

function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [formData, setFormData] = useState({
    user_id: '',
    email: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      // First try to get from localStorage
      // User object from login: { id, name, email, role }
      const localUser = getUser();
      if (localUser) {
        setUser(localUser);
        setFormData({
          user_id: localUser.name || localUser.user_id || '',
          email: localUser.email || '',
        });
      }

      // User data is stored in localStorage after login
      // Backend doesn't have a /me endpoint, so we rely on localStorage data
      // which is set during login: { id, name, email, role }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while loading your profile.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            My Profile
          </Typography>
          <Typography color="text.secondary">
            View and manage your account information.
          </Typography>
        </Box>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Stack spacing={3} alignItems="center">
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: 'secondary.main',
                fontSize: '3rem',
                fontWeight: 600,
              }}
            >
              {getUserInitials()}
            </Avatar>

            <Divider sx={{ width: '100%' }} />

            <Stack spacing={2} sx={{ width: '100%', maxWidth: 500 }}>
              <TextField
                label="User ID"
                value={formData.user_id}
                fullWidth
                disabled
                variant="outlined"
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />

              <TextField
                label="Email"
                type="email"
                value={formData.email}
                fullWidth
                disabled
                variant="outlined"
              />

              <Box sx={{ pt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Note: Profile information is managed by the system. Contact an administrator to update your details.
                </Typography>
              </Box>
            </Stack>
          </Stack>
        </Paper>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}

export default ProfilePage;

