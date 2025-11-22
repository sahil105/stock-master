import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';

function WarehouseFormDialog({ open, onClose, warehouse, onSave }) {
  const [formValues, setFormValues] = useState({
    name: '',
    code: '',
    address: '',
  });

  // Update form when warehouse prop changes (for edit mode)
  useEffect(() => {
    if (warehouse) {
      setFormValues({
        name: warehouse.name || '',
        code: warehouse.code || '',
        address: warehouse.address || '',
      });
    } else {
      // Reset form for new warehouse
      setFormValues({
        name: '',
        code: '',
        address: '',
      });
    }
  }, [warehouse]);

  const handleChange = (field) => (event) => {
    setFormValues((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formValues.name || !formValues.code) {
      return;
    }

    // Prepare API payload
    const apiPayload = {
      name: formValues.name,
      code: formValues.code,
      address: formValues.address || '',
    };

    if (onSave) {
      onSave(apiPayload, formValues);
    }
  };

  const handleCancel = () => {
    setFormValues({
      name: '',
      code: '',
      address: '',
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{warehouse ? 'Edit Warehouse' : 'Create Warehouse'}</Typography>
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
              label="Address"
              value={formValues.address}
              onChange={handleChange('address')}
              fullWidth
              multiline
              rows={2}
              variant="outlined"
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="contained" type="submit">
                {warehouse ? 'Update Warehouse' : 'Save Warehouse'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default WarehouseFormDialog;

