import { Box, Typography } from '@mui/material';

function LogoMark({ label = 'StockMaster' }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: 'radial-gradient(circle, #ff8a2d, #bf1f27)',
          boxShadow: '0 6px 18px rgba(255, 138, 45, 0.6)',
        }}
      />
      <Typography variant="h6" fontWeight={600} letterSpacing={0.6} className="logo-mark-text">
        {label}
      </Typography>
    </Box>
  );
}

export default LogoMark;

