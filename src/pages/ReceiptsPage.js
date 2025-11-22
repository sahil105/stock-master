import { useState, useMemo, useEffect } from 'react';
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import MainLayout from '../components/MainLayout';
import ReceiptDetailDialog from '../components/ReceiptDetailDialog';
import ReceiptFormDialog from '../components/ReceiptFormDialog';
import PaginationControls from '../components/PaginationControls';
import { DataGrid } from '@mui/x-data-grid';
import { createReceipt, getReceipts } from '../services/receiptApi';
import { getWarehouses } from '../services/warehouseApi';
import { getProducts } from '../services/productApi';

function ReceiptsPage() {
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [receiptsData, setReceiptsData] = useState([]);
  const [receiptsLoading, setReceiptsLoading] = useState(true);
  const [receiptsMeta, setReceiptsMeta] = useState({ total: 0, page: 1, limit: 25 });
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [warehousesLoading, setWarehousesLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch warehouses and products on component mount
  useEffect(() => {
    fetchWarehouses();
    fetchProducts();
  }, []);

  // Fetch receipts when pagination changes
  useEffect(() => {
    fetchReceipts();
  }, [receiptsMeta.page, receiptsMeta.limit, searchQuery]);

  const fetchWarehouses = async () => {
    setWarehousesLoading(true);
    try {
      const response = await getWarehouses();
      if (response.success) {
        setWarehouses(response.data || []);
      } else {
        console.error('Error fetching warehouses:', response.message);
        // Keep empty array on error
      }
    } catch (error) {
      console.error('Error fetching warehouses:', error);
    } finally {
      setWarehousesLoading(false);
    }
  };

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await getProducts();
      if (response.success) {
        setProducts(response.data || []);
      } else {
        console.error('Error fetching products:', response.message);
        // Keep empty array on error
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const fetchReceipts = async () => {
    setReceiptsLoading(true);
    try {
      const response = await getReceipts({
        page: receiptsMeta.page,
        limit: receiptsMeta.limit,
        search: searchQuery,
      });
      if (response.success) {
        setReceiptsData(response.data || []);
        setReceiptsMeta(response.meta || { total: 0, page: 1, limit: 25 });
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
            message: response.message || 'Failed to load receipts.',
            severity: 'error',
          });
        }
        setReceiptsData([]);
      }
    } catch (error) {
      console.error('Error fetching receipts:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while loading receipts.',
        severity: 'error',
      });
      setReceiptsData([]);
    } finally {
      setReceiptsLoading(false);
    }
  };

  // Use receiptsData directly (filtering is done on server side via search parameter)
  const filteredReceipts = receiptsData;
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

  // Handle save receipt from dialog (for both create and update)
  const handleSaveReceipt = async (apiPayload, formValues) => {
    try {
      // Call API
      const response = await createReceipt(apiPayload);

      if (response.success) {
        // Show success message
        setSnackbar({
          open: true,
          message: selected ? 'Receipt updated successfully!' : 'Receipt created successfully!',
          severity: 'success',
        });

        // Close dialogs
        setFormDialogOpen(false);
        if (selected) {
          setDetailDialogOpen(false);
          setSelected(null);
        }

        // Refresh receipts list from API
        fetchReceipts();
      } else {
        // Handle 401 Unauthorized
        if (response.statusCode === 401) {
          setSnackbar({
            open: true,
            message: response.message || 'Unauthorized access. Please login again.',
            severity: 'error',
          });
          return;
        }

        // Handle 422 Validation Error
        if (response.statusCode === 422 && response.errors && response.errors.length > 0) {
          const errorMessages = response.errors.map((err) => {
            const field = err.field || 'field';
            return `${field}: ${err.message}`;
          }).join(', ');

          setSnackbar({
            open: true,
            message: `Validation error: ${errorMessages}`,
            severity: 'error',
          });
          // Keep dialog open to allow user to fix errors
          return;
        }

        // Handle other errors
        setSnackbar({
          open: true,
          message: response.message || 'Failed to create receipt. Please try again.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error creating receipt:', error);
      setSnackbar({
        open: true,
        message: 'An error occurred while creating the receipt. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleOpenFormDialog = () => {
    setFormDialogOpen(true);
  };

  const handleCloseFormDialog = () => {
    setFormDialogOpen(false);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handlePageChange = (newPage) => {
    setReceiptsMeta((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newLimit) => {
    setReceiptsMeta((prev) => ({ ...prev, limit: newLimit, page: 1 }));
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
            <Button variant="outlined" onClick={() => {
              setSearchQuery('');
              setReceiptsMeta((prev) => ({ ...prev, page: 1 }));
            }}>
              Refresh list
            </Button>
            <Button variant="contained" onClick={handleOpenFormDialog}>
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
                  setDetailDialogOpen(true);
                }}
                loading={receiptsLoading}
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
                    setDetailDialogOpen(true);
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
          <PaginationControls
            meta={receiptsMeta}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            loading={receiptsLoading}
          />
        </Paper>

      </Stack>
      <ReceiptFormDialog
        open={formDialogOpen}
        onClose={handleCloseFormDialog}
        receipt={null}
        onSave={handleSaveReceipt}
        warehouses={warehouses}
        products={products}
      />
      <ReceiptDetailDialog
        open={detailDialogOpen}
        onClose={() => {
          setDetailDialogOpen(false);
          setSelected(null);
        }}
        receipt={selected}
        onStatusChange={(newStatus) => {
          if (selected) {
            setSelected({ ...selected, status: newStatus });
          }
        }}
        onSave={handleSaveReceipt}
        warehouses={warehouses}
        products={products}
      />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}

export default ReceiptsPage;

