import { useState, useMemo, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Refresh, Search } from '@mui/icons-material';
import MainLayout from '../components/MainLayout';
import { DataGrid } from '@mui/x-data-grid';
import { getStock } from '../services/stockApi';

function StockPage() {
  const [rows, setRows] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const response = await getStock();
      if (response.success) {
        // Map API data to match component expectations
        // Backend returns: { data: [{ id, name, sku, on_hand, reserved, free_to_use, ... }] }
        const mappedStock = response.data.map((item) => ({
          id: item.id,
          product: item.name || 'Unknown Product',
          perUnitCost: 0, // Cost not available in stock endpoint
          onHand: item.on_hand || 0,
          freeToUse: item.free_to_use || (item.on_hand - (item.reserved || 0)) || 0,
          warehouse: item.warehouse_name || `Warehouse ${item.warehouse_id}`,
          sku: item.sku || 'N/A',
          reserved: item.reserved || 0,
          ...item,
        }));
        setRows(mappedStock);
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
            message: response.message || 'Failed to load stock.',
            severity: 'error',
          });
        }
        setRows([]);
      }
    } catch (error) {
      console.error('Error fetching stock:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while loading stock.',
        severity: 'error',
      });
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter stock based on search query
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) {
      return rows;
    }
    const query = searchQuery.toLowerCase().trim();
    return rows.filter((row) => row.product?.toLowerCase().includes(query));
  }, [rows, searchQuery]);

  // Handle row update after cell edit
  const processRowUpdate = (newRow) => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        if (row.id === newRow.id) {
          return newRow;
        }
        return row;
      })
    );
    return newRow;
  };

  const columns = [
    {
      field: 'product',
      headerName: 'Product',
      flex: 1,
      editable: false, // Product name should not be editable
    },
    {
      field: 'perUnitCost',
      headerName: 'per unit cost',
      flex: 1,
      editable: true,
      width: 150,
    },
    {
      field: 'onHand',
      headerName: 'On hand',
      flex: 1,
      editable: true,
      type: 'number',
      width: 120,
    },
    {
      field: 'freeToUse',
      headerName: 'free to Use',
      flex: 1,
      editable: true,
      type: 'number',
      width: 120,
    },
  ];

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Stock
          </Typography>
          <Typography color="text.secondary">Manage stock levels and update inventory directly.</Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <TextField
              placeholder="Search by Product..."
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
            <IconButton 
              variant="outlined" 
              onClick={fetchStock}
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
            <Button variant="contained" onClick={() => {
              setSnackbar({
                open: true,
                message: 'Stock update functionality will be implemented via adjustments.',
                severity: 'info',
              });
            }}>
              Save Changes
            </Button>
          </Stack>
        </Box>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Stock register / list view
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            User must be able to update the stock from here. Click on editable cells to modify values.
          </Typography>
          <Box sx={{ height: 400 }}>
            {!loading && filteredRows.length === 0 ? (
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
                  No stock data found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery ? 'Try adjusting your search.' : 'Stock data will appear here once products are added and stock is updated.'}
                </Typography>
              </Box>
            ) : (
              <DataGrid
                rows={filteredRows}
                columns={columns}
                hideFooter
                density="compact"
                loading={loading}
                processRowUpdate={processRowUpdate}
                disableRowSelectionOnClick
                sx={{
                  '& .MuiDataGrid-cell:editable': {
                    backgroundColor: 'rgba(37, 52, 148, 0.05)',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(37, 52, 148, 0.1)',
                    },
                  },
                  '& .MuiDataGrid-cell:focus': {
                    outline: '2px solid #253494',
                  },
                }}
              />
            )}
          </Box>
        </Paper>
      </Stack>
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
    </MainLayout>
  );
}

export default StockPage;

