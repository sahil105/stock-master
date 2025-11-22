import { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Snackbar,
  Alert,
} from '@mui/material';
import { Add, Refresh, Search, ViewList, ViewModule } from '@mui/icons-material';
import MainLayout from '../components/MainLayout';
import MoveHistoryFormDialog from '../components/MoveHistoryFormDialog';
import MoveHistoryDetailDialog from '../components/MoveHistoryDetailDialog';
import { DataGrid } from '@mui/x-data-grid';
import { getLedger } from '../services/ledgerApi';
import { getWarehouses } from '../services/warehouseApi';
import { getProducts } from '../services/productApi';

function MoveHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedMove, setSelectedMove] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [moves, setMoves] = useState([]);
  const [movesLoading, setMovesLoading] = useState(true);
  const [movesMeta, setMovesMeta] = useState({ total: 0, page: 1, limit: 25 });
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch warehouses and products on mount
  useEffect(() => {
    fetchWarehouses();
    fetchProducts();
  }, []);

  // Fetch ledger when page/limit changes or when warehouses/products are loaded
  useEffect(() => {
    if (warehouses.length > 0 || products.length > 0) {
      fetchLedger();
    }
  }, [movesMeta.page, movesMeta.limit, warehouses.length, products.length]);

  const fetchLedger = async () => {
    setMovesLoading(true);
    try {
      const response = await getLedger({
        page: movesMeta.page,
        limit: movesMeta.limit,
      });
      if (response.success) {
        // Map API data to match component expectations
        const mappedMoves = mapLedgerToMoves(response.data);
        setMoves(mappedMoves);
        setMovesMeta(response.meta || { total: 0, page: 1, limit: 25 });
      } else {
        if (response.statusCode === 401) {
          setSnackbar({
            open: true,
            message: response.message || 'Unauthorized access. Please login again.',
            severity: 'error',
          });
        } else {
          setSnackbar({
            open: true,
            message: response.message || 'Failed to load move history.',
            severity: 'error',
          });
        }
        setMoves([]);
      }
    } catch (error) {
      console.error('Error fetching ledger:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while loading move history.',
        severity: 'error',
      });
      setMoves([]);
    } finally {
      setMovesLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const response = await getWarehouses({ limit: 100 });
      if (response.success) {
        setWarehouses(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await getProducts({ limit: 100 });
      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const mapLedgerToMoves = (ledgerEntries) => {
    return ledgerEntries.map((entry) => {
      const product = products.find(p => p.id === entry.product_id);
      const fromWarehouse = entry.from_warehouse_id 
        ? warehouses.find(w => w.id === entry.from_warehouse_id)
        : null;
      const toWarehouse = entry.to_warehouse_id
        ? warehouses.find(w => w.id === entry.to_warehouse_id)
        : null;

      // Determine reference based on move_type
      let reference = '';
      if (entry.move_type === 'receipt') {
        reference = `WH/IN/${String(entry.reference_id || entry.id).padStart(4, '0')}`;
      } else if (entry.move_type === 'delivery') {
        reference = `WH/OUT/${String(entry.reference_id || entry.id).padStart(4, '0')}`;
      } else if (entry.move_type === 'transfer') {
        reference = `WH/TRF/${String(entry.reference_id || entry.id).padStart(4, '0')}`;
      } else if (entry.move_type === 'adjustment') {
        reference = `WH/ADJ/${String(entry.reference_id || entry.id).padStart(4, '0')}`;
      } else {
        reference = `WH/${entry.move_type?.toUpperCase()}/${String(entry.id).padStart(4, '0')}`;
      }

      // Format date
      let dateStr = 'N/A';
      if (entry.movement_at) {
        try {
          const date = new Date(entry.movement_at);
          dateStr = date.toLocaleDateString('en-US', { 
            month: '2-digit', 
            day: '2-digit', 
            year: 'numeric' 
          });
        } catch (e) {
          dateStr = entry.movement_at;
        }
      }

      return {
        id: entry.id,
        reference: reference,
        date: dateStr,
        contact: product?.name || `Product ${entry.product_id}`,
        from: fromWarehouse?.name || (entry.from_warehouse_id ? `Warehouse ${entry.from_warehouse_id}` : 'N/A'),
        to: toWarehouse?.name || (entry.to_warehouse_id ? `Warehouse ${entry.to_warehouse_id}` : 'N/A'),
        quantity: entry.quantity ? `${entry.quantity} ${product?.uom || 'units'}` : '',
        status: 'Done', // Ledger entries are always completed
        move_type: entry.move_type,
        product_id: entry.product_id,
        product_name: product?.name,
        ...entry, // Include all original entry data
      };
    });
  };

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
              <ToggleButton value="list">
                <ViewList />
              </ToggleButton>
              <ToggleButton value="kanban">
                <ViewModule />
              </ToggleButton>
            </ToggleButtonGroup>
            <IconButton 
              variant="outlined" 
              onClick={() => {
                setSearchQuery('');
                fetchLedger();
              }}
              sx={{ 
                border: '1px solid rgba(0, 0, 0, 0.23)',
                '&:hover': {
                  border: '1px solid rgba(0, 0, 0, 0.87)',
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                },
              }}
            >
              <Refresh />
            </IconButton>
            <IconButton 
              variant="contained" 
              color="primary"
              onClick={() => setFormDialogOpen(true)}
              sx={{ 
                bgcolor: 'secondary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'secondary.dark',
                },
              }}
            >
              <Add />
            </IconButton>
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
              {!movesLoading && filteredMoveHistory.length === 0 ? (
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
                  loading={movesLoading}
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
              {!movesLoading && filteredMoveHistory.length === 0 ? (
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
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Stack>
    </MainLayout>
  );
}

export default MoveHistoryPage;

