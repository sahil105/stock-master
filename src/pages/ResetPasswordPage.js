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

function ResetPasswordPage() {
  const [otpRequested, setOtpRequested] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const navigate = useNavigate();

  const handleRequestOtp = (event) => {
    event.preventDefault();
    setOtpRequested(true);
    setConfirmation('OTP sent to your email. Use the 6-digit code to confirm.');
  };

  const handleReset = (event) => {
    event.preventDefault();
    setConfirmation('Password reset! Redirecting to login…');
    setTimeout(() => navigate('/login'), 1400);
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
        {confirmation && <Alert severity="info">{confirmation}</Alert>}

        <Box component="form" onSubmit={otpRequested ? handleReset : handleRequestOtp} sx={{ mt: 2 }}>
          <Stack spacing={2}>
            <TextField label="Email" type="email" required fullWidth disabled={otpRequested} />
            {otpRequested && (
              <>
                <TextField label="OTP code" type="text" required fullWidth inputProps={{ maxLength: 6 }} />
                <TextField label="New password" type="password" required fullWidth />
                <TextField label="Confirm password" type="password" required fullWidth />
              </>
            )}
            <Button variant="contained" fullWidth type="submit">
              {otpRequested ? 'Reset password' : 'Request OTP'}
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

