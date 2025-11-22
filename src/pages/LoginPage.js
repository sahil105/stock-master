import { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});

  // Check for success message from registration
  useEffect(() => {
    if (location.state?.message) {
      setSuccess(location.state.message);
      // Clear state to prevent message from showing again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const togglePassword = () => setShowPassword((prev) => !prev);

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setError('');
    setErrors({});
    
    // Validate form before submitting
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);

    try {
      const response = await login({ email, password });
      
      if (response.success) {
        // Navigate to dashboard on success
        navigate('/dashboard');
      } else {
        // Show user-friendly error message
        const errorMsg = response.message || 'Invalid Login Id or Password';
        setError(errorMsg);
      }
    } catch (err) {
      setError('Unable to connect to server. Please check your internet connection and try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field) => (event) => {
    const value = event.target.value;
    if (field === 'email') {
      setEmail(value);
    } else if (field === 'password') {
      setPassword(value);
    }
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    // Clear general error when user starts typing
    if (error) {
      setError('');
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
              {success && (
                <Alert severity="success" onClose={() => setSuccess('')}>
                  {success}
                </Alert>
              )}
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
                onChange={handleFieldChange('email')}
                onBlur={() => validateForm()}
                error={Boolean(errors.email)}
                helperText={errors.email}
                disabled={loading}
                placeholder="Enter your email address"
                InputProps={{ sx: { background: 'rgba(255,255,255,0.08)' } }}
              />
              <TextField
                variant="filled"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                fullWidth
                value={password}
                onChange={handleFieldChange('password')}
                onBlur={() => validateForm()}
                error={Boolean(errors.password)}
                helperText={errors.password}
                disabled={loading}
                placeholder="Enter your password"
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

