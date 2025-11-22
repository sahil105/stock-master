import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import LogoMark from '../components/LogoMark';
import { login } from '../services/authApi';

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const togglePassword = () => setShowPassword((prev) => !prev);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({ email, password });
      
      if (response.success) {
        // Navigate to dashboard on success
        navigate('/dashboard');
      } else {
        setError(response.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-root">
      <Paper elevation={6} className="auth-card">
        <Stack spacing={3}>
          <LogoMark />
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={700}>
              Sign in
            </Typography>
            <Typography color="text.secondary">
              Enter your credentials to continue to StockMaster’s dashboard.
            </Typography>
          </Stack>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

          <Box component="form" onSubmit={handleLogin}>
            <Stack spacing={2}>
              {error && (
                <Alert severity="error" onClose={() => setError('')}>
                  {error}
                </Alert>
              )}
              <TextField
                variant="filled"
                label="Email"
                type="email"
                required
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                InputProps={{ sx: { background: 'rgba(255,255,255,0.08)' } }}
              />
              <TextField
                variant="filled"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  sx: { background: 'rgba(255,255,255,0.08)' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={togglePassword} edge="end" disabled={loading}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button 
                variant="contained" 
                color="secondary" 
                fullWidth 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </Stack>
          </Box>

          <Typography color="text.secondary" sx={{ fontSize: 14 }}>
            Forgot password?{' '}
            <Link component={RouterLink} to="/reset-password" underline="hover">
              Reset via OTP
            </Link>
          </Typography>

          <Typography color="text.secondary" sx={{ fontSize: 14 }}>
            Don’t have an account?{' '}
            <Link component={RouterLink} to="/register" underline="hover">
              Sign up
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

export default LoginPage;

