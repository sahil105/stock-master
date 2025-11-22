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
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Close, Print } from '@mui/icons-material';

function ReceiptDetailDialog({ open, onClose, receipt, onStatusChange }) {
  const [status, setStatus] = useState(receipt?.status || 'Draft');
  const [receiveFrom, setReceiveFrom] = useState(receipt?.from || '');
  const [to, setTo] = useState(receipt?.to || '');
  const [contact, setContact] = useState(receipt?.contact || '');
  const [responsible, setResponsible] = useState('Current User'); // Auto-filled
  const [scheduleDate, setScheduleDate] = useState(receipt?.scheduleDate || '');
  const [products, setProducts] = useState([
    { id: 1, product: '[DESK001] Desk', quantity: 6 },
  ]);

  // Update state when receipt prop changes
  useEffect(() => {
    if (receipt) {
      setStatus(receipt.status || 'Draft');
      setReceiveFrom(receipt.from || '');
      setTo(receipt.to || '');
      setContact(receipt.contact || '');
      setScheduleDate(receipt.scheduleDate || '');
    }
  }, [receipt]);

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
            <Typography variant="body2" color="text.secondary">
              Draft > Ready > Done
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
          <Stack direction="row" spacing={2} alignItems="flex-start">
            <TextField
              label="Receive From"
              value={receiveFrom}
              onChange={(e) => setReceiveFrom(e.target.value)}
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
              label="Responsible"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              fullWidth
              variant="outlined"
              helperText="Auto-filled with current logged-in user"
            />
            <TextField
              label="Schedule Date"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
              fullWidth
              variant="outlined"
              type="date"
              InputLabelProps={{ shrink: true }}
            />
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
                  <TableRow key={product.id}>
                    <TableCell>{product.product}</TableCell>
                    <TableCell align="right">{product.quantity}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell>
                    <TextField
                      placeholder="New Product"
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
      </DialogContent>
    </Dialog>
  );
}

export default ReceiptDetailDialog;

