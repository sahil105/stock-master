import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { requestOTP, resetPassword, login } from '../services/authApi';

function ResetPasswordPage() {
  const [step, setStep] = useState('request'); // 'request', 'verify', 'change'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordErrors, setPasswordErrors] = useState({});
  const navigate = useNavigate();

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await requestOTP({ email });
      if (response.success) {
        setStep('verify');
        setSuccess('OTP has been sent to your email address. Please check your inbox.');
      } else {
        setError(response.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Request OTP error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndReset = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setPasswordErrors({});

    // Validate password
    const errors = {};
    if (!newPassword) {
      errors.newPassword = 'Password is required';
    } else {
      if (newPassword.length < 8) {
        errors.newPassword = 'Password must be at least 8 characters long';
      } else if (!/[a-z]/.test(newPassword)) {
        errors.newPassword = 'Password must contain at least one lowercase letter';
      } else if (!/[A-Z]/.test(newPassword)) {
        errors.newPassword = 'Password must contain at least one uppercase letter';
      } else if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(newPassword)) {
        errors.newPassword = 'Password must contain at least one special character';
      }
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setLoading(true);

    try {
      // Reset password with OTP (backend verifies OTP and resets password)
      const response = await resetPassword({
        email,
        token: otp,
        password: newPassword,
      });

      if (response.success) {
        setSuccess('Password reset successfully! Logging you in...');
        
        // Auto-login with new password
        setTimeout(async () => {
          try {
            const loginResponse = await login({ email, password: newPassword });
            if (loginResponse.success) {
              navigate('/dashboard');
            } else {
              // If auto-login fails, redirect to login page
              setSuccess('Password reset successfully! Please login with your new password.');
              setTimeout(() => navigate('/login'), 2000);
            }
          } catch (err) {
            console.error('Auto-login error:', err);
            setSuccess('Password reset successfully! Please login with your new password.');
            setTimeout(() => navigate('/login'), 2000);
          }
        }, 1000);
      } else {
        setError(response.message || 'Failed to reset password. Please check your OTP and try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="auth-root">
      <Paper elevation={6} className="auth-card">
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Reset your password
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {step === 'request' && 'Enter the email linked to your account and we will send a one-time password to continue.'}
          {step === 'verify' && 'Enter the OTP code sent to your email and your new password.'}
        </Typography>
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {step === 'request' && (
          <Box component="form" onSubmit={handleRequestOtp} sx={{ mt: 2 }}>
            <Stack spacing={2}>
              <TextField 
                label="Email" 
                type="email" 
                required 
                fullWidth 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading} 
              />
              <Button variant="contained" fullWidth type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Request OTP'}
              </Button>
            </Stack>
          </Box>
        )}

        {step === 'verify' && (
          <Box component="form" onSubmit={handleVerifyAndReset} sx={{ mt: 2 }}>
            <Stack spacing={2}>
              <TextField 
                label="OTP code" 
                type="text" 
                required 
                fullWidth 
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                inputProps={{ maxLength: 6 }}
                disabled={loading}
                helperText="Enter the 6-digit code sent to your email"
              />
              <TextField
                label="New Password"
                type={showPassword ? 'text' : 'password'}
                required
                fullWidth
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (passwordErrors.newPassword) {
                    setPasswordErrors({ ...passwordErrors, newPassword: '' });
                  }
                }}
                disabled={loading}
                error={!!passwordErrors.newPassword}
                helperText={passwordErrors.newPassword || 'Must be 8+ chars with uppercase, lowercase, and special character'}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Confirm New Password"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                fullWidth
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (passwordErrors.confirmPassword) {
                    setPasswordErrors({ ...passwordErrors, confirmPassword: '' });
                  }
                }}
                disabled={loading}
                error={!!passwordErrors.confirmPassword}
                helperText={passwordErrors.confirmPassword}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Stack direction="row" spacing={2}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => {
                    setStep('request');
                    setOtp('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setError('');
                    setPasswordErrors({});
                  }}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button variant="contained" fullWidth type="submit" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}

        <Typography sx={{ mt: 2 }}>
          Remembered your credentials?{' '}
          <RouterLink to="/login" style={{ color: '#253494', fontWeight: 600 }}>
            Sign in
          </RouterLink>
        </Typography>
      </Paper>
    </Box>
  );
}

export default ResetPasswordPage;

