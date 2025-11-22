import { Grid, Stack, Typography, Button, Box, Paper } from '@mui/material';
import { useState, useEffect } from 'react';
import FlowTimeline from '../components/FlowTimeline';
import KpiGrid from '../components/KpiGrid';
import MainLayout from '../components/MainLayout';
import DynamicFiltersPanel from '../components/DynamicFiltersPanel';
import OperationsPanel from '../components/OperationsPanel';
import { dynamicFilters, flowSteps } from '../data/dashboardData';
import { Link as RouterLink } from 'react-router-dom';
import { getProducts } from '../services/productApi';
import { getStockSummary, getLowStock } from '../services/stockApi';
import { getReceipts } from '../services/receiptApi';
import { getDeliveries } from '../services/deliveryApi';
import { getTransfers } from '../services/transferApi';

function DashboardPage() {
  const [activeFilter, setActiveFilter] = useState('Receipts');
  const [activeStatus, setActiveStatus] = useState('Draft');
  const [kpis, setKpis] = useState([
    { label: 'Total Products in Stock', value: '0', delta: 'Loading...' },
    { label: 'Low / Out of Stock', value: '0 items', delta: 'Loading...' },
    { label: 'Pending Receipts', value: '0 docs', delta: 'Loading...' },
    { label: 'Pending Deliveries', value: '0 orders', delta: 'Loading...' },
    { label: 'Internal Transfers', value: '0 scheduled', delta: 'Loading...' },
  ]);
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [productsRes, lowStockRes, receiptsRes, deliveriesRes, transfersRes, stockSummaryRes] = await Promise.all([
        getProducts({ limit: 1 }), // Just get count
        getLowStock({ limit: 100 }),
        getReceipts({ status: 'Draft', limit: 100 }),
        getDeliveries({ status: 'Ready', limit: 100 }),
        getTransfers({ status: 'Draft', limit: 100 }),
        getStockSummary(),
      ]);

      // Calculate total products
      const totalProducts = productsRes.success ? productsRes.meta?.total || 0 : 0;
      
      // Calculate total stock quantity
      let totalStockQty = 0;
      if (stockSummaryRes.success && stockSummaryRes.data) {
        totalStockQty = stockSummaryRes.data.reduce((sum, item) => sum + (item.free_to_use || 0), 0);
      }

      // Update KPIs
      setKpis([
        {
          label: 'Total Products in Stock',
          value: totalStockQty.toLocaleString(),
          delta: `${totalProducts} products`,
        },
        {
          label: 'Low / Out of Stock',
          value: lowStockRes.success ? `${lowStockRes.meta?.total || 0} items` : '0 items',
          delta: lowStockRes.success && lowStockRes.meta?.total > 0 ? `${lowStockRes.meta.total} alerts` : 'No alerts',
        },
        {
          label: 'Pending Receipts',
          value: receiptsRes.success ? `${receiptsRes.meta?.total || 0} docs` : '0 docs',
          delta: receiptsRes.success && receiptsRes.data?.length > 0 ? `${receiptsRes.data.filter(r => r.status === 'Draft').length} drafts` : 'No pending',
        },
        {
          label: 'Pending Deliveries',
          value: deliveriesRes.success ? `${deliveriesRes.meta?.total || 0} orders` : '0 orders',
          delta: deliveriesRes.success && deliveriesRes.data?.length > 0 ? `${deliveriesRes.data.filter(d => d.status === 'Ready').length} ready` : 'No pending',
        },
        {
          label: 'Internal Transfers',
          value: transfersRes.success ? `${transfersRes.meta?.total || 0} scheduled` : '0 scheduled',
          delta: transfersRes.success && transfersRes.data?.length > 0 ? `${transfersRes.data.filter(t => t.status === 'Draft').length} drafts` : 'No transfers',
        },
      ]);

      // Build operations list from recent receipts, deliveries, and adjustments
      const ops = [];
      
      // Add recent receipts
      if (receiptsRes.success && receiptsRes.data) {
        receiptsRes.data.slice(0, 2).forEach((receipt) => {
          ops.push({
            title: 'Stock Receipt',
            description: `Receive goods from ${receipt.vendor_name || 'Vendor'} - Ref: ${receipt.ref_no || 'N/A'}`,
            status: receipt.status || 'Draft',
            action: 'Validate Goods',
            type: 'receipt',
            id: receipt.id,
          });
        });
      }

      // Add recent deliveries
      if (deliveriesRes.success && deliveriesRes.data) {
        deliveriesRes.data.slice(0, 2).forEach((delivery) => {
          ops.push({
            title: 'Delivery Order',
            description: `Ship to ${delivery.customer_name || 'Customer'} - Ref: ${delivery.ref_no || 'N/A'}`,
            status: delivery.status || 'Draft',
            action: 'Mark Packed',
            type: 'delivery',
            id: delivery.id,
          });
        });
      }

      setOperations(ops.slice(0, 3)); // Limit to 3 operations
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Receipts',
      description: 'Create new receipts, match GRN and validate vendor quantities.',
      path: '/receipts',
      status: kpis[2]?.value || '0 docs',
    },
    {
      title: 'Delivery Orders',
      description: 'Pack and ship goods to customers with proof of dispatch.',
      path: '/delivery',
      status: kpis[3]?.value || '0 orders',
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

