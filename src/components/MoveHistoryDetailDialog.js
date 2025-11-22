import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';

function MoveHistoryDetailDialog({ open, onClose, move, onSave, warehouses = [], locations = [] }) {
  const [formData, setFormData] = useState({
    reference: '',
    date: '',
    contact: '',
    from: '',
    to: '',
    quantity: '',
    status: 'Ready',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (move) {
      // Convert date format from MM/DD/YYYY to YYYY-MM-DD for date input
      let dateValue = '';
      if (move.date) {
        const dateParts = move.date.split('/');
        if (dateParts.length === 3) {
          // MM/DD/YYYY to YYYY-MM-DD
          const month = dateParts[0].padStart(2, '0');
          const day = dateParts[1].padStart(2, '0');
          const year = dateParts[2];
          dateValue = `${year}-${month}-${day}`;
        } else {
          dateValue = move.date;
        }
      }
      if (!dateValue) {
        dateValue = new Date().toISOString().split('T')[0];
      }
      
      setFormData({
        reference: move.reference || '',
        date: dateValue,
        contact: move.contact || '',
        from: move.from || '',
        to: move.to || '',
        quantity: move.quantity || '',
        status: move.status || 'Ready',
      });
    }
  }, [move]);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSave = () => {
    // Basic validation
    const newErrors = {};
    if (!formData.reference.trim()) {
      newErrors.reference = 'Reference is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.contact.trim()) {
      newErrors.contact = 'Contact is required';
    }
    if (!formData.from.trim()) {
      newErrors.from = 'From is required';
    }
    if (!formData.to.trim()) {
      newErrors.to = 'To is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Call onSave with form data
    if (onSave) {
      onSave(formData);
    }
    onClose();
  };

  const getMoveType = (reference) => {
    if (reference?.includes('WH/IN')) {
      return 'inbound';
    } else if (reference?.includes('WH/OUT')) {
      return 'outbound';
    }
    return 'unknown';
  };

  const moveType = getMoveType(formData.reference);

  const getMoveTypeColor = (type) => {
    switch (type) {
      case 'inbound':
        return 'success';
      case 'outbound':
        return 'error';
      default:
        return 'default';
    }
  };

  const getMoveTypeLabel = (type) => {
    switch (type) {
      case 'inbound':
        return 'Inbound';
      case 'outbound':
        return 'Outbound';
      default:
        return 'Unknown';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h6">Move History Details</Typography>
            {moveType !== 'unknown' && (
              <Chip
                label={getMoveTypeLabel(moveType)}
                color={getMoveTypeColor(moveType)}
                size="small"
              />
            )}
            {formData.reference && <Chip label={formData.reference} color="primary" size="small" />}
          </Stack>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Reference"
            value={formData.reference}
            onChange={handleChange('reference')}
            fullWidth
            required
            error={!!errors.reference}
            helperText={errors.reference}
            placeholder="e.g., WH/IN/0001 or WH/OUT/0001"
          />

          <TextField
            label="Date"
            type="date"
            value={formData.date}
            onChange={handleChange('date')}
            fullWidth
            required
            error={!!errors.date}
            helperText={errors.date}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Contact"
            value={formData.contact}
            onChange={handleChange('contact')}
            fullWidth
            required
            error={!!errors.contact}
            helperText={errors.contact}
            placeholder="Vendor or customer name"
          />

          <TextField
            label="From"
            value={formData.from}
            onChange={handleChange('from')}
            fullWidth
            required
            error={!!errors.from}
            helperText={errors.from}
            placeholder="Source location or vendor"
            select
          >
            <MenuItem value="vendor">Vendor</MenuItem>
            {locations.map((loc) => (
              <MenuItem key={loc.id || loc.name} value={loc.name || loc.code}>
                {loc.name || loc.code}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="To"
            value={formData.to}
            onChange={handleChange('to')}
            fullWidth
            required
            error={!!errors.to}
            helperText={errors.to}
            placeholder="Destination location or vendor"
            select
          >
            <MenuItem value="vendor">Vendor</MenuItem>
            {locations.map((loc) => (
              <MenuItem key={loc.id || loc.name} value={loc.name || loc.code}>
                {loc.name || loc.code}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Quantity"
            value={formData.quantity}
            onChange={handleChange('quantity')}
            fullWidth
            placeholder="e.g., 100 units"
          />

          <TextField
            label="Status"
            value={formData.status}
            onChange={handleChange('status')}
            fullWidth
            select
          >
            <MenuItem value="Ready">Ready</MenuItem>
            <MenuItem value="Done">Done</MenuItem>
            <MenuItem value="Draft">Draft</MenuItem>
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default MoveHistoryDetailDialog;

