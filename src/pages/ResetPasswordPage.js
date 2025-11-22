import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { requestOTP, verifyOTP } from '../services/authApi';

function ResetPasswordPage() {
  const [otpRequested, setOtpRequested] = useState(false);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRequestOtp = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await requestOTP({ email });
      if (response.success) {
        setOtpRequested(true);
        setSuccess(`OTP sent to your email.${response.otp ? ` OTP: ${response.otp}` : ''}`);
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

  const handleReset = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await verifyOTP({ email, otp });
      if (response.success) {
        setSuccess('OTP verified successfully! Redirecting to login…');
        setTimeout(() => navigate('/login'), 1400);
      } else {
        setError(response.message || 'OTP verification failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Verify OTP error:', err);
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
          Enter the email linked to your account and we will send a one-time password to continue.
        </Typography>
        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        <Box component="form" onSubmit={otpRequested ? handleReset : handleRequestOtp} sx={{ mt: 2 }}>
          <Stack spacing={2}>
            <TextField 
              label="Email" 
              type="email" 
              required 
              fullWidth 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={otpRequested || loading} 
            />
            {otpRequested && (
              <>
                <TextField 
                  label="OTP code" 
                  type="text" 
                  required 
                  fullWidth 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputProps={{ maxLength: 6 }}
                  disabled={loading}
                />
              </>
            )}
            <Button variant="contained" fullWidth type="submit" disabled={loading}>
              {loading ? 'Processing...' : (otpRequested ? 'Verify OTP' : 'Request OTP')}
            </Button>
          </Stack>
        </Box>

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

