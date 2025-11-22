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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch locations when pagination changes
  useEffect(() => {
    fetchLocations();
  }, [locationsMeta.page, locationsMeta.limit]);

  const fetchLocations = async () => {
    setLocationsLoading(true);
    try {
      const response = await getLocations({ page: locationsMeta.page, limit: locationsMeta.limit });
      if (response.success) {
        // Backend already returns warehouse_name in the response, so we can use it directly
        setLocationsData(response.data || []);
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

  // Fetch warehouses for the form dialog
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await getWarehouses({ limit: 100 });
        if (response.success) {
          setWarehouses(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching warehouses:', error);
      }
    };
    fetchWarehouses();
  }, []);

  // Note: Backend already returns warehouse_name in the response, so no need to map it

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
            Location
          </Typography>
          <Typography color="text.secondary">Track racks, bins, and production zones.</Typography>
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
              onClick={fetchLocations}
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
          ) : locationsData.length === 0 ? (
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
                No locations found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a new location to get started.
              </Typography>
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

