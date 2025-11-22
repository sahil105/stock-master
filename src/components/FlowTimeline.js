import { Paper, Stack, Typography, Chip } from '@mui/material';

function FlowTimeline({ steps }) {
  return (
    <Paper elevation={3} className="timeline-card">
      <Typography variant="h6" gutterBottom>
        Simplified Stock Flow
      </Typography>
      <Stack gap={2}>
        {steps.map((step) => (
          <Paper key={step.title} className="timeline-step">
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <div>
                <Typography fontWeight={600}>{step.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {step.detail}
                </Typography>
              </div>
              <Chip label={step.badge} size="small" />
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
}

export default FlowTimeline;

