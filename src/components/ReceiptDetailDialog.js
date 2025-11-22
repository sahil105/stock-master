import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
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
import { Close, Print, Add, Delete } from '@mui/icons-material';

function ReceiptDetailDialog({ open, onClose, receipt, onStatusChange, onSave, warehouses = [], products = [] }) {
  const [status, setStatus] = useState(receipt?.status || 'Draft');
  const [formValues, setFormValues] = useState({
    vendor_name: receipt?.vendor_name || receipt?.from || '',
    warehouse_id: receipt?.warehouse_id || (warehouses.length > 0 ? warehouses[0].id : ''),
    ref_no: receipt?.ref_no || '',
    contact: receipt?.contact || receipt?.concat || '',
    remarks: receipt?.remarks || '',
    schedule_at: receipt?.schedule_at 
      ? new Date(receipt.schedule_at).toISOString().slice(0, 16)
      : new Date().toISOString().slice(0, 16),
    status: receipt?.status || 'Draft',
    items: receipt?.items || [{ product_id: products.length > 0 ? products[0].id : '', quantity: 0 }],
  });

  // Update state when receipt prop changes
  useEffect(() => {
    if (receipt) {
      setStatus(receipt.status || 'Draft');
      
      // Format schedule_at for datetime-local input
      let scheduleAt = '';
      if (receipt.schedule_at) {
        const date = new Date(receipt.schedule_at);
        scheduleAt = date.toISOString().slice(0, 16);
      } else {
        scheduleAt = new Date().toISOString().slice(0, 16);
      }
      
      setFormValues({
        vendor_name: receipt.vendor_name || receipt.from || '',
        warehouse_id: receipt.warehouse_id || (warehouses.length > 0 ? warehouses[0].id : ''),
        ref_no: receipt.ref_no || '',
        contact: receipt.contact || receipt.concat || '',
        remarks: receipt.remarks || '',
        schedule_at: scheduleAt,
        status: receipt.status || 'Draft',
        items: receipt.items || [{ product_id: products.length > 0 ? products[0].id : '', quantity: 0 }],
      });
    }
  }, [receipt, warehouses, products]);

  const handleChange = (field) => (event) => {
    let value = event.target.value;
    if (field === 'warehouse_id') {
      value = Number(value);
    }
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

  const handleSave = () => {
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
      contact: formValues.contact || formValues.concat || '',
      remarks: formValues.remarks || '',
      schedule_at: scheduleAtISO,
      status: status || formValues.status || 'Draft',
      items: validItems.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      })),
    };

    if (onSave) {
      onSave(apiPayload, formValues);
    }
  };

  // Handle "To DO" button click - moves from Draft to Ready
  const handleToDo = () => {
    if (status === 'Draft') {
      const newStatus = 'Ready';
      setStatus(newStatus);
      if (onStatusChange) onStatusChange(newStatus);
    }
  };

  // Handle "Validate" button click - moves from Ready to Done
  const handleValidate = () => {
    if (status === 'Ready') {
      const newStatus = 'Done';
      setStatus(newStatus);
      if (onStatusChange) onStatusChange(newStatus);
    }
  };

  const handlePrint = () => {
    if (status === 'Done') {
      window.print();
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case 'Draft':
        return 'default';
      case 'Ready':
        return 'warning';
      case 'Done':
        return 'success';
      default:
        return 'default';
    }
  };

  // Button visibility logic based on status
  const showToDoButton = status === 'Draft'; // Show "To DO" when in Draft
  const showValidateButton = status === 'Ready'; // Show "Validate" when in Ready
  const canPrint = status === 'Done'; // Print only enabled when Done

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6">Receipt</Typography>
            <Chip label={receipt?.reference || 'WH/IN/0001'} color="primary" />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {/* <Typography variant="body2" color="text.secondary">
              Draft > Ready > Done
            </Typography> */}
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box component="form" noValidate autoComplete="off" sx={{ mt: 2 }}>
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

          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <Chip
              label={status}
              color={getStatusColor(status)}
              variant={status === 'Done' ? 'filled' : 'outlined'}
            />
            {/* Workflow: Draft → To DO → Ready → Validate → Done */}
            <Stack direction="row" spacing={1}>
              {/* Show "To DO" button when status is Draft */}
              {showToDoButton && (
                <Button variant="contained" color="primary" onClick={handleToDo}>
                  To DO
                </Button>
              )}
              {/* Show "Validate" button when status is Ready */}
              {showValidateButton && (
                <Button variant="contained" color="primary" onClick={handleValidate}>
                  Validate
                </Button>
              )}
              <Button variant="contained" color="secondary" onClick={handleSave}>
                Save
              </Button>
              <Button
                variant="outlined"
                startIcon={<Print />}
                onClick={handlePrint}
                disabled={!canPrint}
              >
                Print
              </Button>
              <Button variant="outlined" color="error" onClick={onClose}>
                Cancel
              </Button>
            </Stack>
          </Stack>

            {status === 'Done' && (
              <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                Print the receipt once it's DONE.
              </Typography>
            )}
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default ReceiptDetailDialog;

