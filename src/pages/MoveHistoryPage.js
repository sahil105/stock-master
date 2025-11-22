import { useState, useMemo } from 'react';
import { Box, Button, InputAdornment, Paper, Stack, TextField, Typography } from '@mui/material';
import { Search } from '@mui/icons-material';
import MainLayout from '../components/MainLayout';
import { moveHistory } from '../data/dashboardData';
import { DataGrid } from '@mui/x-data-grid';

function MoveHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  // Filter move history based on search query (reference, contact, from, to)
  const filteredMoveHistory = useMemo(() => {
    if (!searchQuery.trim()) {
      return moveHistory;
    }
    const query = searchQuery.toLowerCase().trim();
    return moveHistory.filter(
      (move) =>
        move.reference?.toLowerCase().includes(query) ||
        move.contact?.toLowerCase().includes(query) ||
        move.from?.toLowerCase().includes(query) ||
        move.to?.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Determine if move is inbound (WH/IN) or outbound (WH/OUT)
  const getMoveType = (reference) => {
    if (reference?.includes('WH/IN')) {
      return 'inbound';
    } else if (reference?.includes('WH/OUT')) {
      return 'outbound';
    }
    return 'unknown';
  };

  const columns = [
    {
      field: 'reference',
      headerName: 'Reference',
      flex: 1,
      renderCell: (params) => {
        const moveType = getMoveType(params.row.reference);
        return (
          <Typography
            sx={{
              color: moveType === 'inbound' ? 'success.main' : moveType === 'outbound' ? 'error.main' : 'inherit',
              fontWeight: 600,
            }}
          >
            {params.row.reference}
          </Typography>
        );
      },
    },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'contact', headerName: 'Contact', flex: 1 },
    { field: 'from', headerName: 'From', flex: 1 },
    { field: 'to', headerName: 'To', flex: 1 },
    { field: 'quantity', headerName: 'Quantity', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 0.8 },
  ];

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Move History
          </Typography>
          <Typography color="text.secondary">Audited log of stock movements day by day.</Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <Button variant="contained" onClick={() => setFormOpen(true)}>
              New
            </Button>
            <TextField
              placeholder="Search by Reference, Contact, From, or To..."
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
            <Button variant="outlined" onClick={() => setFormOpen(false)}>
              Refresh list
            </Button>
          </Stack>
        </Box>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Move History register / list view
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Populate all moves done between the from - To location in inventory. If single reference has multiple product display it in multiple rows.
          </Typography>
          <Box sx={{ height: 400 }}>
            <DataGrid
              rows={filteredMoveHistory.map((row, index) => ({ id: `${row.reference}-${index}`, ...row }))}
              columns={columns}
              hideFooter
              density="compact"
              disableRowSelectionOnClick
              getRowClassName={(params) => {
                const moveType = getMoveType(params.row.reference);
                if (moveType === 'inbound') {
                  return 'inbound-move-row';
                } else if (moveType === 'outbound') {
                  return 'outbound-move-row';
                }
                return '';
              }}
              sx={{
                '& .inbound-move-row': {
                  backgroundColor: 'rgba(46, 125, 50, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(46, 125, 50, 0.12)',
                  },
                },
                '& .outbound-move-row': {
                  backgroundColor: 'rgba(211, 47, 47, 0.08)',
                  '&:hover': {
                    backgroundColor: 'rgba(211, 47, 47, 0.12)',
                  },
                },
              }}
            />
          </Box>
        </Paper>

        {formOpen && (
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Create Move History Entry
            </Typography>
            <Stack spacing={2}>
              <TextField label="Reference" defaultValue="" fullWidth />
              <TextField label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} />
              <TextField label="Contact" defaultValue="" fullWidth />
              <TextField label="From" defaultValue="" fullWidth />
              <TextField label="To" defaultValue="" fullWidth />
              <TextField label="Quantity" defaultValue="" fullWidth />
              <TextField label="Status" select SelectProps={{ native: true }} fullWidth>
                <option value="">Select Status</option>
                <option value="Ready">Ready</option>
                <option value="Done">Done</option>
              </TextField>
              <Button variant="contained" fullWidth>
                Save
              </Button>
            </Stack>
          </Paper>
        )}
      </Stack>
    </MainLayout>
  );
}

export default MoveHistoryPage;

