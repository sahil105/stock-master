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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
} from '@mui/material';
import { Close, Delete, Add } from '@mui/icons-material';

function ReceiptFormDialog({ open, onClose, receipt, onSave, warehouses = [], products = [] }) {
  const [formValues, setFormValues] = useState({
    vendor_name: '',
    warehouse_id: warehouses.length > 0 ? warehouses[0].id : '',
    ref_no: '',
    contact: '',
    remarks: '',
    schedule_at: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:mm
    status: 'Draft',
    items: [{ product_id: products.length > 0 ? products[0].id : '', qty: 0 }],
  });

  // Update form when receipt prop or data changes
  useEffect(() => {
    if (receipt) {
      // Format schedule_at for datetime-local input
      let scheduleAt = '';
      if (receipt.schedule_at) {
        const date = new Date(receipt.schedule_at);
        scheduleAt = date.toISOString().slice(0, 16);
      } else {
        scheduleAt = new Date().toISOString().slice(0, 16);
      }
      
      setFormValues({
        vendor_name: receipt.vendor_name || '',
        warehouse_id: receipt.warehouse_id || (warehouses.length > 0 ? warehouses[0].id : ''),
        ref_no: receipt.ref_no || '',
        contact: receipt.contact || receipt.concat || '',
        remarks: receipt.remarks || '',
        schedule_at: scheduleAt,
        status: receipt.status || 'Draft',
        items: receipt.items || [{ product_id: products.length > 0 ? products[0].id : '', quantity: 0 }],
      });
    } else {
      // Reset form for new receipt
      setFormValues({
        vendor_name: '',
        warehouse_id: warehouses.length > 0 ? warehouses[0].id : '',
        ref_no: '',
        contact: '',
        remarks: '',
        schedule_at: new Date().toISOString().slice(0, 16),
        status: 'Draft',
        items: [{ product_id: products.length > 0 ? products[0].id : '', quantity: 0 }],
      });
    }
  }, [receipt, warehouses, products]);

  // Update warehouse_id and product_id when warehouses/products are loaded (only on initial load)
  useEffect(() => {
    if (!receipt && warehouses.length > 0) {
      setFormValues((prev) => {
        if (prev.warehouse_id === '' || !prev.warehouse_id) {
          return { ...prev, warehouse_id: warehouses[0].id };
        }
        return prev;
      });
    }
    if (!receipt && products.length > 0) {
      setFormValues((prev) => {
        if (prev.items.length > 0 && (prev.items[0].product_id === '' || !prev.items[0].product_id)) {
          return {
            ...prev,
            items: [{ product_id: products[0].id, quantity: 0 }],
          };
        }
        return prev;
      });
    }
  }, [warehouses.length, products.length, receipt]);

  const handleChange = (field) => (event) => {
    const value = field === 'warehouse_id' ? Number(event.target.value) : event.target.value;
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field) => (event) => {
    const value = field === 'product_id' || field === 'quantity' ? Number(event.target.value) : event.target.value;
    const newItems = [...formValues.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormValues((prev) => ({ ...prev, items: newItems }));
  };

  const handleAddItem = () => {
    setFormValues((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: products.length > 0 ? products[0].id : '', quantity: 0 }],
    }));
  };

  const handleRemoveItem = (index) => {
    if (formValues.items.length > 1) {
      const newItems = formValues.items.filter((_, i) => i !== index);
      setFormValues((prev) => ({ ...prev, items: newItems }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formValues.vendor_name || !formValues.warehouse_id || formValues.items.length === 0) {
      return;
    }

    // Validate items - ensure quantity > 0
    const validItems = formValues.items.filter((item) => item.product_id && item.quantity > 0);
    if (validItems.length === 0) {
      alert('Please add at least one item with quantity greater than 0.');
      return;
    }

    // Prepare API payload - format schedule_at as ISO string
    const scheduleAtISO = formValues.schedule_at 
      ? new Date(formValues.schedule_at).toISOString() 
      : new Date().toISOString();

    const apiPayload = {
      vendor_name: formValues.vendor_name,
      warehouse_id: Number(formValues.warehouse_id),
      ref_no: formValues.ref_no || '',
      contact: formValues.contact || '',
      remarks: formValues.remarks || '',
      schedule_at: scheduleAtISO,
      status: formValues.status || 'Draft',
      items: validItems.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      })),
    };

    if (onSave) {
      onSave(apiPayload, formValues);
    }
  };

  const handleCancel = () => {
    setFormValues({
      vendor_name: '',
      warehouse_id: warehouses.length > 0 ? warehouses[0].id : '',
      ref_no: '',
      contact: '',
      remarks: '',
      schedule_at: new Date().toISOString().slice(0, 16),
      status: 'Draft',
      items: [{ product_id: products.length > 0 ? products[0].id : '', quantity: 0 }],
    });
    onClose();
  };

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === productId);
    return product ? `${product.sku || ''} - ${product.name || ''}`.trim() : 'Select Product';
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{receipt ? 'Edit Receipt' : 'Create Receipt'}</Typography>
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
              label="Vendor Name"
              required
              value={formValues.vendor_name}
              onChange={handleChange('vendor_name')}
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
            <TextField
              label="Reference Number"
              value={formValues.ref_no}
              onChange={handleChange('ref_no')}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Contact"
              value={formValues.contact}
              onChange={handleChange('contact')}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Remarks"
              value={formValues.remarks}
              onChange={handleChange('remarks')}
              fullWidth
              multiline
              rows={2}
              variant="outlined"
            />
            <TextField
              label="Schedule Date & Time"
              type="datetime-local"
              value={formValues.schedule_at}
              onChange={handleChange('schedule_at')}
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Items
                </Typography>
                <Button
                  startIcon={<Add />}
                  onClick={handleAddItem}
                  size="small"
                  variant="outlined"
                  disabled={products.length === 0}
                >
                  Add Item
                </Button>
              </Stack>
              {formValues.items.length === 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  Please add at least one item with product and quantity.
                </Alert>
              )}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Product</TableCell>
                    <TableCell align="right" width={150}>
                      Quantity
                    </TableCell>
                    <TableCell align="center" width={80}>
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formValues.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          select
                          value={item.product_id || ''}
                          onChange={handleItemChange(index, 'product_id')}
                          fullWidth
                          size="small"
                          variant="outlined"
                          required
                        >
                          {products.map((product) => (
                            <MenuItem key={product.id} value={product.id}>
                              {product.sku || ''} - {product.name || ''}
                            </MenuItem>
                          ))}
                        </TextField>
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          type="number"
                          value={item.quantity || 0}
                          onChange={handleItemChange(index, 'quantity')}
                          size="small"
                          variant="outlined"
                          required
                          inputProps={{ min: 0.01, step: 0.01 }}
                          sx={{ width: 120 }}
                          error={item.quantity === 0 || item.quantity < 0}
                          helperText={item.quantity === 0 || item.quantity < 0 ? 'Quantity must be greater than 0' : ''}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveItem(index)}
                          disabled={formValues.items.length === 1}
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
              <Button variant="outlined" onClick={handleCancel}>
                Cancel
              </Button>
              <Button variant="contained" type="submit">
                {receipt ? 'Update Receipt' : 'Create Receipt'}
              </Button>
            </Stack>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ReceiptFormDialog;

