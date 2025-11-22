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
      { test: (pwd) => /.{8,}/.test(pwd), label: 'At least 8 characters' },
      { test: (pwd) => /[A-Z]/.test(pwd), label: 'One uppercase letter' },
      { test: (pwd) => /[a-z]/.test(pwd), label: 'One lowercase letter' },
      { test: (pwd) => /[0-9]/.test(pwd), label: 'One number' },
      {
        test: (pwd) => /[^A-Za-z0-9]/.test(pwd),
        label: 'One special character',
      },
    ],
    [],
  );

  const validate = () => {
    const nextErrors = {};
    if (!values.loginId.trim()) nextErrors.loginId = 'Login ID is required';
    if (!values.email.trim()) nextErrors.email = 'Email is required';
    if (!rules.every((rule) => rule.test(values.password))) {
      nextErrors.password = 'Password does not meet complexity requirements';
    }
    if (values.password !== values.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords must match';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await register({
        email: values.email,
        password: values.password,
        user_id: values.loginId || undefined,
      });

      if (response.success) {
        // Navigate to dashboard on success
        navigate('/dashboard');
      } else {
        setApiError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setApiError('An error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
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
                variant="filled"
                label="Login ID (Optional)"
                fullWidth
                value={values.loginId}
                onChange={handleChange('loginId')}
                error={Boolean(errors.loginId)}
                helperText={errors.loginId}
                disabled={loading}
                InputProps={{ sx: { background: 'rgba(255,255,255,0.08)' } }}
              />
              <TextField
                variant="filled"
                label="Email"
                type="email"
                required
                fullWidth
                value={values.email}
                onChange={handleChange('email')}
                error={Boolean(errors.email)}
                helperText={errors.email}
                disabled={loading}
                InputProps={{ sx: { background: 'rgba(255,255,255,0.08)' } }}
              />
              <TextField
                variant="filled"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                fullWidth
                value={values.password}
                onChange={handleChange('password')}
                error={Boolean(errors.password)}
                helperText={errors.password}
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
              <TextField
                variant="filled"
                label="Re-enter Password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                fullWidth
                value={values.confirmPassword}
                onChange={handleChange('confirmPassword')}
                error={Boolean(errors.confirmPassword)}
                helperText={errors.confirmPassword}
                disabled={loading}
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

