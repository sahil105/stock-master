import { useState, useMemo } from 'react';
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
import ProductFormDialog from '../components/ProductFormDialog';
import { DataGrid } from '@mui/x-data-grid';
import { createProduct } from '../services/productApi';

// Categories with IDs matching API structure
const categories = [
  { id: 1, name: 'Raw Materials' },
  { id: 2, name: 'Components' },
  { id: 3, name: 'Fasteners' },
  { id: 4, name: 'Packaging' },
  { id: 5, name: 'Furniture' },
];

// Static products data - in real app this would come from API
const initialProducts = [
  { id: 1, name: 'Steel Rods', sku: 'STL-001', category_id: 1, category_name: 'Raw Materials', uom: 'kg', reorder_level: 1000 },
  { id: 2, name: 'Frame Bolts', sku: 'BLT-101', category_id: 3, category_name: 'Fasteners', uom: 'pcs', reorder_level: 200 },
  { id: 3, name: 'Panel Sheets', sku: 'PNL-302', category_id: 2, category_name: 'Components', uom: 'sqm', reorder_level: 50 },
  { id: 4, name: 'Desk', sku: 'DESK001', category_id: 5, category_name: 'Furniture', uom: 'unit', reorder_level: 10 },
  { id: 5, name: 'Table', sku: 'TBL001', category_id: 5, category_name: 'Furniture', uom: 'unit', reorder_level: 10 },
];

function ProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success', // 'success' | 'error' | 'warning' | 'info'
  });

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) {
      return products;
    }
    const query = searchQuery.toLowerCase().trim();
    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.category_name?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const columns = [
    { field: 'name', headerName: 'Product name', flex: 1.6 },
    { field: 'sku', headerName: 'SKU / Code', flex: 1 },
    {
      field: 'category_name',
      headerName: 'Category',
      flex: 1.2,
      valueGetter: (params) => params?.row?.category_name || '',
    },
    { field: 'uom', headerName: 'Unit', flex: 0.8 },
    {
      field: 'reorder_level',
      headerName: 'Reorder Level',
      flex: 1,
      valueGetter: (params) => params.row?.reorder_level || 0,
    },
  ];

  const handleViewChange = (_event, next) => {
    if (next) setViewMode(next);
  };

  // Handle save from dialog
  const handleSaveProduct = async (apiPayload, formValues) => {
    try {
      // Call API
      const response = await createProduct(apiPayload);
      
      if (response.success) {
        // Find category name for display
        const selectedCategory = categories.find((cat) => cat.id === formValues.category_id);
        
        if (selectedProduct) {
          // Update existing product
          setProducts((prev) =>
            prev.map((p) =>
              p.id === selectedProduct.id
                ? {
                    ...p,
                    ...apiPayload,
                    category_name: selectedCategory?.name || '',
                  }
                : p
            )
          );
          // Show success message
          setSnackbar({
            open: true,
            message: 'Product updated successfully!',
            severity: 'success',
          });
        } else {
          // Add new product
          const newProduct = {
            id: response.data?.id || Date.now(),
            ...apiPayload,
            category_name: selectedCategory?.name || '',
          };
          setProducts((prev) => [newProduct, ...prev]);
          // Show success message
          setSnackbar({
            open: true,
            message: 'Product created successfully!',
            severity: 'success',
          });
        }
        
        // Close dialog
        setDialogOpen(false);
        setSelectedProduct(null);
      } else {
        // Show error message
        setSnackbar({
          open: true,
          message: response.error || 'Failed to save product. Please try again.',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error saving product:', error);
      // Show error message
      setSnackbar({
        open: true,
        message: 'An error occurred while saving the product. Please try again.',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleOpenDialog = () => {
    setSelectedProduct(null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedProduct(null);
  };

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Products
          </Typography>
          <Typography color="text.secondary">
            Create/update products with SKU/code, category, unit of measure, and optional initial stock so availability is tracked per
            warehouse.
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
            <TextField
              placeholder="Search by Product name, SKU, or Category..."
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
            <Button variant="outlined" onClick={() => setSearchQuery('')}>
              Refresh list
            </Button>
            <Button variant="contained" onClick={handleOpenDialog}>
              New
            </Button>
          </Stack>
        </Box>

        <Paper elevation={3} sx={{ p: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            Product register / list view
          </Typography>
          {viewMode === 'list' ? (
            <Box sx={{ height: 320 }}>
              <DataGrid rows={filteredProducts} columns={columns} hideFooter density="compact" disableRowSelectionOnClick />
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', minHeight: 320 }}>
              {filteredProducts.map((product) => (
                <Paper
                  key={product.id}
                  elevation={3}
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
                    {product.sku}
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {product.name}
                  </Typography>
                  <Typography variant="caption" display="block" mt={1}>
                    Category: {product.category_name}
                  </Typography>
                  <Typography variant="caption" display="block">
                    Reorder Level: {product.reorder_level} {product.uom}
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </Paper>

      </Stack>
      <ProductFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        product={selectedProduct}
        onSave={handleSaveProduct}
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

export default ProductsPage;

