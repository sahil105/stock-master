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

function ProductFormDialog({ open, onClose, product, onSave, categories = [], locations = [], loading = false }) {
  const [formValues, setFormValues] = useState({
    name: '',
    sku: '',
    category_id: categories.length > 0 ? categories[0].id : '',
    uom: '',
    warehouse_location_id: locations.length > 0 ? locations[0].id : '',
    reorder_level: 0,
  });

  // Update form when product prop or categories change
  useEffect(() => {
    if (product) {
      setFormValues({
        name: product.name || '',
        sku: product.sku || '',
        category_id: product.category_id || (categories.length > 0 ? categories[0].id : ''),
        uom: product.uom || '',
        warehouse_location_id: product.warehouse_location_id || (locations.length > 0 ? locations[0].id : ''),
        reorder_level: product.reorder_level || 0,
      });
    } else {
      // Reset form for new product
      setFormValues({
        name: '',
        sku: '',
        category_id: categories.length > 0 ? categories[0].id : '',
        uom: '',
        warehouse_location_id: locations.length > 0 ? locations[0].id : '',
        reorder_level: 0,
      });
    }
  }, [product, categories, locations]);

  // Update warehouse_location_id when locations are loaded
  useEffect(() => {
    if (!product && locations.length > 0) {
      setFormValues((prev) => {
        if (prev.warehouse_location_id === '' || !prev.warehouse_location_id) {
          return { ...prev, warehouse_location_id: locations[0].id };
        }
        return prev;
      });
    }
  }, [locations.length, product]);

  const handleChange = (field) => (event) => {
    const value = field === 'category_id' || field === 'warehouse_location_id' || field === 'reorder_level'
      ? Number(event.target.value) 
      : event.target.value;
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formValues.name || !formValues.sku || !formValues.category_id || !formValues.warehouse_location_id) {
      return;
    }

    // Prepare API payload - backend expects warehouse_location_id
    const apiPayload = {
      name: formValues.name,
      sku: formValues.sku,
      category_id: Number(formValues.category_id),
      uom: formValues.uom || 'unit',
      warehouse_location_id: Number(formValues.warehouse_location_id),
      reorder_level: Number(formValues.reorder_level) || 0,
    };

    if (onSave) {
      onSave(apiPayload, formValues);
    }
  };

  const handleCancel = () => {
    setFormValues({
      name: '',
      sku: '',
      category_id: categories[0]?.id,
      uom: '',
      warehouse_location_id: locations[0]?.id,
      reorder_level: 0,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{product ? 'Edit Product' : 'Create Product'}</Typography>
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
              label="Product name"
              required
              value={formValues.name}
              onChange={handleChange('name')}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="SKU / Code"
              required
              value={formValues.sku}
              onChange={handleChange('sku')}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Category"
              select
              value={formValues.category_id}
              onChange={handleChange('category_id')}
              fullWidth
              required
              variant="outlined"
              disabled={loading || categories.length === 0}
              helperText={loading ? 'Loading categories...' : categories.length === 0 ? 'No categories available' : ''}
            >
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>
                  {cat.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Unit of measure"
              required
              value={formValues.uom}
              onChange={handleChange('uom')}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Location"
              select
              required
              value={formValues.warehouse_location_id}
              onChange={handleChange('warehouse_location_id')}
              fullWidth
              variant="outlined"
              disabled={loading || locations.length === 0}
              helperText={loading ? 'Loading locations...' : locations.length === 0 ? 'No locations available. Please create a location first.' : ''}
            >
              {locations.map((location) => (
                <MenuItem key={location.id} value={location.id}>
                  {location.name || location.code} {location.warehouse_name ? `(${location.warehouse_name})` : ''}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Reorder Level"
              type="number"
              required
              value={formValues.reorder_level}
              onChange={handleChange('reorder_level')}
              fullWidth
              inputProps={{ min: 0 }}
              variant="outlined"
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="contained" type="submit">
                {product ? 'Update Product' : 'Save Product'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ProductFormDialog;

