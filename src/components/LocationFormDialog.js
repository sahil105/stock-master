import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';

function LocationFormDialog({ open, onClose, location, onSave, warehouses = [] }) {
  const [formValues, setFormValues] = useState({
    name: '',
    code: '',
    warehouse_id: warehouses.length > 0 ? warehouses[0].id : '',
  });

  // Update form when location prop or warehouses change
  useEffect(() => {
    if (location) {
      setFormValues({
        name: location.name || '',
        code: location.code || '',
        warehouse_id: location.warehouse_id || (warehouses.length > 0 ? warehouses[0].id : ''),
      });
    } else {
      // Reset form for new location
      setFormValues({
        name: '',
        code: '',
        warehouse_id: warehouses.length > 0 ? warehouses[0].id : '',
      });
    }
  }, [location, warehouses]);

  // Update warehouse_id when warehouses are loaded
  useEffect(() => {
    if (!location && warehouses.length > 0) {
      setFormValues((prev) => {
        if (prev.warehouse_id === '' || !prev.warehouse_id) {
          return { ...prev, warehouse_id: warehouses[0].id };
        }
        return prev;
      });
    }
  }, [warehouses.length, location]);

  const handleChange = (field) => (event) => {
    const value = field === 'warehouse_id' ? Number(event.target.value) : event.target.value;
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formValues.name || !formValues.code || !formValues.warehouse_id) {
      return;
    }

    // Prepare API payload
    const apiPayload = {
      name: formValues.name,
      code: formValues.code,
      warehouse_id: Number(formValues.warehouse_id),
    };

    if (onSave) {
      onSave(apiPayload, formValues);
    }
  };

  const handleCancel = () => {
    setFormValues({
      name: '',
      code: '',
      warehouse_id: warehouses.length > 0 ? warehouses[0].id : '',
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{location ? 'Edit Location' : 'Create Location'}</Typography>
          <IconButton onClick={handleCancel} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off" sx={{ mt: 2 }}>
          <Stack spacing={3}>
            <TextField
              label="Name"
              required
              value={formValues.name}
              onChange={handleChange('name')}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Code"
              required
              value={formValues.code}
              onChange={handleChange('code')}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Warehouse"
              select
              required
              value={formValues.warehouse_id}
              onChange={handleChange('warehouse_id')}
              fullWidth
              variant="outlined"
              disabled={warehouses.length === 0}
              helperText={warehouses.length === 0 ? 'No warehouses available' : ''}
            >
              {warehouses.map((warehouse) => (
                <MenuItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name || warehouse.code}
                </MenuItem>
              ))}
            </TextField>
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              This holds the multiple locations of warehouse, rooms etc..
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="contained" type="submit">
                {location ? 'Update Location' : 'Save Location'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default LocationFormDialog;

