import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import MainLayout from '../components/MainLayout';
import ReceiptDetailDialog from '../components/ReceiptDetailDialog';
import { receipts } from '../data/dashboardData';
import { DataGrid } from '@mui/x-data-grid';

function ReceiptsPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter receipts based on search query (reference and contact)
  const filteredReceipts = useMemo(() => {
    if (!searchQuery.trim()) {
      return receipts;
    }
    const query = searchQuery.toLowerCase().trim();
    return receipts.filter(
      (receipt) =>
        receipt.reference?.toLowerCase().includes(query) ||
        receipt.contact?.toLowerCase().includes(query)
    );
  }, [searchQuery]);
  const columns = [
    { field: 'reference', headerName: 'Reference', flex: 1 },
    { field: 'from', headerName: 'From', flex: 1 },
    { field: 'to', headerName: 'To', flex: 1 },
    { field: 'contact', headerName: 'Contact', flex: 1 },
    { field: 'scheduleDate', headerName: 'Schedule date', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 0.8 },
  ];
  const handleViewChange = (_event, next) => {
    if (next) setViewMode(next);
  };

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Receipts
          </Typography>
          <Typography color="text.secondary">Manage incoming goods and validate vendor deliveries.</Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <TextField
              placeholder="Search by Reference or Contact..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              sx={{ minWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewChange} size="small">
              <ToggleButton value="list">List</ToggleButton>
              <ToggleButton value="kanban">Kanban</ToggleButton>
            </ToggleButtonGroup>
            <Button variant="outlined" onClick={() => setFormOpen(false)}>
              Refresh list
            </Button>
            <Button variant="contained" onClick={() => setFormOpen(true)}>
              New
            </Button>
          </Stack>
        </Box>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Receipt register / list view
          </Typography>
          {viewMode === 'list' ? (
            <Box sx={{ height: 320 }}>
              <DataGrid
                rows={filteredReceipts.map((row) => ({ id: row.reference, ...row }))}
                columns={columns}
                hideFooter
                density="compact"
                onRowClick={(params) => {
                  setSelected(params.row);
                  setDialogOpen(true);
                }}
              />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', minHeight: 320 }}>
              {filteredReceipts.map((receipt) => (
                <Paper
                  key={receipt.reference}
                  elevation={3}
                  onClick={() => {
                    setSelected(receipt);
                    setDialogOpen(true);
                  }}
                  sx={{
                    flex: '1 1 220px',
                    minWidth: 220,
                    p: 2,
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 6,
                    },
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    {receipt.reference}
                  </Typography>
                  <Typography variant="body2">
                    From {receipt.from} · To {receipt.to}
                  </Typography>
                  <Typography variant="caption" display="block" mt={1}>
                    Contact {receipt.contact}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Schedule {receipt.scheduleDate} · Status {receipt.status}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>

        {formOpen && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Create Receipt
            </Typography>
            <Stack spacing={2}>
              <TextField label="Vendor" defaultValue="" fullWidth />
              <TextField label="Warehouse" select SelectProps={{ native: true }} fullWidth>
                <option value="Main Warehouse">Main Warehouse</option>
                <option value="Warehouse 2">Warehouse 2</option>
              </TextField>
              <TextField label="Product" defaultValue="Steel Rods" fullWidth />
              <TextField label="Quantity" defaultValue="150 kg" fullWidth />
              <Button variant="contained" fullWidth>
                Save & Validate
              </Button>
            </Stack>
          </Paper>
        )}
      </Stack>
      <ReceiptDetailDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelected(null);
        }}
        receipt={selected}
        onStatusChange={(newStatus) => {
          if (selected) {
            setSelected({ ...selected, status: newStatus });
          }
        }}
      />
    </MainLayout>
  );
}

export default ReceiptsPage;

