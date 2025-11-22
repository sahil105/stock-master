import { Grid, Paper, Typography } from '@mui/material';

function KpiGrid({ items }) {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      {items.map((kpi) => (
        <Grid key={kpi.label} item xs={12} sm={6} md={4}>
          <Paper elevation={3} className="kpi-card">
            <Typography variant="caption" color="text.secondary">
              {kpi.label}
            </Typography>
            <Typography variant="h5" fontWeight={600}>
              {kpi.value}
            </Typography>
            <Typography variant="body2" color="primary">
              {kpi.delta}
            </Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

export default KpiGrid;

