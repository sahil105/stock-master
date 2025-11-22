import { useState, useEffect, useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import MainLayout from '../components/MainLayout';
import LocationFormDialog from '../components/LocationFormDialog';
import PaginationControls from '../components/PaginationControls';
import { DataGrid } from '@mui/x-data-grid';
import { createLocation, getLocations } from '../services/locationApi';
import { getWarehouses } from '../services/warehouseApi';

function LocationsPage() {
  const [locationsData, setLocationsData] = useState([]);
  const [locationsLoading, setLocationsLoading] = useState(true);
  const [locationsMeta, setLocationsMeta] = useState({ total: 0, page: 1, limit: 25 });
  const [warehouses, setWarehouses] = useState([]);
  const [warehousesLoading, setWarehousesLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch warehouses on component mount
  useEffect(() => {
    fetchWarehouses();
  }, []);

  // Fetch locations when pagination changes
  useEffect(() => {
    fetchLocations();
  }, [locationsMeta.page, locationsMeta.limit]);

  const fetchLocations = async () => {
    setLocationsLoading(true);
    try {
      const response = await getLocations({ page: locationsMeta.page, limit: locationsMeta.limit });
      if (response.success) {
        // Map locations to include warehouse name for display (if warehouses are loaded)
        const locationsWithWarehouseNames = response.data.map((location) => {
          const warehouse = warehouses.find((w) => w.id === location.warehouse_id);
          return {
            ...location,
            warehouse_name: warehouse?.name || warehouse?.code || 'Unknown Warehouse',
          };
        });
        setLocationsData(locationsWithWarehouseNames);
        setLocationsMeta(response.meta || { total: 0, page: 1, limit: 25 });
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
            message: response.message || 'Failed to load locations.',
            severity: 'error',
          });
        }
        setLocationsData([]);
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while loading locations.',
        severity: 'error',
      });
      setLocationsData([]);
    } finally {
      setLocationsLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    setWarehousesLoading(true);
    try {
      const response = await getWarehouses();
      if (response.success) {
        setWarehouses(response.data || []);
      } else {
        console.error('Error fetching warehouses:', response.message);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    } finally {
      setWarehousesLoading(false);
    }
  };

  // Update location warehouse names when warehouses are loaded
  useEffect(() => {
    if (warehouses.length > 0 && locationsData.length > 0) {
      setLocationsData((prevLocations) => {
        const locationsWithWarehouseNames = prevLocations.map((location) => {
          const warehouse = warehouses.find((w) => w.id === location.warehouse_id);
          return {
            ...location,
            warehouse_name: warehouse?.name || warehouse?.code || 'Unknown Warehouse',
          };
        });
        return locationsWithWarehouseNames;
      });
    }
  }, [warehouses.length]);

  // Handle save location from dialog
  const handleSaveLocation = async (apiPayload, formValues) => {
    try {
      const response = await createLocation(apiPayload);

      if (response.success) {
        // Show success message
        setSnackbar({
          open: true,
          message: selectedLocation ? 'Location updated successfully!' : 'Location created successfully!',
          severity: 'success',
        });

        // Close dialog
        setDialogOpen(false);
        setSelectedLocation(null);

        // Refresh locations list from API
        fetchLocations();
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
          message: response.message || 'Failed to save location. Please try again.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error saving location:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while saving the location. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleOpenDialog = () => {
    setSelectedLocation(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedLocation(null);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handlePageChange = (newPage) => {
    setLocationsMeta((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newLimit) => {
    setLocationsMeta((prev) => ({ ...prev, limit: newLimit, page: 1 }));
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'code', headerName: 'Code', flex: 1 },
    {
      field: 'warehouse_name',
      headerName: 'Warehouse',
      flex: 1,
      valueGetter: (params) => params.row?.warehouse_name || 'N/A',
    },
    {
      field: 'created_at',
      headerName: 'Created At',
      flex: 1,
      valueGetter: (params) => {
        if (!params.row?.created_at) return 'N/A';
        const date = new Date(params.row.created_at);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      },
    },
  ];

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Location
          </Typography>
          <Typography color="text.secondary">Track racks, bins, and production zones.</Typography>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={handleOpenDialog}>
              New
            </Button>
            <Button variant="outlined" onClick={fetchLocations}>
              Refresh list
            </Button>
          </Stack>
        </Box>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Location register / list view
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total: {locationsMeta.total} | Page: {locationsMeta.page} | Limit: {locationsMeta.limit}
            </Typography>
          </Stack>
          {locationsLoading ? (
            <Box sx={{ height: 400, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography>Loading locations...</Typography>
            </Box>
          ) : (
            <Box sx={{ height: 400 }}>
              <DataGrid
                rows={locationsData}
                columns={columns}
                hideFooter
                density="compact"
                disableRowSelectionOnClick
                loading={locationsLoading}
              />
            </Box>
          )}
          <PaginationControls
            meta={locationsMeta}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={locationsLoading}
          />
        </Paper>
      </Stack>
      <LocationFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        location={selectedLocation}
        onSave={handleSaveLocation}
        warehouses={warehouses}
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

export default LocationsPage;

