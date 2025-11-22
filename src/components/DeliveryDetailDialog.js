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
import { Close, Print } from '@mui/icons-material';

function DeliveryDetailDialog({ open, onClose, delivery, onStatusChange }) {
  const [status, setStatus] = useState(delivery?.status || 'Draft');
  const [from, setFrom] = useState(delivery?.from || '');
  const [to, setTo] = useState(delivery?.to || '');
  const [contact, setContact] = useState(delivery?.contact || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [responsible, setResponsible] = useState('Current User'); // Auto-filled
  const [scheduleDate, setScheduleDate] = useState(delivery?.scheduleDate || '');
  const [operationType, setOperationType] = useState('');
  const [products, setProducts] = useState([
    { id: 1, product: '[DESK001] Desk', quantity: 6, inStock: false }, // Example: out of stock
  ]);

  // Update state when delivery prop changes
  useEffect(() => {
    if (delivery) {
      setStatus(delivery.status || 'Draft');
      setFrom(delivery.from || '');
      setTo(delivery.to || '');
      setContact(delivery.contact || '');
      setScheduleDate(delivery.scheduleDate || '');
    }
  }, [delivery]);

  // Handle "To DO" button click - moves from Draft to Waiting
  const handleToDo = () => {
    if (status === 'Draft') {
      // Check if any products are out of stock
      const hasOutOfStock = products.some((p) => !p.inStock);
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
      const hasOutOfStock = products.some((p) => !p.inStock);
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

  const hasOutOfStockProducts = products.some((p) => !p.inStock);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6">Delivery</Typography>
            <Chip label={delivery?.reference || 'WH/OUT/0001'} color="primary" />
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              Draft > Waiting > Ready > Done
            </Typography>
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
              label="From"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="To"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              fullWidth
              variant="outlined"
            />
            <TextField
              label="Contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              fullWidth
              variant="outlined"
            />
          </Stack>

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
              >
                <MenuItem value="">Select Operation Type</MenuItem>
                <MenuItem value="standard">Standard Delivery</MenuItem>
                <MenuItem value="express">Express Delivery</MenuItem>
                <MenuItem value="bulk">Bulk Delivery</MenuItem>
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
                {products.map((product) => (
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
                      {product.product}
                      {!product.inStock && (
                        <Chip
                          label="Out of Stock"
                          size="small"
                          color="error"
                          sx={{ ml: 1 }}
                        />
                      )}
                    </TableCell>
                    <TableCell align="right">{product.quantity}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <TextField
                      placeholder="Add New product"
                      size="small"
                      fullWidth
                      variant="standard"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      placeholder="Qty"
                      size="small"
                      type="number"
                      variant="standard"
                      sx={{ width: 80 }}
                    />
                  </TableCell>
                </TableRow>
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

