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

// Categories with IDs matching API structure
const categories = [
  { id: 1, name: 'Raw Materials' },
  { id: 2, name: 'Components' },
  { id: 3, name: 'Fasteners' },
  { id: 4, name: 'Packaging' },
  { id: 5, name: 'Furniture' },
];

function ProductFormDialog({ open, onClose, product, onSave }) {
  const [formValues, setFormValues] = useState({
    name: '',
    sku: '',
    category_id: categories[0].id,
    uom: '',
    reorder_level: 0,
  });

  // Update form when product prop changes (for edit mode)
  useEffect(() => {
    if (product) {
      setFormValues({
        name: product.name || '',
        sku: product.sku || '',
        category_id: product.category_id || categories[0].id,
        uom: product.uom || '',
        reorder_level: product.reorder_level || 0,
      });
    } else {
      // Reset form for new product
      setFormValues({
        name: '',
        sku: '',
        category_id: categories[0].id,
        uom: '',
        reorder_level: 0,
      });
    }
  }, [product]);

  const handleChange = (field) => (event) => {
    const value = field === 'category_id' || field === 'reorder_level' 
      ? Number(event.target.value) 
      : event.target.value;
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formValues.name || !formValues.sku) {
      return;
    }

    // Prepare API payload
    const apiPayload = {
      name: formValues.name,
      sku: formValues.sku,
      category_id: Number(formValues.category_id),
      uom: formValues.uom || 'unit',
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
      category_id: categories[0].id,
      uom: '',
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

