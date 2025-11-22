import { Grid, Stack, Typography, Button, Box, Paper } from '@mui/material';
import { useState } from 'react';
import FlowTimeline from '../components/FlowTimeline';
import KpiGrid from '../components/KpiGrid';
import MainLayout from '../components/MainLayout';
import DynamicFiltersPanel from '../components/DynamicFiltersPanel';
import OperationsPanel from '../components/OperationsPanel';
import { kpis, dynamicFilters, operations, flowSteps } from '../data/dashboardData';
import { Link as RouterLink } from 'react-router-dom';

function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState('Receipts');
  const [activeStatus, setActiveStatus] = useState('Draft');
  const quickActions = [
    {
      title: 'Receipts',
      description: 'Create new receipts, match GRN and validate vendor quantities.',
      path: '/receipts',
      status: '2 drafts',
    },
    {
      title: 'Delivery Orders',
      description: 'Pack and ship goods to customers with proof of dispatch.',
      path: '/delivery',
      status: '3 ready',
    },
  ];

  return (
    <MainLayout>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Inventory Operations Dashboard
          </Typography>
          <Typography color="text.secondary">
            A real-time view of stock levels, movement, and alerts.
          </Typography>
        </Box>
        <Button variant="contained" color="secondary" size="large">
          Create Document
        </Button>
      </Stack>

      <KpiGrid items={kpis} />

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {quickActions.map((action) => (
          <Grid item xs={12} md={6} key={action.title}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Stack spacing={1}>
                <Typography variant="h6" fontWeight={600}>
                  {action.title}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  {action.description}
                </Typography>
                <Typography variant="caption" color="primary">
                  {action.status}
                </Typography>
                <Button component={RouterLink} to={action.path} variant="outlined" size="small">
                  Open {action.title}
                </Button>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <DynamicFiltersPanel
        filters={dynamicFilters}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        activeStatus={activeStatus}
        setActiveStatus={setActiveStatus}
      />

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          <OperationsPanel operations={operations} />
        </Grid>
        <Grid item xs={12} md={4}>
          <FlowTimeline steps={flowSteps} />
        </Grid>
      </Grid>
    </MainLayout>
  );
}

export default DashboardPage;

