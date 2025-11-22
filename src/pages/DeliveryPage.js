import { useState, useMemo, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Add, Refresh, Search, ViewList, ViewModule } from '@mui/icons-material';
import MainLayout from '../components/MainLayout';
import DeliveryDetailDialog from '../components/DeliveryDetailDialog';
import { DataGrid } from '@mui/x-data-grid';
import { getDeliveries, createDelivery } from '../services/deliveryApi';
import { getWarehouses } from '../services/warehouseApi';
import { getProducts } from '../services/productApi';

function DeliveryPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [deliveriesLoading, setDeliveriesLoading] = useState(true);
  const [deliveriesMeta, setDeliveriesMeta] = useState({ total: 0, page: 1, limit: 25 });
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchDeliveries();
    fetchWarehouses();
    fetchProducts();
  }, [deliveriesMeta.page, deliveriesMeta.limit]);

  const fetchDeliveries = async () => {
    setDeliveriesLoading(true);
    try {
      const response = await getDeliveries({
        page: deliveriesMeta.page,
        limit: deliveriesMeta.limit,
      });
      if (response.success) {
        // Map API data to match component expectations
        const mappedDeliveries = response.data.map((delivery) => ({
          id: delivery.id,
          reference: delivery.ref_no || `DEL-${delivery.id}`,
          from: delivery.warehouse_name || (delivery.warehouse_id ? `Warehouse ${delivery.warehouse_id}` : 'Warehouse'),
          to: delivery.customer_name || 'Customer',
          contact: delivery.remarks || 'N/A',
          scheduleDate: delivery.created_at ? (() => {
            try {
              const dateStr = delivery.created_at;
              const date = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'Z');
              return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
            } catch (e) {
              return 'N/A';
            }
          })() : 'N/A',
          status: delivery.status || 'Draft',
          ...delivery,
        }));
        setDeliveries(mappedDeliveries);
        setDeliveriesMeta(response.meta || { total: 0, page: 1, limit: 25 });
      } else {
        if (response.statusCode === 401) {
          setSnackbar({
            open: true,
            message: response.message || 'Unauthorized access. Please login again.',
            severity: 'error',
          });
        } else {
          setSnackbar({
            open: true,
            message: response.message || 'Failed to load deliveries.',
            severity: 'error',
          });
        }
        setDeliveries([]);
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while loading deliveries.',
        severity: 'error',
      });
      setDeliveries([]);
    } finally {
      setDeliveriesLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await getWarehouses();
      if (response.success) {
        setWarehouses(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await getProducts();
      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  // Filter deliveries based on search query (reference and contact)
  const filteredDeliveries = useMemo(() => {
    if (!searchQuery.trim()) {
      return deliveries;
    }
    const query = searchQuery.toLowerCase().trim();
    return deliveries.filter(
      (delivery) =>
        delivery.reference?.toLowerCase().includes(query) ||
        delivery.contact?.toLowerCase().includes(query)
    );
  }, [deliveries, searchQuery]);

  const columns = [
    { field: 'reference', headerName: 'Reference', flex: 1 },
    { field: 'from', headerName: 'From', flex: 1 },
    { field: 'to', headerName: 'To', flex: 1 },
    { field: 'contact', headerName: 'Contact', flex: 1 },
    { field: 'scheduleDate', headerName: 'Schedule date', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 0.8 },
  ];
  const handleViewChange = (_event, next) => {
    if (next) setViewMode(next);
  };

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Delivery
          </Typography>
          <Typography color="text.secondary">Schedule outgoing shipments and close deliveries.</Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <TextField
              placeholder="Search by Reference or Contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewChange} size="small">
              <ToggleButton value="list">
                <ViewList />
              </ToggleButton>
              <ToggleButton value="kanban">
                <ViewModule />
              </ToggleButton>
            </ToggleButtonGroup>
            <IconButton 
              variant="outlined" 
              onClick={() => {
                setSearchQuery('');
                fetchDeliveries();
              }}
              sx={{ 
                border: '1px solid rgba(0, 0, 0, 0.23)',
                '&:hover': {
                  border: '1px solid rgba(0, 0, 0, 0.87)',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <Refresh />
            </IconButton>
            <IconButton 
              variant="contained" 
              color="primary"
              onClick={() => {
                setSelected(null);
                setDialogOpen(true);
              }}
              sx={{ 
                bgcolor: 'secondary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                },
              }}
            >
              <Add />
            </IconButton>
          </Stack>
        </Box>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Delivery register / list view
          </Typography>
          {viewMode === 'list' ? (
            <Box sx={{ height: 320 }}>
              {!deliveriesLoading && filteredDeliveries.length === 0 ? (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    No deliveries found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery ? 'Try adjusting your search or create a new delivery.' : 'Create a new delivery to get started.'}
                  </Typography>
                </Box>
              ) : (
                <DataGrid
                  rows={filteredDeliveries}
                  columns={columns}
                  hideFooter
                  density="compact"
                  loading={deliveriesLoading}
                  onRowClick={(params) => {
                    setSelected(params.row);
                    setDialogOpen(true);
                  }}
                />
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', minHeight: 320 }}>
              {!deliveriesLoading && filteredDeliveries.length === 0 ? (
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2,
                    minHeight: 320,
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    No deliveries found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery ? 'Try adjusting your search or create a new delivery.' : 'Create a new delivery to get started.'}
                  </Typography>
                </Box>
              ) : (
                filteredDeliveries.map((delivery) => (
                <Paper
                  key={delivery.reference}
                  elevation={3}
                  onClick={() => {
                    setSelected(delivery);
                    setDialogOpen(true);
                  }}
                  sx={{
                    flex: '1 1 220px',
                    minWidth: 220,
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 6,
                    },
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    {delivery.reference}
                  </Typography>
                  <Typography variant="body2">
                    From {delivery.from} · To {delivery.to}
                  </Typography>
                  <Typography variant="caption" display="block" mt={1}>
                    Contact {delivery.contact}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Schedule {delivery.scheduleDate} · Status {delivery.status}
                  </Typography>
                </Paper>
                ))
              )}
            </Box>
          )}
        </Paper>

      </Stack>
      <DeliveryDetailDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelected(null);
        }}
        delivery={selected}
        onStatusChange={(newStatus) => {
          if (selected) {
            setSelected({ ...selected, status: newStatus });
          }
        }}
        onSave={async (payload) => {
          const response = await createDelivery(payload);
          if (response.success) {
            setSnackbar({
              open: true,
              message: 'Delivery created successfully!',
              severity: 'success',
            });
            setDialogOpen(false);
            setSelected(null);
            fetchDeliveries();
          } else {
            // Handle 422 Validation Error
            if (response.statusCode === 422) {
              setSnackbar({
                open: true,
                message: response.message || 'Validation error. Please check your input.',
                severity: 'error',
              });
            } else {
              setSnackbar({
                open: true,
                message: response.message || 'Failed to create delivery.',
                severity: 'error',
              });
            }
          }
        }}
        warehouses={warehouses}
        products={products}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}

export default DeliveryPage;

