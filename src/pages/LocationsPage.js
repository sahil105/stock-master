import { useState, useEffect } from 'react';
import { Box, Button, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import MainLayout from '../components/MainLayout';
import { locations, warehouses } from '../data/dashboardData';
import { DataGrid } from '@mui/x-data-grid';

function LocationsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    shortCode: '',
    warehouse: '',
  });
  const [rows, setRows] = useState(
    locations.map((l, index) => ({
      id: l.name || `loc-${index}`,
      name: l.name,
      shortCode: l.type || '',
      warehouse: l.warehouse,
      type: l.type,
      capacity: l.capacity,
    }))
  );

  // Get available warehouse short codes for dropdown
  const warehouseOptions = warehouses.map((w) => ({
    value: w.code,
    label: `${w.name} (${w.code})`,
  }));

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSave = () => {
    if (formData.name && formData.shortCode && formData.warehouse) {
      const newRow = {
        id: formData.name,
        name: formData.name,
        shortCode: formData.shortCode,
        warehouse: formData.warehouse,
        type: formData.shortCode,
        capacity: '',
      };
      setRows((prev) => [...prev, newRow]);
      setFormData({ name: '', shortCode: '', warehouse: '' });
      setFormOpen(false);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'shortCode', headerName: 'Short Code', flex: 1 },
    { field: 'warehouse', headerName: 'Warehouse', flex: 1 },
    { field: 'type', headerName: 'Type', flex: 0.8 },
    { field: 'capacity', headerName: 'Capacity', flex: 0.8 },
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
            <Button variant="contained" onClick={() => setFormOpen(true)}>
              New
            </Button>
            <Button variant="outlined" onClick={() => setFormOpen(false)}>
              Refresh list
            </Button>
          </Stack>
        </Box>

        {formOpen && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>
              Create Location
            </Typography>
            <Stack spacing={3}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                fullWidth
                required
                variant="outlined"
              />
              <TextField
                label="Short Code"
                value={formData.shortCode}
                onChange={handleInputChange('shortCode')}
                fullWidth
                required
                variant="outlined"
              />
              <TextField
                label="Warehouse"
                value={formData.warehouse}
                onChange={handleInputChange('warehouse')}
                select
                fullWidth
                required
                variant="outlined"
                helperText="Select warehouse by short code"
              >
                {warehouseOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                This holds the multiple locations of warehouse, rooms etc..
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={() => setFormOpen(false)}>
                  Cancel
                </Button>
                <Button variant="contained" onClick={handleSave}>
                  Save
                </Button>
              </Stack>
            </Stack>
          </Paper>
        )}

        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Location register / list view
          </Typography>
          <Box sx={{ height: 400 }}>
            <DataGrid rows={rows} columns={columns} hideFooter density="compact" disableRowSelectionOnClick />
          </Box>
        </Paper>
      </Stack>
    </MainLayout>
  );
}

export default LocationsPage;

