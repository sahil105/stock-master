import { useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import MainLayout from '../components/MainLayout';
import { warehouses } from '../data/dashboardData';
import { DataGrid } from '@mui/x-data-grid';

function WarehousesPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    shortCode: '',
    address: '',
  });
  const [rows, setRows] = useState(
    warehouses.map((w, index) => ({
      id: w.code || `wh-${index}`,
      name: w.name,
      shortCode: w.code,
      address: w.address,
      status: w.status,
    }))
  );

  const handleInputChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSave = () => {
    if (formData.name && formData.shortCode) {
      const newRow = {
        id: formData.shortCode,
        name: formData.name,
        shortCode: formData.shortCode,
        address: formData.address,
        status: 'Active',
      };
      setRows((prev) => [...prev, newRow]);
      setFormData({ name: '', shortCode: '', address: '' });
      setFormOpen(false);
    }
  };

  const columns = [
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'shortCode', headerName: 'Short Code', flex: 1 },
    { field: 'address', headerName: 'Address', flex: 2 },
    { field: 'status', headerName: 'Status', flex: 0.8 },
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
              Create Warehouse
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
                label="Address"
                value={formData.address}
                onChange={handleInputChange('address')}
                fullWidth
                multiline
                rows={2}
                variant="outlined"
              />
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
            Warehouse register / list view
          </Typography>
          <Box sx={{ height: 400 }}>
            <DataGrid rows={rows} columns={columns} hideFooter density="compact" disableRowSelectionOnClick />
          </Box>
        </Paper>
      </Stack>
    </MainLayout>
  );
}

export default WarehousesPage;

