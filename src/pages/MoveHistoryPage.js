import { useState, useMemo } from 'react';
import {
  Box,
  Button,
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
import MoveHistoryFormDialog from '../components/MoveHistoryFormDialog';
import MoveHistoryDetailDialog from '../components/MoveHistoryDetailDialog';
import { moveHistory } from '../data/dashboardData';
import { DataGrid } from '@mui/x-data-grid';

function MoveHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedMove, setSelectedMove] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [moves, setMoves] = useState(moveHistory);

  // Filter move history based on search query (reference, contact, from, to)
  const filteredMoveHistory = useMemo(() => {
    if (!searchQuery.trim()) {
      return moves;
    }
    const query = searchQuery.toLowerCase().trim();
    return moves.filter(
      (move) =>
        move.reference?.toLowerCase().includes(query) ||
        move.contact?.toLowerCase().includes(query) ||
        move.from?.toLowerCase().includes(query) ||
        move.to?.toLowerCase().includes(query)
    );
  }, [moves, searchQuery]);

  // Determine if move is inbound (WH/IN) or outbound (WH/OUT)
  const getMoveType = (reference) => {
    if (reference?.includes('WH/IN')) {
      return 'inbound';
    } else if (reference?.includes('WH/OUT')) {
      return 'outbound';
    }
    return 'unknown';
  };

  const handleViewChange = (_event, next) => {
    if (next) setViewMode(next);
  };

  const handleRowClick = (params) => {
    setSelectedMove(params.row);
    setDetailDialogOpen(true);
  };

  const handleCardClick = (move) => {
    setSelectedMove(move);
    setDetailDialogOpen(true);
  };

  const handleSaveMove = (formData) => {
    // Create new move entry
    const newMove = {
      ...formData,
      id: `${formData.reference}-${Date.now()}`,
    };
    setMoves((prev) => [newMove, ...prev]);
  };

  const handleSaveMoveDetail = (formData) => {
    // Update existing move
    setMoves((prev) =>
      prev.map((move) => {
        const moveId = move.id || `${move.reference}-${move.date}`;
        const selectedId = selectedMove?.id || `${selectedMove?.reference}-${selectedMove?.date}`;
        if (moveId === selectedId) {
          return { ...move, ...formData };
        }
        return move;
      })
    );
    setSelectedMove(null);
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
            <ToggleButtonGroup value={viewMode} exclusive onChange={handleViewChange} size="small">
              <ToggleButton value="list">List</ToggleButton>
              <ToggleButton value="kanban">Kanban</ToggleButton>
            </ToggleButtonGroup>
            <Button variant="outlined" onClick={() => setMoves(moveHistory)}>
              Refresh list
            </Button>
            <Button variant="contained" onClick={() => setFormDialogOpen(true)}>
              New
            </Button>
          </Stack>
        </Box>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Move History register / {viewMode === 'list' ? 'list' : 'kanban'} view
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Populate all moves done between the from - To location in inventory. If single reference has multiple product display it in multiple rows.
          </Typography>
          {viewMode === 'list' ? (
            <Box sx={{ height: 400 }}>
              {filteredMoveHistory.length === 0 ? (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    No move history found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Movement history will appear here once transactions are processed.
                  </Typography>
                </Box>
              ) : (
                <DataGrid
                  rows={filteredMoveHistory.map((row, index) => ({
                    id: row.id || `${row.reference}-${index}`,
                    ...row,
                  }))}
                  columns={columns}
                  hideFooter
                  density="compact"
                  onRowClick={handleRowClick}
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
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(46, 125, 50, 0.12)',
                      },
                    },
                    '& .outbound-move-row': {
                      backgroundColor: 'rgba(211, 47, 47, 0.08)',
                      cursor: 'pointer',
                      '&:hover': {
                        backgroundColor: 'rgba(211, 47, 47, 0.12)',
                      },
                    },
                  }}
                />
              )}
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', minHeight: 320 }}>
              {filteredMoveHistory.length === 0 ? (
                <Box
                  sx={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 2,
                    minHeight: 320,
                  }}
                >
                  <Typography variant="h6" color="text.secondary">
                    No move history found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Movement history will appear here once transactions are processed.
                  </Typography>
                </Box>
              ) : (
                filteredMoveHistory.map((move, index) => {
                const moveType = getMoveType(move.reference);
                return (
                  <Paper
                    key={move.id || `${move.reference}-${index}`}
                    elevation={3}
                    onClick={() => handleCardClick(move)}
                    sx={{
                      flex: '1 1 220px',
                      minWidth: 220,
                      p: 2,
                      cursor: 'pointer',
                      borderLeft: `4px solid ${
                        moveType === 'inbound'
                          ? '#2e7d32'
                          : moveType === 'outbound'
                          ? '#d32f2f'
                          : 'transparent'
                      }`,
                      '&:hover': {
                        boxShadow: 6,
                      },
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color:
                          moveType === 'inbound'
                            ? 'success.main'
                            : moveType === 'outbound'
                            ? 'error.main'
                            : 'text.primary',
                        fontWeight: 600,
                      }}
                    >
                      {move.reference}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      From {move.from} · To {move.to}
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      Contact: {move.contact}
                    </Typography>
                    <Typography variant="caption" display="block">
                      Date: {move.date} · Status: {move.status}
                    </Typography>
                    {move.quantity && (
                      <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                        Quantity: {move.quantity}
                      </Typography>
                    )}
                  </Paper>
                );
                })
              )}
            </Box>
          )}
        </Paper>

        <MoveHistoryFormDialog
          open={formDialogOpen}
          onClose={() => setFormDialogOpen(false)}
          onSave={handleSaveMove}
        />

        <MoveHistoryDetailDialog
          open={detailDialogOpen}
          onClose={() => {
            setDetailDialogOpen(false);
            setSelectedMove(null);
          }}
          move={selectedMove}
          onSave={handleSaveMoveDetail}
        />
      </Stack>
    </MainLayout>
  );
}

export default MoveHistoryPage;

