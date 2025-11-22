import { useState, useEffect, useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';
import MainLayout from '../components/MainLayout';
import WarehouseFormDialog from '../components/WarehouseFormDialog';
import PaginationControls from '../components/PaginationControls';
import { DataGrid } from '@mui/x-data-grid';
import { createWarehouse, getWarehouses } from '../services/warehouseApi';

function WarehousesPage() {
  const [warehousesData, setWarehousesData] = useState([]);
  const [warehousesLoading, setWarehousesLoading] = useState(true);
  const [warehousesMeta, setWarehousesMeta] = useState({ total: 0, page: 1, limit: 25 });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch warehouses on component mount and when pagination changes
  useEffect(() => {
    fetchWarehouses();
  }, [warehousesMeta.page, warehousesMeta.limit]);

  const fetchWarehouses = async () => {
    setWarehousesLoading(true);
    try {
      const response = await getWarehouses({ page: warehousesMeta.page, limit: warehousesMeta.limit });
      if (response.success) {
        setWarehousesData(response.data || []);
        setWarehousesMeta(response.meta || { total: 0, page: 1, limit: 25 });
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
            message: response.message || 'Failed to load warehouses.',
            severity: 'error',
          });
        }
        setWarehousesData([]);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while loading warehouses.',
        severity: 'error',
      });
      setWarehousesData([]);
    } finally {
      setWarehousesLoading(false);
    }
  };

  // Handle save warehouse from dialog
  const handleSaveWarehouse = async (apiPayload, formValues) => {
    try {
      const response = await createWarehouse(apiPayload);

      if (response.success) {
        // Show success message
        setSnackbar({
          open: true,
          message: selectedWarehouse ? 'Warehouse updated successfully!' : 'Warehouse created successfully!',
          severity: 'success',
        });

        // Close dialog
        setDialogOpen(false);
        setSelectedWarehouse(null);

        // Refresh warehouses list from API
        fetchWarehouses();
      } else {
        // Handle 401 Unauthorized
        if (response.statusCode === 401) {
          setSnackbar({
            open: true,
            message: response.message || 'Unauthorized access. Please login again.',
            severity: 'error',
          });
          return;
        }

        // Handle 422 Validation Error
        if (response.statusCode === 422 && response.errors && response.errors.length > 0) {
          const errorMessages = response.errors.map((err) => {
            const field = err.field || 'field';
            return `${field}: ${err.message}`;
          }).join(', ');

          setSnackbar({
            open: true,
            message: `Validation error: ${errorMessages}`,
            severity: 'error',
          });
          // Keep dialog open to allow user to fix errors
          return;
        }

        // Handle other errors
        setSnackbar({
          open: true,
          message: response.message || 'Failed to save warehouse. Please try again.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error saving warehouse:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while saving the warehouse. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleOpenDialog = () => {
    setSelectedWarehouse(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedWarehouse(null);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handlePageChange = (newPage) => {
    setWarehousesMeta((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newLimit) => {
    setWarehousesMeta((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'code', headerName: 'Code', flex: 1 },
    { field: 'address', headerName: 'Address', flex: 2 },
    {
      field: 'created_at',
      headerName: 'Created At',
      flex: 1,
      valueGetter: (params) => {
        if (!params.row?.created_at) return 'N/A';
        try {
          // Handle UTC date strings like "2025-11-22T08:28:02"
          const dateStr = params.row.created_at;
          const date = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'Z');
          if (isNaN(date.getTime())) return 'N/A';
          return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        } catch (e) {
          return 'N/A';
        }
      },
    },
  ];

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Warehouse
          </Typography>
          <Typography color="text.secondary">Keep warehouse master data current.</Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <IconButton 
              variant="contained" 
              color="primary"
              onClick={handleOpenDialog}
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
            <IconButton 
              variant="outlined" 
              onClick={fetchWarehouses}
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
          </Stack>
        </Box>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Warehouse register / list view
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total: {warehousesMeta.total} | Page: {warehousesMeta.page} | Limit: {warehousesMeta.limit}
            </Typography>
          </Stack>
          {warehousesLoading ? (
            <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography>Loading warehouses...</Typography>
            </Box>
          ) : warehousesData.length === 0 ? (
            <Box
              sx={{
                height: 400,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                No warehouses found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a new warehouse to get started.
              </Typography>
            </Box>
          ) : (
            <Box sx={{ height: 400 }}>
              <DataGrid
                rows={warehousesData}
                columns={columns}
                hideFooter
                density="compact"
                disableRowSelectionOnClick
                loading={warehousesLoading}
              />
            </Box>
          )}
          <PaginationControls
            meta={warehousesMeta}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={warehousesLoading}
          />
        </Paper>
      </Stack>
      <WarehouseFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        warehouse={selectedWarehouse}
        onSave={handleSaveWarehouse}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}

export default WarehousesPage;

