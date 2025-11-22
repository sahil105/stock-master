import {
  Assessment,
  LocalShipping,
  ReceiptLong,
} from '@mui/icons-material';
import { Avatar, Button, Paper, Stack, Typography, Chip } from '@mui/material';

const iconMap = {
  'Stock Receipt': <ReceiptLong />,
  'Delivery Order': <LocalShipping />,
  Adjustment: <Assessment />,
};

function OperationsPanel({ operations }) {
  return (
    <Paper elevation={3} className="operations-card">
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6">In-flight Operations</Typography>
        <Button size="small">View All</Button>
      </Stack>
      <Stack gap={2}>
        {operations.map((op) => (
          <Paper key={op.title} className="operation-item" elevation={1}>
            <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
              <Stack spacing={0.5} flex={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar sx={{ bgcolor: '#f97316' }}>{iconMap[op.title]}</Avatar>
                  <Typography fontWeight={600}>{op.title}</Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {op.description}
                </Typography>
                <Chip label={op.status} size="small" color="secondary" />
              </Stack>
              <Button variant="contained" color="primary">
                {op.action}
              </Button>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
}

export default OperationsPanel;

