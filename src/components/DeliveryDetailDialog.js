import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Select,
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
import { Close, Print, Delete, Add } from '@mui/icons-material';

function DeliveryDetailDialog({ open, onClose, delivery, onStatusChange, onSave, warehouses = [], products: productsList = [] }) {
  const isNewDelivery = !delivery;
  const [status, setStatus] = useState(delivery?.status || 'Draft');
  const [from, setFrom] = useState(delivery?.from || (warehouses.length > 0 ? warehouses[0].name : ''));
  const [warehouseId, setWarehouseId] = useState(delivery?.warehouse_id || (warehouses.length > 0 ? warehouses[0].id : ''));
  const [to, setTo] = useState(delivery?.to || delivery?.customer_name || '');
  const [contact, setContact] = useState(delivery?.contact || '');
  const [deliveryAddress, setDeliveryAddress] = useState(delivery?.address || '');
  const [responsible, setResponsible] = useState('Current User'); // Auto-filled
  const [scheduleDate, setScheduleDate] = useState(delivery?.scheduleDate || delivery?.schedule_at || '');
  const [operationType, setOperationType] = useState(delivery?.operation_type || 'Standard Delivery');
  const [refNo, setRefNo] = useState(delivery?.ref_no || '');
  const [remarks, setRemarks] = useState(delivery?.remarks || '');
  const [deliveryProducts, setDeliveryProducts] = useState(
    delivery?.items?.map((item, idx) => ({
      id: idx + 1,
      product_id: item.product_id,
      product: productsList.find(p => p.id === item.product_id)?.name || `Product ${item.product_id}`,
      quantity: item.quantity || item.qty || 0,
      inStock: true, // TODO: Check actual stock
    })) || (productsList.length > 0 ? [{ id: 1, product_id: productsList[0].id, product: productsList[0].name, quantity: 0, inStock: true }] : [])
  );

  // Update state when delivery prop changes
  useEffect(() => {
    if (delivery) {
      setStatus(delivery.status || 'Draft');
      setFrom(delivery.from || delivery.warehouse_name || '');
      setWarehouseId(delivery.warehouse_id || '');
      setTo(delivery.to || delivery.customer_name || '');
      setContact(delivery.contact || '');
      setDeliveryAddress(delivery.address || '');
      setScheduleDate(delivery.scheduleDate || delivery.schedule_at || '');
      setOperationType(delivery.operation_type || 'Standard Delivery');
      setRefNo(delivery.ref_no || '');
      setRemarks(delivery.remarks || '');
      if (delivery.items) {
        setDeliveryProducts(
          delivery.items.map((item, idx) => ({
            id: idx + 1,
            product_id: item.product_id,
            product: productsList.find(p => p.id === item.product_id)?.name || `Product ${item.product_id}`,
            quantity: item.quantity || item.qty || 0,
            inStock: true,
          }))
        );
      }
    } else {
      // Reset for new delivery
      setStatus('Draft');
      setFrom(warehouses.length > 0 ? warehouses[0].name : '');
      setWarehouseId(warehouses.length > 0 ? warehouses[0].id : '');
      setTo('');
      setContact('');
      setDeliveryAddress('');
      setScheduleDate('');
      setOperationType('Standard Delivery');
      setRefNo('');
      setRemarks('');
      setDeliveryProducts(productsList.length > 0 ? [{ id: 1, product_id: productsList[0].id, product: productsList[0].name, quantity: 0, inStock: true }] : []);
    }
  }, [delivery, warehouses, productsList]);

  // Handle "To DO" button click - moves from Draft to Waiting
  const handleToDo = () => {
    if (status === 'Draft') {
      // Check if any products are out of stock
      const hasOutOfStock = deliveryProducts.some((p) => !p.inStock);
      if (hasOutOfStock) {
        const newStatus = 'Waiting';
        setStatus(newStatus);
        if (onStatusChange) onStatusChange(newStatus);
      } else {
        const newStatus = 'Ready';
        setStatus(newStatus);
        if (onStatusChange) onStatusChange(newStatus);
      }
    }
  };

  // Handle "Check Stock" button click - moves from Waiting to Ready if products are available
  const handleCheckStock = () => {
    if (status === 'Waiting') {
      // Check if products are now in stock (in real app, this would be an API call)
      const hasOutOfStock = deliveryProducts.some((p) => !p.inStock);
      if (!hasOutOfStock) {
        const newStatus = 'Ready';
        setStatus(newStatus);
        if (onStatusChange) onStatusChange(newStatus);
      } else {
        // Still out of stock - could show a notification here
        alert('Some products are still out of stock. Please wait or update product availability.');
      }
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
      case 'Waiting':
        return 'warning';
      case 'Ready':
        return 'info';
      case 'Done':
        return 'success';
      default:
        return 'default';
    }
  };

  // Button visibility logic based on status
  const showToDoButton = status === 'Draft'; // Show "To DO" when in Draft
  const showCheckStockButton = status === 'Waiting'; // Show "Check Stock" when in Waiting
  const showValidateButton = status === 'Ready'; // Show "Validate" when in Ready
  const canPrint = status === 'Done'; // Print only enabled when Done
  const hasOutOfStockProducts = deliveryProducts.some((p) => !p.inStock);

  // Handle save for new delivery
  const handleSave = async () => {
    if (!onSave) return;
    
    const payload = {
      customer_name: to,
      address: deliveryAddress,
      warehouse_id: warehouseId,
      ref_no: refNo || `DEL-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
      contact: contact,
      schedule_at: scheduleDate ? new Date(scheduleDate).toISOString() : null,
      remarks: remarks,
      operation_type: operationType,
      status: status,
      items: deliveryProducts
        .filter(p => p.product_id && p.quantity > 0)
        .map(p => ({
          product_id: p.product_id,
          quantity: parseFloat(p.quantity),
        })),
    };

    await onSave(payload);
  };

  // Handle adding new product row
  const handleAddProduct = () => {
    if (productsList.length > 0) {
      setDeliveryProducts([
        ...deliveryProducts,
        {
          id: deliveryProducts.length + 1,
          product_id: productsList[0].id,
          product: productsList[0].name,
          quantity: 0,
          inStock: true,
        },
      ]);
    }
  };

  // Handle product change
  const handleProductChange = (index, field, value) => {
    const updated = [...deliveryProducts];
    if (field === 'product_id') {
      const product = productsList.find(p => p.id === value);
      updated[index] = {
        ...updated[index],
        product_id: value,
        product: product?.name || `Product ${value}`,
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setDeliveryProducts(updated);
  };

  // Handle removing product
  const handleRemoveProduct = (index) => {
    if (deliveryProducts.length > 1) {
      setDeliveryProducts(deliveryProducts.filter((_, i) => i !== index));
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6">{isNewDelivery ? 'New Delivery' : 'Delivery'}</Typography>
            {!isNewDelivery && <Chip label={delivery?.reference || delivery?.ref_no || 'WH/OUT/0001'} color="primary" />}
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            {/* <Typography variant="body2" color="text.secondary">
              Draft > Waiting > Ready > Done
            </Typography> */}
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Stack>
        </Stack>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Stack spacing={3}>
          {status === 'Waiting' && hasOutOfStockProducts && (
            <Alert severity="warning">
              Waiting for out of stock product to be in stock. Please check product availability.
            </Alert>
          )}

          <Stack direction="row" spacing={2} alignItems="flex-start">
            <TextField
              label="From (Warehouse)"
              value={warehouseId}
              onChange={(e) => {
                const selectedWarehouse = warehouses.find(w => w.id === Number(e.target.value));
                setWarehouseId(Number(e.target.value));
                setFrom(selectedWarehouse?.name || '');
              }}
              select
              fullWidth
              variant="outlined"
              SelectProps={{ native: false }}
            >
              {warehouses.map((warehouse) => (
                <MenuItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="To (Customer Name)"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              fullWidth
              variant="outlined"
              required
            />
            <TextField
              label="Contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              fullWidth
              variant="outlined"
            />
          </Stack>
          {isNewDelivery && (
            <Stack direction="row" spacing={2}>
              <TextField
                label="Reference Number"
                value={refNo}
                onChange={(e) => setRefNo(e.target.value)}
                fullWidth
                variant="outlined"
                helperText="Leave empty to auto-generate"
              />
              <TextField
                label="Remarks"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                fullWidth
                variant="outlined"
              />
            </Stack>
          )}

          <Stack direction="row" spacing={2}>
            <TextField
              label="Delivery Address"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              fullWidth
              variant="outlined"
              multiline
              rows={2}
            />
            <TextField
              label="Responsible"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              fullWidth
              variant="outlined"
              helperText="Auto-filled with current logged-in user"
            />
          </Stack>

          <Stack direction="row" spacing={2}>
            <TextField
              label="Schedule Date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              fullWidth
              variant="outlined"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
            <FormControl fullWidth>
              <TextField
                label="Operation Type"
                value={operationType}
                onChange={(e) => setOperationType(e.target.value)}
                select
                SelectProps={{ native: false }}
                variant="outlined"
                required
              >
                <MenuItem value="Standard Delivery">Standard Delivery</MenuItem>
                <MenuItem value="Express Delivery">Express Delivery</MenuItem>
                <MenuItem value="Bulk Delivery">Bulk Delivery</MenuItem>
              </TextField>
            </FormControl>
          </Stack>

          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Products
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveryProducts.map((product, index) => (
                  <TableRow
                    key={product.id}
                    sx={{
                      backgroundColor: !product.inStock ? 'rgba(211, 47, 47, 0.1)' : 'transparent',
                      '& .MuiTableCell-root': {
                        color: !product.inStock ? 'error.main' : 'inherit',
                      },
                    }}
                  >
                    <TableCell>
                      {isNewDelivery ? (
                        <TextField
                          select
                          value={product.product_id || ''}
                          onChange={(e) => handleProductChange(index, 'product_id', Number(e.target.value))}
                          size="small"
                          variant="standard"
                          sx={{ minWidth: 200 }}
                          SelectProps={{ native: false }}
                        >
                          {productsList.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                              {p.name} ({p.sku})
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <>
                          {product.product}
                          {!product.inStock && (
                            <Chip
                              label="Out of Stock"
                              size="small"
                              color="error"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {isNewDelivery ? (
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
                          <TextField
                            value={product.quantity}
                            onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                            size="small"
                            type="number"
                            variant="standard"
                            sx={{ width: 80 }}
                            inputProps={{ min: 0, step: 0.01 }}
                          />
                          {deliveryProducts.length > 1 && (
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveProduct(index)}
                              color="error"
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      ) : (
                        product.quantity
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {isNewDelivery && (
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Button
                        startIcon={<Add />}
                        onClick={handleAddProduct}
                        size="small"
                        variant="outlined"
                      >
                        Add Product
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>

          <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
            <Chip
              label={status}
              color={getStatusColor(status)}
              variant={status === 'Done' ? 'filled' : 'outlined'}
            />
            {/* Workflow: Draft → To DO → Waiting/Ready → Validate → Done */}
            <Stack direction="row" spacing={1}>
              {isNewDelivery ? (
                <>
                  <Button variant="contained" color="primary" onClick={handleSave}>
                    Save
                  </Button>
                  <Button variant="outlined" color="error" onClick={onClose}>
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  {/* Show "To DO" button when status is Draft */}
                  {showToDoButton && (
                    <Button variant="contained" color="primary" onClick={handleToDo}>
                      To DO
                    </Button>
                  )}
                  {/* Show "Check Stock" button when status is Waiting */}
                  {showCheckStockButton && (
                    <Button variant="contained" color="warning" onClick={handleCheckStock}>
                      Check Stock
                    </Button>
                  )}
                  {/* Show "Validate" button when status is Ready */}
                  {showValidateButton && (
                    <Button variant="contained" color="primary" onClick={handleValidate}>
                      Validate
                    </Button>
                  )}
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
                </>
              )}
            </Stack>
          </Stack>

          {status === 'Done' && (
            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Print the delivery order once it's DONE.
            </Typography>
          )}

          {status === 'Waiting' && (
            <Alert severity="info">
              <Typography variant="body2">
                <strong>Draft:</strong> Initial state
                <br />
                <strong>Waiting:</strong> Waiting for the out of stock product to be in stock
                <br />
                <strong>Ready:</strong> Ready to deliver/receive
                <br />
                <strong>Done:</strong> Received or delivered
              </Typography>
            </Alert>
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

export default DeliveryDetailDialog;

