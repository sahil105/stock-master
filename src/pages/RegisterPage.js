import { useMemo, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
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
import { register } from '../services/authApi';

function RegisterPage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    loginId: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const togglePassword = () => setShowPassword((prev) => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword((prev) => !prev);

  const rules = useMemo(
    () => [
      { test: (pwd) => pwd.length > 8, label: 'More than 8 characters' },
      { test: (pwd) => /[A-Z]/.test(pwd), label: 'One uppercase letter' },
      { test: (pwd) => /[a-z]/.test(pwd), label: 'One lowercase letter' },
      {
        test: (pwd) => /[^A-Za-z0-9]/.test(pwd),
        label: 'One special character',
      },
    ],
    [],
  );

  const validate = (field = null) => {
    const nextErrors = { ...errors };
    
    // Validate specific field or all fields
    const validateField = (fieldName) => {
      if (field && field !== fieldName) return;
      
      if (fieldName === 'loginId') {
        if (!values.loginId.trim()) {
          nextErrors.loginId = 'Login ID is required';
        } else if (values.loginId.trim().length < 6) {
          nextErrors.loginId = 'Login ID must be at least 6 characters';
        } else if (values.loginId.trim().length > 12) {
          nextErrors.loginId = 'Login ID cannot exceed 12 characters';
        } else {
          delete nextErrors.loginId;
        }
      }
      
      if (fieldName === 'email') {
        if (!values.email.trim()) {
          nextErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
          nextErrors.email = 'Please enter a valid email address (e.g., user@example.com)';
        } else {
          delete nextErrors.email;
        }
      }
      
      if (fieldName === 'password') {
        if (!values.password) {
          nextErrors.password = 'Password is required';
        } else if (values.password.length <= 8) {
          nextErrors.password = 'Password must be more than 8 characters';
        } else if (!/[a-z]/.test(values.password)) {
          nextErrors.password = 'Password must contain at least one lowercase letter';
        } else if (!/[A-Z]/.test(values.password)) {
          nextErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!/[^A-Za-z0-9]/.test(values.password)) {
          nextErrors.password = 'Password must contain at least one special character (!@#$%^&*...)';
        } else {
          delete nextErrors.password;
          // Re-validate confirm password if password changed
          if (values.confirmPassword) {
            validateField('confirmPassword');
          }
        }
      }
      
      if (fieldName === 'confirmPassword') {
        if (!values.confirmPassword) {
          nextErrors.confirmPassword = 'Please confirm your password';
        } else if (values.password !== values.confirmPassword) {
          nextErrors.confirmPassword = 'Passwords do not match. Please enter the same password.';
        } else {
          delete nextErrors.confirmPassword;
        }
      }
    };
    
    if (field) {
      validateField(field);
    } else {
      validateField('loginId');
      validateField('email');
      validateField('password');
      validateField('confirmPassword');
    }
    
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setApiError('');
    
    // Validate all fields before submitting
    if (!validate()) {
      // Focus on first error field
      const firstErrorField = Object.keys(errors)[0];
      if (firstErrorField) {
        document.querySelector(`[name="${firstErrorField}"]`)?.focus();
      }
      return;
    }

    setLoading(true);
    try {
      const response = await register({
        email: values.email.trim(),
        password: values.password,
        user_id: values.loginId.trim(),
      });

      if (response.success) {
        // Show success message briefly before navigating
        setApiError('');
        // Navigate to login page on success (user needs to login)
        setTimeout(() => {
          navigate('/login', { 
            state: { message: 'Registration successful! Please login with your credentials.' }
          });
        }, 500);
      } else {
        // Parse and show user-friendly error messages
        let errorMsg = response.message || 'Registration failed. Please try again.';
        
        // Handle backend validation errors
        if (errorMsg.includes('Login ID')) {
          setErrors((prev) => ({ ...prev, loginId: errorMsg }));
        } else if (errorMsg.includes('Email') || errorMsg.includes('email')) {
          setErrors((prev) => ({ ...prev, email: errorMsg }));
        } else if (errorMsg.includes('Password') || errorMsg.includes('password')) {
          setErrors((prev) => ({ ...prev, password: errorMsg }));
        } else {
          setApiError(errorMsg);
        }
      }
    } catch (err) {
      setApiError('Unable to connect to server. Please check your internet connection and try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Clear API error when user starts typing
    if (apiError) {
      setApiError('');
    }
    
    // Real-time validation on blur or after typing
    if (value) {
      // Small delay to avoid validating on every keystroke
      setTimeout(() => {
        validate(field);
      }, 300);
    }
  };

  return (
    <Box className="auth-root">
      <Paper elevation={6} className="auth-card">
        <Stack spacing={3}>
          <LogoMark />
          <Stack spacing={1}>
            <Typography variant="h4" fontWeight={700}>
              Create account
            </Typography>
            <Typography color="text.secondary">
              Provide basic details and a secure login ID to join StockMaster.
            </Typography>
          </Stack>

          <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />

          <Box component="form" onSubmit={handleRegister}>
            <Stack spacing={2}>
              {apiError && (
                <Alert severity="error" onClose={() => setApiError('')}>
                  {apiError}
                </Alert>
              )}
              <TextField
                name="loginId"
                variant="filled"
                label="Login ID"
                required
                fullWidth
                value={values.loginId}
                onChange={handleChange('loginId')}
                onBlur={() => validate('loginId')}
                error={Boolean(errors.loginId)}
                helperText={errors.loginId || 'Must be between 6-12 characters'}
                disabled={loading}
                placeholder="Enter your login ID"
                InputProps={{ sx: { background: 'rgba(255,255,255,0.08)' } }}
              />
              <TextField
                name="email"
                variant="filled"
                label="Email"
                type="email"
                required
                fullWidth
                value={values.email}
                onChange={handleChange('email')}
                onBlur={() => validate('email')}
                error={Boolean(errors.email)}
                helperText={errors.email || 'Enter your email address'}
                disabled={loading}
                placeholder="example@email.com"
                InputProps={{ sx: { background: 'rgba(255,255,255,0.08)' } }}
              />
              <TextField
                name="password"
                variant="filled"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                fullWidth
                value={values.password}
                onChange={handleChange('password')}
                onBlur={() => validate('password')}
                error={Boolean(errors.password)}
                helperText={errors.password || 'Must be more than 8 characters with uppercase, lowercase, and special character'}
                disabled={loading}
                placeholder="Enter a strong password"
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
              <TextField
                name="confirmPassword"
                variant="filled"
                label="Re-enter Password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                fullWidth
                value={values.confirmPassword}
                onChange={handleChange('confirmPassword')}
                onBlur={() => validate('confirmPassword')}
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword || 'Re-enter the same password'}
                disabled={loading}
                placeholder="Confirm your password"
                InputProps={{
                  sx: { background: 'rgba(255,255,255,0.08)' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={toggleConfirmPassword} edge="end" disabled={loading}>
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Password should include:
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1} mt={1}>
                  {rules.map((rule) => (
                    <Chip
                      key={rule.label}
                      label={rule.label}
                      size="small"
                      color={rule.test(values.password) ? 'secondary' : 'default'}
                      variant={rule.test(values.password) ? 'filled' : 'outlined'}
                    />
                  ))}
                </Stack>
              </Box>
              <Button 
                variant="contained" 
                color="secondary" 
                fullWidth 
                type="submit"
                disabled={loading}
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </Button>
            </Stack>
          </Box>

          <Typography color="text.secondary" sx={{ fontSize: 14 }}>
            Already have an account?{' '}
            <Link component={RouterLink} to="/login" underline="hover">
              Sign in
            </Link>
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}

export default RegisterPage;

